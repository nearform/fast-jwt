'use strict'

const {
  createHmac,
  createVerify,
  createSign,
  constants: { RSA_PKCS1_PSS_PADDING, RSA_PSS_SALTLEN_DIGEST }
} = require('crypto')
const { joseToDer, derToJose } = require('ecdsa-sig-formatter')
const { cpus } = require('os')
const { promisify } = require('util')
const setImmediateAsync = promisify(setImmediate)

const TokenError = require('./error')

const publicKeyAlgorithms = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'PS256', 'PS384', 'PS512']
const rsaKeyAlgorithms = ['RS256', 'RS384', 'RS512', 'PS256', 'PS384', 'PS512']
const hashAlgorithms = ['HS256', 'HS384', 'HS512']
const publicKeyMatcher = /BEGIN (?:PUBLIC KEY|CERTIFICATE)/

const poolSize = cpus().length
let supportsWorkers = false
let workersStarted = false
let availableWorkers = []
let Worker

// Worker threads support
try {
  const { Worker: WorkerClass, isMainThread, parentPort } = require('worker_threads')
  supportsWorkers = true

  /* istanbul ignore else */
  if (isMainThread) {
    Worker = WorkerClass
  } else {
    parentPort.on('message', ({ type, data }) => {
      try {
        const { algorithm, secret, header, payload, input, signature } = { ...data }

        parentPort.postMessage({
          type: 'result',
          data:
            type === 'sign'
              ? createSignature(algorithm, secret, header, payload)
              : verifySignature(algorithm, secret, input, signature)
        })
      } catch (e) {
        parentPort.postMessage({
          type: 'error',
          data: {
            code: e.code,
            message: e.message,
            stack: e.stack,
            originalError: {
              code: e.originalError.code,
              message: e.originalError.message,
              stack: e.originalError.stack
            }
          }
        })
      }
    })
  }
} catch (e) {
  // No-op - Nothing to do here
}

function validateSecretKey(algorithm, key) {
  if (!Buffer.isBuffer(key) && typeof key !== 'string') {
    throw new TokenError(
      TokenError.codes.invalidSecret,
      `The secret for algorithm ${algorithm} must be a string or a buffer.`
    )
  }
}

function validatePrivateKey(algorithm, key) {
  if (typeof key === 'object') {
    if (typeof key.key !== 'string' && !Buffer.isBuffer(key)) {
      throw new TokenError(
        TokenError.codes.invalidSecret,
        `The secret object for algorithm ${algorithm} must have the key property as string or buffer containing the private key.`
      )
    }

    if (key.passphrase && typeof key.passphrase !== 'string') {
      throw new TokenError(
        TokenError.codes.invalidSecret,
        `The secret object for algorithm ${algorithm} must have the passphrase property as string or buffer containing the private key.`
      )
    }
  }

  if (typeof key !== 'string' && typeof key !== 'object' && !Buffer.isBuffer(key)) {
    throw new TokenError(
      TokenError.codes.invalidSecret,
      `The secret for algorithm ${algorithm} must be a string, a object or a buffer.`
    )
  }
}

function validatePublicKey(algorithm, key) {
  if (!Buffer.isBuffer(key) && typeof key !== 'string') {
    throw new TokenError(
      TokenError.codes.invalidSecret,
      `The secret for algorithm ${algorithm} must be a string or a buffer containing the public key.`
    )
  }
}

function getSupportedAlgorithms(secret) {
  const secretString = Buffer.isBuffer(secret) ? secret.toString('utf8') : secret

  if (!secretString) {
    return ['none']
  } else if (secretString.includes('BEGIN RSA PUBLIC KEY')) {
    return rsaKeyAlgorithms
  } else if (secretString.match(publicKeyMatcher)) {
    return publicKeyAlgorithms
  }

  return hashAlgorithms
}

function createSignature(algorithm, secret, header, payload, useWorkers = false) {
  if (useWorkers && supportsWorkers && workersStarted) {
    return createSignatureWithWorker(algorithm, secret, header, payload)
  }

  try {
    const type = algorithm.substring(0, 2).toLowerCase()
    const bits = algorithm.substring(2)
    const input = `${header}.${payload}`
    let signer
    let signature

    switch (type) {
      case 'rs':
      case 'es':
        validatePrivateKey(algorithm, secret)

        signer = createSign(`RSA-SHA${bits}`)
        signer.update(input)

        signature = signer.sign(secret, 'base64')

        if (type === 'es') {
          signature = derToJose(signature, `ES${bits}`).toString('base64')
        }

        return signature
      case 'ps':
        validatePrivateKey(algorithm, secret)

        signer = createSign(`RSA-SHA${bits}`)
        signer.update(input)

        return signer.sign(
          {
            key: secret,
            padding: RSA_PKCS1_PSS_PADDING,
            saltLength: RSA_PSS_SALTLEN_DIGEST
          },
          'base64'
        )
      default:
        // hs
        validateSecretKey(algorithm, secret)

        signer = createHmac(`SHA${bits}`, secret)
        signer.update(input)
        return signer.digest('base64')
    }
  } catch (e) {
    throw new TokenError(TokenError.codes.signError, 'Cannot create the signature.', { originalError: e })
  }
}

function verifySignature(algorithm, secret, input, signature, useWorkers = false) {
  if (useWorkers && supportsWorkers && workersStarted) {
    return verifySignatureWithWorker(algorithm, secret, input, signature)
  }

  try {
    const type = algorithm.substring(0, 2).toLowerCase()
    const bits = algorithm.substring(2)
    let verifier

    switch (type) {
      case 'es':
      case 'rs':
        validatePublicKey(algorithm, secret)

        verifier = createVerify(`RSA-SHA${bits}`)
        verifier.update(input)

        return verifier.verify(
          secret,
          type === 'es' ? joseToDer(signature, `ES${bits}`).toString('base64') : signature,
          'base64'
        )
      case 'ps':
        validatePublicKey(algorithm, secret)

        verifier = createVerify(`RSA-SHA${bits}`)
        verifier.update(input)

        return verifier.verify(
          {
            key: secret,
            padding: RSA_PKCS1_PSS_PADDING,
            saltLength: RSA_PSS_SALTLEN_DIGEST
          },
          signature,
          'base64'
        )
      default:
        // hs
        validateSecretKey(algorithm, secret)

        verifier = createHmac(`SHA${bits}`, secret)
        verifier.update(input)

        return verifier.digest('base64') === signature
    }
  } catch (e) {
    throw new TokenError(TokenError.codes.verifyError, 'Cannot verify the signature.', { originalError: e })
  }
}

function startWorkers() {
  if (workersStarted || !Worker) {
    return
  }

  availableWorkers = Array.from(Array(poolSize)).map((_, index) => new Worker(__filename, { workerData: { index } }))
  workersStarted = true
}

async function stopWorkers() {
  if (!workersStarted) {
    return
  }

  while (availableWorkers.length !== poolSize) {
    await setImmediateAsync()
  }

  await Promise.all(availableWorkers.map(w => w.terminate()))
  workersStarted = false
}

async function getAvailableWorker() {
  while (!availableWorkers.length) {
    await setImmediateAsync()
  }

  return availableWorkers.shift()
}

function deserializeWorkerError(serialized) {
  const { code, message, stack } = serialized.originalError
  const originalError = new Error(message)
  originalError.code = code
  originalError.stack = stack

  const error = new TokenError(serialized.code, serialized.message, { originalError })

  return error
}

async function createSignatureWithWorker(algorithm, secret, header, payload) {
  // Wait for a worker thread to be available
  const worker = await getAvailableWorker()

  try {
    if (Buffer.isBuffer(secret)) {
      secret = secret.toString('utf-8')
    } else if (typeof secret === 'object') {
      if (Buffer.isBuffer(secret.key)) {
        secret.key = secret.key.toString('utf-8')
      }

      if (Buffer.isBuffer(secret.passphrase)) {
        secret.passphrase = secret.passphrase.toString('utf-8')
      }
    }

    const { type, data } = await new Promise((resolve, reject) => {
      worker.postMessage({ type: 'sign', data: { algorithm, secret, header, payload } })
      worker.once('message', resolve)
      worker.once('error', reject)
    })

    if (type === 'error') {
      throw deserializeWorkerError(data)
    }

    availableWorkers.push(worker)
    return data
  } catch (e) {
    availableWorkers.push(worker)
    throw e
  }
}

async function verifySignatureWithWorker(algorithm, secret, input, signature) {
  // Wait for a worker thread to be available
  const worker = await getAvailableWorker()

  try {
    const { type, data } = await new Promise((resolve, reject) => {
      worker.postMessage({
        type: 'verify',
        data: { algorithm, secret: Buffer.isBuffer(secret) ? secret.toString('utf-8') : secret, input, signature }
      })
      worker.once('message', resolve)
      worker.once('error', reject)
    })

    if (type === 'error') {
      throw deserializeWorkerError(data)
    }

    availableWorkers.push(worker)
    return data
  } catch (e) {
    availableWorkers.push(worker)
    throw e
  }
}

module.exports = {
  publicKeyAlgorithms,
  rsaKeyAlgorithms,
  hashAlgorithms,
  getSupportedAlgorithms,
  createSignature,
  verifySignature,
  supportsWorkers,
  startWorkers,
  stopWorkers
}

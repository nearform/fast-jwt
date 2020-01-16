'use strict'

const {
  createHmac,
  createVerify,
  createSign,
  createPublicKey,
  constants: { RSA_PKCS1_PSS_PADDING, RSA_PSS_SALTLEN_DIGEST }
} = require('crypto')
const { joseToDer, derToJose } = require('ecdsa-sig-formatter')

const TokenError = require('./error')

const publicKeyAlgorithms = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'PS256', 'PS384', 'PS512']
const rsaKeyAlgorithms = ['RS256', 'RS384', 'RS512', 'PS256', 'PS384', 'PS512']
const hashAlgorithms = ['HS256', 'HS384', 'HS512']
const publicKeyMatcher = /BEGIN (?:PUBLIC KEY|CERTIFICATE)/
const supportsPublicKeyObjects = typeof createPublicKey === 'function'
let supportsWorkerThreads = true

try {
  require('worker_threads')
} catch (e) {
  supportsWorkerThreads = false
}

function validatePublicKey(algorithm, key) {
  if (supportsPublicKeyObjects && typeof key === 'object') {
    if (typeof key.type !== 'string' || typeof key.asymmetricKeyType !== 'string') {
      throw new TokenError(
        TokenError.codes.invalidSecret,
        `The secret object for algorithm ${algorithm} must have type and asymmetricKeyType properties of type string.`
      )
    }

    if (typeof key.export !== 'function') {
      throw new TokenError(
        TokenError.codes.invalidSecret,
        `The secret object for algorithm ${algorithm} must have a function export property.`
      )
    }
  }

  if (!Buffer.isBuffer(key) && typeof key !== 'string') {
    throw new TokenError(
      TokenError.codes.invalidSecret,
      `The secret for algorithm ${algorithm} must be a string or a buffer.`
    )
  }
}

function validateSecretKey(algorithm, key) {
  if (supportsPublicKeyObjects && typeof key === 'object') {
    if (typeof key.type !== 'string') {
      throw new TokenError(
        TokenError.codes.invalidSecret,
        `The secret object for algorithm ${algorithm} must have type and asymmetricKeyType properties of type string.`
      )
    }

    if (typeof key.export !== 'function') {
      throw new TokenError(
        TokenError.codes.invalidSecret,
        `The secret object for algorithm ${algorithm} must have a function export property.`
      )
    }
  }

  if (!Buffer.isBuffer(key) && typeof key !== 'string') {
    throw new TokenError(
      TokenError.codes.invalidSecret,
      `The secret for algorithm ${algorithm} must be a string or a buffer.`
    )
  }
}

function validatePrivateKey(algorithm, key) {
  if (typeof key !== 'string' && typeof key !== 'object' && !Buffer.isBuffer(key)) {
    throw new TokenError(
      TokenError.codes.invalidSecret,
      `The secret for algorithm ${algorithm} must be a string, a object or a buffer.`
    )
  }
}

function signWithHmac(algorithm, bits, secret, input) {
  if (!Buffer.isBuffer(secret) && typeof secret !== 'string') {
    throw new TokenError(
      TokenError.codes.invalidSecret,
      `The secret for algorithm ${algorithm} must be a string or a buffer.`
    )
  }

  const hmac = createHmac(`SHA${bits}`, secret)
  hmac.update(input)
  return hmac.digest('base64')
}

function signWithRSA(algorithm, bits, secret, input, asJose = false) {
  validatePrivateKey(algorithm, secret)

  const signer = createSign(`RSA-SHA${bits}`)
  signer.update(input)

  let signature = signer.sign(secret, 'base64')

  if (asJose) {
    signature = derToJose(signature, `ES${bits}`).toString('base64')
  }

  return signature
}

function signWithPS(algorithm, bits, secret, input) {
  validateSecretKey(algorithm, secret)

  const signer = createSign(`RSA-SHA${bits}`)
  signer.update(input)

  const signature = signer.sign(
    {
      key: secret,
      padding: RSA_PKCS1_PSS_PADDING,
      saltLength: RSA_PSS_SALTLEN_DIGEST
    },
    'base64'
  )

  return signature
}

function verifyWithRSA(algorithm, bits, secret, input, signature) {
  validatePublicKey(algorithm, secret)

  const verifier = createVerify(`RSA-SHA${bits}`)
  verifier.update(input)

  return verifier.verify(secret, signature, 'base64')
}

function verifyWithPS(algorithm, bits, secret, input, signature) {
  validatePublicKey(algorithm, secret)

  const verifier = createVerify(`RSA-SHA${bits}`)
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
}

// TODO@PI Add worker_threads implementation
function createSignature(algorithm, secret, header, payload, useWorkerThreads = false) {
  try {
    const bits = algorithm.substring(2)
    const input = `${header}.${payload}`

    switch (algorithm.substring(0, 2).toLowerCase()) {
      case 'rs':
        return signWithRSA(algorithm, bits, secret, input)
      case 'ps':
        return signWithPS(algorithm, bits, secret, input)
      case 'es':
        return signWithRSA(algorithm, bits, secret, input, true)
      case 'hs':
        return signWithHmac(algorithm, bits, secret, input)
      default:
        // none
        return ''
    }
  } catch (e) {
    throw new TokenError(TokenError.codes.signError, 'Cannot create the signature.', { error: e })
  }
}

// TODO@PI Add worker_threads implementation
function verifySignature(algorithm, secret, input, signature, useWorkerThreads = false) {
  try {
    const bits = algorithm.substring(2)

    switch (algorithm.substring(0, 2).toLowerCase()) {
      case 'rs':
        return verifyWithRSA(algorithm, bits, secret, input, signature)
      case 'ps':
        return verifyWithPS(algorithm, bits, secret, input, signature)
      case 'es':
        return verifyWithRSA(algorithm, bits, secret, input, joseToDer(signature, `ES${bits}`).toString('base64'))
      case 'hs':
        return signWithHmac(algorithm, bits, secret, input) === signature
      default:
        // none
        return signature === ''
    }
  } catch (e) {
    throw new TokenError(TokenError.codes.verifyError, 'Cannot verify the signature.', { error: e })
  }
}

function getSupportedAlgorithms(secret) {
  if (typeof secret === 'string' && secret.match(publicKeyMatcher)) {
    return publicKeyAlgorithms
  } else if (typeof secret === 'string' && secret.includes('BEGIN RSA PUBLIC KEY')) {
    return rsaKeyAlgorithms
  }

  return hashAlgorithms
}

module.exports = {
  publicKeyAlgorithms,
  rsaKeyAlgorithms,
  hashAlgorithms,
  supportsWorkerThreads,
  getSupportedAlgorithms,
  createSignature,
  verifySignature
}

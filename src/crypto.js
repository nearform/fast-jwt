'use strict'

const {
  createHmac,
  createVerify,
  createSign,
  constants: { RSA_PKCS1_PSS_PADDING, RSA_PSS_SALTLEN_DIGEST }
} = require('crypto')
const { joseToDer, derToJose } = require('ecdsa-sig-formatter')

const TokenError = require('./error')

const publicKeyAlgorithms = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'PS256', 'PS384', 'PS512']
const hashAlgorithms = ['HS256', 'HS384', 'HS512']
const publicKeyMatcher = /BEGIN (?:PUBLIC KEY|CERTIFICATE)/

function validateSecretKey(algorithm, key) {
  if (!(key instanceof Buffer) && typeof key !== 'string') {
    throw new TokenError(
      TokenError.codes.invalidKey,
      `The secret for algorithm ${algorithm} must be a string or a buffer.`
    )
  }
}

function validatePrivateKey(algorithm, key) {
  if (typeof key === 'object') {
    if (typeof key.key !== 'string' && !(key instanceof Buffer)) {
      throw new TokenError(
        TokenError.codes.invalidKey,
        `The key object for algorithm ${algorithm} must have the key property as string or buffer containing the private key.`
      )
    }

    if (key.passphrase && typeof key.passphrase !== 'string') {
      throw new TokenError(
        TokenError.codes.invalidKey,
        `The key object for algorithm ${algorithm} must have the passphrase property as string or buffer containing the private key.`
      )
    }
  }

  if (typeof key !== 'string' && typeof key !== 'object' && !(key instanceof Buffer)) {
    throw new TokenError(
      TokenError.codes.invalidKey,
      `The key for algorithm ${algorithm} must be a string, a object or a buffer.`
    )
  }
}

function validatePublicKey(algorithm, key) {
  if (!(key instanceof Buffer) && typeof key !== 'string') {
    throw new TokenError(
      TokenError.codes.invalidKey,
      `The key for algorithm ${algorithm} must be a string or a buffer containing the public key.`
    )
  }
}

function getSupportedAlgorithms(key) {
  const keyString = key instanceof Buffer ? key.toString('utf8') : key

  if (!keyString) {
    return ['none']
  } else if (keyString.match(publicKeyMatcher)) {
    return publicKeyAlgorithms
  }

  return hashAlgorithms
}

function createSignature(algorithm, key, header, payload) {
  try {
    const type = algorithm.slice(0, 2)
    const bits = algorithm.slice(2)
    const input = `${header}.${payload}`
    let signer, signature

    switch (type) {
      case 'RS':
      case 'ES':
        validatePrivateKey(algorithm, key)

        signer = createSign(`RSA-SHA${bits}`)
        signer.update(input)

        signature = signer.sign(key, 'base64')

        if (type === 'ES') {
          signature = derToJose(signature, `ES${bits}`).toString('base64')
        }

        break
      case 'PS':
        validatePrivateKey(algorithm, key)

        signer = createSign(`RSA-SHA${bits}`)
        signer.update(input)

        signature = signer.sign(
          {
            key: key,
            padding: RSA_PKCS1_PSS_PADDING,
            saltLength: RSA_PSS_SALTLEN_DIGEST
          },
          'base64'
        )
        break
      default:
        // HS
        validateSecretKey(algorithm, key)

        signer = createHmac(`SHA${bits}`, key)
        signer.update(input)
        signature = signer.digest('base64')
    }

    return signature
  } catch (e) {
    throw new TokenError(TokenError.codes.signError, 'Cannot create the signature.', { originalError: e })
  }
}

function verifySignature(algorithm, key, input, signature) {
  try {
    const type = algorithm.slice(0, 2)
    const bits = algorithm.slice(2)
    let verifier

    switch (type) {
      case 'ES':
      case 'RS':
        validatePublicKey(algorithm, key)

        verifier = createVerify(`RSA-SHA${bits}`)
        verifier.update(input)

        return verifier.verify(
          key,
          type === 'ES' ? joseToDer(signature, `ES${bits}`).toString('base64') : signature,
          'base64'
        )
      case 'PS':
        validatePublicKey(algorithm, key)

        verifier = createVerify(`RSA-SHA${bits}`)
        verifier.update(input)

        return verifier.verify(
          {
            key: key,
            padding: RSA_PKCS1_PSS_PADDING,
            saltLength: RSA_PSS_SALTLEN_DIGEST
          },
          signature,
          'base64'
        )
      default:
        // HS
        validateSecretKey(algorithm, key)

        verifier = createHmac(`SHA${bits}`, key)
        verifier.update(input)

        return verifier.digest('base64') === signature
    }
  } catch (e) {
    throw new TokenError(TokenError.codes.verifyError, 'Cannot verify the signature.', { originalError: e })
  }
}

module.exports = {
  publicKeyAlgorithms,
  hashAlgorithms,
  getSupportedAlgorithms,
  createSignature,
  verifySignature
}

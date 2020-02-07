'use strict'

const { publicKeyAlgorithms, hashAlgorithms, createSignature } = require('./crypto')
const { detectAlgorithm } = require('./privateKeyParser')
const TokenError = require('./error')
const { base64UrlEncode, getAsyncKey, ensurePromiseCallback } = require('./utils')

const supportedAlgorithms = Array.from(new Set([...publicKeyAlgorithms, ...hashAlgorithms, 'none'])).join(', ')

module.exports = function createSigner(options) {
  let {
    key,
    algorithm,
    noTimestamp,
    mutatePayload,
    clockTimestamp,
    expiresIn,
    notBefore,
    jti,
    aud,
    iss,
    sub,
    nonce,
    kid,
    header: additionalHeader
  } = { clockTimestamp: 0, ...options }

  // Validate options
  if (
    algorithm &&
    algorithm !== 'none' &&
    !publicKeyAlgorithms.includes(algorithm) &&
    !hashAlgorithms.includes(algorithm)
  ) {
    throw new TokenError(
      TokenError.codes.invalidOption,
      `The algorithm option must be one of the following values: ${supportedAlgorithms}.`
    )
  }

  if (algorithm === 'none') {
    if (key) {
      throw new TokenError(
        TokenError.codes.invalidOption,
        'The key option must not be provided when the algorithm option is "none".'
      )
    }
  } else if (!key || (typeof key !== 'string' && typeof key !== 'object' && typeof key !== 'function')) {
    throw new TokenError(
      TokenError.codes.invalidOption,
      'The key option must be a string, buffer, object or callback containing a secret or a private key.'
    )
  }

  if (expiresIn && (typeof expiresIn !== 'number' || expiresIn < 0)) {
    throw new TokenError(TokenError.codes.invalidOption, 'The expiresIn option must be a positive number.')
  }

  if (notBefore && (typeof notBefore !== 'number' || notBefore < 0)) {
    throw new TokenError(TokenError.codes.invalidOption, 'The notBefore option must be a positive number.')
  }

  if (clockTimestamp && (typeof clockTimestamp !== 'number' || clockTimestamp < 0)) {
    throw new TokenError(TokenError.codes.invalidOption, 'The clockTimestamp option must be a positive number.')
  }

  if (jti && typeof jti !== 'string') {
    throw new TokenError(TokenError.codes.invalidOption, 'The jti option must be a string.')
  }

  if (aud && typeof aud !== 'string' && !Array.isArray(aud)) {
    throw new TokenError(TokenError.codes.invalidOption, 'The aud option must be a string or an array of strings.')
  }

  if (iss && typeof iss !== 'string') {
    throw new TokenError(TokenError.codes.invalidOption, 'The iss option must be a string.')
  }

  if (sub && typeof sub !== 'string') {
    throw new TokenError(TokenError.codes.invalidOption, 'The sub option must be a string.')
  }

  if (nonce && typeof nonce !== 'string') {
    throw new TokenError(TokenError.codes.invalidOption, 'The nonce option must be a string.')
  }

  if (kid && typeof kid !== 'string') {
    throw new TokenError(TokenError.codes.invalidOption, 'The kid option must be a string.')
  }

  if (additionalHeader && typeof additionalHeader !== 'object') {
    throw new TokenError(TokenError.codes.invalidOption, 'The header option must be a object.')
  }

  // Prepare the fixed payload
  const fixedPayload = {
    jti,
    aud,
    iss,
    sub,
    nonce
  }

  // Return the signer
  const signer = function sign(payload, cb) {
    const [callback, promise] = typeof key === 'function' ? ensurePromiseCallback(cb) : []

    // Prepare header and payload
    if (typeof payload !== 'string' && typeof payload !== 'object') {
      throw new TokenError(TokenError.codes.invalidType, 'The payload must be a object, a string or a buffer.')
    } else if (payload instanceof Buffer) {
      payload = payload.toString('utf-8')
    }

    const header = { alg: algorithm, typ: typeof payload === 'object' ? 'JWT' : undefined, kid, ...additionalHeader }

    // Prepare the payload
    // All the claims are added only if the payload is not a string
    let finalPayload = payload

    if (typeof payload !== 'string') {
      const iat = payload.iat * 1000 || clockTimestamp || Date.now()
      const additionalPayload = {}

      if (!noTimestamp) {
        additionalPayload.iat = Math.floor(iat / 1000)
      }

      if (expiresIn) {
        additionalPayload.exp = Math.floor((iat + expiresIn) / 1000)
      }

      if (notBefore) {
        additionalPayload.nbf = Math.floor((iat + notBefore) / 1000)
      }

      // Assign the final payload
      if (mutatePayload) {
        finalPayload = JSON.stringify(Object.assign(payload, fixedPayload, additionalPayload))
      } else {
        finalPayload = JSON.stringify(Object.assign({}, payload, fixedPayload, additionalPayload))
      }
    }

    const encodedPayload = base64UrlEncode(Buffer.from(finalPayload, 'utf-8'))

    // We're get the key synchronously
    if (!callback) {
      if (!algorithm) {
        algorithm = header.alg = detectAlgorithm(key)
      }

      const encodedHeader = base64UrlEncode(Buffer.from(JSON.stringify(header), 'utf-8'))
      const encodedSignature =
        algorithm === 'none' ? '' : base64UrlEncode(createSignature(algorithm, key, encodedHeader, encodedPayload))

      return `${encodedHeader}.${encodedPayload}.${encodedSignature}`
    }

    getAsyncKey(key, header, (err, currentKey) => {
      if (err) {
        const error = TokenError.wrap(err, TokenError.codes.keyFetchingError, 'Cannot fetch key.')
        return callback(error)
      }

      let token
      try {
        if (!algorithm) {
          algorithm = header.alg = detectAlgorithm(key)
        }

        const encodedHeader = base64UrlEncode(Buffer.from(JSON.stringify(header), 'utf-8'))
        const encodedSignature = base64UrlEncode(createSignature(algorithm, currentKey, encodedHeader, encodedPayload))

        token = `${encodedHeader}.${encodedPayload}.${encodedSignature}`
      } catch (e) {
        return callback(e)
      }

      callback(null, token)
    })

    return promise
  }

  return signer
}

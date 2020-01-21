'use strict'

const { publicKeyAlgorithms, rsaKeyAlgorithms, hashAlgorithms, createSignature } = require('./crypto')
const TokenError = require('./error')
const { base64UrlEncode, getAsyncSecret, ensurePromiseCallback } = require('./utils')

const supportedAlgorithms = Array.from(
  new Set([...publicKeyAlgorithms, ...rsaKeyAlgorithms, ...hashAlgorithms, 'none'])
).join(', ')

module.exports = function createSigner(options) {
  const {
    secret,
    algorithm,
    encoding,
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
  } = { algorithm: 'HS256', clockTimestamp: 0, ...options }

  // Validate options
  if (
    algorithm !== 'none' &&
    !publicKeyAlgorithms.includes(algorithm) &&
    !rsaKeyAlgorithms.includes(algorithm) &&
    !hashAlgorithms.includes(algorithm)
  ) {
    throw new TokenError(
      TokenError.codes.invalidOption,
      `The algorithm option must be one of the following values: ${supportedAlgorithms}.`
    )
  }

  if (algorithm === 'none') {
    if (secret) {
      throw new TokenError(
        TokenError.codes.invalidOption,
        'The secret option must not be provided when the algorithm option is "none".'
      )
    }
  } else if (!secret || (typeof secret !== 'string' && typeof secret !== 'object' && typeof secret !== 'function')) {
    throw new TokenError(
      TokenError.codes.invalidOption,
      'The secret option must be a string, buffer, object or callback containing a secret or a private key.'
    )
  }

  if (encoding && typeof encoding !== 'string') {
    throw new TokenError(TokenError.codes.invalidOption, 'The encoding option must be a string.')
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
  return function sign(payload, cb) {
    const [callback, promise] = typeof secret === 'function' ? ensurePromiseCallback(cb) : []

    // Prepare header and payload
    // Prepare the header
    if (typeof payload !== 'string' && typeof payload !== 'object') {
      throw new TokenError(TokenError.codes.invalidType, 'The payload must be a object, a string or a buffer.')
    } else if (payload instanceof Buffer) {
      payload = payload.toString(encoding)
    }

    const header = Object.assign(
      { alg: algorithm, typ: typeof payload === 'object' ? 'JWT' : undefined, kid },
      additionalHeader
    )

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

    const encodedHeader = base64UrlEncode(Buffer.from(JSON.stringify(header)).toString('base64'))
    const encodedPayload = base64UrlEncode(Buffer.from(finalPayload).toString('base64'))

    // We're get the secret synchronously
    if (!callback) {
      const encodedSignature =
        algorithm === 'none' ? '' : base64UrlEncode(createSignature(algorithm, secret, encodedHeader, encodedPayload))

      return `${encodedHeader}.${encodedPayload}.${encodedSignature}`
    }

    getAsyncSecret(secret, header, (err, currentSecret) => {
      if (err) {
        return callback(
          err instanceof TokenError
            ? err
            : new TokenError(TokenError.codes.secretFetchingError, 'Cannot fetch secret.', { originalError: err })
        )
      }

      try {
        const encodedSignature = base64UrlEncode(
          createSignature(algorithm, currentSecret, encodedHeader, encodedPayload)
        )

        callback(null, `${encodedHeader}.${encodedPayload}.${encodedSignature}`)
      } catch (e) {
        callback(e)
      }
    })

    return promise
  }
}

'use strict'

const { base64UrlMatcher, base64UrlReplacer, createSignature } = require('./crypto')
const TokenError = require('./error')
const { hsAlgorithms, esAlgorithms, rsaAlgorithms, edAlgorithms, detectPrivateKey } = require('./keyParser')
const { getAsyncKey, ensurePromiseCallback, keyToBuffer } = require('./utils')

const supportedAlgorithms = Array.from(
  new Set([...hsAlgorithms, ...esAlgorithms, ...rsaAlgorithms, ...edAlgorithms, 'none'])
).join(', ')

function ensureAlgorithm(algorithm, curve, key, header) {
  // Force detection of EdDSA algorithms in order to get the curve
  if (algorithm && algorithm !== 'EdDSA') {
    return [algorithm, curve]
  }

  const [newAlgorithm, newCurve] = detectPrivateKey(key)
  header.alg = algorithm = algorithm || newAlgorithm
  curve = curve || newCurve

  if (algorithm.slice(0, 2) === 'Ed') {
    header.kty = 'OKP'
    header.crv = curve
  }

  return [algorithm, curve]
}

function sign(
  {
    key,
    algorithm,
    curve,
    noTimestamp,
    mutatePayload,
    clockTimestamp,
    expiresIn,
    notBefore,
    kid,
    isAsync,
    additionalHeader,
    fixedPayload
  },
  payload,
  cb
) {
  const [callback, promise] = isAsync ? ensurePromiseCallback(cb) : []

  // Validate header and payload
  let payloadType = typeof payload
  if (payload instanceof Buffer) {
    payload = payload.toString('utf-8')
    payloadType = 'string'
  } else if (payloadType !== 'string' && payloadType !== 'object') {
    throw new TokenError(TokenError.codes.invalidType, 'The payload must be a object, a string or a buffer.')
  }

  // Prepare the header
  const header = {
    alg: algorithm,
    typ: payloadType === 'object' ? 'JWT' : undefined,
    kty: undefined,
    crv: undefined,
    kid,
    ...additionalHeader
  }

  if (algorithm && algorithm.slice(0, 2) === 'Ed') {
    header.kty = 'OKP'
    header.crv = curve
  }

  // Prepare the payload
  let encodedPayload = ''

  // All the claims are added only if the payload is not a string
  if (payloadType !== 'string') {
    const iat = payload.iat * 1000 || clockTimestamp || Date.now()

    const finalPayload = {
      ...payload,
      ...fixedPayload,
      iat: noTimestamp ? undefined : iat / 1000,
      exp: expiresIn ? Math.floor((iat + expiresIn) / 1000) : undefined,
      nbf: notBefore ? Math.floor((iat + notBefore) / 1000) : undefined
    }

    if (mutatePayload) {
      Object.assign(payload, finalPayload)
    }

    encodedPayload = Buffer.from(JSON.stringify(finalPayload), 'utf-8')
      .toString('base64')
      .replace(base64UrlMatcher, base64UrlReplacer)
  } else {
    encodedPayload = Buffer.from(payload, 'utf-8')
      .toString('base64')
      .replace(base64UrlMatcher, base64UrlReplacer)
  }

  // We have the key
  if (!callback) {
    const encodedHeader = Buffer.from(JSON.stringify(header), 'utf-8')
      .toString('base64')
      .replace(base64UrlMatcher, base64UrlReplacer)

    const input = encodedHeader + '.' + encodedPayload
    const signature = algorithm === 'none' ? '' : createSignature(algorithm, key, input)

    return input + '.' + signature
  }

  // Get the key asynchronously
  getAsyncKey(key, header, (err, currentKey) => {
    if (err) {
      const error = TokenError.wrap(err, TokenError.codes.keyFetchingError, 'Cannot fetch key.')
      return callback(error)
    }

    currentKey = keyToBuffer(currentKey)

    let token
    try {
      ;[algorithm, curve] = ensureAlgorithm(algorithm, curve, currentKey, header)

      const encodedHeader = Buffer.from(JSON.stringify(header), 'utf-8')
        .toString('base64')
        .replace(base64UrlMatcher, base64UrlReplacer)

      const input = encodedHeader + '.' + encodedPayload
      token = input + '.' + createSignature(algorithm, currentKey, input)
    } catch (e) {
      return callback(e)
    }

    callback(null, token)
  })

  return promise
}

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
    !hsAlgorithms.includes(algorithm) &&
    !esAlgorithms.includes(algorithm) &&
    !rsaAlgorithms.includes(algorithm) &&
    !edAlgorithms.includes(algorithm)
  ) {
    throw new TokenError(
      TokenError.codes.invalidOption,
      `The algorithm option must be one of the following values: ${supportedAlgorithms}.`
    )
  }

  const keyType = typeof key
  let curve = ''

  if (algorithm === 'none') {
    if (key) {
      throw new TokenError(
        TokenError.codes.invalidOption,
        'The key option must not be provided when the algorithm option is "none".'
      )
    }
  } else if (!key || (keyType !== 'string' && keyType !== 'object' && keyType !== 'function')) {
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

  // Convert the key to a buffer when not a function - If static also detect the algorithm here
  if (key && keyType !== 'function') {
    key = keyToBuffer(key)

    // Force detection of EdDSA algorithms in order to get the curve
    ;[algorithm, curve] = ensureAlgorithm(algorithm, curve, key, {})
  }

  // Return the signer
  const context = {
    key,
    algorithm,
    curve,
    noTimestamp,
    mutatePayload,
    clockTimestamp,
    expiresIn,
    notBefore,
    kid,
    isAsync: keyType === 'function',
    additionalHeader,
    fixedPayload: {
      jti,
      aud,
      iss,
      sub,
      nonce
    }
  }

  return sign.bind(null, context)
}

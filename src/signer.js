'use strict'

const {
  base64UrlMatcher,
  base64UrlReplacer,
  hsAlgorithms,
  esAlgorithms,
  rsaAlgorithms,
  edAlgorithms,
  detectPrivateKeyAlgorithm,
  createSignature
} = require('./crypto')
const { TokenError } = require('./error')
const { getAsyncKey, ensurePromiseCallback } = require('./utils')
const { createPrivateKey, createSecretKey } = require('node:crypto')
const { parse: parseMs } = require('@lukeed/ms')

const supportedAlgorithms = new Set([...hsAlgorithms, ...esAlgorithms, ...rsaAlgorithms, ...edAlgorithms, 'none'])

const supportedAlgorithmsList = Array.from(supportedAlgorithms).join(', ')

function checkIsCompatibleAlgorithm(expected, actual) {
  const expectedType = expected.slice(0, 2)
  const actualType = actual.slice(0, 2)

  let valid = true // We accept everything for HS

  // If the key is passphrase encrypted (actual === "ENCRYPTED") only RS and ES algos are supported
  if (expectedType === 'RS' || expectedType === 'PS') {
    // RS and PS use same keys
    valid = actualType === 'RS' || (expectedType === 'RS' && actual === 'ENCRYPTED')
  } else if (expectedType === 'ES' || expectedType === 'Ed') {
    // ES and Ed must match
    valid = expectedType === actualType || (expectedType === 'ES' && actual === 'ENCRYPTED')
  }

  if (!valid) {
    throw new TokenError(TokenError.codes.invalidKey, `Invalid private key provided for algorithm ${expected}.`)
  }
}

function prepareKeyOrSecret(key, algorithm) {
  if (typeof key === 'string') {
    key = Buffer.from(key, 'utf-8')
  }

  return algorithm[0] === 'H' ? createSecretKey(key) : createPrivateKey(key)
}

function sign(
  {
    key,
    algorithm,
    noTimestamp,
    mutatePayload,
    clockTimestamp,
    expiresIn,
    notBefore,
    kid,
    typ,
    isAsync,
    additionalHeader,
    fixedPayload
  },
  payload,
  cb
) {
  const [callback, promise] = isAsync ? ensurePromiseCallback(cb) : []

  // Validate payload
  if (typeof payload !== 'object') {
    throw new TokenError(TokenError.codes.invalidType, 'The payload must be an object.')
  }

  if (payload.exp && (!Number.isInteger(payload.exp) || payload.exp < 0)) {
    throw new TokenError(TokenError.codes.invalidClaimValue, 'The exp claim must be a positive integer.')
  }

  // Prepare the header
  const header = {
    alg: algorithm,
    typ: typ || 'JWT',
    kid,
    ...additionalHeader
  }

  // Prepare the payload
  let encodedPayload = ''

  // Add claims
  const iat = payload.iat * 1000 || clockTimestamp || Date.now()

  const finalPayload = {
    ...payload,
    ...fixedPayload,
    iat: noTimestamp ? undefined : Math.floor(iat / 1000),
    exp: payload.exp ? payload.exp : expiresIn ? Math.floor((iat + expiresIn) / 1000) : undefined,
    nbf: payload.nbf ? payload.nbf : notBefore ? Math.floor((iat + notBefore) / 1000) : undefined
  }

  if (mutatePayload) {
    Object.assign(payload, finalPayload)
  }

  encodedPayload = Buffer.from(JSON.stringify(finalPayload), 'utf-8')
    .toString('base64')
    .replace(base64UrlMatcher, base64UrlReplacer)

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
  getAsyncKey(key, { header, payload }, (err, currentKey) => {
    if (err) {
      const error = TokenError.wrap(err, TokenError.codes.keyFetchingError, 'Cannot fetch key.')
      return callback(error)
    }

    if (typeof currentKey === 'string') {
      currentKey = Buffer.from(currentKey, 'utf-8')
    } else if (!(currentKey instanceof Buffer)) {
      return callback(
        new TokenError(
          TokenError.codes.keyFetchingError,
          'The key returned from the callback must be a string or a buffer containing a secret or a private key.'
        )
      )
    }

    let token
    try {
      // Detect the private key - If the algorithm was known, just verify they match, otherwise assign it
      const availableAlgorithm = detectPrivateKeyAlgorithm(currentKey, algorithm)

      if (algorithm) {
        checkIsCompatibleAlgorithm(algorithm, availableAlgorithm)
      } else {
        header.alg = algorithm = availableAlgorithm
      }

      currentKey = prepareKeyOrSecret(currentKey, algorithm)

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
    typ,
    header: additionalHeader
  } = { clockTimestamp: 0, ...options }

  // Validate options
  if (algorithm && !supportedAlgorithms.has(algorithm)) {
    throw new TokenError(
      TokenError.codes.invalidOption,
      `The algorithm option must be one of the following values: ${supportedAlgorithmsList}.`
    )
  }

  const keyType = typeof key
  const isKeyPasswordProtected = keyType === 'object' && key && key.key && key.passphrase

  if (algorithm === 'none') {
    if (key) {
      throw new TokenError(
        TokenError.codes.invalidOption,
        'The key option must not be provided when the algorithm option is "none".'
      )
    }
  } else if (
    !key ||
    (keyType !== 'string' && !(key instanceof Buffer) && keyType !== 'function' && !isKeyPasswordProtected)
  ) {
    throw new TokenError(
      TokenError.codes.invalidOption,
      'The key option must be a string, a buffer, an object containing key/passphrase properties or a function returning the algorithm secret or private key.'
    )
  } else if (isKeyPasswordProtected && !algorithm) {
    throw new TokenError(
      TokenError.codes.invalidAlgorithm,
      'When using password protected key you must provide the algorithm option.'
    )
  }

  // Convert the key to a string when not a function, in order to be able to detect
  if (key && keyType !== 'function') {
    // Detect the private key - If the algorithm was known, just verify they match, otherwise assign it
    const availableAlgorithm = detectPrivateKeyAlgorithm(isKeyPasswordProtected ? key.key : key, algorithm)

    if (algorithm) {
      checkIsCompatibleAlgorithm(algorithm, availableAlgorithm)
    } else {
      algorithm = availableAlgorithm
    }

    key = prepareKeyOrSecret(key, algorithm)
  }

  if (expiresIn) {
    if (typeof expiresIn === 'string') {
      expiresIn = parseMs(expiresIn)
    }
    if (typeof expiresIn !== 'number' || expiresIn < 0) {
      throw new TokenError(
        TokenError.codes.invalidOption,
        'The expiresIn option must be a positive number or a valid string.'
      )
    }
  }

  if (notBefore) {
    if (typeof notBefore === 'string') {
      notBefore = parseMs(notBefore)
    }
    if (typeof notBefore !== 'number' || notBefore < 0) {
      throw new TokenError(
        TokenError.codes.invalidOption,
        'The notBefore option must be a positive number or a valid string.'
      )
    }
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

  const fpo = { jti, aud, iss, sub, nonce }
  const fixedPayload = Object.entries(fpo).reduce((obj, [key, value]) => {
    if (value !== undefined) {
      obj[key] = value
    }
    return obj
  }, {})

  // Return the signer
  return sign.bind(null, {
    key,
    algorithm,
    noTimestamp,
    mutatePayload,
    clockTimestamp,
    expiresIn,
    notBefore,
    kid,
    typ,
    isAsync: keyType === 'function',
    additionalHeader,
    fixedPayload
  })
}

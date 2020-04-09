'use strict'

const Cache = require('mnemonist/lru-cache')

const { verifySignature } = require('./crypto')
const createDecoder = require('./decoder')
const TokenError = require('./error')
const { detectPublicKeySupportedAlgorithms } = require('./keyParser')
const { keyToBuffer, getAsyncKey, ensurePromiseCallback, hashToken } = require('./utils')

const defaultCacheSize = 1000

function ensureStringClaimMatcher(raw) {
  if (!Array.isArray(raw)) {
    raw = [raw]
  }

  return raw.map(r => (r && typeof r.test === 'function' ? r : new RegExp(r.toString())))
}

function createCache(rawSize) {
  const size = parseInt(rawSize === true ? defaultCacheSize : rawSize, 10)
  return size > 0 ? new Cache(size) : null
}

function cacheSet(
  { cache, token, cacheTTL, payload, ignoreExpiration, ignoreNotBefore, maxAge, clockTimestamp, clockTolerance },
  value
) {
  if (!cache) {
    return value
  }

  const cacheValue = [value, 0, 0]
  const hasIat = payload && typeof payload.iat === 'number'

  // Add time range of the token
  if (hasIat) {
    cacheValue[1] = !ignoreNotBefore && typeof payload.nbf === 'number' ? payload.nbf * 1000 : 0

    if (!ignoreExpiration) {
      if (typeof payload.exp === 'number') {
        cacheValue[2] = payload.exp * 1000
      } else if (maxAge) {
        cacheValue[2] = payload.iat * 1000 + maxAge
      }
    }
  }

  // The maximum TTL for the token cannot exceed the configured cacheTTL
  const maxTTL = (clockTimestamp || Date.now()) + clockTolerance + cacheTTL
  cacheValue[2] = cacheValue[2] === 0 ? maxTTL : Math.min(cacheValue[2], maxTTL)

  cache.set(hashToken(token), cacheValue)

  return value
}

function handleCachedResult(cached, callback, promise) {
  if (cached instanceof TokenError) {
    if (!callback) {
      throw cached
    }

    callback(cached)
  } else {
    if (!callback) {
      return cached
    }

    callback(null, cached)
  }

  return promise
}

function validateAlgorithmAndSignature(input, header, signature, key, allowedAlgorithms) {
  // According to the signature and key, check with algorithms are supported
  const algorithms = allowedAlgorithms.length ? allowedAlgorithms : detectPublicKeySupportedAlgorithms(key)

  // Verify the token is allowed
  if (!algorithms.includes(header.alg)) {
    throw new TokenError(TokenError.codes.invalidAlgorithm, 'The token algorithm is invalid.')
  }

  // Verify the signature, if present
  if (signature && !verifySignature(header.alg, key, input, signature)) {
    throw new TokenError(TokenError.codes.invalidSignature, 'The token signature is invalid.')
  }
}

function validateClaimType(values, claim, array, type) {
  const typeFailureMessage = array
    ? `The ${claim} claim must be a ${type} or an array of ${type}s.`
    : `The ${claim} claim must be a ${type}.`

  if (values.map(v => typeof v).some(t => t !== type)) {
    throw new TokenError(TokenError.codes.invalidClaimType, typeFailureMessage)
  }
}

function validateClaimDateField(values, claim, allowed, arrayValue) {
  const failureMessage = arrayValue
    ? `None of ${claim} claim values is allowed.`
    : `The ${claim} claim value is not allowed.`

  if (!values.some(v => allowed.some(a => a.test(v)))) {
    throw new TokenError(TokenError.codes.invalidClaimValue, failureMessage)
  }
}

function validateClaimValue(value, modifier, now, greater, errorCode, errorVerb) {
  const adjusted = value * 1000 + (modifier || 0)
  const valid = greater ? now >= adjusted : now <= adjusted

  if (!valid) {
    throw new TokenError(TokenError.codes[errorCode], `The token ${errorVerb} at ${new Date(adjusted).toISOString()}.`)
  }
}

function verifyToken(
  key,
  { input, header, payload, signature },
  { validators, allowedAlgorithms, clockTimestamp, clockTolerance }
) {
  // Verify the key
  const hasKey = key instanceof Buffer ? key.length : !!key

  if (hasKey && !signature) {
    throw new TokenError(TokenError.codes.missingSignature, 'The token signature is missing.')
  } else if (!hasKey && signature) {
    throw new TokenError(TokenError.codes.missingKey, 'The key option is missing.')
  }

  validateAlgorithmAndSignature(input, header, signature, key, allowedAlgorithms)

  if (typeof payload === 'string') {
    return
  }

  // Verify the payload
  const now = (clockTimestamp || Date.now()) + clockTolerance

  for (const validator of validators) {
    const { type, claim, allowed, array, modifier, greater, errorCode, errorVerb } = validator
    const value = payload[claim]
    const arrayValue = Array.isArray(value)
    const values = arrayValue ? value : [value]

    // Skip validation if claim is missing
    if (!(claim in payload)) {
      continue
    }

    // Validate type
    validateClaimType(values, claim, array, type === 'date' ? 'number' : 'string')

    if (type === 'date') {
      validateClaimValue(value, modifier, now, greater, errorCode, errorVerb)
    } else {
      validateClaimDateField(values, claim, allowed, arrayValue)
    }
  }
}

function verify(
  {
    key,
    allowedAlgorithms,
    complete,
    cacheTTL,
    clockTimestamp,
    clockTolerance,
    ignoreExpiration,
    ignoreNotBefore,
    maxAge,
    isAsync,
    validators,
    decode,
    cache
  },
  token,
  cb
) {
  const [callback, promise] = isAsync ? ensurePromiseCallback(cb) : []

  const cacheContext = {
    cache,
    token,
    cacheTTL,
    payload: undefined,
    ignoreExpiration,
    ignoreNotBefore,
    maxAge,
    clockTimestamp,
    clockTolerance
  }

  // Check the cache
  if (cache) {
    const [value, min, max] = cache.get(hashToken(token)) || [undefined, 0, 0]
    const now = (clockTimestamp || Date.now()) + clockTolerance

    // Validate time range
    if (typeof value !== 'undefined' && (min === 0 || now > min) && (max === 0 || now <= max)) {
      // Cache hit
      return handleCachedResult(value, callback, promise)
    }
  }

  /*
    As very first thing, decode the token - If invalid, everything else is useless.
    We don't involve cache here since it's much slower.
  */
  let decoded
  try {
    decoded = decode(token)
  } catch (e) {
    if (callback) {
      callback(e)
      return promise
    }

    throw e
  }

  const { header, payload, signature } = decoded
  cacheContext.payload = payload
  const validationContext = { validators, allowedAlgorithms, clockTimestamp, clockTolerance }

  // We have the key
  if (!callback) {
    try {
      verifyToken(key, decoded, validationContext)

      return cacheSet(cacheContext, complete ? { header, payload, signature } : payload)
    } catch (e) {
      throw cacheSet(cacheContext, e)
    }
  }

  // Get the key asynchronously
  getAsyncKey(key, header, (err, currentKey) => {
    if (err) {
      return callback(
        cacheSet(cacheContext, TokenError.wrap(err, TokenError.codes.keyFetchingError, 'Cannot fetch key.'))
      )
    }

    try {
      verifyToken(keyToBuffer(currentKey), decoded, validationContext)
    } catch (e) {
      return callback(cacheSet(cacheContext, e))
    }

    callback(null, cacheSet(cacheContext, complete ? { header, payload, signature } : payload))
  })

  return promise
}

module.exports = function createVerifier(options) {
  let {
    key,
    algorithms: allowedAlgorithms,
    json,
    complete,
    cache: cacheSize,
    cacheTTL,
    clockTimestamp,
    clockTolerance,
    ignoreExpiration,
    ignoreNotBefore,
    maxAge,
    allowedJti,
    allowedAud,
    allowedIss,
    allowedSub,
    allowedNonce
  } = { cacheTTL: 600000, ...options }

  // Validate options
  const keyType = typeof key
  if (keyType !== 'string' && keyType !== 'object' && keyType !== 'function') {
    throw new TokenError(
      TokenError.codes.INVALID_OPTION,
      'The key option must be a string, a buffer or a function returning the algorithm secret or public key.'
    )
  }

  // Convert the key to a buffer
  if (key && keyType !== 'function') {
    key = keyToBuffer(key)
  }

  if (clockTimestamp && (typeof clockTimestamp !== 'number' || clockTimestamp < 0)) {
    throw new TokenError(TokenError.codes.invalidOption, 'The clockTimestamp option must be a positive number.')
  }

  if (clockTolerance && (typeof clockTolerance !== 'number' || clockTolerance < 0)) {
    throw new TokenError(TokenError.codes.invalidOption, 'The clockTolerance option must be a positive number.')
  } else {
    clockTolerance = 0
  }

  if (cacheTTL && (typeof cacheTTL !== 'number' || cacheTTL < 0)) {
    throw new TokenError(TokenError.codes.invalidOption, 'The cacheTTL option must be a positive number.')
  }

  if (!Array.isArray(allowedAlgorithms)) {
    allowedAlgorithms = []
  }

  // Add validators
  const validators = []

  if (!ignoreNotBefore) {
    validators.push({ type: 'date', claim: 'nbf', errorCode: 'inactive', errorVerb: 'will be active', greater: true })
  }

  if (!ignoreExpiration) {
    validators.push({ type: 'date', claim: 'exp', errorCode: 'expired', errorVerb: 'has expired' })
  }

  if (typeof maxAge === 'number') {
    validators.push({ type: 'date', claim: 'iat', errorCode: 'expired', errorVerb: 'has expired', modifier: maxAge })
  }

  if (allowedJti) {
    validators.push({ type: 'string', claim: 'jti', allowed: ensureStringClaimMatcher(allowedJti) })
  }

  if (allowedAud) {
    validators.push({ type: 'string', claim: 'aud', allowed: ensureStringClaimMatcher(allowedAud), array: true })
  }

  if (allowedIss) {
    validators.push({ type: 'string', claim: 'iss', allowed: ensureStringClaimMatcher(allowedIss) })
  }

  if (allowedSub) {
    validators.push({ type: 'string', claim: 'sub', allowed: ensureStringClaimMatcher(allowedSub) })
  }

  if (allowedNonce) {
    validators.push({ type: 'string', claim: 'nonce', allowed: ensureStringClaimMatcher(allowedNonce) })
  }

  const context = {
    key,
    allowedAlgorithms,
    complete,
    cacheTTL,
    clockTimestamp,
    clockTolerance,
    ignoreExpiration,
    ignoreNotBefore,
    maxAge,
    isAsync: keyType === 'function',
    validators,
    decode: createDecoder({ json, complete: true }),
    cache: createCache(cacheSize)
  }

  // Return the verifier
  const verifier = verify.bind(null, context)
  verifier.cache = context.cache
  return verifier
}

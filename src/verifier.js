'use strict'

const { createPublicKey, createSecretKey } = require('crypto')
const Cache = require('mnemonist/lru-cache')

const { useNewCrypto, hsAlgorithms, verifySignature, detectPublicKeyAlgorithms } = require('./crypto')
const createDecoder = require('./decoder')
const TokenError = require('./error')
const { getAsyncKey, ensurePromiseCallback, hashToken } = require('./utils')

const defaultCacheSize = 1000

function exactStringClaimMatcher(allowed, actual) {
  return allowed === actual
}

function checkAreCompatibleAlgorithms(expected, actual) {
  let valid = false

  for (const expectedAlg of expected) {
    valid = actual.indexOf(expectedAlg) !== -1

    // if at least one of the expected algorithms is compatible we're done
    if (valid) {
      break
    }
  }

  if (!valid) {
    throw new TokenError(
      TokenError.codes.invalidKey,
      `Invalid public key provided for algorithms ${expected.join(', ')}.`
    )
  }
}

function prepareKeyOrSecret(key, isSecret) {
  if (typeof key === 'string') {
    key = Buffer.from(key, 'utf-8')
  }

  // Only on Node 12 - Create a key object
  /* istanbul ignore next */
  if (useNewCrypto) {
    key = isSecret ? createSecretKey(key) : createPublicKey(key)
  }

  return key
}

function ensureStringClaimMatcher(raw) {
  if (!Array.isArray(raw)) {
    raw = [raw]
  }

  return raw
    .filter(r => r)
    .map(r => {
      if (r && typeof r.test === 'function') {
        return r
      }

      return { test: exactStringClaimMatcher.bind(null, r) }
    })
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
    cacheValue[1] = !ignoreNotBefore && typeof payload.nbf === 'number' ? (payload.nbf * 1000 - clockTolerance) : 0

    if (!ignoreExpiration) {
      if (typeof payload.exp === 'number') {
        cacheValue[2] = payload.exp * 1000 + clockTolerance
      } else if (maxAge) {
        cacheValue[2] = payload.iat * 1000 + maxAge + clockTolerance
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
  const algorithms = allowedAlgorithms

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

function validateClaimValues(values, claim, allowed, arrayValue) {
  const failureMessage = arrayValue
    ? `None of ${claim} claim values are allowed.`
    : `The ${claim} claim value is not allowed.`

  if (!values.some(v => allowed.some(a => a.test(v)))) {
    throw new TokenError(TokenError.codes.invalidClaimValue, failureMessage)
  }
}

function validateClaimDateValue(value, modifier, now, greater, errorCode, errorVerb) {
  const adjusted = value * 1000 + (modifier || 0)
  const valid = greater ? now >= adjusted : now <= adjusted

  if (!valid) {
    throw new TokenError(TokenError.codes[errorCode], `The token ${errorVerb} at ${new Date(adjusted).toISOString()}.`)
  }
}

function verifyToken(
  key,
  { input, header, payload, signature },
  { validators, allowedAlgorithms, checkTyp, clockTimestamp, clockTolerance, requiredClaims }
) {
  // Verify the key
  /* istanbul ignore next */
  const hasKey = key instanceof Buffer ? key.length : !!key

  if (hasKey && !signature) {
    throw new TokenError(TokenError.codes.missingSignature, 'The token signature is missing.')
  } else if (!hasKey && signature) {
    throw new TokenError(TokenError.codes.missingKey, 'The key option is missing.')
  }

  validateAlgorithmAndSignature(input, header, signature, key, allowedAlgorithms)

  // Verify typ
  if (checkTyp) {
    if (typeof header.typ !== 'string' || checkTyp !== header.typ.toLowerCase().replace(/^application\//, '')) {
      throw new TokenError(TokenError.codes.invalidType, 'Invalid typ.')
    }
  }

  // Verify the payload
  const now = clockTimestamp || Date.now()

  for (const validator of validators) {
    const { type, claim, allowed, array, modifier, greater, errorCode, errorVerb } = validator
    const value = payload[claim]
    const arrayValue = Array.isArray(value)
    const values = arrayValue ? value : [value]

    // Check if the claim is marked as required before skipping it
    if (!(claim in payload)) {
      if (requiredClaims && requiredClaims.includes(claim)) {
        throw new TokenError(TokenError.codes.missingRequiredClaim, `The ${claim} claim is required.`)
      }

      continue
    }

    // Validate type
    validateClaimType(values, claim, array, type === 'date' ? 'number' : 'string')

    if (type === 'date') {
      validateClaimDateValue(value, modifier, now, greater, errorCode, errorVerb)
    } else {
      validateClaimValues(values, claim, allowed, arrayValue)
    }
  }
}

function verify(
  {
    key,
    allowedAlgorithms,
    complete,
    cacheTTL,
    checkTyp,
    clockTimestamp,
    clockTolerance,
    ignoreExpiration,
    ignoreNotBefore,
    maxAge,
    isAsync,
    validators,
    decode,
    cache,
    requiredClaims
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
    const now = clockTimestamp || Date.now()

    // Validate time range
    if (typeof value !== 'undefined' &&
      (min === 0 || (now < min && value.code === 'FAST_JWT_INACTIVE') || (now >= min && value.code !== 'FAST_JWT_INACTIVE')) &&
      (max === 0 || now <= max)) {
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
  const validationContext = { validators, allowedAlgorithms, checkTyp, clockTimestamp, clockTolerance, requiredClaims }

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

    if (typeof currentKey === 'string') {
      currentKey = Buffer.from(currentKey, 'utf-8')
    } else if (!(currentKey instanceof Buffer)) {
      return callback(
        cacheSet(
          cacheContext,
          new TokenError(
            TokenError.codes.keyFetchingError,
            'The key returned from the callback must be a string or a buffer containing a secret or a public key.'
          )
        )
      )
    }

    try {
      // Detect the private key - If the algorithms were known, just verify they match, otherwise assign them
      const availableAlgorithms = detectPublicKeyAlgorithms(currentKey)

      if (validationContext.allowedAlgorithms.length) {
        checkAreCompatibleAlgorithms(allowedAlgorithms, availableAlgorithms)
      } else {
        validationContext.allowedAlgorithms = availableAlgorithms
      }

      currentKey = prepareKeyOrSecret(currentKey, availableAlgorithms[0] === hsAlgorithms[0])

      verifyToken(currentKey, decoded, validationContext)
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
    complete,
    cache: cacheSize,
    cacheTTL,
    checkTyp,
    clockTimestamp,
    clockTolerance,
    ignoreExpiration,
    ignoreNotBefore,
    maxAge,
    allowedJti,
    allowedAud,
    allowedIss,
    allowedSub,
    allowedNonce,
    requiredClaims
  } = { cacheTTL: 600000, clockTolerance: 0, ...options }

  // Validate options
  if (!Array.isArray(allowedAlgorithms)) {
    allowedAlgorithms = []
  }

  const keyType = typeof key
  if (keyType !== 'string' && keyType !== 'object' && keyType !== 'function') {
    throw new TokenError(
      TokenError.codes.INVALID_OPTION,
      'The key option must be a string, a buffer or a function returning the algorithm secret or public key.'
    )
  }

  if (key && keyType !== 'function') {
    // Detect the private key - If the algorithms were known, just verify they match, otherwise assign them
    const availableAlgorithms = detectPublicKeyAlgorithms(key)

    if (allowedAlgorithms.length) {
      checkAreCompatibleAlgorithms(allowedAlgorithms, availableAlgorithms)
    } else {
      allowedAlgorithms = availableAlgorithms
    }

    key = prepareKeyOrSecret(key, availableAlgorithms[0] === hsAlgorithms[0])
  }

  if (clockTimestamp && (typeof clockTimestamp !== 'number' || clockTimestamp < 0)) {
    throw new TokenError(TokenError.codes.invalidOption, 'The clockTimestamp option must be a positive number.')
  }

  if (clockTolerance && (typeof clockTolerance !== 'number' || clockTolerance < 0)) {
    throw new TokenError(TokenError.codes.invalidOption, 'The clockTolerance option must be a positive number.')
  }

  if (cacheTTL && (typeof cacheTTL !== 'number' || cacheTTL < 0)) {
    throw new TokenError(TokenError.codes.invalidOption, 'The cacheTTL option must be a positive number.')
  }

  if (requiredClaims && !Array.isArray(requiredClaims)) {
    throw new TokenError(TokenError.codes.invalidOption, 'The requiredClaims option must be an array.')
  }

  // Add validators
  const validators = []

  if (!ignoreNotBefore) {
    validators.push({ type: 'date', claim: 'nbf', errorCode: 'inactive', errorVerb: 'will be active', greater: true, modifier: -clockTolerance })
  }

  if (!ignoreExpiration) {
    validators.push({ type: 'date', claim: 'exp', errorCode: 'expired', errorVerb: 'has expired', modifier: +clockTolerance })
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

  let normalizedTyp = null
  if (checkTyp) {
    normalizedTyp = checkTyp.toLowerCase().replace(/^application\//, '')
  }

  const context = {
    key,
    allowedAlgorithms,
    complete,
    cacheTTL,
    checkTyp: normalizedTyp,
    clockTimestamp,
    clockTolerance,
    ignoreExpiration,
    ignoreNotBefore,
    maxAge,
    isAsync: keyType === 'function',
    validators,
    decode: createDecoder({ complete: true }),
    cache: createCache(cacheSize),
    requiredClaims
  }

  // Return the verifier
  const verifier = verify.bind(null, context)
  verifier.cache = context.cache
  return verifier
}

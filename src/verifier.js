'use strict'

const { getSupportedAlgorithms, verifySignature } = require('./crypto')
const createDecoder = require('./decoder')
const TokenError = require('./error')
const { getAsyncKey, ensurePromiseCallback, createCache, getCacheSize, handleCachedResult } = require('./utils')

function ensureStringClaimMatcher(raw) {
  if (!Array.isArray(raw)) {
    raw = [raw]
  }

  return raw.map(r => (r && typeof r.test === 'function' ? r : new RegExp(r.toString())))
}

function verifyToken(
  key,
  input,
  header,
  payload,
  signature,
  validators,
  allowedAlgorithms,
  clockTimestamp,
  clockTolerance
) {
  // Verify the key
  const hasKey = key instanceof Buffer ? key.length : !!key

  if (hasKey && !signature) {
    throw new TokenError(TokenError.codes.missingSignature, 'The token signature is missing.')
  } else if (!hasKey && signature) {
    throw new TokenError(TokenError.codes.missingKey, 'The key option is missing.')
  }

  // According to the signature and key, check with algorithms are supported
  const algorithms = allowedAlgorithms.length ? allowedAlgorithms : getSupportedAlgorithms(key)

  // Verify the token is allowed
  if (!algorithms.includes(header.alg)) {
    throw new TokenError(TokenError.codes.invalidAlgorithm, 'The token algorithm is invalid.')
  }

  // Verify the signature, if present
  if (signature && !verifySignature(header.alg, key, input, signature)) {
    throw new TokenError(TokenError.codes.invalidSignature, 'The token signature is invalid.')
  }

  // Verify the payload
  const now = (clockTimestamp || Date.now()) + clockTolerance

  for (const validator of validators) {
    const { type, claim, allowed, array, modifier, greater, errorCode, errorVerb } = validator
    const value = payload[claim]
    const arrayValue = Array.isArray(value)
    const claimType = array && arrayValue ? value.map(v => typeof v) : typeof value
    const claimRequestedType = type === 'date' ? 'number' : 'string'

    // Check that the value exists (otherwise skip the validation) and that is of the valid value
    if (claimType === 'undefined') {
      continue
    }

    // Check the type
    const typeFailureMessage = array
      ? `The ${claim} claim must be a ${claimRequestedType} or an array of ${claimRequestedType}s.`
      : `The ${claim} claim must be a ${claimRequestedType}.`

    if (arrayValue) {
      if (claimType.some(t => t !== claimRequestedType)) {
        throw new TokenError(TokenError.codes.invalidClaimType, typeFailureMessage)
      }
    } else if (claimType !== claimRequestedType) {
      throw new TokenError(TokenError.codes.invalidClaimType, typeFailureMessage)
    }

    if (type === 'date') {
      const adjusted = value * 1000 + (modifier || 0)
      const valid = greater ? now >= adjusted : now <= adjusted

      if (!valid) {
        throw new TokenError(
          TokenError.codes[errorCode],
          `The token ${errorVerb} at ${new Date(adjusted).toISOString()}.`
        )
      }
    } else {
      // All these traversing are probably slow. These should probably be refactored.
      if (arrayValue) {
        if (!value.some(v => allowed.some(a => a.test(v)))) {
          throw new TokenError(TokenError.codes.invalidClaimValue, `None of ${claim} claim values is allowed.`)
        }
      } else if (!allowed.some(a => a.test(value))) {
        throw new TokenError(TokenError.codes.invalidClaimValue, `The ${claim} claim value is not allowed.`)
      }
    }
  }
}

module.exports = function createVerifier(options) {
  let {
    key,
    algorithms: allowedAlgorithms,
    json,
    complete,
    encoding,
    cache,
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
  if (typeof key !== 'string' && !(key instanceof Buffer) && typeof key !== 'function') {
    throw new TokenError(
      TokenError.codes.INVALID_OPTION,
      'The key option must be a string, a buffer or a function returning the algorithm secret or public key.'
    )
  }

  if (clockTimestamp && (typeof clockTimestamp !== 'number' || clockTimestamp < 0)) {
    throw new TokenError(TokenError.codes.invalidOption, 'The clockTimestamp option must be a positive number.')
  }

  if (clockTolerance && (typeof clockTolerance !== 'number' || clockTolerance < 0)) {
    throw new TokenError(TokenError.codes.invalidOption, 'The clockTolerance option must be a positive number.')
  } else {
    clockTolerance = 0
  }

  if (encoding && typeof encoding !== 'string') {
    throw new TokenError(TokenError.codes.invalidOption, 'The encoding option must be a string.')
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

  const decodeJwt = createDecoder({ json, complete: true, encoding, cache, cacheTTL })

  // Prepare the caching layer
  let [cacheGet, cacheSet, cacheProperties] = createCache(getCacheSize(cache))

  if (cacheProperties) {
    const [cacheGetInner, cacheSetInner] = [cacheGet, cacheSet]

    cacheGet = function(key) {
      const [value, min, max] = cacheGetInner(key) || [null, 0, 0]
      const now = (clockTimestamp || Date.now()) + clockTolerance

      // Validate time range
      if ((min > 0 && now <= min) || (max > 0 && now >= max)) {
        return null
      }

      return value
    }

    cacheSet = function(token, payload, result) {
      const value = [result, 0, 0]
      const hasIat = typeof payload.iat === 'number'

      // Add time range of the key
      if (hasIat) {
        value[1] = !ignoreNotBefore && typeof payload.nbf === 'number' ? payload.nbf * 1000 : 0

        if (!ignoreExpiration) {
          if (typeof payload.exp === 'number') {
            value[2] = payload.exp * 1000
          } else if (maxAge) {
            value[2] = payload.iat * 1000 + maxAge
          }
        }
      }

      // The maximum TTL for the token cannot exceed the configured cacheTTL
      const maxTTL = (hasIat ? payload.iat * 1000 : (clockTimestamp || Date.now()) + clockTolerance) + cacheTTL
      value[2] = value[2] === 0 ? maxTTL : Math.min(value[2], maxTTL)

      cacheSetInner(token, value)
    }
  }

  // Return the verifier
  const verifier = function verify(token, cb) {
    const [callback, promise] = typeof key === 'function' ? ensurePromiseCallback(cb) : []

    // Check the cache
    const cached = cacheGet(token)

    if (cached) {
      return handleCachedResult(cached, callback, promise)
    }

    // As very first thing, decode the token - If invalid, everything else is useless
    let decoded
    try {
      decoded = decodeJwt(token)
    } catch (e) {
      if (callback) {
        callback(e)
        return promise
      }

      throw e
    }

    const { header, payload, signature, input } = decoded

    // We're get the key synchronously
    if (!callback) {
      try {
        verifyToken(
          key,
          input,
          header,
          payload,
          signature,
          validators,
          allowedAlgorithms,
          clockTimestamp,
          clockTolerance
        )

        const result = complete ? { header, payload, signature } : payload

        cacheSet(token, payload, result)
        return result
      } catch (e) {
        cacheSet(token, payload, e)
        throw e
      }
    }

    getAsyncKey(key, header, (err, currentKey) => {
      if (err) {
        const error = TokenError.wrap(err, TokenError.codes.keyFetchingError, 'Cannot fetch key.')
        cacheSet(token, payload, error)
        return callback(error)
      }

      let result
      try {
        verifyToken(
          currentKey,
          input,
          header,
          payload,
          signature,
          validators,
          allowedAlgorithms,
          clockTimestamp,
          clockTolerance
        )

        result = complete ? { header, payload, signature } : payload
      } catch (e) {
        cacheSet(token, payload, e)
        return callback(e)
      }

      cacheSet(token, payload, result)
      callback(null, result)
    })

    return promise
  }

  Object.assign(verifier, cacheProperties)
  return verifier
}

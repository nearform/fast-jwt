'use strict'

const { getSupportedAlgorithms, verifySignature } = require('./crypto')
const createDecoder = require('./decoder')
const TokenError = require('./error')
const { getAsyncSecret, ensurePromiseCallback } = require('./utils')

function ensureStringClaimMatcher(raw) {
  if (!Array.isArray(raw)) {
    raw = [raw]
  }

  return raw.map(r => (r && typeof r.test === 'function' ? r : new RegExp(r.toString())))
}

function verifyToken(
  secret,
  input,
  header,
  payload,
  signature,
  validators,
  allowedAlgorithms,
  clockTimestamp,
  clockTolerance
) {
  // Verify the secret
  const hasSecret = secret instanceof Buffer ? secret.length : !!secret

  if (hasSecret && !signature) {
    throw new TokenError(TokenError.codes.missingSignature, 'The token signature is missing.')
  } else if (!hasSecret && signature) {
    throw new TokenError(TokenError.codes.missingSecret, 'The secret is missing.')
  }

  // According to the signature and secret, check with algorithms are supported
  const algorithms = allowedAlgorithms.length ? allowedAlgorithms : getSupportedAlgorithms(secret)

  // Verify the token is allowed
  if (!algorithms.includes(header.alg)) {
    throw new TokenError(TokenError.codes.invalidAlgorithm, 'The token algorithm is invalid.')
  }

  // Verify the signature, if present
  if (signature && !verifySignature(header.alg, secret, input, signature)) {
    throw new TokenError(TokenError.codes.invalidSignature, 'The token signature is invalid.')
  }

  // Verify the payload
  const now = clockTimestamp || Date.now() + (clockTolerance || 0)

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
    secret,
    algorithms: allowedAlgorithms,
    complete,
    encoding,
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
  } = { clockTimestamp: 0, ...options }

  // Validate options
  if (typeof secret !== 'string' && !(secret instanceof Buffer) && typeof secret !== 'function') {
    throw new TokenError(
      TokenError.codes.INVALID_OPTION,
      'The secret option must be a string, a buffer or a function returning the algorithm secret or public key.'
    )
  }

  if (clockTimestamp && (typeof clockTimestamp !== 'number' || clockTimestamp < 0)) {
    throw new TokenError(TokenError.codes.invalidOption, 'The clockTimestamp option must be a positive number.')
  }

  if (clockTolerance && (typeof clockTolerance !== 'number' || clockTolerance < 0)) {
    throw new TokenError(TokenError.codes.invalidOption, 'The clockTolerance option must be a positive number.')
  }

  if (encoding && typeof encoding !== 'string') {
    throw new TokenError(TokenError.codes.invalidOption, 'The encoding option must be a string.')
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

  const decodeJwt = createDecoder({ complete: true, encoding })

  // Return the verifier
  return function verify(token, cb) {
    const [callback, promise] = typeof secret === 'function' ? ensurePromiseCallback(cb) : []

    // As very first thing, decode the token - If invalid, everything else is useless
    const { header, payload, signature, input } = decodeJwt(token)

    // We're get the secret synchronously
    if (!callback) {
      verifyToken(
        secret,
        input,
        header,
        payload,
        signature,
        validators,
        allowedAlgorithms,
        clockTimestamp,
        clockTolerance
      )

      return complete ? { header, payload, signature } : payload
    }

    getAsyncSecret(secret, header, (err, currentSecret) => {
      if (err) {
        return callback(
          err instanceof TokenError
            ? err
            : new TokenError(TokenError.codes.secretFetchingError, 'Cannot fetch secret.', { originalError: err })
        )
      }

      verifyToken(
        currentSecret,
        input,
        header,
        payload,
        signature,
        validators,
        allowedAlgorithms,
        clockTimestamp,
        clockTolerance
      )

      callback(null, complete ? { header, payload, signature } : payload)
    })

    return promise
  }
}

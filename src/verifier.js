'use strict'

const { supportsWorkerThreads, getSupportedAlgorithms, verifySignature } = require('./crypto')
const createDecoder = require('./decoder')
const TokenError = require('./error')
const { getAsyncSecret } = require('./utils')

function ensureStringClaimMatcher(raw) {
  if (!Array.isArray(raw)) {
    raw = [raw]
  }

  return raw.map(r => (r && typeof r.test === 'function' ? r : new RegExp(r.toString())))
}

function verifyAlgorithm(secret, header, signature, allowedAlgorithms) {
  if (secret && !signature) {
    throw new TokenError(TokenError.codes.missingSignature, 'The token signature is missing.')
  } else if (!secret && signature) {
    throw new TokenError(TokenError.codes.missingSecret, 'The secret is missing.')
  }

  // According to the signature and secret, check with algorithms are supported
  const algorithms = signature ? getSupportedAlgorithms(secret) : ['none']

  // Verify the token is supported and allowed
  if (!algorithms.includes(header.alg) || (allowedAlgorithms.length && !allowedAlgorithms.includes(header.alg))) {
    throw new TokenError(TokenError.codes.invalidAlgorithm, 'The token algorithm is invalid.')
  }
}

function verifyPayload(payload, validators, clockTimestamp, clockTolerance) {
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
    if (arrayValue) {
      if (claimType.some(t => t !== claimRequestedType)) {
        throw new TokenError(
          TokenError.codes.invalidClaimType,
          `The ${claim} claim must be a ${claimRequestedType} or an array of ${claimRequestedType}s.`
        )
      }
    } else if (claimType !== claimRequestedType) {
      throw new TokenError(TokenError.codes.invalidClaimType, `The ${claim} claim must be a ${claimType}.`)
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

/*
  secret: It is a string, buffer or object containing the secret for HMAC algorithms or the PEM encoded private key for RSA and ECDSA keys (whose format is defined by the Node's crypto module documentation).
  algorithms: List of strings with the names of the allowed algorithms.
  complete: return an object with the decoded payload, header and signature instead of only the content of the payload.
  encoding: The token encoding.
  useWorkerThreads: Use worker threads (Node > 10.5.0) for crypto operator, if they are available. This will force the returned function to be async (with callback support) even if the secret is not a callback.
  clockTimestamp: Epoch time in millseconds (like the output of Date.now()) that should be used as the current time for all necessary comparisons.
  clockTolerance: Number of milliseconds to tolerate when checking the iat, nbf and exp claims, to deal time synchronization.
  ignoreExpiration: Do not validate the expiration of the token.
  ignoreNotBefore: Do not validate the activation of the token.
  maxAge: The maximum allowed age (in milliseconds) for tokens to still be valid.
  allowedJti: string or array of strings or regexp of allowed values for the id (jti) claim.
  allowedAud: string or array of strings or regexp of allowed values for the audience (aud) claim.
  allowedIss: string or array of strings or regexp of allowed values for the issuer (iss) claim.
  allowedSub: string or array of strings or regexp of allowed values for the subject (sub) claim.
  allowedNonce: string or array of strings or regexp of allowed values for the nonce claim.
*/
module.exports = function createVerifier(options) {
  let {
    secret,
    algorithms: allowedAlgorithms,
    complete,
    encoding,
    useWorkerThreads,
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
  if (typeof secret !== 'string' && typeof secret !== 'object' && typeof secret !== 'function') {
    throw new TokenError(
      TokenError.codes.INVALID_OPTION,
      'The secret option must be a string, buffer, object or callback containing a secret or a public key.'
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
  if (typeof secret !== 'function' && (!useWorkerThreads || !supportsWorkerThreads)) {
    return function verifyJwt(token) {
      // As very first thing, decode the token - If invalid, everything else is useless
      const { header, payload, signature, input } = decodeJwt(token)

      // Now verify the algorithm
      verifyAlgorithm(secret, header, signature, allowedAlgorithms)

      // Verify the signature, if present
      if (signature && !verifySignature(header.alg, secret, input, signature)) {
        throw new TokenError(TokenError.codes.invalidSignature, 'The token signature is invalid.')
      }

      // Finally, verify the payload
      verifyPayload(payload, validators, clockTimestamp, clockTolerance)

      // Return
      return complete ? { header, payload, signature } : payload
    }
  }

  return async function verifyJwt(token, callback) {
    try {
      // As very first thing, decode the token - If invalid, everything else is useless
      const { header, payload, signature, input } = decodeJwt(token)

      // Get the secret
      let currentSecret = secret

      if (typeof currentSecret === 'function') {
        try {
          currentSecret = await getAsyncSecret(secret, header)
        } catch (e) {
          throw new TokenError(TokenError.codes.secretFetchingError, 'Cannot fetch secret.', { error: e })
        }
      }

      // Now verify the algorithm
      verifyAlgorithm(currentSecret, header, signature, allowedAlgorithms)

      // Verify the signature, if present
      if (signature && !(await verifySignature(header.alg, currentSecret, input, signature, useWorkerThreads))) {
        throw new TokenError(TokenError.codes.invalidSignature, 'The token signature is invalid.')
      }

      // Finally, verify the payload
      verifyPayload(payload, validators, clockTimestamp, clockTolerance)

      const rv = complete ? { header, payload, signature } : payload

      if (typeof callback === 'function') {
        callback(null, rv)
      }

      return rv
    } catch (e) {
      if (typeof callback === 'function') {
        return callback(e)
      }

      throw e
    }
  }
}

'use strict'

class TokenError extends Error {
  constructor(code, message, additional) {
    super(message)
    Error.captureStackTrace(this, this.constructor)

    this.code = code

    if (additional) {
      for (const k in additional) {
        this[k] = additional[k]
      }
    }
  }
}

TokenError.codes = {
  invalidType: 'FAST_JWT_INVALID_TYPE',
  invalidOption: 'FAST_JWT_INVALID_OPTION',
  invalidAlgorithm: 'FAST_JWT_INVALID_ALGORITHM',
  invalidClaimType: 'FAST_JWT_INVALID_CLAIM_TYPE',
  invalidClaimValue: 'FAST_JWT_INVALID_CLAIM_VALUE',
  invalidKey: 'FAST_JWT_INVALID_KEY',
  invalidSignature: 'FAST_JWT_INVALID_SIGNATURE',
  invalidPayload: 'FAST_JWT_INVALID_PAYLOAD',
  malformed: 'FAST_JWT_MALFORMED',
  inactive: 'FAST_JWT_INACTIVE',
  expired: 'FAST_JWT_EXPIRED',
  missingKey: 'FAST_JWT_MISSING_KEY',
  keyFetchingError: 'FAST_JWT_KEY_FETCHING_ERROR',
  signError: 'FAST_JWT_SIGN_ERROR',
  verifyError: 'FAST_JWT_VERIFY_ERROR',
  missingRequiredClaim: 'FAST_JWT_MISSING_REQUIRED_CLAIM'
}

TokenError.wrap = function(originalError, code, message) {
  if (originalError instanceof TokenError) {
    return originalError
  }

  return new TokenError(code, message, { originalError })
}

module.exports = TokenError

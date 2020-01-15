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
  invalidSecret: 'FAST_JWT_INVALID_SECRET',
  invalidSignature: 'FAST_JWT_INVALID_SIGNATURE',
  malformed: 'FAST_JWT_MALFORMED',
  malformedHeader: 'FAST_JWT_MALFORMED_HEADER',
  missingSignature: 'FAST_JWT_MISSING_SIGNATURE',
  missingSecret: 'FAST_JWT_MISSING_SECRET',
  inactive: 'FAST_JWT_INACTIVE',
  expired: 'FAST_JWT_EXPIRED',
  secretFetchingError: 'FAST_JWT_SECRET_FETCHING_ERROR',
  signError: 'FAST_JWT_SECRET_SIGN_ERROR',
  verifyError: 'FAST_JWT_SECRET_VERIFY_ERROR'
}

module.exports = TokenError

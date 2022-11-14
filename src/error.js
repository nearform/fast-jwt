'use strict'

const TOKEN_ERROR_CODES = {
  invalidType: 'FAST_JWT_INVALID_TYPE', //  Invalid token type
  invalidOption: 'FAST_JWT_INVALID_OPTION', // The option object is not valid
  invalidAlgorithm: 'FAST_JWT_INVALID_ALGORITHM', //  The token algorithm is invalid
  invalidClaimType: 'FAST_JWT_INVALID_CLAIM_TYPE', // The claim type is not supported
  invalidClaimValue: 'FAST_JWT_INVALID_CLAIM_VALUE', // The claim type is not a positive integer or an number array
  invalidKey: 'FAST_JWT_INVALID_KEY', // The key is not a string or a buffer or is unsupported
  invalidSignature: 'FAST_JWT_INVALID_SIGNATURE', //  The token signature is invalid
  invalidPayload: 'FAST_JWT_INVALID_PAYLOAD', // The payload to be decoded must be an object
  malformed: 'FAST_JWT_MALFORMED', // The token is malformed
  inactive: 'FAST_JWT_INACTIVE', // The token is not valid yet
  expired: 'FAST_JWT_EXPIRED', // The token is expired
  missingKey: 'FAST_JWT_MISSING_KEY', // The key option is missing
  keyFetchingError: 'FAST_JWT_KEY_FETCHING_ERROR', // Could not retrieve the key
  signError: 'FAST_JWT_SIGN_ERROR', // Cannot create the signature
  verifyError: 'FAST_JWT_VERIFY_ERROR', // Cannot verify the signature
  missingRequiredClaim: 'FAST_JWT_MISSING_REQUIRED_CLAIM', // A required claim is missing
  missingSignature: 'FAST_JWT_MISSING_SIGNATURE' // The token signature is missing
}

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

TokenError.codes = TOKEN_ERROR_CODES

TokenError.wrap = function (originalError, code, message) {
  if (originalError instanceof TokenError) {
    return originalError
  }

  return new TokenError(code, message, { originalError })
}

module.exports = {
  TokenError,
  TOKEN_ERROR_CODES
}

'use strict'

const { TokenError } = require('./error')

// RFC 4648 §3.3 requires implementations to reject encoded data containing
// characters outside the base alphabet unless the referring spec opts into
// lenient decoding. RFC 7515 does not, so whitespace, newlines, and base64
// padding in any of a JWT's three segments are a spec violation and should
// not be silently stripped by `Buffer.from(segment, 'base64')`.
const BASE64URL_RE = /^[A-Za-z0-9_-]*$/

function decode({ complete, checkTyp }, token) {
  // Make sure the token is a string or a Buffer - Other cases make no sense to even try to validate
  if (token instanceof Buffer) {
    token = token.toString('utf-8')
  } else if (typeof token !== 'string') {
    throw new TokenError(TokenError.codes.invalidType, 'The token must be a string or a buffer.')
  }

  // Validate the format
  const firstSeparator = token.indexOf('.')
  const lastSeparator = token.lastIndexOf('.')

  if (firstSeparator === -1 || firstSeparator >= lastSeparator) {
    throw new TokenError(TokenError.codes.malformed, 'The token is malformed.')
  }

  const headerSegment = token.slice(0, firstSeparator)
  const payloadSegment = token.slice(firstSeparator + 1, lastSeparator)
  const signatureSegment = token.slice(lastSeparator + 1)

  // Reject any segment containing characters outside the base64url alphabet
  // before handing it to `Buffer.from(..., 'base64')`, which would otherwise
  // silently strip them and accept a non-canonical token.
  if (!BASE64URL_RE.test(headerSegment)) {
    throw new TokenError(TokenError.codes.malformed, 'The token header is not a valid base64url serialized JSON.')
  }
  if (!BASE64URL_RE.test(payloadSegment)) {
    throw new TokenError(TokenError.codes.malformed, 'The token payload is not a valid base64url serialized JSON.')
  }
  if (!BASE64URL_RE.test(signatureSegment)) {
    throw new TokenError(TokenError.codes.invalidSignature, 'The token signature is invalid.')
  }

  // Parse header
  let validHeader = false
  try {
    const header = JSON.parse(Buffer.from(headerSegment, 'base64').toString('utf-8'))
    if (!header || typeof header !== 'object' || Array.isArray(header)) {
      throw new TokenError(TokenError.codes.malformed, 'The token header is not a valid JSON object.')
    }
    if (checkTyp && header.typ !== checkTyp) {
      throw new TokenError(TokenError.codes.invalidType, `The type must be "${checkTyp}".`, { header })
    }
    validHeader = true

    // Parse payload
    let payload = Buffer.from(payloadSegment, 'base64').toString('utf-8')
    payload = JSON.parse(payload)
    // https://tools.ietf.org/html/rfc7519#section-7.2
    //
    // 10.  Verify that the resulting octet sequence is a UTF-8-encoded
    //      representation of a completely valid JSON object conforming to
    //      RFC 7159 [RFC7159]; let the JWT Claims Set be this JSON object.
    if (!payload || typeof payload !== 'object') {
      throw new TokenError(TokenError.codes.invalidPayload, 'The payload must be an object', { payload })
    }

    // Return whatever was requested
    return complete ? { header, payload, signature: signatureSegment, input: token.slice(0, lastSeparator) } : payload
  } catch (e) {
    throw TokenError.wrap(
      e,
      TokenError.codes.malformed,
      `The token ${validHeader ? 'payload' : 'header'} is not a valid base64url serialized JSON.`
    )
  }
}

module.exports = function createDecoder(options = {}) {
  const complete = options.complete || false
  const checkTyp = options.checkTyp

  return decode.bind(null, { complete, checkTyp })
}

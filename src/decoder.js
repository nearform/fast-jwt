'use strict'

const TokenError = require('./error')

function decode({ json, complete }, token) {
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

  // Parse header
  let validHeader = false
  try {
    const header = JSON.parse(Buffer.from(token.slice(0, firstSeparator), 'base64').toString('utf-8'))
    validHeader = true
    let payload = Buffer.from(token.slice(firstSeparator + 1, lastSeparator), 'base64').toString('utf-8')

    // Parse payload if needed
    if (json === true || header.typ === 'JWT') {
      payload = JSON.parse(payload)

      // https://tools.ietf.org/html/rfc7519#section-7.2
      //
      // 10.  Verify that the resulting octet sequence is a UTF-8-encoded
      //      representation of a completely valid JSON object conforming to
      //      RFC 7159 [RFC7159]; let the JWT Claims Set be this JSON object.
      if (typeof payload !== 'object') {
        throw new TokenError(TokenError.codes.invalidPayload, 'The payload must be an object', { payload })
      }
    }

    // Return whatever was requested
    return complete
      ? { header, payload, signature: token.slice(lastSeparator + 1), input: token.slice(0, lastSeparator) }
      : payload
  } catch (e) {
    throw TokenError.wrap(
      e,
      TokenError.codes.malformed,
      `The token ${validHeader ? 'payload' : 'header'} is not a valid base64url serialized JSON.`
    )
  }
}

module.exports = function createDecoder(options = {}) {
  const json = !(options.json === false)
  const complete = options.complete || false

  return decode.bind(null, { json, complete })
}

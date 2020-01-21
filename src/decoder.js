'use strict'

const { base64UrlDecode } = require('./utils')
const TokenError = require('./error')

const jwtMatcher = /^([a-zA-Z0-9\-_]+)\.([a-zA-Z0-9\-_]+)\.([a-zA-Z0-9\-_]*)$/

module.exports = function createDecoder(options) {
  const { json, complete, encoding } = { encoding: 'utf-8', ...options }

  return function decodeJwt(token) {
    // Make sure the token is a string or a Buffer - Other cases make no sense to even try to validate
    if (typeof token !== 'string') {
      if (!(token instanceof Buffer)) {
        throw new TokenError(TokenError.codes.invalidType, 'The token must be a string or a buffer.')
      }

      token = token.toString(encoding)
    }

    // Get the components
    const match = token.match(jwtMatcher)

    if (!match) {
      throw new TokenError(TokenError.codes.malformed, 'The token is malformed.')
    }

    const [, rawHeader, rawPayload, rawSignature] = match
    const input = `${rawHeader}.${rawPayload}`

    // Decode header and payload
    let header

    try {
      header = JSON.parse(Buffer.from(base64UrlDecode(rawHeader), 'base64').toString(encoding))
    } catch (e) {
      throw new TokenError(
        TokenError.codes.malformedHeader,
        'The token header is not a valid base64url serialized JSON.'
      )
    }

    let payload = Buffer.from(base64UrlDecode(rawPayload), 'base64').toString(encoding)

    if (json || header.typ === 'JWT') {
      try {
        payload = JSON.parse(payload)
      } catch (e) {
        throw new TokenError(
          TokenError.codes.malformedPayload,
          'The token payload is not a valid base64url serialized JSON.'
        )
      }
    }

    return complete ? { header, payload, signature: base64UrlDecode(rawSignature), input } : payload
  }
}

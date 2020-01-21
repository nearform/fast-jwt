'use strict'

const { base64UrlDecode } = require('./utils')
const TokenError = require('./error')

module.exports = function createDecoder(options) {
  const { json, complete, encoding } = { encoding: 'utf-8', ...options }

  return function decode(token) {
    // Make sure the token is a string or a Buffer - Other cases make no sense to even try to validate
    if (token instanceof Buffer) {
      token = token.toString(encoding)
    } else if (typeof token !== 'string') {
      throw new TokenError(TokenError.codes.invalidType, 'The token must be a string or a buffer.')
    }

    // Split the string
    const [rawHeader, rawPayload, rawSignature] = token.split('.', 3)

    if (typeof rawPayload !== 'string' || typeof rawSignature !== 'string') {
      throw new TokenError(TokenError.codes.malformed, 'The token is malformed.')
    }

    // Decode header and payload
    let header

    try {
      header = JSON.parse(Buffer.from(base64UrlDecode(rawHeader), 'base64').toString(encoding))

      let payload = Buffer.from(base64UrlDecode(rawPayload), 'base64').toString(encoding)

      if (json || header.typ === 'JWT') {
        payload = JSON.parse(payload)
      }

      return complete
        ? { header, payload, signature: base64UrlDecode(rawSignature), input: `${rawHeader}.${rawPayload}` }
        : payload
    } catch (e) {
      throw new TokenError(
        TokenError.codes.malformed,
        `The token ${header ? 'payload' : 'header'} is not a valid base64url serialized JSON.`
      )
    }
  }
}

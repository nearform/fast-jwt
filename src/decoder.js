'use strict'

const Cache = require('mnemonist/lru-cache')

const { base64UrlDecode, defaultCacheSize } = require('./utils')
const TokenError = require('./error')

module.exports = function createDecoder(options) {
  const { json, complete, encoding, cache } = { encoding: 'utf-8', ...options }
  let cacheGet = () => false
  let cacheSet = () => false

  if (cache) {
    const size = parseInt(cache, 10)
    const cacheInstance = new Cache(size >= 1 ? size : defaultCacheSize)

    cacheGet = cacheInstance.get.bind(cacheInstance)
    cacheSet = cacheInstance.set.bind(cacheInstance)
  }

  // TODO@PI: Cache and handle failures
  return function decode(token) {
    // Make sure the token is a string or a Buffer - Other cases make no sense to even try to validate
    if (token instanceof Buffer) {
      token = token.toString(encoding)
    } else if (typeof token !== 'string') {
      throw new TokenError(TokenError.codes.invalidType, 'The token must be a string or a buffer.')
    }

    const cached = cacheGet(token)

    if (cached) {
      return cached
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

      const rv = complete
        ? { header, payload, signature: base64UrlDecode(rawSignature), input: `${rawHeader}.${rawPayload}` }
        : payload

      cacheSet(token, rv)
      return rv
    } catch (e) {
      throw new TokenError(
        TokenError.codes.malformed,
        `The token ${header ? 'payload' : 'header'} is not a valid base64url serialized JSON.`,
        { originalError: e }
      )
    }
  }
}

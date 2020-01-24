'use strict'

const Cache = require('mnemonist/lru-cache')
const TokenError = require('./error')

const decoderReplacer = /[-_]/g
const encoderReplacer = /[=+/]/g
const decoderMap = { '-': '+', _: '/' }
const encoderMap = { '=': '', '+': '-', '/': '_' }
const defaultCacheSize = 1000

function base64UrlEncode(base64) {
  return base64.replace(encoderReplacer, c => encoderMap[c])
}

function base64UrlDecode(base64url) {
  const padding = 4 - (base64url.length % 4)

  return base64url
    .padEnd(base64url.length + (padding !== 4 ? padding : 0), '=')
    .replace(decoderReplacer, c => decoderMap[c])
}

function getAsyncSecret(handler, header, callback) {
  const result = handler(header, callback)

  if (result && typeof result.then === 'function') {
    result.then(secret => callback(null, secret)).catch(callback)
  }
}

function ensurePromiseCallback(callback) {
  if (typeof callback === 'function') {
    return [callback]
  }

  let promiseResolve, promiseReject

  const promise = new Promise((resolve, reject) => {
    promiseResolve = resolve
    promiseReject = reject
  })

  return [
    function(err, token) {
      if (err) {
        return promiseReject(err)
      }

      return promiseResolve(token)
    },
    promise
  ]
}

function createCache(option) {
  let get = () => false
  let set = () => false

  let cache
  if (option) {
    const size = parseInt(option, 10)

    cache = new Cache(size >= 1 ? size : defaultCacheSize)
    get = cache.get.bind(cache)
    set = cache.set.bind(cache)
  }

  return [cache, get, set]
}

function handleCachedResult(cached, callback, promise) {
  if (!callback) {
    if (cached instanceof TokenError) {
      throw cached
    }

    return cached
  }

  if (cached instanceof TokenError) {
    callback(cached)
  } else {
    callback(null, cached)
  }

  return promise
}

module.exports = {
  base64UrlDecode,
  base64UrlEncode,
  getAsyncSecret,
  ensurePromiseCallback,
  createCache,
  handleCachedResult
}

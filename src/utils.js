'use strict'

const { createHash } = require('crypto')
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

function getAsyncKey(handler, header, callback) {
  const result = handler(header, callback)

  if (result && typeof result.then === 'function') {
    result.then(key => callback(null, key)).catch(callback)
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

function getCacheSize(rawSize) {
  const size = parseInt(rawSize === true ? defaultCacheSize : rawSize, 10)
  return size > 0 ? size : null
}

function hashKey(key, algorithm) {
  if (!algorithm) {
    algorithm = 'sha256'
  }

  try {
    const [rawHeader] = key.split('.', 1)
    const header = JSON.parse(Buffer.from(base64UrlDecode(rawHeader), 'base64').toString('utf-8'))
    const complexity = header.alg.slice(-3)

    if (complexity === '384' || complexity === '512') {
      algorithm = `sha${complexity}`
    }
  } catch (e) {
    // No-op, default to sha512
  }

  return createHash(algorithm)
    .update(key)
    .digest('hex')
}

function readCache(cache, key) {
  return cache.get(hashKey(key))
}

function writeCache(cache, key, value) {
  return cache.set(hashKey(key), value)
}

function createCache(size) {
  let get = () => false
  let set = () => false

  let cacheProperties

  if (size) {
    const cache = new Cache(size)
    get = readCache.bind(null, cache)
    set = writeCache.bind(null, cache)

    cacheProperties = {
      cache,
      clearCache() {
        cache.clear()
      },
      readCacheEntry: get,
      writeCacheEntry: set,
      deleteCacheEntry(key) {
        set(key, null)
      }
    }
  }

  return [get, set, cacheProperties]
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
  defaultCacheSize,
  base64UrlDecode,
  base64UrlEncode,
  getAsyncKey,
  ensurePromiseCallback,
  getCacheSize,
  createCache,
  hashKey,
  handleCachedResult
}

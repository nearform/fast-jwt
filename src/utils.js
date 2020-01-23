'use strict'

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
  const rv = handler(header, callback)

  if (rv && typeof rv.then === 'function') {
    rv.then(secret => callback(null, secret)).catch(callback)
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

module.exports = {
  defaultCacheSize,
  base64UrlDecode,
  base64UrlEncode,
  getAsyncSecret,
  ensurePromiseCallback
}

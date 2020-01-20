'use strict'

const decoderMap = { '-': '+', _: '/' }
const encoderMap = { '=': '', '+': '-', '/': '_' }

function base64UrlEncode(base64) {
  return base64.replace(/[=+/]/g, c => encoderMap[c])
}

function base64UrlDecode(base64url) {
  const padding = 4 - (base64url.length % 4)

  return base64url.padEnd(base64url.length + (padding !== 4 ? padding : 0), '=').replace(/[-_]/g, c => decoderMap[c])
}

function getAsyncSecret(handler, header, callback) {
  try {
    const rv = handler(header, callback)

    if (rv && typeof rv.then === 'function') {
      rv.then(secret => callback(null, secret)).catch(callback)
    }
  } catch (e) {
    callback(e)
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
  base64UrlDecode,
  base64UrlEncode,
  getAsyncSecret,
  ensurePromiseCallback
}

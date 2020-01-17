'use strict'

function base64UrlEncode(base64) {
  return base64
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function base64UrlDecode(base64url) {
  const padding = 4 - (base64url.length % 4)

  return base64url
    .padEnd(base64url.length + (padding !== 4 ? padding : 0), '=')
    .replace(/-/g, '+')
    .replace(/_/g, '/')
}

function getAsyncSecret(handler, header) {
  let promiseResolve
  let promiseReject

  const callbackPromise = new Promise((resolve, reject) => {
    promiseResolve = resolve
    promiseReject = reject
  })

  const callback = function(error, value) {
    if (error) {
      return promiseReject(error)
    }

    promiseResolve(value)
  }

  const rv = handler(header, callback)

  return rv && (typeof rv === 'string' || Buffer.isBuffer(rv) || typeof rv.then === 'function') ? rv : callbackPromise
}

module.exports = {
  base64UrlDecode,
  base64UrlEncode,
  getAsyncSecret
}

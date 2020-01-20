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

function createPromiseCallback() {
  let promiseResolve, promiseReject

  const promise = new Promise((resolve, reject) => {
    promiseResolve = resolve
    promiseReject = reject
  })

  const callback = function(err, token) {
    if (err) {
      return promiseReject(err)
    }

    return promiseResolve(token)
  }

  return [promise, callback]
}

module.exports = {
  base64UrlDecode,
  base64UrlEncode,
  getAsyncSecret,
  createPromiseCallback
}

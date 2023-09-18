'use strict'

const { createHash } = require('node:crypto')
const algorithmMatcher = /"alg"\s*:\s*"[HERP]S(256|384)"/m
const edAlgorithmMatcher = /"alg"\s*:\s*"EdDSA"/m
const ed448CurveMatcher = /"crv"\s*:\s*"Ed448"/m

function getAsyncKey(handler, decoded, callback) {
  const result = handler(decoded, callback)

  if (result && typeof result.then === 'function') {
    result
      .then(key => {
        // This avoids the callback to be thrown twice if callback throws
        process.nextTick(() => callback(null, key))
      })
      .catch(callback)
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
    function (err, token) {
      if (err) {
        return promiseReject(err)
      }

      return promiseResolve(token)
    },
    promise
  ]
}

function hashToken(token) {
  const rawHeader = token.split('.', 1)[0]
  const header = Buffer.from(rawHeader, 'base64').toString('utf-8')
  let hasher = null

  /* istanbul ignore next */
  if (header.match(edAlgorithmMatcher) && header.match(ed448CurveMatcher)) {
    hasher = createHash('shake256', { outputLength: 114 })
  } else {
    const mo = header.match(algorithmMatcher)
    hasher = createHash(`sha${mo ? mo[1] : '512'}`)
  }

  return hasher.update(token).digest('hex')
}

module.exports = {
  getAsyncKey,
  ensurePromiseCallback,
  hashToken
}

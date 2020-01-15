module.exports = function getAsyncSecret(handler, header) {
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

  return rv && typeof rv.then === 'function' ? rv : callbackPromise
}

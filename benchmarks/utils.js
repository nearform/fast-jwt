const Benchmark = require('benchmark')
const { sign: jsonwebtokenSign, verify: jsonwebtokenVerify } = require('jsonwebtoken')

const { createSigner, createVerifier } = require('../src')

async function compareSigning(payload, algorithm, privateKey, publicKey) {
  const fastjwtSign = createSigner({ algorithm, secret: privateKey })
  const fastjwtVerify = createVerifier({ secret: publicKey })
  const fastjwtSignAsync = createSigner({ algorithm, secret: async () => privateKey })

  if ((process.env.NODE_DEBUG || '').includes('fast-jwt')) {
    const fastjwtGenerated = fastjwtSign(payload)
    const jsonwebtokenGenerated = jsonwebtokenSign(payload, privateKey, { algorithm })

    console.log('-------')
    console.log(`Generated ${algorithm} tokens (equal=${jsonwebtokenGenerated === fastjwtGenerated}):`)
    console.log(`       fastjwt: ${fastjwtGenerated}`)
    console.log(`  jsonwebtoken: ${jsonwebtokenGenerated}`)
    console.log('Generated tokens verification:')
    console.log(`       fastjwt: ${JSON.stringify(fastjwtVerify(fastjwtGenerated))}`)
    console.log(`  jsonwebtoken: ${JSON.stringify(jsonwebtokenVerify(jsonwebtokenGenerated, publicKey))}`)
    console.log('-------')
  }

  let promiseResolve, promiseReject

  const promise = new Promise((resolve, reject) => {
    promiseResolve = resolve
    promiseReject = reject
  })

  const suite = new Benchmark.Suite()

  suite
    .add(`${algorithm} - sign - fast-jwt (sync)`, function() {
      fastjwtSign(payload)
    })
    .add(`${algorithm} - sign - fast-jwt (async)`, {
      defer: true,
      fn(deferred) {
        fastjwtSignAsync(payload, err => {
          if (err) {
            deferred.reject()
          }

          deferred.resolve()
        })
      }
    })
    .add(`${algorithm} - sign - jsonwebtoken (sync)`, function() {
      jsonwebtokenSign(payload, privateKey, { algorithm })
    })
    .add(`${algorithm} - sign - jsonwebtoken (async)`, {
      defer: true,
      fn(deferred) {
        jsonwebtokenSign(payload, privateKey, { algorithm }, err => {
          if (err) {
            deferred.reject()
          }

          deferred.resolve()
        })
      }
    })
    .on('cycle', function(event) {
      console.log(`Executed: ${event.target}`)
    })
    .on('complete', async function() {
      const fastest = this.filter('fastest')
        .map(i => i.name.split(' - ').pop())
        .join(' OR ')
      console.log(`Fastest ${algorithm} sign implementation is: ${fastest}\n`)
      promiseResolve()
    })
    .on('error', promiseReject)
    .run({ async: true })

  return promise
}

function compareVerifying(token, algorithm, publicKey) {
  const fastjwtVerify = createVerifier({ secret: publicKey })
  const fastjwtVerifyAsync = createVerifier({ secret: async () => publicKey })

  if ((process.env.NODE_DEBUG || '').includes('fast-jwt')) {
    console.log('-------')
    console.log(`Decoded ${algorithm} tokens:`)
    console.log(`  jsonwebtoken: ${JSON.stringify(jsonwebtokenVerify(token, publicKey))}`)
    console.log(`       fastjwt: ${JSON.stringify(fastjwtVerify(token))}`)
    console.log('-------')
  }

  let promiseResolve, promiseReject

  const promise = new Promise((resolve, reject) => {
    promiseResolve = resolve
    promiseReject = reject
  })

  const suite = new Benchmark.Suite()

  suite
    .add(`${algorithm} - verify - fast-jwt (sync)`, function() {
      fastjwtVerify(token)
    })
    .add(`${algorithm} - verify - fast-jwt (async)`, {
      defer: true,
      fn(deferred) {
        fastjwtVerifyAsync(token, err => {
          if (err) {
            deferred.reject()
          }

          deferred.resolve()
        })
      }
    })
    .add(`${algorithm} - verify - jsonwebtoken (sync)`, function() {
      jsonwebtokenVerify(token, publicKey)
    })
    .add(`${algorithm} - verify - jsonwebtoken (async)`, {
      defer: true,
      fn(deferred) {
        jsonwebtokenVerify(token, publicKey, err => {
          if (err) {
            deferred.reject()
          }

          deferred.resolve()
        })
      }
    })
    .on('cycle', function(event) {
      console.log(`Executed: ${event.target}`)
    })
    .on('complete', async function() {
      const fastest = this.filter('fastest')
        .map(i => i.name.split(' - ').pop())
        .join(' OR ')
      console.log(`Fastest ${algorithm} verify implementation is: ${fastest}\n`)
      promiseResolve()
    })
    .on('error', promiseReject)
    .run({ async: true })

  return promise
}

module.exports = { compareSigning, compareVerifying }

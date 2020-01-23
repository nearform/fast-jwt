'use strict'

const Benchmark = require('benchmark')
const { mkdir, writeFile } = require('fs').promises
const { resolve } = require('path')
const { sign: jsonwebtokenSign, decode: jsonwebtokenDecode, verify: jsonwebtokenVerify } = require('jsonwebtoken')

const { createSigner, createDecoder, createVerifier } = require('../src')

const output = []

async function saveLogs(type) {
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '-')
    .slice(0, 15)

  const directory = resolve(__dirname, 'logs')

  try {
    await mkdir(directory)
  } catch (e) {
    // No-op
  }

  await writeFile(resolve(directory, `${type}-${now}.log`), output.join('\n'), 'utf-8')
}

function log(message) {
  console.log(message)
  output.push(message)
}

async function compareSigning(payload, algorithm, privateKey, publicKey) {
  const fastjwtSign = createSigner({ algorithm, secret: privateKey })
  const fastjwtVerify = createVerifier({ secret: publicKey })
  const fastjwtSignAsync = createSigner({ algorithm, secret: async () => privateKey })

  if ((process.env.NODE_DEBUG || '').includes('fast-jwt')) {
    const fastjwtGenerated = fastjwtSign(payload)
    const jsonwebtokenGenerated = jsonwebtokenSign(payload, privateKey, { algorithm })

    log('-------')
    log(`Generated ${algorithm} tokens (equal=${jsonwebtokenGenerated === fastjwtGenerated}):`)
    log(`       fastjwt: ${fastjwtGenerated}`)
    log(`  jsonwebtoken: ${jsonwebtokenGenerated}`)
    log('Generated tokens verification:')
    log(`       fastjwt: ${JSON.stringify(fastjwtVerify(fastjwtGenerated))}`)
    log(`  jsonwebtoken: ${JSON.stringify(jsonwebtokenVerify(jsonwebtokenGenerated, publicKey))}`)
    log('-------')
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
      log(`Executed: ${event.target}`)
    })
    .on('complete', async function() {
      const fastest = this.filter('fastest')
        .map(i => i.name.split(' - ').pop())
        .join(' OR ')
      log(`Fastest ${algorithm} sign implementation is: ${fastest}\n`)
      promiseResolve()
    })
    .on('error', promiseReject)
    .run({ async: true })

  return promise
}

function compareDecoding(token, algorithm) {
  const fastjwtDecoder = createDecoder()
  const fastjwtCompleteDecoder = createDecoder({ complete: true })
  const fastjwtCachedDecoder = createDecoder({ cache: true })
  const fastjwtCachedCompleteDecoder = createDecoder({ cache: true, complete: true })

  if ((process.env.NODE_DEBUG || '').includes('fast-jwt')) {
    log('-------')
    log(`Decoded ${algorithm} tokens:`)
    log(`       jsonwebtoken: ${JSON.stringify(jsonwebtokenDecode(token, { complete: true }))}`)
    log(`            fastjwt: ${JSON.stringify(fastjwtCompleteDecoder(token, { complete: true }))}`)
    log(` fastjwt+cache-miss: ${JSON.stringify(fastjwtCachedCompleteDecoder(token, { complete: true }))}`)
    log(`  fastjwt+cache-hit: ${JSON.stringify(fastjwtCachedCompleteDecoder(token, { complete: true }))}`)
    log('-------')
  }

  let promiseResolve, promiseReject

  const promise = new Promise((resolve, reject) => {
    promiseResolve = resolve
    promiseReject = reject
  })

  const suite = new Benchmark.Suite()

  suite
    .add(`${algorithm} - decode - fast-jwt`, function() {
      fastjwtDecoder(token)
    })
    .add(`${algorithm} - decode - fast-jwt (complete)`, function() {
      fastjwtCompleteDecoder(token)
    })
    .add(`${algorithm} - decode - fast-jwt (with cache)`, function() {
      fastjwtCachedDecoder(token)
    })
    .add(`${algorithm} - decode - fast-jwt (complete with cache)`, function() {
      fastjwtCachedCompleteDecoder(token)
    })
    .add(`${algorithm} - decode - jsonwebtoken`, function() {
      jsonwebtokenDecode(token)
    })
    .add(`${algorithm} - decode - jsonwebtoken - complete`, function() {
      jsonwebtokenDecode(token, { complete: true })
    })
    .on('cycle', function(event) {
      log(`Executed: ${event.target}`)
    })
    .on('complete', async function() {
      const fastest = this.filter('fastest')
        .map(i => i.name.split(' - ').pop())
        .join(' OR ')
      log(`Fastest ${algorithm} decode implementation is: ${fastest}\n`)
      promiseResolve()
    })
    .on('error', promiseReject)
    .run({ async: true })

  return promise
}

function compareVerifying(token, algorithm, publicKey) {
  const fastjwtVerify = createVerifier({ secret: publicKey })
  const fastjwtVerifyAsync = createVerifier({ secret: async () => publicKey })
  const fastjwtCachedVerify = createVerifier({ secret: publicKey, cache: true })
  const fastjwtCachedVerifyAsync = createVerifier({ secret: async () => publicKey, cache: true })

  if ((process.env.NODE_DEBUG || '').includes('fast-jwt')) {
    log('-------')
    log(`Decoded ${algorithm} tokens:`)
    log(`      jsonwebtoken: ${JSON.stringify(jsonwebtokenVerify(token, publicKey))}`)
    log(`           fastjwt: ${JSON.stringify(fastjwtVerify(token))}`)
    log(`fastjwt+cache-miss: ${JSON.stringify(fastjwtCachedVerify(token))}`)
    log(` fastjwt+cache-hit: ${JSON.stringify(fastjwtCachedVerify(token))}`)
    log('-------')
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
    .add(`${algorithm} - verify - fast-jwt (sync with cache)`, function() {
      fastjwtCachedVerify(token)
    })
    .add(`${algorithm} - verify - fast-jwt (async with cache)`, {
      defer: true,
      fn(deferred) {
        fastjwtCachedVerifyAsync(token, err => {
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
      log(`Executed: ${event.target}`)
    })
    .on('complete', async function() {
      const fastest = this.filter('fastest')
        .map(i => i.name.split(' - ').pop())
        .join(' OR ')
      log(`Fastest ${algorithm} verify implementation is: ${fastest}\n`)
      promiseResolve()
    })
    .on('error', promiseReject)
    .run({ async: true })

  return promise
}

module.exports = { compareSigning, compareDecoding, compareVerifying, saveLogs }

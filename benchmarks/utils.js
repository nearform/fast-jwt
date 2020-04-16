'use strict'

const cronometro = require('cronometro')
const { mkdir, writeFile } = require('fs').promises
const { resolve } = require('path')
const { sign: jsonwebtokenSign, decode: jsonwebtokenDecode, verify: jsonwebtokenVerify } = require('jsonwebtoken')
const {
  JWT: { sign: joseSign, verify: joseVerify, decode: joseDecode },
  JWK: { asKey }
} = require('jose')

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

function compareDecoding(token, algorithm) {
  const fastjwtDecoder = createDecoder()
  const fastjwtCompleteDecoder = createDecoder({ complete: true })

  if ((process.env.NODE_DEBUG || '').includes('fast-jwt')) {
    log('-------')
    log(`Decoded ${algorithm} tokens:`)
    log(`  jsonwebtoken: ${JSON.stringify(jsonwebtokenDecode(token, { complete: true }))}`)
    log(`          jose: ${JSON.stringify(joseDecode(token, { complete: true }))}`)
    log(`       fastjwt: ${JSON.stringify(fastjwtCompleteDecoder(token, { complete: true }))}`)
    log('-------')
  }

  return cronometro(
    {
      [`${algorithm} - fast-jwt`]: function() {
        fastjwtDecoder(token)
      },
      [`${algorithm} - fast-jwt (complete)`]: function() {
        fastjwtCompleteDecoder(token)
      },
      [`${algorithm} - jsonwebtoken`]: function() {
        jsonwebtokenDecode(token)
      },
      [`${algorithm} - jsonwebtoken - complete`]: function() {
        jsonwebtokenDecode(token, { complete: true })
      },
      [`${algorithm} - jose`]: function() {
        joseDecode(token)
      },
      [`${algorithm} - jose - complete`]: function() {
        joseDecode(token, { complete: true })
      }
    },
    { print: { compare: true, compareMode: 'base' } }
  )
}

async function compareSigning(payload, algorithm, privateKey, publicKey) {
  const isEdDSA = algorithm.slice(0, 2) === 'Ed'

  const fastjwtSign = createSigner({ algorithm, key: privateKey, noTimestamp: true })
  const fastjwtSignAsync = createSigner({ algorithm, key: async () => privateKey, noTimestamp: true })
  const fastjwtVerify = createVerifier({ key: publicKey })

  const josePrivateKey = asKey(privateKey)
  const joseOptions = {
    algorithm,
    iat: false,
    header: {
      typ: 'JWT'
    }
  }

  if ((process.env.NODE_DEBUG || '').includes('fast-jwt')) {
    const fastjwtGenerated = fastjwtSign(payload)
    const joseGenerated = joseSign(payload, josePrivateKey, joseOptions)
    const jsonwebtokenGenerated = isEdDSA
      ? null
      : jsonwebtokenSign(payload, privateKey, { algorithm, noTimestamp: true })

    log('-------')
    log(`Generated ${algorithm} tokens:`)
    if (!isEdDSA) {
      log(`  jsonwebtoken: ${JSON.stringify(jsonwebtokenGenerated)}`)
    }
    log(`          jose: ${JSON.stringify(joseGenerated)}`)
    log(`       fastjwt: ${JSON.stringify(fastjwtSign(payload))}`)
    log('Generated tokens verification:')
    if (!isEdDSA) {
      log(`  jsonwebtoken: ${JSON.stringify(jsonwebtokenVerify(jsonwebtokenGenerated, publicKey))}`)
    }
    log(`          jose: ${JSON.stringify(joseVerify(joseGenerated, asKey(publicKey)))}`)
    log(`       fastjwt: ${JSON.stringify(fastjwtVerify(fastjwtGenerated))}`)
    log('-------')
  }

  const tests = {
    [`${algorithm} - jose (sync)`]: function() {
      joseSign(payload, josePrivateKey, joseOptions)
    }
  }

  if (!isEdDSA) {
    Object.assign(tests, {
      [`${algorithm} - jsonwebtoken (sync)`]: function() {
        jsonwebtokenSign(payload, privateKey, { algorithm, noTimestamp: true })
      },
      [`${algorithm} - jsonwebtoken (async)`]: function(done) {
        jsonwebtokenSign(payload, privateKey, { algorithm, noTimestamp: true }, done)
      }
    })
  }

  Object.assign(tests, {
    [`${algorithm} - fast-jwt (sync)`]: function() {
      fastjwtSign(payload)
    },
    [`${algorithm} - fast-jwt (async)`]: function(done) {
      fastjwtSignAsync(payload, done)
    }
  })

  return cronometro(tests, { print: { compare: true, compareMode: 'base' } })
}

function compareVerifying(token, algorithm, publicKey) {
  const isEdDSA = algorithm.slice(0, 2) === 'Ed'

  const fastjwtVerify = createVerifier({ key: publicKey })
  const fastjwtVerifyAsync = createVerifier({ key: async () => publicKey })
  const fastjwtCachedVerify = createVerifier({ key: publicKey, cache: true })
  const fastjwtCachedVerifyAsync = createVerifier({ key: async () => publicKey, cache: true })

  const josePublicKey = asKey(publicKey)

  if ((process.env.NODE_DEBUG || '').includes('fast-jwt')) {
    log('-------')
    log(`Verified ${algorithm} tokens:`)
    if (!isEdDSA) {
      log(`        jsonwebtoken: ${JSON.stringify(jsonwebtokenVerify(token, publicKey))}`)
    }
    log(`                jose: ${JSON.stringify(joseVerify(token, josePublicKey))}`)
    log(`             fastjwt: ${JSON.stringify(fastjwtVerify(token))}`)
    log(`  fastjwt+cache-miss: ${JSON.stringify(fastjwtCachedVerify(token))}`)
    log(`   fastjwt+cache-hit: ${JSON.stringify(fastjwtCachedVerify(token))}`)
    log('-------')
  }

  const tests = {
    [`${algorithm} - fast-jwt (sync)`]: function() {
      fastjwtVerify(token)
    },
    [`${algorithm} - fast-jwt (async)`]: function(done) {
      fastjwtVerifyAsync(token, done)
    },
    [`${algorithm} - fast-jwt (sync with cache)`]: function() {
      fastjwtCachedVerify(token)
    },
    [`${algorithm} - fast-jwt (async with cache)`]: function(done) {
      fastjwtCachedVerifyAsync(token, done)
    },
    [`${algorithm} - jose (sync)`]: function() {
      joseVerify(token, josePublicKey)
    }
  }

  if (!isEdDSA) {
    tests[`${algorithm} - jsonwebtoken (sync)`] = function() {
      jsonwebtokenVerify(token, publicKey)
    }
    tests[`${algorithm} - jsonwebtoken (async)`] = function(done) {
      jsonwebtokenVerify(token, publicKey, done)
    }
  }

  return cronometro(tests, { print: { compare: true, compareMode: 'base' } })
}

module.exports = {
  compareDecoding,
  compareSigning,
  compareVerifying,
  saveLogs
}

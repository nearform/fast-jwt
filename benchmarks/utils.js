'use strict'

const cronometro = require('cronometro')
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
  const fastjwtSign = createSigner({ algorithm, secret: privateKey, noTimestamp: true })
  const fastjwtSignAsync = createSigner({ algorithm, secret: async () => privateKey, noTimestamp: true })
  const fastjwtCachedSign = createSigner({ algorithm, secret: privateKey, noTimestamp: true, cache: true })
  const fastjwtCachedSignAsync = createSigner({
    algorithm,
    secret: async () => privateKey,
    noTimestamp: true,
    cache: true
  })
  const fastjwtVerify = createVerifier({ secret: publicKey })

  if ((process.env.NODE_DEBUG || '').includes('fast-jwt')) {
    const fastjwtGenerated = fastjwtSign(payload)
    const jsonwebtokenGenerated = jsonwebtokenSign(payload, privateKey, { algorithm, noTimestamp: true })

    log('-------')
    log(`Generated ${algorithm} tokens (equal=${jsonwebtokenGenerated === fastjwtGenerated}):`)
    log(`       jsonwebtoken: ${JSON.stringify(jsonwebtokenSign(payload, privateKey))}`)
    log(`            fastjwt: ${JSON.stringify(fastjwtSign(payload))}`)
    log(` fastjwt+cache-miss: ${JSON.stringify(fastjwtCachedSign(payload))}`)
    log(`  fastjwt+cache-hit: ${JSON.stringify(fastjwtCachedSign(payload))}`)
    log('Generated tokens verification:')
    log(`       fastjwt: ${JSON.stringify(fastjwtVerify(fastjwtGenerated))}`)
    log(`  jsonwebtoken: ${JSON.stringify(jsonwebtokenVerify(jsonwebtokenGenerated, publicKey))}`)
    log('-------')
  }

  return cronometro({
    [`${algorithm} - sign - fast-jwt (sync)`]: function() {
      fastjwtSign(payload)
    },
    [`${algorithm} - sign - fast-jwt (async)`]: function(done) {
      fastjwtSignAsync(payload, done)
    },
    [`${algorithm} - sign - fast-jwt (sync with cache)`]: function() {
      fastjwtCachedSign(payload)
    },
    [`${algorithm} - sign - fast-jwt (async with cache)`]: function(done) {
      fastjwtCachedSignAsync(payload, done)
    },
    [`${algorithm} - sign - jsonwebtoken (sync)`]: function() {
      jsonwebtokenSign(payload, privateKey, { algorithm, noTimestamp: true })
    },
    [`${algorithm} - sign - jsonwebtoken (async)`]: function(done) {
      jsonwebtokenSign(payload, privateKey, { algorithm, noTimestamp: true }, done)
    }
  })
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

  return cronometro({
    [`${algorithm} - decode - fast-jwt`]: function() {
      fastjwtDecoder(token)
    },
    [`${algorithm} - decode - fast-jwt (complete)`]: function() {
      fastjwtCompleteDecoder(token)
    },
    [`${algorithm} - decode - fast-jwt (with cache)`]: function() {
      fastjwtCachedDecoder(token)
    },
    [`${algorithm} - decode - fast-jwt (complete with cache)`]: function() {
      fastjwtCachedCompleteDecoder(token)
    },
    [`${algorithm} - decode - jsonwebtoken`]: function() {
      jsonwebtokenDecode(token)
    },
    [`${algorithm} - decode - jsonwebtoken - complete`]: function() {
      jsonwebtokenDecode(token, { complete: true })
    }
  })
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

  return cronometro({
    [`${algorithm} - verify - fast-jwt (sync)`]: function() {
      fastjwtVerify(token)
    },
    [`${algorithm} - verify - fast-jwt (async)`]: function(done) {
      fastjwtVerifyAsync(token, done)
    },
    [`${algorithm} - verify - fast-jwt (sync with cache)`]: function() {
      fastjwtCachedVerify(token)
    },
    [`${algorithm} - verify - fast-jwt (async with cache)`]: function(done) {
      fastjwtCachedVerifyAsync(token, done)
    },
    [`${algorithm} - verify - jsonwebtoken (sync)`]: function() {
      jsonwebtokenVerify(token, publicKey)
    },
    [`${algorithm} - verify - jsonwebtoken (async)`]: function(done) {
      jsonwebtokenVerify(token, publicKey, done)
    }
  })
}

module.exports = { compareSigning, compareDecoding, compareVerifying, saveLogs }

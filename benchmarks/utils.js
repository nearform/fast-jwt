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
  const fastjwtSign = createSigner({ algorithm, key: privateKey, noTimestamp: true })
  const fastjwtSignAsync = createSigner({ algorithm, key: async () => privateKey, noTimestamp: true })
  const fastjwtVerify = createVerifier({ key: publicKey })

  if ((process.env.NODE_DEBUG || '').includes('fast-jwt')) {
    const fastjwtGenerated = fastjwtSign(payload)
    const jsonwebtokenGenerated = jsonwebtokenSign(payload, privateKey, { algorithm, noTimestamp: true })

    log('-------')
    log(`Generated ${algorithm} tokens (equal=${jsonwebtokenGenerated === fastjwtGenerated}):`)
    log(`       jsonwebtoken: ${JSON.stringify(jsonwebtokenSign(payload, privateKey))}`)
    log(`            fastjwt: ${JSON.stringify(fastjwtSign(payload))}`)
    log('Generated tokens verification:')
    log(`       fastjwt: ${JSON.stringify(fastjwtVerify(fastjwtGenerated))}`)
    log(`  jsonwebtoken: ${JSON.stringify(jsonwebtokenVerify(jsonwebtokenGenerated, publicKey))}`)
    log('-------')
  }

  return cronometro(
    {
      [`${algorithm} - sign - fast-jwt (sync)`]: function() {
        fastjwtSign(payload)
      },
      [`${algorithm} - sign - fast-jwt (async)`]: function(done) {
        fastjwtSignAsync(payload, done)
      },
      [`${algorithm} - sign - jsonwebtoken (sync)`]: function() {
        jsonwebtokenSign(payload, privateKey, { algorithm, noTimestamp: true })
      },
      [`${algorithm} - sign - jsonwebtoken (async)`]: function(done) {
        jsonwebtokenSign(payload, privateKey, { algorithm, noTimestamp: true }, done)
      }
    },
    { print: { compare: true, compareMode: 'base' } }
  )
}

function compareDecoding(token, algorithm) {
  const fastjwtDecoder = createDecoder()
  const fastjwtCompleteDecoder = createDecoder({ complete: true })

  if ((process.env.NODE_DEBUG || '').includes('fast-jwt')) {
    log('-------')
    log(`Decoded ${algorithm} tokens:`)
    log(`       jsonwebtoken: ${JSON.stringify(jsonwebtokenDecode(token, { complete: true }))}`)
    log(`            fastjwt: ${JSON.stringify(fastjwtCompleteDecoder(token, { complete: true }))}`)
    log('-------')
  }

  return cronometro(
    {
      [`${algorithm} - decode - fast-jwt`]: function() {
        fastjwtDecoder(token)
      },
      [`${algorithm} - decode - fast-jwt (complete)`]: function() {
        fastjwtCompleteDecoder(token)
      },
      [`${algorithm} - decode - jsonwebtoken`]: function() {
        jsonwebtokenDecode(token)
      },
      [`${algorithm} - decode - jsonwebtoken - complete`]: function() {
        jsonwebtokenDecode(token, { complete: true })
      }
    },
    { print: { compare: true, compareMode: 'base' } }
  )
}

function compareVerifying(token, algorithm, publicKey) {
  const fastjwtVerify = createVerifier({ key: publicKey })
  const fastjwtVerifyAsync = createVerifier({ key: async () => publicKey })
  const fastjwtCachedVerify = createVerifier({ key: publicKey, cache: true })
  const fastjwtCachedVerifyAsync = createVerifier({ key: async () => publicKey, cache: true })

  if ((process.env.NODE_DEBUG || '').includes('fast-jwt')) {
    log('-------')
    log(`Decoded ${algorithm} tokens:`)
    log(`      jsonwebtoken: ${JSON.stringify(jsonwebtokenVerify(token, publicKey))}`)
    log(`           fastjwt: ${JSON.stringify(fastjwtVerify(token))}`)
    log(`fastjwt+cache-miss: ${JSON.stringify(fastjwtCachedVerify(token))}`)
    log(` fastjwt+cache-hit: ${JSON.stringify(fastjwtCachedVerify(token))}`)
    log('-------')
  }

  return cronometro(
    {
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
    },
    { print: { compare: true, compareMode: 'base' } }
  )
}

module.exports = { compareSigning, compareDecoding, compareVerifying, saveLogs }

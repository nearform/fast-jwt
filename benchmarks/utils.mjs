'use strict'

import nodeRsJwt, { Algorithm } from '@node-rs/jsonwebtoken'
import cronometro from 'cronometro'
import { createSecretKey, createPublicKey, createPrivateKey } from 'crypto'
import { readFileSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import jwt from 'jsonwebtoken'

import { JWK as JWKJose, JWT as JWTJose } from 'jose'

import { createDecoder, createSigner, createVerifier } from '../src/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const { sign: jsonwebtokenSign, decode: jsonwebtokenDecode, verify: jsonwebtokenVerify } = jwt

const { sign: nodeRsSign, signSync: nodeRsSignSync, verifySync: nodeRsVerifySync } = nodeRsJwt

const { sign: joseSign, verify: joseVerify, decode: joseDecode } = JWTJose
const { asKey } = JWKJose

const iterations = process.env.BENCHMARK_ITERATIONS || 10000

const output = []
const cronometroOptions = {
  iterations: Number.parseInt(iterations, 10),
  warmup: true,
  print: { compare: true, compareMode: 'base' }
}

export const algorithms = ['HS256', 'RS256', 'HS512', 'ES512', 'RS512', 'PS512', 'EdDSA']

export const tokens = {
  /*
    Regenerate these tokens after regenerating the keys
    by running `npm run test:generate-tokens` and getting the HS256, RS256, HS512, ES512, RS512, PS512 and EdDSA tokens
  */
  HS256:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMyJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1ODc1NTc3NTN9.UY0_qir1YkcvWrSW2Flu_5ktcfdVAouB6qW-A8IcRxY',
  RS256:
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMyJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1ODc1NTc3NTN9.bXsECAdFEv6MYtjprR5ICw_UwUdDyiKMgISuhPRsiOBA5UKWvFeOdG32-44aUolHEgH1f27F7IpBjrvk87qMibRko6CxjZu4k1oLon1lxjT1qd1oaDhXeMu0yc6qQgLSK7X_QpKzi6jAzWmXicA7EQ-zdUyUiyhodOEsqc_v7Cu5Wx90yHCrLPlqZhaDZgx5AUMN0UidVbWq9VzukONRle7kMCCdiSmT0kJY5jDzZ3cbqd7k4Sm3MJ9yiazNaVEx2SN-3REgTq7zvpfowAKrgraGjqPJaX5kwvYtZqMKMPTBw-0kAZ9zTMbt-7zOz5YZhr_gfIpi6DYd71ZsacRy4Ecq7pDsQcht9StrsesQ0L0_Q5iCHLtdUDUKnxtgV4LSx9PR34-vjaQ2SRxJsX3k23luQJbWBiu49tLeLXhbcQTKQVemAZ6psv1Fp4h_iTl0NjVaECliVDSiLcWz57lmqc5bAExwDVlCkVCcYXuB57-nWjdD9L7Sl7Ru9jfs0FEF4YFDPinUvzWqJCYZWR_5vXIs0laP_CwZcAB8b4MFh-a8ZWSmcR-sZc1lk0F2ksZPwEBccgy_i-EOChFGcWg1c256UjtT2j_CkLAaPeJXO91R935n0UNM4DFBcwtJgfpHfGlYbWsgR-JTfaMwTLRg-M7xtnI-J2S9V-mrQE65obU',
  HS512:
    'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1Nzk1MjEyMTJ9.mIcxteEVjbh2MnKQ3EQlojZojGSyA_guqRBYHQURcfnCSSBTT2OShF8lo9_ogjAv-5oECgmCur_cDWB7x3X53g',
  ES512:
    'eyJhbGciOiJFUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMyJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1ODA5MTUyOTZ9.ARkECNhVBhn3Ac6BRJaX-8-HLTX9r11m9mXN96jWyAYJiJqify8brOdIVqYXoLW67bRSreOaK1966AalZavicMf0AN1FUDBYi9JBnW2p9-ZSfa3b95fAcMRDD5xOoYTJNtEF4SNQSEFgflWzaPzlVhKNzZC7273SFvRtkJC4QI-U-Y-l',
  RS512:
    'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMyJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1ODA5MTUyOTZ9.JEHZDpA99hww-5-PKcCvwialNy1QcyDSJXJ-qvzV0fU56NXPxZRfn2rEwdX4g-8N-oXLsjCjNZzr0Hl39FXSK0ke_vnzwPW6D4r5mVL6Ak0K-jMgNFidxElM7PRg2XE7N72dI5ClQJCJMqex7NYmIN4OUj9psx1NDv8bM_Oj44kXyI6ozYrkV-6tvowLXUX9BOZH55jF3aAA1DLI4rVBKc_JYqiHf376xu6zvFxzZ8XP3-S-dTR7OBRZLe5_Y6YJweWiL2n0lRkEjYrpK3Ht9MlfaCmW2_KMH0DpUKVS6nnKmzqGjdutnzP6PYXZsJikCQOrIcPW97LdQWLLRIptSpn7YHH1xbNbq__kryaggwpKuNd6qhdXqREEhpaYl3Xc4yjGnBR0zMq7J-GxDo7mSujMMFmb4ZQLQWwANCEHSfqYIJYp7Upc1Rd__lo56Mr1Bd9claZPBNgKqAvhlmjZT9lELA-eyEzhH_yrcVzMcVpCC_oVIzvpiDQ0jgOLcDIz0q8uzoSCks3M0IK3flefopY8g1e-OExqBoYrfoktFciabLfTM5g-rIpC0CrrDN-TfXLqZAPkIv7suGBmQn9-HbcFL8eZEIg-q6D3o7EAfCO7ki9ncrm47C2y5SX3zDOjG37_5pN2JGWztfSFRQ-YbbEV13-TuKvRG3HLJjJQk6g',
  PS512:
    'eyJhbGciOiJQUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMyJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE3MzY3NzM0OTd9.KgJrc8DZI1XPOH3qh3xUn1_9Fpl-Js5OsBZCoPJJ9agfIPC1xkKGH7XQZId6P3_JWObZLmq2-17wB9-wUNQJA3wRH3wZpmWVrdY7qJDmAQT1cSqXHu4xfZaclG3jiawweLeGmAOcwnZFv0xsFaT-Pa_McTTl-BqNN20Kzs5GnLSCb8upy1xi73_hVwIqo9l3l02xFxcJp2UpELXLe6hzfsUZ43OEN-L4aYtLPKHW1KGGMz3TmNRfS0cjvC3swRr3B-jCdfcnofxHR2NBtPw0kkMePqWyr8k6O85vFYPlDyoNjbEIVtTwr2umJn_BA5IgDphj_Xa8YffHTg02-EUX9kKGhDhMKhx7Yeh_2wOyySPCG1gt1A5CxjndSvs14jCoA3F5GSPCWn0x2EG-mtUsERHXyNPuGvhlqrVAl5KYcGf8NgbDeVtSTbgy3ykFew76__d_P6j9GlIfvZ4rFVuAEvL4nhcBB7Tpp7Phtl72k19TlfeHe2REZkRMQ2Dc9FHH7gM-ey3A9m0ZT-IUFZkJgCVOjbgG3Vm7cDBmvn2oIGtsG6fkdHTHqWfUOcgkkJFEd28_75rnL-I_KhsXU8DCCVHedql-uMErwPiBThS9NqTv2ZqSVdEV4es0mK03X1IV3U6oXpP6sxOqE6FTrzDstEYTiZhQq8wDnWznlxaNWA8',
  EdDSA:
    'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCIsImt0eSI6Ik9LUCIsImNydiI6IkVkMjU1MTkiLCJraWQiOiIxMjMifQ.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1ODY3ODQ3ODF9.PDIxWOWhAHr-7Zy7UC8W4pRuk7dMYTD8xy0DR0N102P0pXK6U4r6THHe66muTdSM3qiDHZnync1WQp-10QFLCQ'
}

export const privateKeys = {
  HS256: 'secretsecretsecret',
  RS256: readFileSync(resolve(__dirname, './keys/rs-512-private.key')),
  HS512: 'secretsecretsecret',
  ES512: readFileSync(resolve(__dirname, './keys/es-512-private.key')),
  RS512: readFileSync(resolve(__dirname, './keys/rs-512-private.key')),
  PS512: readFileSync(resolve(__dirname, './keys/ps-512-private.key')),
  EdDSA: readFileSync(resolve(__dirname, './keys/ed-25519-private.key'))
}

export const publicKeys = {
  HS256: 'secretsecretsecret',
  RS256: readFileSync(resolve(__dirname, './keys/rs-512-public.key')),
  HS512: 'secretsecretsecret',
  ES512: readFileSync(resolve(__dirname, './keys/es-512-public.key')),
  RS512: readFileSync(resolve(__dirname, './keys/rs-512-public.key')),
  PS512: readFileSync(resolve(__dirname, './keys/ps-512-public.key')),
  EdDSA: readFileSync(resolve(__dirname, './keys/ed-25519-public.key'))
}

export async function saveLogs(type) {
  const now = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15)

  const directory = resolve(__dirname, 'logs')

  try {
    await mkdir(directory)
  } catch {
    // No-op
  }

  await writeFile(resolve(directory, `${type}-${now}.log`), output.join('\n'), 'utf-8')
}

function log(message) {
  console.log(message)
  output.push(message)
}

export function compareDecoding(token, algorithm) {
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
      [`${algorithm} - fast-jwt`]: function () {
        fastjwtDecoder(token)
      },
      [`${algorithm} - fast-jwt (complete)`]: function () {
        fastjwtCompleteDecoder(token)
      },
      [`${algorithm} - jsonwebtoken`]: function () {
        jsonwebtokenDecode(token)
      },
      [`${algorithm} - jsonwebtoken (complete)`]: function () {
        jsonwebtokenDecode(token, { complete: true })
      },
      [`${algorithm} - jose`]: function () {
        joseDecode(token)
      },
      [`${algorithm} - jose (complete)`]: function () {
        joseDecode(token, { complete: true })
      }
    },
    cronometroOptions
  )
}

function jsonwebtokenPrivateKeyFromString(privateKey) {
  return jsonwebtokenKeyFromString(privateKey, createPrivateKey)
}

function jsonwebtokenSecretKeyFromString(publicKey) {
  return jsonwebtokenKeyFromString(publicKey, createSecretKey)
}

function jsonwebtokenPublicKeyFromString(publicKey) {
  return jsonwebtokenKeyFromString(publicKey, createPublicKey)
}

function jsonwebtokenKeyFromString(key, keyFunc) {
  const jsonwebtokenBuffer = Buffer.from(key)
  const jwtSecretDataview = new DataView(
    jsonwebtokenBuffer.buffer,
    jsonwebtokenBuffer.byteOffset,
    jsonwebtokenBuffer.byteLength
  )
  return keyFunc(jwtSecretDataview)
}

export async function compareSigning(payload, algorithm, privateKey, publicKey) {
  const isEdDSA = algorithm.slice(0, 2) === 'Ed'

  const fastjwtSign = createSigner({ algorithm, key: privateKey, noTimestamp: true })
  const fastjwtSignAsync = createSigner({ algorithm, key: async () => privateKey, noTimestamp: true })
  const fastjwtVerify = createVerifier({ key: publicKey })

  const josePrivateKey = asKey(privateKey)
  const jsonwebtokenKey = /^(?:RS|PS|ES)/.test(algorithm)
    ? jsonwebtokenPrivateKeyFromString(privateKey)
    : jsonwebtokenSecretKeyFromString(publicKey)
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
    const nodeRsGenerated = nodeRsSignSync({ data: payload, exp: Date.now() }, privateKey, {
      algorithm: Algorithm[algorithm.toUpperCase()]
    })
    const jsonwebtokenGenerated = isEdDSA
      ? null
      : jsonwebtokenSign(payload, jsonwebtokenKey, { algorithm, noTimestamp: true })

    log('-------')
    log(`Generated ${algorithm} tokens:`)
    if (!isEdDSA) {
      log(`         jsonwebtoken: ${JSON.stringify(jsonwebtokenGenerated)}`)
    }
    log(`                 jose: ${JSON.stringify(joseGenerated)}`)
    log(`              fastjwt: ${JSON.stringify(fastjwtGenerated)}`)
    log(`@node-rs/jsonwebtoken: ${JSON.stringify(nodeRsGenerated)}`)
    log('Generated tokens verification:')
    if (!isEdDSA) {
      log(`         jsonwebtoken: ${JSON.stringify(jsonwebtokenVerify(jsonwebtokenGenerated, jsonwebtokenKey))}`)
    }
    log(`                 jose: ${JSON.stringify(joseVerify(joseGenerated, asKey(publicKey)))}`)
    log(`              fastjwt: ${JSON.stringify(fastjwtVerify(fastjwtGenerated))}`)
    log(
      `@node-rs/jsonwebtoken: ${JSON.stringify(nodeRsVerifySync(nodeRsGenerated, publicKey, { algorithms: [Algorithm[algorithm.toUpperCase()]] }))}`
    )
    log('-------')
  }

  const tests = {
    [`${algorithm} - jose (sync)`]: function () {
      joseSign(payload, josePrivateKey, joseOptions)
    }
  }

  if (!isEdDSA) {
    Object.assign(tests, {
      [`${algorithm} - jsonwebtoken (sync)`]: function () {
        jsonwebtokenSign(payload, jsonwebtokenKey, { algorithm, noTimestamp: true })
      },
      [`${algorithm} - jsonwebtoken (async)`]: function (done) {
        jsonwebtokenSign(payload, jsonwebtokenKey, { algorithm, noTimestamp: true }, done)
      }
    })
  }

  Object.assign(tests, {
    [`${algorithm} - fast-jwt (sync)`]: function () {
      fastjwtSign(payload)
    },
    [`${algorithm} - fast-jwt (async)`]: function (done) {
      fastjwtSignAsync(payload, done)
    }
  })

  Object.assign(tests, {
    [`${algorithm} - @node-rs/jsonwebtoken (sync)`]: function () {
      nodeRsSignSync({ data: payload }, privateKey, { algorithm: Algorithm[algorithm.toUpperCase()] })
    },
    [`${algorithm} - @node-rs/jsonwebtoken (async)`]: function (done) {
      nodeRsSign({ data: payload }, privateKey, { algorithm: Algorithm[algorithm.toUpperCase()] }).then(() => done())
    }
  })

  return cronometro(tests, cronometroOptions)
}

export function compareVerifying(token, algorithm, publicKey) {
  const isEdDSA = algorithm.slice(0, 2) === 'Ed'

  const fastjwtVerify = createVerifier({ key: publicKey })
  const fastjwtVerifyAsync = createVerifier({ key: async () => publicKey })
  const fastjwtCachedVerify = createVerifier({ key: publicKey, cache: true })
  const fastjwtCachedVerifyAsync = createVerifier({ key: async () => publicKey, cache: true })

  const josePublicKey = asKey(publicKey)
  const jsonwebtokenKey = /^(?:RS|PS|ES)/.test(algorithm)
    ? jsonwebtokenPublicKeyFromString(publicKey)
    : jsonwebtokenSecretKeyFromString(publicKey)

  if ((process.env.NODE_DEBUG || '').includes('fast-jwt')) {
    log('-------')
    log(`Verified ${algorithm} tokens:`)
    if (!isEdDSA) {
      log(`        jsonwebtoken: ${JSON.stringify(jsonwebtokenVerify(token, jsonwebtokenKey))}`)
    }
    log(`                jose: ${JSON.stringify(joseVerify(token, josePublicKey))}`)
    log(`             fastjwt: ${JSON.stringify(fastjwtVerify(token))}`)
    log(`  fastjwt+cache-miss: ${JSON.stringify(fastjwtCachedVerify(token))}`)
    log(`   fastjwt+cache-hit: ${JSON.stringify(fastjwtCachedVerify(token))}`)
    log('-------')
  }

  const tests = {
    [`${algorithm} - fast-jwt (sync)`]: function () {
      fastjwtVerify(token)
    },
    [`${algorithm} - fast-jwt (async)`]: function (done) {
      fastjwtVerifyAsync(token, done)
    },
    [`${algorithm} - fast-jwt (sync with cache)`]: function () {
      fastjwtCachedVerify(token)
    },
    [`${algorithm} - fast-jwt (async with cache)`]: function (done) {
      fastjwtCachedVerifyAsync(token, done)
    },
    [`${algorithm} - jose (sync)`]: function () {
      joseVerify(token, josePublicKey)
    }
  }

  if (!isEdDSA) {
    tests[`${algorithm} - jsonwebtoken (sync)`] = function () {
      jsonwebtokenVerify(token, jsonwebtokenKey)
    }
    tests[`${algorithm} - jsonwebtoken (async)`] = function (done) {
      jsonwebtokenVerify(token, jsonwebtokenKey, done)
    }
  }

  return cronometro(tests, cronometroOptions)
}

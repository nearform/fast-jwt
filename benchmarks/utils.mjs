'use strict'

import cronometro from 'cronometro'
import { readFileSync } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

import jwt from 'jsonwebtoken'

import {
  JWT as JWTJose,
  JWK as JWKJose
} from 'jose'

import {
  createSigner,
  createDecoder,
  createVerifier
} from '../src/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const {
  sign: jsonwebtokenSign,
  decode: jsonwebtokenDecode,
  verify: jsonwebtokenVerify
} = jwt

const { sign: joseSign, verify: joseVerify, decode: joseDecode } = JWTJose
const { asKey } = JWKJose

const iterations = process.env.BENCHMARK_ITERATIONS || 10000

const output = []
const cronometroOptions = {
  iterations: Number.parseInt(iterations, 10),
  warmup: true,
  print: { compare: true, compareMode: 'base' }
}

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
    'eyJhbGciOiJQUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMyJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1ODA5MTUyOTd9.IfPgE2aPz9dBzvb8hvn_RjBvdq5jLgfzRw-lM5Q2Ah67NYuRYjCzpvywJASY-0Y-tvk94kwwmDUpqR7nPPPlcv9o_OYQVGhPnndh6iMww0D-MGZwP0sqIauu6NgUsCY4rFG2_K8lxCYbdNThJJVDDN8v_VmKrK3qh7DJC89PE-ZbIMr4N3AuLww-vPgB-9hFmuVnjgO43scZb8C_SaA1HuSbw_SU6OWguAlaTP3zUKlyQmTvvx843J8byi5jDcqK4Rtah5gRaO8U1l6bzmVCKs8Fh3tv7A7GWs-eFukFu5dUr-Ig0iyIhPSAVOjnk0dEZ4s5YI1XaPrnm3wAKV9fyzSri2LaaElp_8Cy7xyJNDPgWSTUmm4BGU7m5x_zwamRbQ1zI7p-YxftwkL4Jl8VD1km7CP9T_6cOEt6RzSTNbTgkk3XhcqYZ0oTgAJ4nXa4j47-7E0n5drtM1xoYeWBaWQvXPdMwGTAwXMx33B1WOm80B7Ncn6AzZKtJtEYalFEKntNfJhWi5x9nZNc4-3cja4o1appVm5PWSOtV4mkLsrLL1T0x1c9ymyF_XtYkRAuxdOKaRs2N5YxHcikgX-iifI1Ih4l79BrWAgyioGjMTU78VMV_gLRQ1VLexmgYJLKL2fBUrBR-k8fI4VwbKEtEZF3wBINWBAp4-urFV3QVig',
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
      [`${algorithm} - fast-jwt`]: function() {
        fastjwtDecoder(token)
      },
      [`${algorithm} - fast-jwt (complete)`]: function() {
        fastjwtCompleteDecoder(token)
      },
      [`${algorithm} - jsonwebtoken`]: function() {
        jsonwebtokenDecode(token)
      },
      [`${algorithm} - jsonwebtoken (complete)`]: function() {
        jsonwebtokenDecode(token, { complete: true })
      },
      [`${algorithm} - jose`]: function() {
        joseDecode(token)
      },
      [`${algorithm} - jose (complete)`]: function() {
        joseDecode(token, { complete: true })
      }
    },
    cronometroOptions
  )
}

export async function compareSigning(payload, algorithm, privateKey, publicKey) {
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

  return cronometro(tests, cronometroOptions)
}

export function compareVerifying(token, algorithm, publicKey) {
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

  return cronometro(tests, cronometroOptions)
}

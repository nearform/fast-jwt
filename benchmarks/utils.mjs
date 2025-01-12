'use strict'

import nodeRsJwt, { Algorithm } from '@node-rs/jsonwebtoken'
import { run, bench, summary } from 'mitata'
import { createSecretKey } from 'crypto'
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

const output = []
const mitataOptions = {
  format: 'mitata',
  colors: false,
  throw: true
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
    'eyJhbGciOiJQUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozfQ.iUpS__v2Lcw-1ahbVrnoLzi0SeW54YCkn0LMlsPdpmgUR09KR0MTYh949oQK0OpiMj0ZyHBjynn8v8-pbY0Y9g2Q-fT0zX18s55trHxv1ynBXmDQjiA_RNHWBgWfxRFYu9eqIE6MQcbQon7dTPptW7irPkUNS3inBesnRGx9k9hrRlMqp5ncB9XENJYDtj20oIIutCXzmUM3m4vrrVdIlwpTCb_bs6TK6oYtJC9TjPwX6UwCMp-0vEOQdmgf0qhW4LkgGzg0IRhJ-gc6ETVqOuKKTKcV2DYc9vy0sNh4gMRX-1N3y63Q_nNdSdtkCYy6yrzIXpoV-nhtxgPezsapdTRrqLD_3cITvq8YN1EHxZ8UF1ps7TB2sMIQOP4bH5a7pGzLhy_HjKp1kORkqVthXVaEQ3Q1p9FC7uligGCg6GWgDCYi4wTWJCSH00qWt9NG_8HMSHBWRAJf8zyEplJlY6WAfCG-qYQCqGYd8-yG1exMBEu7vuyumW-41gRxa1q5rT_2oI8N1WCqn-pPzXfEQ8NpBpzZucfUtSFp7T2V_a_86r4-tcQXvX0N5iGRs3KT-60AMdDDO2GePrBubkq4DFniSgpX-1-DNdJbwZf0Ip94ogU5Np9i2syoRR8mtGDXKPG_My4xA6gk8WqM-GoVHtpjhuclZ-EJCjRKVqWiRz8',
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

  const tests = {
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
  }

  return runMitata(tests, mitataOptions)
}

function jsonwebtokenKeyFromString(publicKey) {
  const jsonwebtokenBuffer = Buffer.from(publicKey)
  const jwtSecretDataview = new DataView(
    jsonwebtokenBuffer.buffer,
    jsonwebtokenBuffer.byteOffset,
    jsonwebtokenBuffer.byteLength
  )
  return createSecretKey(jwtSecretDataview)
}

export async function compareSigning(payload, algorithm, privateKey, publicKey) {
  const isEdDSA = algorithm.slice(0, 2) === 'Ed'

  const fastjwtSign = createSigner({ algorithm, key: privateKey, noTimestamp: true })
  const fastjwtSignAsync = createSigner({ algorithm, key: async () => privateKey, noTimestamp: true })
  const fastjwtVerify = createVerifier({ key: publicKey })

  const josePrivateKey = asKey(privateKey)
  const jsonwebtokenKey = jsonwebtokenKeyFromString(publicKey)
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
      [`${algorithm} - jsonwebtoken (async)`]: async function () {
        return new Promise(resolve => jsonwebtokenSign(payload, jsonwebtokenKey, { algorithm, noTimestamp: true }, resolve))
      }
    })
  }

  Object.assign(tests, {
    [`${algorithm} - fast-jwt (sync)`]: function () {
      fastjwtSign(payload)
    },
    [`${algorithm} - fast-jwt (async)`]: async function () {
      return fastjwtSignAsync(payload)
    },
    [`${algorithm} - @node-rs/jsonwebtoken (sync)`]: function () {
      nodeRsSignSync({ data: payload }, privateKey, { algorithm: Algorithm[algorithm.toUpperCase()] })
    },
    [`${algorithm} - @node-rs/jsonwebtoken (async)`]: async function () {
      return nodeRsSign({ data: payload }, privateKey, { algorithm: Algorithm[algorithm.toUpperCase()] })
    }
  })

  return runMitata(tests, mitataOptions)
}

export function compareVerifying(token, algorithm, publicKey) {
  const isEdDSA = algorithm.slice(0, 2) === 'Ed'

  const fastjwtVerify = createVerifier({ key: publicKey })
  const fastjwtVerifyAsync = createVerifier({ key: async () => publicKey })
  const fastjwtCachedVerify = createVerifier({ key: publicKey, cache: true })
  const fastjwtCachedVerifyAsync = createVerifier({ key: async () => publicKey, cache: true })

  const josePublicKey = asKey(publicKey)
  const jsonwebtokenKey = jsonwebtokenKeyFromString(publicKey)

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
    [`${algorithm} - fast-jwt (async)`]: async function () {
      return fastjwtVerifyAsync(token)
    },
    [`${algorithm} - fast-jwt (sync with cache)`]: function () {
      fastjwtCachedVerify(token)
    },
    [`${algorithm} - fast-jwt (async with cache)`]: async function () {
      return fastjwtCachedVerifyAsync(token)
    },
    [`${algorithm} - jose (sync)`]: function () {
      joseVerify(token, josePublicKey)
    }
  }

  if (!isEdDSA) {
    tests[`${algorithm} - jsonwebtoken (sync)`] = function () {
      jsonwebtokenVerify(token, jsonwebtokenKey)
    }
    tests[`${algorithm} - jsonwebtoken (async)`] = async function () {
      return new Promise(resolve => jsonwebtokenVerify(token, jsonwebtokenKey, resolve))
    }
  }

  return runMitata(tests, mitataOptions)
}

async function runMitata(tests, opts) {
  const outputLines = []
  opts.print = line => {
    console.log(line)
    outputLines.push(line)
  }

  summary(() => {
    Object.entries(tests).forEach(([t, fn]) => bench(t, fn))
  })

  await run(opts)
  return outputLines.join('\n')
}

'use strict'

const { readFileSync } = require('fs')
const { resolve } = require('path')
const { test } = require('tap')

const { createSigner, createVerifier } = require('../src')
const { sign: jsonwebtokenSign, verify: jsonwebtokenVerify } = require('jsonwebtoken')

const privateKeys = {
  HS: 'secretsecretsecret',
  ES256: readFileSync(resolve(__dirname, '../benchmarks/keys/es-256-private.key')),
  ES384: readFileSync(resolve(__dirname, '../benchmarks/keys/es-384-private.key')),
  ES512: readFileSync(resolve(__dirname, '../benchmarks/keys/es-512-private.key')),
  RS: readFileSync(resolve(__dirname, '../benchmarks/keys/rs-512-private.key')),
  PS: readFileSync(resolve(__dirname, '../benchmarks/keys/ps-512-private.key'))
}

const publicKeys = {
  HS: 'secretsecretsecret',
  ES256: readFileSync(resolve(__dirname, '../benchmarks/keys/es-256-public.key')),
  ES384: readFileSync(resolve(__dirname, '../benchmarks/keys/es-384-public.key')),
  ES512: readFileSync(resolve(__dirname, '../benchmarks/keys/es-512-public.key')),
  RS: readFileSync(resolve(__dirname, '../benchmarks/keys/rs-512-public.key')),
  PS: readFileSync(resolve(__dirname, '../benchmarks/keys/ps-512-public.key'))
}

for (const type of ['ES']) {
  for (const bits of ['256']) {
    const algorithm = `${type}${bits}`
    const privateKey = privateKeys[type === 'ES' ? algorithm : type]
    const publicKey = publicKeys[type === 'ES' ? algorithm : type]

    test(`fastjwt should correcty verify tokens created by jsonwebtoken - ${algorithm}`, t => {
      const verify = createVerifier({ algorithm, secret: publicKey.toString() })
      const token = jsonwebtokenSign({ a: 1, b: 2, c: 3 }, privateKey.toString(), { algorithm, noTimestamp: true })

      t.strictDeepEqual(verify(token), { a: 1, b: 2, c: 3 })

      t.end()
    })

    test('jsonwebtoken should correcty verify tokens created by fast-jwt', t => {
      const signer = createSigner({ algorithm, secret: privateKey, noTimestamp: true })
      const token = signer({ a: 1, b: 2, c: 3 })

      t.strictDeepEqual(jsonwebtokenVerify(token, publicKey, { algorithm }), { a: 1, b: 2, c: 3 })
      t.end()
    })
  }
}

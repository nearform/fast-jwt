'use strict'

const { readFileSync } = require('node:fs')
const { sign: jsonwebtokenSign, verify: jsonwebtokenVerify } = require('jsonwebtoken')
const {
  JWT: { sign: joseSign, verify: joseVerify },
  JWK: { asKey }
} = require('jose')
const { resolve } = require('node:path')
const { test } = require('node:test')

const { createSigner, createVerifier } = require('../src')
const { useNewCrypto } = require('../src/crypto')

const privateKeys = {
  HS: 'secretsecretsecret',
  ES256: readFileSync(resolve(__dirname, '../benchmarks/keys/es-256-private.key')),
  ES384: readFileSync(resolve(__dirname, '../benchmarks/keys/es-384-private.key')),
  ES512: readFileSync(resolve(__dirname, '../benchmarks/keys/es-512-private.key')),
  RS: readFileSync(resolve(__dirname, '../benchmarks/keys/rs-512-private.key')),
  PS: readFileSync(resolve(__dirname, '../benchmarks/keys/ps-512-private.key')),
  Ed25519: readFileSync(resolve(__dirname, '../benchmarks/keys/ed-25519-private.key')),
  Ed448: readFileSync(resolve(__dirname, '../benchmarks/keys/ed-448-private.key'))
}

const publicKeys = {
  HS: 'secretsecretsecret',
  ES256: readFileSync(resolve(__dirname, '../benchmarks/keys/es-256-public.key')),
  ES384: readFileSync(resolve(__dirname, '../benchmarks/keys/es-384-public.key')),
  ES512: readFileSync(resolve(__dirname, '../benchmarks/keys/es-512-public.key')),
  RS: readFileSync(resolve(__dirname, '../benchmarks/keys/rs-512-public.key')),
  PS: readFileSync(resolve(__dirname, '../benchmarks/keys/ps-512-public.key')),
  Ed25519: readFileSync(resolve(__dirname, '../benchmarks/keys/ed-25519-public.key')),
  Ed448: readFileSync(resolve(__dirname, '../benchmarks/keys/ed-448-public.key'))
}

for (const type of ['HS', 'ES', 'RS', 'PS']) {
  for (const bits of ['256', '384', '512']) {
    const algorithm = `${type}${bits}`
    const privateKey = privateKeys[type === 'ES' ? algorithm : type]
    const publicKey = publicKeys[type === 'ES' ? algorithm : type]

    test(`fast-jwt should correcty verify tokens created by jsonwebtoken - ${algorithm}`, t => {
      const verify = createVerifier({ algorithm, key: publicKey.toString() })
      const token = jsonwebtokenSign({ a: 1, b: 2, c: 3 }, privateKey.toString(), { algorithm, noTimestamp: true })

      t.assert.deepStrictEqual(verify(token), { a: 1, b: 2, c: 3 })
    })

    test(`jsonwebtoken should correcty verify tokens created by fast-jwt - ${algorithm}`, t => {
      const signer = createSigner({ algorithm, key: privateKey, noTimestamp: true })
      const token = signer({ a: 1, b: 2, c: 3 })

      t.assert.deepStrictEqual(jsonwebtokenVerify(token, publicKey, { algorithm }), { a: 1, b: 2, c: 3 })
    })
  }
}

if (useNewCrypto) {
  for (const curve of ['Ed25519', 'Ed448']) {
    test(`fast-jwt should correcty verify tokens created by jose - EdDSA with ${curve}`, t => {
      const verify = createVerifier({ key: publicKeys[curve].toString() })
      const token = joseSign({ a: 1, b: 2, c: 3 }, asKey(privateKeys[curve]), {
        iat: false,
        header: {
          typ: 'JWT'
        }
      })

      t.assert.deepStrictEqual(verify(token), { a: 1, b: 2, c: 3 })
    })

    test(`jose should correcty verify tokens created by fast-jwt - EdDSA with ${curve}`, t => {
      const signer = createSigner({ key: privateKeys[curve], noTimestamp: true })
      const token = signer({ a: 1, b: 2, c: 3 })

      t.assert.deepStrictEqual(joseVerify(token, asKey(publicKeys[curve])), { a: 1, b: 2, c: 3 })
    })
  }
}

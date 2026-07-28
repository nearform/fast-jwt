'use strict'

const { readFileSync } = require('node:fs')
const { sign: jsonwebtokenSign, verify: jsonwebtokenVerify } = require('jsonwebtoken')
// jose is ESM only, so it is imported dynamically to keep this file CommonJS
const josePromise = import('jose')
const { resolve } = require('node:path')
const { test } = require('node:test')

const { createSigner, createVerifier } = require('../src')

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

    test(`fast-jwt should correctly verify tokens created by jsonwebtoken - ${algorithm}`, t => {
      const verify = createVerifier({ algorithm, key: publicKey.toString() })
      const token = jsonwebtokenSign({ a: 1, b: 2, c: 3 }, privateKey.toString(), { algorithm, noTimestamp: true })

      t.assert.deepStrictEqual(verify(token), { a: 1, b: 2, c: 3 })
    })

    test(`jsonwebtoken should correctly verify tokens created by fast-jwt - ${algorithm}`, t => {
      const signer = createSigner({ algorithm, key: privateKey, noTimestamp: true })
      const token = signer({ a: 1, b: 2, c: 3 })

      t.assert.deepStrictEqual(jsonwebtokenVerify(token, publicKey, { algorithm }), { a: 1, b: 2, c: 3 })
    })
  }
}

// jose builds on WebCrypto, which has no Ed448 support, so only Ed25519 can be cross checked.
// Ed448 remains covered against fast-jwt itself in crypto.spec.js, signer.spec.js and verifier.spec.js
for (const curve of ['Ed25519']) {
  test(`fast-jwt should correctly verify tokens created by jose - EdDSA with ${curve}`, async t => {
    const { SignJWT, importPKCS8 } = await josePromise

    const verify = createVerifier({ key: publicKeys[curve].toString() })
    // No setIssuedAt() call, to match the noTimestamp option used below
    const token = await new SignJWT({ a: 1, b: 2, c: 3 })
      .setProtectedHeader({ alg: 'EdDSA', typ: 'JWT' })
      .sign(await importPKCS8(privateKeys[curve].toString(), 'EdDSA'))

    t.assert.deepStrictEqual(verify(token), { a: 1, b: 2, c: 3 })
  })

  test(`jose should correctly verify tokens created by fast-jwt - EdDSA with ${curve}`, async t => {
    const { jwtVerify, importSPKI } = await josePromise

    const signer = createSigner({ key: privateKeys[curve], noTimestamp: true })
    const token = signer({ a: 1, b: 2, c: 3 })

    const { payload } = await jwtVerify(token, await importSPKI(publicKeys[curve].toString(), 'EdDSA'), {
      algorithms: ['EdDSA']
    })

    t.assert.deepStrictEqual(payload, { a: 1, b: 2, c: 3 })
  })
}

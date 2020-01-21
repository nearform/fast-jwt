'use strict'

const { readFileSync } = require('fs')
const { resolve } = require('path')
const { test } = require('tap')

const { createSigner, createVerifier } = require('../src')
const { sign: jsonwebtokenSign, verify: jsonwebtokenVerify } = require('jsonwebtoken')

const privateKeys = {
  HS: 'secretsecretsecret',
  ES: readFileSync(resolve(__dirname, '../benchmarks/keys/es-private.key')),
  RS: readFileSync(resolve(__dirname, '../benchmarks/keys/rs-private.key')),
  PS: readFileSync(resolve(__dirname, '../benchmarks/keys/ps-private.key'))
}

const publicKeys = {
  HS: 'secretsecretsecret',
  ES: readFileSync(resolve(__dirname, '../benchmarks/keys/es-public.key')),
  RS: readFileSync(resolve(__dirname, '../benchmarks/keys/rs-public.key')),
  PS: readFileSync(resolve(__dirname, '../benchmarks/keys/ps-public.key'))
}

test('fastjwt should correcty verify tokens created by jsonwebtoken', t => {
  for (const type of ['HS', 'ES', 'RS', 'PS']) {
    for (const bits of ['256', '384', '512']) {
      const algorithm = `${type}${bits}`
      const verify = createVerifier({ algorithm, secret: publicKeys[type] })
      const token = jsonwebtokenSign({ a: 1, b: 2, c: 3 }, privateKeys[type], { algorithm, noTimestamp: true })

      t.strictDeepEqual(verify(token), { a: 1, b: 2, c: 3 })
    }
  }

  t.end()
})

test('jsonwebtoken should correcty verify tokens created by fast-jwt', t => {
  for (const type of ['HS', 'ES', 'RS', 'PS']) {
    for (const bits of ['256', '384', '512']) {
      const algorithm = `${type}${bits}`
      const signer = createSigner({ algorithm, secret: privateKeys[type], noTimestamp: true })
      const token = signer({ a: 1, b: 2, c: 3 })

      t.strictDeepEqual(jsonwebtokenVerify(token, publicKeys[type], { algorithm }), { a: 1, b: 2, c: 3 })
      break
    }
    break
  }

  t.end()
})

'use strict'

const { test } = require('tap')

const { createDecoder, createSigner } = require('../src')

const secret = 'secret'
const decoder = createDecoder({ key: secret })
const signer = createSigner({ key: secret })

test('Should encode and decode the token, keeping a consistent payload', t => {
  const p1 = {
    a: 20,
    iat: 999,
    exp: 200000
  }
  t.strictSame(decoder(signer(p1)), p1)

  const p2 = {
    a: 'h',
    iat: 999,
    nbf: 999
  }
  t.strictSame(decoder(signer(p2)), p2)

  t.end()
})

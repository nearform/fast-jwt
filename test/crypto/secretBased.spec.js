'use strict'

const { test } = require('tap')

const { createVerifier, createSigner } = require('../../src')

const start = Math.floor(Date.now() / 1000)

for (const bits of [256, 384, 512]) {
  const hsAlgorithm = `HS${bits}`

  // HS256, HS512, HS512
  test(`${hsAlgorithm} based tokens round trip  with string secrets`, t => {
    const token = createSigner({ algorithm: hsAlgorithm, secret: 'secretsecretsecret' })({ payload: 'PAYLOAD' })

    const verified = createVerifier({ secret: 'secretsecretsecret' })(token)

    t.equal(verified.payload, 'PAYLOAD')
    t.true(verified.iat >= start)
    t.true(verified.iat < Date.now() / 1000)

    t.end()
  })

  test(`${hsAlgorithm} based tokens round trip with buffer secrets`, t => {
    const token = createSigner({ algorithm: hsAlgorithm, secret: Buffer.from('secretsecretsecret') })({
      payload: 'PAYLOAD'
    })

    const verified = createVerifier({ secret: 'secretsecretsecret' })(token)

    t.equal(verified.payload, 'PAYLOAD')
    t.true(verified.iat >= start)
    t.true(verified.iat < Date.now() / 1000)

    t.end()
  })

  test(`${hsAlgorithm} based tokens should validate the secret`, async t => {
    await t.rejects(createSigner({ algorithm: hsAlgorithm, secret: async () => 123 })({ payload: 'PAYLOAD' }), {
      message: 'Cannot create the signature.',
      originalError: { message: `The secret for algorithm ${hsAlgorithm} must be a string or a buffer.` }
    })
  })
}

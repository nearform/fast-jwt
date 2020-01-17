'use strict'

const { test } = require('tap')
const { readFileSync } = require('fs')
const { resolve } = require('path')

const { createVerifier, createSigner } = require('../../src')

const start = Math.floor(Date.now() / 1000)

for (const method of ['RS', 'PS', 'ES']) {
  const privateKey = readFileSync(resolve(__dirname, `../fixtures/keys/${method.toLowerCase()}/private.key`))
  const publicKey = readFileSync(resolve(__dirname, `../fixtures/keys/${method.toLowerCase()}/public.key`))

  for (const bits of [256, 384, 512]) {
    const algorithm = `${method}${bits}`

    test(`${algorithm} based tokens round trip with buffer secrets`, t => {
      const token = createSigner({ algorithm: algorithm, secret: privateKey })({ payload: 'PAYLOAD' })
      const verified = createVerifier({ secret: publicKey })(token)

      t.is(verified.payload, 'PAYLOAD')

      t.true(verified.iat >= start)

      t.true(verified.iat < Date.now() / 1000)

      t.end()
    })

    test(`${algorithm} based tokens round trip with string secrets`, t => {
      const token = createSigner({ algorithm: algorithm, secret: privateKey.toString('utf8') })({
        payload: 'PAYLOAD'
      })
      const verified = createVerifier({ algorithms: [algorithm], secret: publicKey.toString('utf8') })(token)

      t.is(verified.payload, 'PAYLOAD')

      t.true(verified.iat >= start)

      t.true(verified.iat < Date.now() / 1000)

      t.end()
    })

    if (method !== 'PS') {
      test(`${algorithm} based tokens round trip with object secrets`, t => {
        const token = createSigner({
          algorithm: algorithm,
          secret: { key: privateKey.toString('utf8') }
        })({
          payload: 'PAYLOAD'
        })
        const verified = createVerifier({ algorithms: [algorithm], secret: publicKey.toString('utf8') })(token)

        t.is(verified.payload, 'PAYLOAD')

        t.true(verified.iat >= start)

        t.true(verified.iat < Date.now() / 1000)

        t.end()
      })
    }

    test(`${algorithm} based tokens should validate the private key`, async t => {
      await t.rejects(
        createSigner({ algorithm: algorithm, secret: async () => 123 })({ payload: 'PAYLOAD' }),
        {
          message: 'Cannot create the signature.',
          originalError: { message: `The secret for algorithm ${algorithm} must be a string, a object or a buffer.` }
        },
        null
      )

      await t.rejects(
        createSigner({ algorithm: algorithm, secret: async () => ({ key: 123, passphrase: 123 }) })({
          payload: 'PAYLOAD'
        }),
        {
          message: 'Cannot create the signature.',
          originalError: {
            message: `The secret object for algorithm ${algorithm} must have the key property as string or buffer containing the private key.`
          }
        }
      )

      await t.rejects(
        createSigner({ algorithm: algorithm, secret: async () => ({ key: '123', passphrase: 123 }) })({
          payload: 'PAYLOAD'
        }),
        {
          message: 'Cannot create the signature.',
          originalError: {
            message: `The secret object for algorithm ${algorithm} must have the passphrase property as string or buffer containing the private key.`
          }
        }
      )
    })

    test(`${algorithm} based tokens should validate the public key`, async t => {
      const token = createSigner({ algorithm: algorithm, secret: privateKey })({ payload: 'PAYLOAD' })

      await t.rejects(createVerifier({ algorithms: [algorithm], secret: async () => 123 })(token), {
        message: 'Cannot verify the signature.',
        originalError: {
          message: `The secret for algorithm ${algorithm} must be a string or a buffer containing the public key.`
        }
      })
    })
  }
}

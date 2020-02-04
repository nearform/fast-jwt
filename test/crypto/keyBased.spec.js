'use strict'

const { test } = require('tap')
const { readFileSync } = require('fs')
const { resolve } = require('path')

const { createVerifier, createSigner } = require('../../src')

const start = Math.floor(Date.now() / 1000)

const privateKeys = {
  HS: 'secretsecretsecret',
  ES256: readFileSync(resolve(__dirname, '../../benchmarks/keys/es-256-private.key')),
  ES384: readFileSync(resolve(__dirname, '../../benchmarks/keys/es-384-private.key')),
  ES512: readFileSync(resolve(__dirname, '../../benchmarks/keys/es-512-private.key')),
  RS: readFileSync(resolve(__dirname, '../../benchmarks/keys/rs-512-private.key')),
  PS: readFileSync(resolve(__dirname, '../../benchmarks/keys/ps-512-private.key'))
}

const publicKeys = {
  HS: 'secretsecretsecret',
  ES256: readFileSync(resolve(__dirname, '../../benchmarks/keys/es-256-public.key')),
  ES384: readFileSync(resolve(__dirname, '../../benchmarks/keys/es-384-public.key')),
  ES512: readFileSync(resolve(__dirname, '../../benchmarks/keys/es-512-public.key')),
  RS: readFileSync(resolve(__dirname, '../../benchmarks/keys/rs-512-public.key')),
  PS: readFileSync(resolve(__dirname, '../../benchmarks/keys/ps-512-public.key'))
}

for (const type of ['ES', 'RS', 'PS']) {
  for (const bits of [256, 384, 512]) {
    const algorithm = `${type}${bits}`
    const privateKey = privateKeys[type === 'ES' ? algorithm : type]
    const publicKey = publicKeys[type === 'ES' ? algorithm : type]

    test(`${algorithm} based tokens round trip with buffer keys`, t => {
      const token = createSigner({ algorithm, key: privateKey })({ payload: 'PAYLOAD' })
      const verified = createVerifier({ key: publicKey })(token)

      t.equal(verified.payload, 'PAYLOAD')
      t.true(verified.iat >= start)
      t.true(verified.iat < Date.now() / 1000)

      t.end()
    })

    test(`${algorithm} based tokens round trip with string keys`, t => {
      const token = createSigner({ algorithm, key: privateKey.toString('utf8') })({
        payload: 'PAYLOAD'
      })
      const verified = createVerifier({ algorithms: [algorithm], key: publicKey.toString('utf8') })(token)

      t.equal(verified.payload, 'PAYLOAD')
      t.true(verified.iat >= start)
      t.true(verified.iat < Date.now() / 1000)

      t.end()
    })

    if (type !== 'PS') {
      test(`${algorithm} based tokens round trip with object keys`, t => {
        const token = createSigner({
          algorithm,
          key: { key: privateKey.toString('utf8') }
        })({
          payload: 'PAYLOAD'
        })
        const verified = createVerifier({ algorithms: [algorithm], key: publicKey.toString('utf8') })(token)

        t.equal(verified.payload, 'PAYLOAD')
        t.true(verified.iat >= start)
        t.true(verified.iat < Date.now() / 1000)

        t.end()
      })
    }

    test(`${algorithm} based tokens should validate the private key`, async t => {
      await t.rejects(
        createSigner({ algorithm, key: async () => 123 })({ payload: 'PAYLOAD' }),
        {
          message: 'Cannot create the signature.',
          originalError: { message: `The key for algorithm ${algorithm} must be a string, a object or a buffer.` }
        },
        null
      )

      await t.rejects(
        createSigner({ algorithm, key: async () => ({ key: 123, passphrase: 123 }) })({
          payload: 'PAYLOAD'
        }),
        {
          message: 'Cannot create the signature.',
          originalError: {
            message: `The key object for algorithm ${algorithm} must have the key property as string or buffer containing the private key.`
          }
        }
      )

      await t.rejects(
        createSigner({ algorithm, key: async () => ({ key: '123', passphrase: 123 }) })({
          payload: 'PAYLOAD'
        }),
        {
          message: 'Cannot create the signature.',
          originalError: {
            message: `The key object for algorithm ${algorithm} must have the passphrase property as string or buffer containing the private key.`
          }
        }
      )
    })

    test(`${algorithm} based tokens should validate the public key`, async t => {
      const token = createSigner({ algorithm, key: privateKey })({ payload: 'PAYLOAD' })

      await t.rejects(createVerifier({ algorithms: [algorithm], key: async () => 123 })(token), {
        message: 'Cannot verify the signature.',
        originalError: {
          message: `The key for algorithm ${algorithm} must be a string or a buffer containing the public key.`
        }
      })
    })
  }
}

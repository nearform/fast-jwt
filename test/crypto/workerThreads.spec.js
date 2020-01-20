'use strict'

const { test } = require('tap')
const { readFileSync } = require('fs')
const { cpus } = require('os')
const { resolve } = require('path')

const { createVerifier, createSigner, supportsWorkers, startWorkers, stopWorkers } = require('../../src')

const start = Math.floor(Date.now() / 1000)
const rsPrivateKey = readFileSync(resolve(__dirname, '../../benchmarks/keys/rs-private.key'))
const rsPublicKey = readFileSync(resolve(__dirname, '../../benchmarks/keys/rs-public.key'))
const psPrivateKey = readFileSync(resolve(__dirname, '../../benchmarks/keys/ps-private.key'))
const psPublicKey = readFileSync(resolve(__dirname, '../../benchmarks/keys/ps-public.key'))
const esPrivateKey = readFileSync(resolve(__dirname, '../../benchmarks/keys/es-private.key'))
const esPublicKey = readFileSync(resolve(__dirname, '../../benchmarks/keys/es-public.key'))

test('worker threads based tokens round trip with buffer secrets', async t => {
  if (supportsWorkers) {
    startWorkers()
    startWorkers() // This is to check workers cannot be started twice

    t.teardown(async () => {
      // Once all tests are done, simulate filling up the queue
      const sign = createSigner({ algorithm: 'RS512', secret: rsPrivateKey.toString('utf-8'), useWorkers: true })

      Promise.all(Array.from(Array(cpus().length * 2)).map(() => sign({ payload: 'PAYLOAD' }))).then(
        () => false,
        () => false
      )

      await stopWorkers()
      await stopWorkers() // This is to check workers cannot be stopped twice
    })
  }

  let sign
  let verify
  let token
  let verified

  sign = createSigner({ algorithm: 'HS512', secret: 'secretsecretsecret', useWorkers: true })
  verify = createVerifier({ secret: 'secretsecretsecret', useWorkers: true })
  token = await sign({ payload: 'PAYLOAD' })
  verified = await verify(token)

  t.is(verified.payload, 'PAYLOAD')
  t.true(verified.iat >= start)
  t.true(verified.iat < Date.now() / 1000)

  sign = createSigner({ algorithm: 'RS512', secret: rsPrivateKey.toString('utf-8'), useWorkers: true })
  verify = createVerifier({ secret: rsPublicKey.toString('utf-8'), useWorkers: true })
  token = await sign({ payload: 'PAYLOAD' })
  verified = await verify(token)

  t.is(verified.payload, 'PAYLOAD')
  t.true(verified.iat >= start)
  t.true(verified.iat < Date.now() / 1000)

  sign = createSigner({ algorithm: 'PS512', secret: psPrivateKey, useWorkers: true })
  verify = createVerifier({ secret: psPublicKey, useWorkers: true })
  token = await sign({ payload: 'PAYLOAD' })
  verified = await verify(token)

  t.is(verified.payload, 'PAYLOAD')
  t.true(verified.iat >= start)
  t.true(verified.iat < Date.now() / 1000)

  sign = createSigner({ algorithm: 'ES512', secret: { key: esPrivateKey, passphrase: '' }, useWorkers: true })
  verify = createVerifier({ secret: esPublicKey, useWorkers: true })
  token = await sign({ payload: 'PAYLOAD' })
  verified = await verify(token)

  t.is(verified.payload, 'PAYLOAD')
  t.true(verified.iat >= start)
  t.true(verified.iat < Date.now() / 1000)

  sign = createSigner({
    algorithm: 'ES512',
    secret: { key: esPrivateKey.toString('utf-8'), passphrase: Buffer.from('') },
    useWorkers: true
  })
  verify = createVerifier({ secret: esPublicKey, useWorkers: true })
  token = await sign({ payload: 'PAYLOAD' })
  verified = await verify(token)

  t.is(verified.payload, 'PAYLOAD')
  t.true(verified.iat >= start)
  t.true(verified.iat < Date.now() / 1000)

  await t.rejects(
    createSigner({
      algorithm: 'RS512',
      secret: '-----BEGIN RSA PRIVATE KEY-----NONE-----END RSA PRIVATE KEY-----',
      useWorkers: true
    })({ payload: 'PAYLOAD' }),
    {
      message: 'Cannot create the signature.'
    }
  )

  await t.rejects(
    createVerifier({ secret: '-----BEGIN PUBLIC KEY-----NONE-----END PUBLIC KEY-----', useWorkers: true })(
      'eyJhbGciOiJQUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiUEFZTE9BRCIsImlhdCI6MTU3OTI2MDYzMH0.lbQwm3hZK0Wj4y52i1KMP0NRZ8Ruu0znifQffoGXqQuMJkqXCXBsDnLlFRhNU3GbfCfjtX52vNRqerse4AWfjY3wV1Po6zPiuewXyWzWqu9QY0oQG-qT1P2c2Q_u_eOJmXFZwiHq8MOn4Vi1jwFxZ_TSNkNHFRJ3vKVCEuXECtehpeP83IMXlUrRaTy_Wl0NZ2DtbUz4QyfehrWOWdB1AjBwTuNbiaVLpX4GJCkCJSUM5iF-NZgrcKjj_DjRMiQRUKVHK64OtegZkM5AId1U9hbGdY7Tujd7Vdx-yazP5tdcCQYHp0woZBWQWNZw_4Fn-mqIis6PjHgJdamFeTYTHYxRB5DwjdLCDrjUsh3Wi3I59APxfmL1zACGcNSPmeAqW4caE73lWOMQec7H60FVoVt_BAylDle2osJXsKkMQj_rNFo_Lky7VAURwAS3-0_Rxm9DuYwg1ZH1IEK3INfJ5I2QVmLkfO_4T96uDGyUOGqZ4DvPcTUbLAVp_kgCBkLHtk178oKMmbg8yYYoJnaNkRRFo-Z6HZD-8-OBDbjnrrgf8GiJUkgqO1tDETGTnX7U-2eotPcVsiuruwRIRRfoYP9j_zIEMP9NoUoXrdcwQRVrTIg8RAweEMtcc1uMM5P13RHNVbFZkXjS35tuvlTyvJFzA4_uY6t-ZvDq_EdDrBI'
    ),
    { message: 'Cannot verify the signature.' }
  )
})

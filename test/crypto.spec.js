'use strict'

const { test } = require('node:test')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')

const { createVerifier, createSigner } = require('../src')
const {
  useNewCrypto,
  hsAlgorithms,
  rsaAlgorithms,
  detectPrivateKeyAlgorithm,
  detectPublicKeyAlgorithms
} = require('../src/crypto')

const start = Math.floor(Date.now() / 1000)

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

const detectedAlgorithms = {
  HS: hsAlgorithms,
  RS: rsaAlgorithms,
  PS: rsaAlgorithms
}

const invalidPrivatePKCS8 = `-----BEGIN PRIVATE KEY-----
MIIBSwIBADCCASsGByqGSM44BAEwggEeAoGBAMGxOb7Tft3j9ibDnbRQmSzNFVWI
zXgZuKcImr0hfaTHiCezcafkUCydrdlE+UddkS7i8I2USopaAC8qXm9MakL7aTLa
PdCJIPBjmcMSXfxqngeIko1mGySNRVCc2QxGHvMSkjTrY7TEzvgI4cJDg9ykZGU1
M9Hyq+Uq9I+/dRSxAhUA5HbY0DRPg5dciCzogxNGjfRVDO0CgYA6pxzHf5izDhsP
OdcPDPeHRNxDn1LdyHPTWcO96SLT3dRne40tXbvVxSdlXI1H9ZsTuBGoLWUcN9Mv
E9zBIU8h8nSWY6A4MwGdrGIwdb65kwrIGdHqxckQKJnGwvkzSftCiEMUvmn1TU0l
sZjIEvC33/YIQaP8Gvw0zKIQFS9vMwQXAhUAxRK28V19J5W4jfBY+3L3Zy/XbIo=
-----END PRIVATE KEY-----
`

const invalidPrivateCurve = `-----BEGIN EC PRIVATE KEY-----
MHECAQEEHgMIJ+JtbK1h1Hr+VuYfQD/lWlBSRo2Fx4+10MljjKAKBggqhkjOPQMA
DaFAAz4ABH2YBzIol9aAQrQERTRHF31ztVeZ6dr8T8qJiitVoAFKep39qV9n/7sV
NspwxJ55TbI7tJiW6tcF2/MdOw==
-----END EC PRIVATE KEY-----
`

const invalidPublicPKCS8 = `-----BEGIN PUBLIC KEY-----
MIIBtzCCASwGByqGSM44BAEwggEfAoGBALqI31HbMCIw1QPaf2nGT6z7DaYu/NRV
sdQ8cBkQSvegBXOTbAS+hxNq3rMcwm240ukBKnpvdEB3gyegsmNK2UVjrBgdl6Xs
0H9TK5Utnv5HspziTKgCy6Zf5IrAsiitrwnb+fBYLJrVGRAJErNmVVTXo6wiDHhW
ZX9Llz4iB6onAhUA82qMvjYhGvyQDef9Bo2STEUER3sCgYEAkjLCi6MPKKCzERtY
x+dAw+1rJ3G6QQIb0wJv26HeJ9GTBeJwBeQLqoNzYvYvOxupwSphCHXujjIFIVuh
3KPL1NYLrbeCWZA7V6u9K/QM6y6dqQIcOOCE56rx9tvloh1G6g/d1gar5syry4dR
VyAzctj8Vahz5gkTQyg9lslOjCoDgYQAAoGAWsVZnwUaqcXIMGhKhjzK/JlHdGmL
Qlp07YAmnFRQPsNjHAsxtDuO7RS/rEUsavvARAcQi36e48HoJZ7SOuMuqX+zwphI
58zpti5ntJ2sfsWxvHCWDISB2moPM94vPHnbhqJ1f4X51UGU22VwAawZ/YhfW9fE
dceK/5cqXl02B+Q=
-----END PUBLIC KEY-----
`

const invalidPublicCurve = `-----BEGIN PUBLIC KEY-----
MFUwEwYHKoZIzj0CAQYIKoZIzj0DAA0DPgAEBaKDc/7IW3cMDxat8ivVjqDq1TZ+
T7r5sAUIWaF0Q5uk5NYmLOnCFxoP8Ua16sraCbAozdvg0wfvT7Cq
-----END PUBLIC KEY-----
`

for (const type of ['HS', 'ES', 'RS', 'PS']) {
  for (const bits of [256, 384, 512]) {
    const algorithm = `${type}${bits}`
    const detectedAlgorithm = `${type === 'PS' ? 'RS' : type}${bits}`
    const privateKey = privateKeys[type === 'ES' ? algorithm : type]

    test(`detectPrivateKeyAlgorithm - ${type} keys should be recognized as ${detectedAlgorithm}`, t => {
      t.assert.equal(detectPrivateKeyAlgorithm(privateKey), detectedAlgorithm)
    })

    if (type !== 'ES') {
      break
    }
  }
}

for (const type of ['Ed25519', 'Ed448']) {
  const privateKey = privateKeys[type]

  test(`detectPrivateKeyAlgorithm - ${type} keys should be recognized as EdDSA`, t => {
    t.assert.deepStrictEqual(detectPrivateKeyAlgorithm(privateKey), 'EdDSA')
  })
}

test('detectPrivateKeyAlgorithm - malformed or encrypted key objects must be rejected', t => {
  t.assert.throws(() => detectPrivateKeyAlgorithm({}), {
    message: 'The private key must be a string or a buffer.'
  })

  // Execute twice to check caching of errors
  t.assert.throws(() => detectPrivateKeyAlgorithm({}), {
    message: 'The private key must be a string or a buffer.'
  })

  t.assert.throws(() => detectPrivateKeyAlgorithm({ key: privateKeys.RS }), {
    message: 'The private key must be a string or a buffer.'
  })

  t.assert.throws(() => detectPrivateKeyAlgorithm(123), {
    message: 'The private key must be a string or a buffer.'
  })
})

test('detectPrivateKeyAlgorithm - malformed PEM files should be rejected', t => {
  t.assert.throws(
    () =>
      detectPrivateKeyAlgorithm(Buffer.from('-----BEGIN PRIVATE KEY-----WHATEVER-----END PRIVATE KEY-----', 'utf-8')),
    {
      message: 'Unsupported PEM private key.'
    }
  )

  // Executed twice to check caching of errors
  t.assert.throws(
    () =>
      detectPrivateKeyAlgorithm(Buffer.from('-----BEGIN PRIVATE KEY-----WHATEVER-----END PRIVATE KEY-----', 'utf-8')),
    {
      message: 'Unsupported PEM private key.'
    }
  )
})

test('detectPrivateKeyAlgorithm - public keys should be rejected', t => {
  t.assert.throws(() => detectPrivateKeyAlgorithm(publicKeys.RS), {
    message: 'Public keys are not supported for signing.'
  })
})

test('detectPrivateKeyAlgorithm - unrecognized PKCS8 OIDs should be rejected', t => {
  t.assert.throws(() => detectPrivateKeyAlgorithm(invalidPrivatePKCS8), {
    message: 'Unsupported PEM PCKS8 private key with OID 1.2.840.10040.4.1.'
  })
})

test('detectPrivateKeyAlgorithm - unrecognized EC curves should be rejected', t => {
  t.assert.throws(() => detectPrivateKeyAlgorithm(invalidPrivateCurve), {
    message: 'Unsupported EC private key with curve 1.2.840.10045.3.0.13.'
  })
})

for (const type of ['HS', 'ES', 'RS', 'PS']) {
  for (const bits of [256, 384, 512]) {
    const algorithm = `${type}${bits}`
    const detectedAlgorithm = type === 'ES' ? [algorithm] : detectedAlgorithms[type]
    const publicKey = publicKeys[type === 'ES' ? algorithm : type]

    test(`detectPublicKeyAlgorithms - ${type} keys should be recognized as ${detectedAlgorithm}`, t => {
      t.assert.deepStrictEqual(detectPublicKeyAlgorithms(publicKey), detectedAlgorithm)
    })

    if (type !== 'ES') {
      break
    }
  }
}

for (const type of ['Ed25519', 'Ed448']) {
  const publicKey = publicKeys[type]

  test(`detectPublicKeyAlgorithms - ${type} keys should be recognized as EdDSA`, t => {
    t.assert.deepStrictEqual(detectPublicKeyAlgorithms(publicKey), ['EdDSA'])
  })
}

test('detectPublicKeyAlgorithms - empty key should return "none"', t => {
  t.assert.equal(detectPublicKeyAlgorithms(), 'none')
})

test('detectPublicKeyAlgorithms - malformed or key objects must be rejected', t => {
  t.assert.throws(() => detectPublicKeyAlgorithms({}), {
    message: 'The public key must be a string or a buffer.'
  })

  // Executed twice to check caching of errors
  t.assert.throws(() => detectPublicKeyAlgorithms({}), {
    message: 'The public key must be a string or a buffer.'
  })

  t.assert.throws(() => detectPublicKeyAlgorithms({ key: publicKeys.RS }), {
    message: 'The public key must be a string or a buffer.'
  })

  t.assert.throws(() => detectPublicKeyAlgorithms(123), {
    message: 'The public key must be a string or a buffer.'
  })
})

test('detectPublicKeyAlgorithms - malformed PEM files should be rejected', t => {
  t.assert.throws(
    () => detectPublicKeyAlgorithms(Buffer.from('-----BEGIN PUBLIC KEY-----WHATEVER-----END PUBLIC KEY-----', 'utf-8')),
    {
      message: 'Unsupported PEM public key.'
    }
  )
})

test('detectPublicKeyAlgorithms - private keys should be rejected', t => {
  t.assert.throws(() => detectPublicKeyAlgorithms(privateKeys.RS), {
    message: 'Private keys are not supported for verifying.'
  })
})

test('detectPublicKeyAlgorithms - unrecognized PKCS8 OIDs should be rejected', t => {
  t.assert.throws(() => detectPublicKeyAlgorithms(invalidPublicPKCS8), {
    message: 'Unsupported PEM PCKS8 public key with OID 1.2.840.10040.4.1.'
  })
})

test('detectPublicKeyAlgorithms - unrecognized EC curves should be rejected', t => {
  t.assert.throws(() => detectPublicKeyAlgorithms(invalidPublicCurve), {
    message: 'Unsupported EC public key with curve 1.2.840.10045.3.0.13.'
  })
})

for (const bits of [256, 384, 512]) {
  const hsAlgorithm = `HS${bits}`

  // HS256, HS512, HS512
  test(`${hsAlgorithm} based tokens round trip with string keys`, t => {
    const token = createSigner({ algorithm: hsAlgorithm, key: 'secretsecretsecret' })({ payload: 'PAYLOAD' })

    const verified = createVerifier({ key: 'secretsecretsecret' })(token)

    t.assert.equal(verified.payload, 'PAYLOAD')
    t.assert.ok(verified.iat >= start)
    t.assert.ok(verified.iat <= Date.now() / 1000)
  })

  test(`${hsAlgorithm} based tokens round trip with buffer keys`, t => {
    const token = createSigner({ algorithm: hsAlgorithm, key: Buffer.from('secretsecretsecret', 'utf-8') })({
      payload: 'PAYLOAD'
    })

    const verified = createVerifier({ key: 'secretsecretsecret' })(token)

    t.assert.equal(verified.payload, 'PAYLOAD')
    t.assert.ok(verified.iat >= start)
    t.assert.ok(verified.iat <= Date.now() / 1000)
  })

  test(`${hsAlgorithm} based tokens should validate the key`, async t => {
    await t.assert.rejects(createSigner({ algorithm: hsAlgorithm, key: async () => 123 })({ payload: 'PAYLOAD' }), {
      message: 'The key returned from the callback must be a string or a buffer containing a secret or a private key.'
    })
  })
}

for (const type of ['ES', 'RS', 'PS']) {
  for (const bits of [256, 384, 512]) {
    const algorithm = `${type}${bits}`
    const privateKey = privateKeys[type === 'ES' ? algorithm : type]
    const publicKey = publicKeys[type === 'ES' ? algorithm : type]

    test(`${algorithm} based tokens round trip with buffer keys`, t => {
      const token = createSigner({ algorithm, key: privateKey })({ payload: 'PAYLOAD' })
      const verified = createVerifier({ key: publicKey })(token)

      t.assert.equal(verified.payload, 'PAYLOAD')
      t.assert.ok(verified.iat >= start)
      t.assert.ok(verified.iat <= Date.now() / 1000)
    })

    test(`${algorithm} based tokens round trip with string keys`, t => {
      const token = createSigner({ algorithm, key: privateKey.toString('utf-8') })({
        payload: 'PAYLOAD'
      })
      const verified = createVerifier({ algorithms: [algorithm], key: publicKey.toString('utf-8') })(token)

      t.assert.equal(verified.payload, 'PAYLOAD')
      t.assert.ok(verified.iat >= start)
      t.assert.ok(verified.iat <= Date.now() / 1000)
    })

    test(`${algorithm} based tokens should validate the private key`, async t => {
      await t.assert.rejects(
        createSigner({ algorithm, key: async () => 123 })({ payload: 'PAYLOAD' }),
        {
          message:
            'The key returned from the callback must be a string or a buffer containing a secret or a private key.'
        },
        null
      )
    })

    test(`${algorithm} based tokens should validate the public key`, async t => {
      const token = createSigner({ algorithm, key: privateKey })({ payload: 'PAYLOAD' })

      await t.assert.rejects(createVerifier({ algorithms: [algorithm], key: async () => 123 })(token), {
        message: 'The key returned from the callback must be a string or a buffer containing a secret or a public key.'
      })
    })
  }
}

if (useNewCrypto) {
  for (const type of ['Ed25519', 'Ed448']) {
    const privateKey = privateKeys[type]
    const publicKey = publicKeys[type]

    test(`EdDSA with ${type} based tokens round trip with buffer keys`, t => {
      const token = createSigner({ algorithm: 'EdDSA', key: privateKey })({ payload: 'PAYLOAD' })
      const verified = createVerifier({ algorithms: ['EdDSA'], key: publicKey })(token)

      t.assert.equal(verified.payload, 'PAYLOAD')
      t.assert.ok(verified.iat >= start)
      t.assert.ok(verified.iat <= Date.now() / 1000)
    })

    test(`EdDSA with ${type} based tokens round trip with string keys`, t => {
      const token = createSigner({ algorithm: 'EdDSA', key: privateKey.toString('utf-8') })({
        payload: 'PAYLOAD'
      })
      const verified = createVerifier({ algorithms: ['EdDSA'], key: publicKey.toString('utf-8') })(token)

      t.assert.equal(verified.payload, 'PAYLOAD')
      t.assert.ok(verified.iat >= start)
      t.assert.ok(verified.iat <= Date.now() / 1000)
    })

    test(`EdDSA with ${type} based tokens should validate the private key`, async t => {
      await t.assert.rejects(
        createSigner({ algorithm: 'EdDSA', key: async () => 123 })({ payload: 'PAYLOAD' }),
        {
          message:
            'The key returned from the callback must be a string or a buffer containing a secret or a private key.'
        },
        null
      )
    })

    test(`EdDSA with ${type} based tokens should validate the public key`, async t => {
      const token = createSigner({ algorithm: 'EdDSA', key: privateKey })({ payload: 'PAYLOAD' })

      await t.assert.rejects(createVerifier({ algorithms: ['EdDSA'], key: async () => 123 })(token), {
        message: 'The key returned from the callback must be a string or a buffer containing a secret or a public key.'
      })
    })
  }
}

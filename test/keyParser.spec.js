'use strict'

const { readFileSync } = require('fs')
const { resolve } = require('path')
const { test } = require('tap')

const {
  hsAlgorithms,
  rsaAlgorithms,
  detectPrivateKey,
  detectPublicKeySupportedAlgorithms
} = require('../src/keyParser')

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

const invalidPrivatePKCS8 = `
-----BEGIN PRIVATE KEY-----
MIIBSwIBADCCASsGByqGSM44BAEwggEeAoGBAMGxOb7Tft3j9ibDnbRQmSzNFVWI
zXgZuKcImr0hfaTHiCezcafkUCydrdlE+UddkS7i8I2USopaAC8qXm9MakL7aTLa
PdCJIPBjmcMSXfxqngeIko1mGySNRVCc2QxGHvMSkjTrY7TEzvgI4cJDg9ykZGU1
M9Hyq+Uq9I+/dRSxAhUA5HbY0DRPg5dciCzogxNGjfRVDO0CgYA6pxzHf5izDhsP
OdcPDPeHRNxDn1LdyHPTWcO96SLT3dRne40tXbvVxSdlXI1H9ZsTuBGoLWUcN9Mv
E9zBIU8h8nSWY6A4MwGdrGIwdb65kwrIGdHqxckQKJnGwvkzSftCiEMUvmn1TU0l
sZjIEvC33/YIQaP8Gvw0zKIQFS9vMwQXAhUAxRK28V19J5W4jfBY+3L3Zy/XbIo=
-----END PRIVATE KEY-----
`

const invalidPrivateCurve = `
-----BEGIN EC PRIVATE KEY-----
MHECAQEEHgMIJ+JtbK1h1Hr+VuYfQD/lWlBSRo2Fx4+10MljjKAKBggqhkjOPQMA
DaFAAz4ABH2YBzIol9aAQrQERTRHF31ztVeZ6dr8T8qJiitVoAFKep39qV9n/7sV
NspwxJ55TbI7tJiW6tcF2/MdOw==
-----END EC PRIVATE KEY-----
`

const invalidPublicPKCS8 = `
-----BEGIN PUBLIC KEY-----
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

const invalidPublicCurve = `
-----BEGIN PUBLIC KEY-----
MFUwEwYHKoZIzj0CAQYIKoZIzj0DAA0DPgAEBaKDc/7IW3cMDxat8ivVjqDq1TZ+
T7r5sAUIWaF0Q5uk5NYmLOnCFxoP8Ua16sraCbAozdvg0wfvT7Cq
-----END PUBLIC KEY-----
`

for (const type of ['HS', 'ES', 'RS', 'PS']) {
  for (const bits of [256, 384, 512]) {
    const algorithm = `${type}${bits}`
    const detectedAlgorithm = `${type === 'PS' ? 'RS' : type}${bits}`
    const privateKey = privateKeys[type === 'ES' ? algorithm : type]

    test(`detectPrivateKey - ${type} keys should be recognized as ${detectedAlgorithm}`, t => {
      t.equal(detectPrivateKey(privateKey), detectedAlgorithm)

      t.end()
    })

    if (type !== 'ES') {
      break
    }
  }
}

for (const type of ['Ed25519', 'Ed448']) {
  const privateKey = privateKeys[type]

  test(`detectPrivateKey - ${type} keys should be recognized as EdDSA`, t => {
    t.strictDeepEqual(detectPrivateKey(privateKey), 'EdDSA')

    t.end()
  })
}

test('detectPrivateKey - should support PEM passed as object', t => {
  t.equal(detectPrivateKey({ key: privateKeys.RS, passphrase: '' }), 'RS256')

  t.end()
})

test('detectPrivateKey - malformed or encrypted key objects must be rejected', t => {
  t.throws(() => detectPrivateKey({}), {
    message: 'Unsupported PEM key.'
  })

  // Execute twice to check caching of errors
  t.throws(() => detectPrivateKey({}), {
    message: 'Unsupported PEM key.'
  })

  t.throws(() => detectPrivateKey({ key: 123, passphrase: 123 }), {
    message: 'Unsupported PEM key.'
  })

  t.throws(() => detectPrivateKey({ key: 'A', passphrase: 123 }), {
    message: 'Unsupported PEM key.'
  })

  t.throws(() => detectPrivateKey({ key: 'A', passphrase: 'B' }), {
    message: 'Encrypted PEM keys are not supported when autodetecting the algorithm.'
  })

  t.end()
})

test('detectPrivateKey - malformed PEM files should be rejected', t => {
  t.throws(
    () => detectPrivateKey(Buffer.from('-----BEGIN PRIVATE KEY-----WHATEVER-----END PRIVATE KEY-----', 'utf-8')),
    {
      message: 'Unsupported PEM key.'
    }
  )

  // Executed twice to check caching of errors
  t.throws(
    () => detectPrivateKey(Buffer.from('-----BEGIN PRIVATE KEY-----WHATEVER-----END PRIVATE KEY-----', 'utf-8')),
    {
      message: 'Unsupported PEM key.'
    }
  )

  t.end()
})

test('detectPrivateKey - public keys should be rejected', t => {
  t.throws(() => detectPrivateKey(publicKeys.RS), {
    message: 'Public keys are not supported for signing.'
  })

  t.end()
})

test('detectPrivateKey - unrecognized PKCS8 OIDs should be rejected', t => {
  t.throws(() => detectPrivateKey(invalidPrivatePKCS8), {
    message: 'Unsupported PEM PCKS8 private key with OID 1.2.840.10040.4.1.'
  })

  t.end()
})

test('detectPrivateKey - unrecognized EC curves should be rejected', t => {
  t.throws(() => detectPrivateKey(invalidPrivateCurve), {
    message: 'Unsupported EC private key with curve 1.2.840.10045.3.0.13.'
  })

  t.end()
})

for (const type of ['HS', 'ES', 'RS', 'PS']) {
  for (const bits of [256, 384, 512]) {
    const algorithm = `${type}${bits}`
    const detectedAlgorithm = type === 'ES' ? [algorithm] : detectedAlgorithms[type]
    const publicKey = publicKeys[type === 'ES' ? algorithm : type]

    test(`detectPublicKeySupportedAlgorithms - ${type} keys should be recognized as ${detectedAlgorithm}`, t => {
      t.strictDeepEqual(detectPublicKeySupportedAlgorithms(publicKey), detectedAlgorithm)

      t.end()
    })

    if (type !== 'ES') {
      break
    }
  }
}

for (const type of ['Ed25519', 'Ed448']) {
  const publicKey = publicKeys[type]

  test(`detectPublicKeySupportedAlgorithms - ${type} keys should be recognized as EdDSA`, t => {
    t.strictDeepEqual(detectPublicKeySupportedAlgorithms(publicKey), 'EdDSA')

    t.end()
  })
}

test('detectPublicKeySupportedAlgorithms - should support PEM passed as object', t => {
  t.strictDeepEqual(detectPublicKeySupportedAlgorithms({ key: publicKeys.RS, passphrase: '' }), rsaAlgorithms)

  t.end()
})

test('detectPublicKeySupportedAlgorithms - malformed or key objects must be rejected', t => {
  t.throws(() => detectPublicKeySupportedAlgorithms({}), {
    message: 'Unsupported PEM key.'
  })

  t.throws(() => detectPublicKeySupportedAlgorithms({ key: 123 }), {
    message: 'Unsupported PEM key.'
  })

  t.end()
})

test('detectPublicKeySupportedAlgorithms - malformed PEM files should be rejected', t => {
  t.throws(
    () =>
      detectPublicKeySupportedAlgorithms(
        Buffer.from('-----BEGIN PUBLIC KEY-----WHATEVER-----END PUBLIC KEY-----', 'utf-8')
      ),
    {
      message: 'Unsupported PEM key.'
    }
  )

  // Executed twice to check caching of errors
  t.throws(
    () =>
      detectPublicKeySupportedAlgorithms(
        Buffer.from('-----BEGIN PUBLIC KEY-----WHATEVER-----END PUBLIC KEY-----', 'utf-8')
      ),
    {
      message: 'Unsupported PEM key.'
    }
  )

  t.end()
})

test('detectPublicKeySupportedAlgorithms - public keys should be rejected', t => {
  t.throws(() => detectPublicKeySupportedAlgorithms(privateKeys.RS), {
    message: 'Private keys are not supported for verifying.'
  })

  t.end()
})

test('detectPublicKeySupportedAlgorithms - unrecognized PKCS8 OIDs should be rejected', t => {
  t.throws(() => detectPublicKeySupportedAlgorithms(invalidPublicPKCS8), {
    message: 'Unsupported PEM PCKS8 public key with OID 1.2.840.10040.4.1.'
  })

  t.end()
})

test('detectPublicKeySupportedAlgorithms - unrecognized EC curves should be rejected', t => {
  t.throws(() => detectPublicKeySupportedAlgorithms(invalidPublicCurve), {
    message: 'Unsupported EC public key with curve 1.2.840.10045.3.0.13.'
  })

  t.end()
})

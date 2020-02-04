'use strict'

const { readFileSync } = require('fs')
const { resolve } = require('path')
const { test } = require('tap')

const { detectAlgorithm } = require('../../src/privateKeyParser')

const privateKeys = {
  HS: 'secretsecretsecret',
  ES256: readFileSync(resolve(__dirname, '../../benchmarks/keys/es-256-private.key')),
  ES384: readFileSync(resolve(__dirname, '../../benchmarks/keys/es-384-private.key')),
  ES512: readFileSync(resolve(__dirname, '../../benchmarks/keys/es-512-private.key')),
  RS: readFileSync(resolve(__dirname, '../../benchmarks/keys/rs-512-private.key')),
  PS: readFileSync(resolve(__dirname, '../../benchmarks/keys/ps-512-private.key'))
}

const invalidPKCS8 = `
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

const invalidCurve = `
-----BEGIN EC PRIVATE KEY-----
MHECAQEEHgMIJ+JtbK1h1Hr+VuYfQD/lWlBSRo2Fx4+10MljjKAKBggqhkjOPQMA
DaFAAz4ABH2YBzIol9aAQrQERTRHF31ztVeZ6dr8T8qJiitVoAFKep39qV9n/7sV
NspwxJ55TbI7tJiW6tcF2/MdOw==
-----END EC PRIVATE KEY-----
`

for (const type of ['HS', 'ES', 'RS', 'PS']) {
  for (const bits of [256, 384, 512]) {
    const algorithm = `${type}${bits}`
    const detectedAlgorithm = `${type === 'PS' ? 'RS' : type}${bits}`
    const privateKey = privateKeys[type === 'ES' ? algorithm : type]

    test(`${type} keys should be recognized as ${detectedAlgorithm}`, t => {
      t.equal(detectAlgorithm(privateKey), detectedAlgorithm)

      t.end()
    })

    if (type !== 'ES') {
      break
    }
  }
}

test('should support PEM passed as object', t => {
  t.equal(detectAlgorithm({ key: privateKeys.RS, passphrase: '' }), 'RS256')

  t.end()
})

test('malformed or encrypted key objects must be rejected', t => {
  t.throws(() => detectAlgorithm({}), {
    message: 'Unsupported PEM key.'
  })

  t.throws(() => detectAlgorithm({ key: 123, passphrase: 123 }), {
    message: 'Unsupported PEM key.'
  })

  t.throws(() => detectAlgorithm({ key: 'A', passphrase: 123 }), {
    message: 'Unsupported PEM key.'
  })

  t.throws(() => detectAlgorithm({ key: 'A', passphrase: 'B' }), {
    message: 'Encrypted PEM keys are not supported when autodetecting the algorithm.'
  })

  t.end()
})

test('malformed PEM files should be rejected', t => {
  t.throws(() => detectAlgorithm('----- BEGIN PUBLIC KEY-----WHATEVER-----END PUBLIC KEY-----'), {
    message: 'Unsupported PEM key.'
  })

  t.end()
})

test('unrecognized PKCS8 curves should be rejected', t => {
  t.throws(() => detectAlgorithm(invalidPKCS8), {
    message: 'Unsupported PEM PCKS8 key with OID 1.2.840.10040.4.1.'
  })

  t.end()
})

test('unrecognized EC curves should be rejected', t => {
  t.throws(() => detectAlgorithm(invalidCurve), {
    message: 'Unsupported EC private key with curve 1.2.840.10045.3.0.13.'
  })

  t.end()
})

'use strict'

const { describe, test } = require('node:test')
const { createHmac } = require('node:crypto')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')

const { createVerifier, createSigner } = require('../src')
const { hsAlgorithms, rsaAlgorithms, detectPrivateKeyAlgorithm, detectPublicKeyAlgorithms } = require('../src/crypto')

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

const leadingWhitespacePrefixes = ['\n', ' ', ' \n', '\n ', '\t\t']

// GHSA-ww5h-9m49-7xx4 (incomplete fix of CVE-2026-34950): `String.prototype.trim()`
// only strips whitespace, so any NON-whitespace leading byte used to push the PEM
// header off position 0 and defeat the ^-anchored matcher, causing an asymmetric
// key to be misclassified as an HMAC secret (RSA -> HS256 algorithm confusion).
const leadingNonWhitespacePrefixes = [
  '# some comment\n', // comment line
  '// comment\n',
  '.', // arbitrary printable byte
  'HTTP/1.1 200 OK\r\n\r\n', // HTTP-style header
  String.fromCodePoint(0x00), // NUL
  String.fromCodePoint(0x01), // SOH
  String.fromCodePoint(0x1b), // ESC (ANSI escape)
  String.fromCodePoint(0x7f), // DEL
  String.fromCodePoint(0x200b), // zero-width space
  String.fromCodePoint(0x200d), // zero-width joiner
  String.fromCodePoint(0x180e) // Mongolian vowel separator
]

describe('detectPrivateKeyAlgorithm', () => {
  for (const type of ['HS', 'ES', 'RS', 'PS']) {
    for (const bits of [256, 384, 512]) {
      const algorithm = `${type}${bits}`
      const detectedAlgorithm = `${type === 'PS' ? 'RS' : type}${bits}`
      const privateKey = privateKeys[type === 'ES' ? algorithm : type]

      test(`${type} keys should be recognized as ${detectedAlgorithm}`, t => {
        t.assert.equal(detectPrivateKeyAlgorithm(privateKey), detectedAlgorithm)
      })

      if (type !== 'ES') {
        break
      }
    }
  }

  for (const type of ['Ed25519', 'Ed448']) {
    const privateKey = privateKeys[type]

    test(`${type} keys should be recognized as EdDSA`, t => {
      t.assert.deepStrictEqual(detectPrivateKeyAlgorithm(privateKey), 'EdDSA')
    })
  }

  test('malformed or encrypted key objects must be rejected', t => {
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

  test('malformed PEM files should be rejected', t => {
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

  test('public keys should be rejected', t => {
    t.assert.throws(() => detectPrivateKeyAlgorithm(publicKeys.RS), {
      message: 'Public keys are not supported for signing.'
    })
  })

  test('a key with an unrecognized PEM header must be refused (not used as a secret)', t => {
    t.assert.throws(
      () => detectPrivateKeyAlgorithm('# note\n-----BEGIN SOMETHING-----\nQUJD\n-----END SOMETHING-----'),
      {
        message: 'Unsupported PEM private key.'
      }
    )
  })

  test('public keys should be accepted if HS256, HS384, HS512 is used', t => {
    ;['HS256', 'HS384', 'HS512'].forEach(algorithm => {
      t.assert.equal(
        detectPrivateKeyAlgorithm(`-----BEGIN PUBLIC KEY-----\nUSED IN ${algorithm}`, algorithm),
        algorithm
      )
    })
  })

  test('unrecognized PKCS8 OIDs should be rejected', t => {
    t.assert.throws(() => detectPrivateKeyAlgorithm(invalidPrivatePKCS8), {
      message: 'Unsupported PEM PCKS8 private key with OID 1.2.840.10040.4.1.'
    })
  })

  test('unrecognized EC curves should be rejected', t => {
    t.assert.throws(() => detectPrivateKeyAlgorithm(invalidPrivateCurve), {
      message: 'Unsupported EC private key with curve 1.2.840.10045.3.0.13.'
    })
  })

  // GHSA-mvf2-f6gm-w987 (signer side): public key with leading whitespace must not
  // bypass the "Public keys are not supported for signing" guard.
  test('public key with leading whitespace must still be rejected', t => {
    for (const prefix of leadingWhitespacePrefixes) {
      t.assert.throws(() => detectPrivateKeyAlgorithm(prefix + publicKeys.RS.toString('utf-8')), {
        message: 'Public keys are not supported for signing.'
      })
    }
  })

  test('X.509 cert with leading whitespace must still be rejected', t => {
    const cert = readFileSync(resolve(__dirname, '../benchmarks/keys/rs-x509-public.key'))
    for (const prefix of leadingWhitespacePrefixes) {
      t.assert.throws(() => detectPrivateKeyAlgorithm(prefix + cert.toString('utf-8')), {
        message: 'Public keys are not supported for signing.'
      })
    }
  })

  test('EC private key with leading whitespace must still be detected', t => {
    for (const prefix of leadingWhitespacePrefixes) {
      t.assert.equal(detectPrivateKeyAlgorithm(prefix + privateKeys.ES256.toString('utf-8')), 'ES256')
    }
  })

  // GHSA-ww5h-9m49-7xx4 (signer side): a non-whitespace prefix must not push the PEM
  // header off position 0 and cause a public/private key to be treated as an HMAC secret.
  test('public key with non-whitespace prefix must still be rejected', t => {
    for (const prefix of leadingNonWhitespacePrefixes) {
      t.assert.throws(() => detectPrivateKeyAlgorithm(prefix + publicKeys.RS.toString('utf-8')), {
        message: 'Public keys are not supported for signing.'
      })
    }
  })

  test('X.509 cert with non-whitespace prefix must still be rejected', t => {
    const cert = readFileSync(resolve(__dirname, '../benchmarks/keys/rs-x509-public.key'))
    for (const prefix of leadingNonWhitespacePrefixes) {
      t.assert.throws(() => detectPrivateKeyAlgorithm(prefix + cert.toString('utf-8')), {
        message: 'Public keys are not supported for signing.'
      })
    }
  })

  test('EC private key with non-whitespace prefix must still be detected (not HMAC)', t => {
    for (const prefix of leadingNonWhitespacePrefixes) {
      t.assert.equal(detectPrivateKeyAlgorithm(prefix + privateKeys.ES256.toString('utf-8')), 'ES256')
    }
  })
})

describe('detectPublicKeyAlgorithms', () => {
  for (const type of ['HS', 'ES', 'RS', 'PS']) {
    for (const bits of [256, 384, 512]) {
      const algorithm = `${type}${bits}`
      const detectedAlgorithm = type === 'ES' ? [algorithm] : detectedAlgorithms[type]
      const publicKey = publicKeys[type === 'ES' ? algorithm : type]

      test(`${type} keys should be recognized as ${detectedAlgorithm}`, t => {
        t.assert.deepStrictEqual(detectPublicKeyAlgorithms(publicKey), detectedAlgorithm)
      })

      if (type !== 'ES') {
        break
      }
    }
  }

  for (const type of ['Ed25519', 'Ed448']) {
    const publicKey = publicKeys[type]

    test(`${type} keys should be recognized as EdDSA`, t => {
      t.assert.deepStrictEqual(detectPublicKeyAlgorithms(publicKey), ['EdDSA'])
    })
  }

  test('empty key should return "none"', t => {
    t.assert.equal(detectPublicKeyAlgorithms(), 'none')
  })

  test('malformed or key objects must be rejected', t => {
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

  test('malformed PEM files should be rejected', t => {
    t.assert.throws(
      () =>
        detectPublicKeyAlgorithms(Buffer.from('-----BEGIN PUBLIC KEY-----WHATEVER-----END PUBLIC KEY-----', 'utf-8')),
      {
        message: 'Unsupported PEM public key.'
      }
    )
  })

  test('private keys should be rejected', t => {
    t.assert.throws(() => detectPublicKeyAlgorithms(privateKeys.RS), {
      message: 'Private keys are not supported for verifying.'
    })
  })

  test('a key with an unrecognized PEM header must be refused (not used as a secret)', t => {
    t.assert.throws(
      () => detectPublicKeyAlgorithms('# note\n-----BEGIN SOMETHING-----\nQUJD\n-----END SOMETHING-----'),
      {
        message: 'Unsupported PEM public key.'
      }
    )
  })

  test('public key-like strings should be accepted if all provided algorithms are HS', t => {
    ;['HS256', 'HS384', 'HS512'].forEach(algorithm => {
      t.assert.deepStrictEqual(
        detectPublicKeyAlgorithms(`-----BEGIN PUBLIC KEY-----\nUSED IN ${algorithm}`, [algorithm]),
        [algorithm]
      )
    })
  })

  test('unrecognized PKCS8 OIDs should be rejected', t => {
    t.assert.throws(() => detectPublicKeyAlgorithms(invalidPublicPKCS8), {
      message: 'Unsupported PEM PCKS8 public key with OID 1.2.840.10040.4.1.'
    })
  })

  test('unrecognized EC curves should be rejected', t => {
    t.assert.throws(() => detectPublicKeyAlgorithms(invalidPublicCurve), {
      message: 'Unsupported EC public key with curve 1.2.840.10045.3.0.13.'
    })
  })

  // GHSA-mvf2-f6gm-w987: leading whitespace must not defeat the ^ anchor and cause
  // an RSA/EC/Ed public key to be misclassified as an HMAC secret.
  test('RSA public key with leading whitespace must be detected as RSA (not HMAC)', t => {
    for (const prefix of leadingWhitespacePrefixes) {
      t.assert.deepStrictEqual(detectPublicKeyAlgorithms(prefix + publicKeys.RS.toString('utf-8')), rsaAlgorithms)
    }
  })

  test('EC public key with leading whitespace must be detected as EC (not HMAC)', t => {
    for (const prefix of leadingWhitespacePrefixes) {
      t.assert.deepStrictEqual(detectPublicKeyAlgorithms(prefix + publicKeys.ES256.toString('utf-8')), ['ES256'])
    }
  })

  test('Ed25519 public key with leading whitespace must be detected as EdDSA (not HMAC)', t => {
    for (const prefix of leadingWhitespacePrefixes) {
      t.assert.deepStrictEqual(detectPublicKeyAlgorithms(prefix + publicKeys.Ed25519.toString('utf-8')), ['EdDSA'])
    }
  })

  test('private key with leading whitespace must still be rejected', t => {
    for (const prefix of leadingWhitespacePrefixes) {
      t.assert.throws(() => detectPublicKeyAlgorithms(prefix + privateKeys.RS.toString('utf-8')), {
        message: 'Private keys are not supported for verifying.'
      })
    }
  })

  // GHSA-ww5h-9m49-7xx4: a non-whitespace prefix must not defeat detection and cause an
  // asymmetric public key to be misclassified as an HMAC secret (RSA -> HS256 confusion).
  test('RSA public key with non-whitespace prefix must be detected as RSA (not HMAC)', t => {
    for (const prefix of leadingNonWhitespacePrefixes) {
      t.assert.deepStrictEqual(detectPublicKeyAlgorithms(prefix + publicKeys.RS.toString('utf-8')), rsaAlgorithms)
    }
  })

  test('EC public key with non-whitespace prefix must be detected as EC (not HMAC)', t => {
    for (const prefix of leadingNonWhitespacePrefixes) {
      t.assert.deepStrictEqual(detectPublicKeyAlgorithms(prefix + publicKeys.ES256.toString('utf-8')), ['ES256'])
    }
  })

  test('Ed25519 public key with non-whitespace prefix must be detected as EdDSA (not HMAC)', t => {
    for (const prefix of leadingNonWhitespacePrefixes) {
      t.assert.deepStrictEqual(detectPublicKeyAlgorithms(prefix + publicKeys.Ed25519.toString('utf-8')), ['EdDSA'])
    }
  })

  test('private key with non-whitespace prefix must still be rejected', t => {
    for (const prefix of leadingNonWhitespacePrefixes) {
      t.assert.throws(() => detectPublicKeyAlgorithms(prefix + privateKeys.RS.toString('utf-8')), {
        message: 'Private keys are not supported for verifying.'
      })
    }
  })
})

// GHSA-ww5h-9m49-7xx4: end-to-end proof that the RSA -> HS256 algorithm-confusion
// attack (forge an HS256 token whose signature is an HMAC keyed with the target's
// RSA public key) is rejected even when the loaded key carries a non-whitespace prefix.
describe('GHSA-ww5h-9m49-7xx4 - RSA to HS256 algorithm confusion via key prefix', () => {
  function forgeHsToken(secret, alg = 'HS256') {
    const header = Buffer.from(JSON.stringify({ alg, typ: 'JWT' })).toString('base64url')
    const payload = Buffer.from(JSON.stringify({ admin: true, sub: 'attacker' })).toString('base64url')
    const signature = createHmac(`sha${alg.slice(2)}`, secret)
      .update(`${header}.${payload}`)
      .digest('base64url')
    return `${header}.${payload}.${signature}`
  }

  test('a prefixed RSA public key must not be usable as an HMAC secret (default verifier)', t => {
    const publicKey = publicKeys.RS.toString('utf-8')
    for (const prefix of leadingNonWhitespacePrefixes) {
      const key = prefix + publicKey
      const forged = forgeHsToken(key)
      // No algorithms allowlist -> the key must be detected as RSA, so an HS256 token
      // can never be accepted. Rejection may surface at verifier creation or at verify.
      t.assert.throws(() => createVerifier({ key })(forged))
    }
  })

  test('the clean (unprefixed) RSA public key is also not usable as an HMAC secret', t => {
    const key = publicKeys.RS.toString('utf-8')
    const forged = forgeHsToken(key)
    t.assert.throws(() => createVerifier({ key })(forged), {
      code: 'FAST_JWT_INVALID_ALGORITHM'
    })
  })
})

// GHSA-ww5h-9m49-7xx4 (review follow-up): the two detectors must agree on
// junk-before-a-real-header input. A real key hidden behind an unrelated PEM
// block must be refused by BOTH detectors (never classified as an HMAC secret),
// so the paths cannot drift the way earlier fixes in this CVE lineage did.
describe('GHSA-ww5h-9m49-7xx4 - detector consistency on junk PEM block before a real key', () => {
  const junkBlock = '-----BEGIN COMMENT-----\nQUJD\n-----END COMMENT-----\n'

  test('private-key detection refuses a real key behind a junk PEM block', t => {
    t.assert.throws(() => detectPrivateKeyAlgorithm(junkBlock + privateKeys.RS.toString('utf-8')), {
      message: 'Unsupported PEM private key.'
    })
  })

  test('public-key detection refuses a real key behind a junk PEM block', t => {
    t.assert.throws(() => detectPublicKeyAlgorithms(junkBlock + publicKeys.RS.toString('utf-8')), {
      message: 'Unsupported PEM public key.'
    })
  })
})

for (const bits of [256, 384, 512]) {
  const hsAlgorithm = `HS${bits}`
  const key = privateKeys.HS

  // HS256, HS384, HS512
  describe(`${hsAlgorithm} based tokens`, () => {
    test('round trip with string keys', t => {
      const token = createSigner({ algorithm: hsAlgorithm, key })({ payload: 'PAYLOAD' })
      const verified = createVerifier({ key })(token)

      t.assert.equal(verified.payload, 'PAYLOAD')
      t.assert.ok(verified.iat >= start)
      t.assert.ok(verified.iat <= Date.now() / 1000)
    })

    test('round trip with buffer keys', t => {
      const token = createSigner({ algorithm: hsAlgorithm, key: Buffer.from(key, 'utf-8') })({ payload: 'PAYLOAD' })
      const verified = createVerifier({ key })(token)

      t.assert.equal(verified.payload, 'PAYLOAD')
      t.assert.ok(verified.iat >= start)
      t.assert.ok(verified.iat <= Date.now() / 1000)
    })

    test('should validate the key', async t => {
      await t.assert.rejects(createSigner({ algorithm: hsAlgorithm, key: async () => 123 })({ payload: 'PAYLOAD' }), {
        message: 'The key returned from the callback must be a string or a buffer containing a secret or a private key.'
      })
    })

    const pemLikeSecret = `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu1SU1LfVLPHCozMxH2Mo\n4lgOEePzNm0tRgeLezV6ffAt0gunVTLw7onLRnrq0/IzW7yWR7QkrmBL7jTKEn5u\n-----END PUBLIC KEY-----`
    test('round trip with PEM-like secret keys', t => {
      const token = createSigner({ algorithm: hsAlgorithm, key: pemLikeSecret })({ payload: 'PAYLOAD' })
      const verified = createVerifier({ algorithms: [hsAlgorithm], key: pemLikeSecret })(token)

      t.assert.equal(verified.payload, 'PAYLOAD')
      t.assert.ok(verified.iat >= start)
      t.assert.ok(verified.iat <= Date.now() / 1000)
    })
  })
}

for (const type of ['ES', 'RS', 'PS']) {
  for (const bits of [256, 384, 512]) {
    const algorithm = `${type}${bits}`
    const privateKey = privateKeys[type === 'ES' ? algorithm : type]
    const publicKey = publicKeys[type === 'ES' ? algorithm : type]

    describe(`${algorithm} based tokens`, () => {
      test('round trip with buffer keys', t => {
        const token = createSigner({ algorithm, key: privateKey })({ payload: 'PAYLOAD' })
        const verified = createVerifier({ key: publicKey })(token)

        t.assert.equal(verified.payload, 'PAYLOAD')
        t.assert.ok(verified.iat >= start)
        t.assert.ok(verified.iat <= Date.now() / 1000)
      })

      test('round trip with string keys', t => {
        const token = createSigner({ algorithm, key: privateKey.toString('utf-8') })({
          payload: 'PAYLOAD'
        })
        const verified = createVerifier({ algorithms: [algorithm], key: publicKey.toString('utf-8') })(token)

        t.assert.equal(verified.payload, 'PAYLOAD')
        t.assert.ok(verified.iat >= start)
        t.assert.ok(verified.iat <= Date.now() / 1000)
      })

      test('should validate the private key', async t => {
        await t.assert.rejects(
          createSigner({ algorithm, key: async () => 123 })({ payload: 'PAYLOAD' }),
          {
            message:
              'The key returned from the callback must be a string or a buffer containing a secret or a private key.'
          },
          null
        )
      })

      test('should validate the public key', async t => {
        const token = createSigner({ algorithm, key: privateKey })({ payload: 'PAYLOAD' })

        await t.assert.rejects(createVerifier({ algorithms: [algorithm], key: async () => 123 })(token), {
          message:
            'The key returned from the callback must be a string or a buffer containing a secret or a public key.'
        })
      })
    })
  }
}

for (const type of ['Ed25519', 'Ed448']) {
  const privateKey = privateKeys[type]
  const publicKey = publicKeys[type]

  describe(`EdDSA with ${type} based tokens`, () => {
    test('round trip with buffer keys', t => {
      const token = createSigner({ algorithm: 'EdDSA', key: privateKey })({ payload: 'PAYLOAD' })
      const verified = createVerifier({ algorithms: ['EdDSA'], key: publicKey })(token)

      t.assert.equal(verified.payload, 'PAYLOAD')
      t.assert.ok(verified.iat >= start)
      t.assert.ok(verified.iat <= Date.now() / 1000)
    })

    test('round trip with string keys', t => {
      const token = createSigner({ algorithm: 'EdDSA', key: privateKey.toString('utf-8') })({
        payload: 'PAYLOAD'
      })
      const verified = createVerifier({ algorithms: ['EdDSA'], key: publicKey.toString('utf-8') })(token)

      t.assert.equal(verified.payload, 'PAYLOAD')
      t.assert.ok(verified.iat >= start)
      t.assert.ok(verified.iat <= Date.now() / 1000)
    })

    test('should validate the private key', async t => {
      await t.assert.rejects(
        createSigner({ algorithm: 'EdDSA', key: async () => 123 })({ payload: 'PAYLOAD' }),
        {
          message:
            'The key returned from the callback must be a string or a buffer containing a secret or a private key.'
        },
        null
      )
    })

    test('should validate the public key', async t => {
      const token = createSigner({ algorithm: 'EdDSA', key: privateKey })({ payload: 'PAYLOAD' })

      await t.assert.rejects(createVerifier({ algorithms: ['EdDSA'], key: async () => 123 })(token), {
        message: 'The key returned from the callback must be a string or a buffer containing a secret or a public key.'
      })
    })
  })
}

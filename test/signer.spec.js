'use strict'

const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { describe, test } = require('node:test')

const { createSigner, createVerifier, TokenError, createDecoder } = require('../src')

/*
  Only count the signer's own warnings: on Node 20 and 22 the first use of t.mock.timers emits
  an unrelated ExperimentalWarning through the same mocked process.emitWarning.
*/
function nonFiniteTimeWarningCalls(emitWarningMock) {
  return emitWarningMock.mock.calls.filter(
    warningCall => warningCall.arguments[1]?.code === 'FAST_JWT_NON_FINITE_TIME_OPTION'
  )
}

const privateKeys = {
  HS: 'secretsecretsecret',
  ES256: readFileSync(resolve(__dirname, '../benchmarks/keys/es-256-private.key')),
  ES384: readFileSync(resolve(__dirname, '../benchmarks/keys/es-384-private.key')),
  ES512: readFileSync(resolve(__dirname, '../benchmarks/keys/es-512-private.key')),
  PPES256: readFileSync(resolve(__dirname, '../benchmarks/keys/ppes-256-private.key')),
  PPES384: readFileSync(resolve(__dirname, '../benchmarks/keys/ppes-384-private.key')),
  PPES512: readFileSync(resolve(__dirname, '../benchmarks/keys/ppes-512-private.key')),
  RS: readFileSync(resolve(__dirname, '../benchmarks/keys/rs-512-private.key')),
  RSX509: readFileSync(resolve(__dirname, '../benchmarks/keys/rs-x509-private.key')),
  PPRS: readFileSync(resolve(__dirname, '../benchmarks/keys/pprs-512-private.key')),
  PS: readFileSync(resolve(__dirname, '../benchmarks/keys/ps-512-private.key')),
  Ed25519: readFileSync(resolve(__dirname, '../benchmarks/keys/ed-25519-private.key')),
  Ed448: readFileSync(resolve(__dirname, '../benchmarks/keys/ed-448-private.key'))
}

const publicKeys = {
  HS: 'secretsecretsecret',
  ES256: readFileSync(resolve(__dirname, '../benchmarks/keys/es-256-public.key')),
  ES384: readFileSync(resolve(__dirname, '../benchmarks/keys/es-384-public.key')),
  ES512: readFileSync(resolve(__dirname, '../benchmarks/keys/es-512-public.key')),
  PPES256: readFileSync(resolve(__dirname, '../benchmarks/keys/ppes-256-public.key')),
  PPES384: readFileSync(resolve(__dirname, '../benchmarks/keys/ppes-384-public.key')),
  PPES512: readFileSync(resolve(__dirname, '../benchmarks/keys/ppes-512-public.key')),
  RS: readFileSync(resolve(__dirname, '../benchmarks/keys/rs-512-public.key')),
  RSX509: readFileSync(resolve(__dirname, '../benchmarks/keys/rs-x509-public.key')),
  PPRS: readFileSync(resolve(__dirname, '../benchmarks/keys/pprs-512-public.key')),
  PS: readFileSync(resolve(__dirname, '../benchmarks/keys/ps-512-public.key')),
  Ed25519: readFileSync(resolve(__dirname, '../benchmarks/keys/ed-25519-public.key')),
  Ed448: readFileSync(resolve(__dirname, '../benchmarks/keys/ed-448-public.key'))
}

function sign(payload, options, callback) {
  const signer = createSigner({ key: 'secret', ...options })
  return signer(payload, callback)
}

describe('createSigner', () => {
  test('passes the correct decoded jwt token to the key callback', async t => {
    sign(
      { a: 1 },
      {
        noTimestamp: true,
        key: decodedJwt => {
          t.assert.deepStrictEqual(decodedJwt, {
            payload: { a: 1 },
            header: {
              alg: undefined,
              typ: 'JWT',
              kid: undefined
            }
          })
        }
      }
    )
  })

  test('correctly returns a token - sync', async t => {
    t.assert.equal(
      sign({ a: 1 }, { noTimestamp: true }),
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
    )

    t.assert.equal(
      sign({ a: 1 }, { key: undefined, algorithm: 'none', noTimestamp: true }),
      'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJhIjoxfQ.'
    )

    t.assert.equal(
      sign({ a: 1 }, { noTimestamp: true, algorithm: 'none', key: null }),
      'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJhIjoxfQ.'
    )

    t.assert.equal(
      sign({ a: 1 }, { noTimestamp: true, key: privateKeys.Ed25519 }),
      'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.pIRjmLR-JW4sTCslD24h5fs0sTUpGYBG7zh4Z_UyEZ_u29NojdH2dSNKQZwwgjl1WvfYNtBCCF_EnYTazAXmDQ'
    )
  })

  test('correctly returns a token - async - key with callback', async t => {
    t.assert.equal(
      await sign(
        { a: 1 },
        { key: (_decodedJwt, callback) => setTimeout(() => callback(null, 'secret'), 10), noTimestamp: true }
      ),
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
    )
  })

  test('correctly returns a token - async - key as promise', async t => {
    t.assert.equal(
      await sign({ a: 1 }, { key: async () => 'secret', noTimestamp: true }),
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
    )
  })

  test('correctly returns a token - async - static key', async t => {
    t.assert.equal(
      await sign({ a: 1 }, { noTimestamp: true }),
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
    )
  })

  test('correctly returns a token - callback - key as promise', t => {
    sign({ a: 1 }, { key: async () => Buffer.from('secret', 'utf-8'), noTimestamp: true }, (error, token) => {
      t.assert.ok(error == null)
      t.assert.equal(
        token,
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
      )
    })
  })

  test('correctly returns a token - key as an RSA X509 key', async t => {
    const payload = { a: 1 }
    const signedToken = sign(payload, { key: privateKeys.RSX509, noTimestamp: true })
    const decoder = createDecoder()
    const result = decoder(signedToken)

    t.assert.equal(payload.a, result.a)
  })

  test('correctly returns a token - key as an RSA passphrase protected key', async t => {
    const payload = { a: 1 }
    const signedToken = sign(payload, { algorithm: 'RS256', key: { key: privateKeys.PPRS, passphrase: 'secret' } })
    const decoder = createDecoder()
    const result = decoder(signedToken)

    t.assert.equal(payload.a, result.a)
  })

  test('correctly returns a token - key as an ES256 passphrase protected key', async t => {
    const payload = { a: 1 }
    const signedToken = sign(payload, { algorithm: 'ES256', key: { key: privateKeys.PPES256, passphrase: 'secret' } })
    const decoder = createDecoder()
    const result = decoder(signedToken)

    t.assert.equal(payload.a, result.a)
  })

  test('correctly returns a token - key as an ES384 passphrase protected key', async t => {
    const payload = { a: 1 }
    const signedToken = sign(payload, { algorithm: 'ES384', key: { key: privateKeys.PPES384, passphrase: 'secret' } })
    const decoder = createDecoder()
    const result = decoder(signedToken)

    t.assert.equal(payload.a, result.a)
  })

  test('correctly returns a token - key as an ES512 passphrase protected key', async t => {
    const payload = { a: 1 }
    const signedToken = sign(payload, { algorithm: 'ES512', key: { key: privateKeys.PPES512, passphrase: 'secret' } })
    const decoder = createDecoder()
    const result = decoder(signedToken)

    t.assert.equal(payload.a, result.a)
  })

  test('correctly returns an error when algorithm is not provided when using passphrase protected key', async t => {
    t.assert.throws(() => sign({ a: 1 }, { key: { key: privateKeys.PPRS, passphrase: 'secret' } }), {
      message: 'When using password protected key you must provide the algorithm option.'
    })
  })

  test('correctly returns an error when using "EdDSA" algorithm passphrase protected key', async t => {
    t.assert.throws(
      () => sign({ a: 1 }, { algorithm: 'EdDSA', key: { key: privateKeys.PPRS, passphrase: 'secret' } }),
      {
        message: 'Invalid private key provided for algorithm EdDSA.',
        code: TokenError.codes.invalidKey
      }
    )
  })

  test('correctly returns an error when using "ES256" algorithm with RSA private key', async t => {
    t.assert.throws(() => sign({ a: 1 }, { algorithm: 'ES256', key: privateKeys.RS }), {
      message: 'Invalid private key provided for algorithm ES256.',
      code: TokenError.codes.invalidKey
    })
  })

  test('correctly autodetects the algorithm depending on the secret provided', async t => {
    const hsVerifier = createVerifier({ complete: true, key: publicKeys.HS })
    const rsVerifier = createVerifier({ complete: true, key: publicKeys.RS })
    const pprsVerifier = createVerifier({ complete: true, key: publicKeys.PPRS })
    const psVerifier = createVerifier({ complete: true, key: publicKeys.PS })
    const es256Verifier = createVerifier({ complete: true, key: publicKeys.ES256 })
    const es384Verifier = createVerifier({ complete: true, key: publicKeys.ES384 })
    const es512Verifier = createVerifier({ complete: true, key: publicKeys.ES512 })
    const ppes256Verifier = createVerifier({ complete: true, key: publicKeys.PPES256 })
    const ppes384Verifier = createVerifier({ complete: true, key: publicKeys.PPES384 })
    const ppes512Verifier = createVerifier({ complete: true, key: publicKeys.PPES512 })
    const es25519Verifier = createVerifier({ complete: true, key: publicKeys.Ed25519 })
    const es448Verifier = createVerifier({ complete: true, key: publicKeys.Ed448 })

    let token = createSigner({ key: privateKeys.HS })({ a: 1 })
    let verification = hsVerifier(token)
    t.assert.equal(verification.header.alg, 'HS256')

    token = createSigner({ key: privateKeys.RS })({ a: 1 })
    verification = rsVerifier(token)
    t.assert.equal(verification.header.alg, 'RS256')

    token = createSigner({ key: privateKeys.PS })({ a: 1 })
    verification = psVerifier(token)
    t.assert.equal(verification.header.alg, 'RS256')

    token = createSigner({ key: privateKeys.ES256 })({ a: 1 })
    verification = es256Verifier(token)
    t.assert.equal(verification.header.alg, 'ES256')

    token = createSigner({ key: privateKeys.ES384 })({ a: 1 })
    verification = es384Verifier(token)
    t.assert.equal(verification.header.alg, 'ES384')

    token = createSigner({ key: privateKeys.ES512 })({ a: 1 })
    verification = es512Verifier(token)
    t.assert.equal(verification.header.alg, 'ES512')

    token = createSigner({ algorithm: 'RS256', key: { key: privateKeys.PPRS, passphrase: 'secret' } })({ a: 1 })
    verification = pprsVerifier(token)
    t.assert.equal(verification.header.alg, 'RS256')

    token = createSigner({ algorithm: 'ES256', key: { key: privateKeys.PPES256, passphrase: 'secret' } })({ a: 1 })
    verification = ppes256Verifier(token)
    t.assert.equal(verification.header.alg, 'ES256')

    token = createSigner({ algorithm: 'ES384', key: { key: privateKeys.PPES384, passphrase: 'secret' } })({ a: 1 })
    verification = ppes384Verifier(token)
    t.assert.equal(verification.header.alg, 'ES384')

    token = createSigner({ algorithm: 'ES512', key: { key: privateKeys.PPES512, passphrase: 'secret' } })({ a: 1 })
    verification = ppes512Verifier(token)
    t.assert.equal(verification.header.alg, 'ES512')

    token = createSigner({ key: privateKeys.Ed25519 })({ a: 1 })
    verification = es25519Verifier(token)
    t.assert.equal(verification.header.alg, 'EdDSA')

    token = createSigner({ key: privateKeys.Ed448 })({ a: 1 })
    verification = es448Verifier(token)
    t.assert.equal(verification.header.alg, 'EdDSA')
  })

  describe('claims and headers handling', () => {
    test('correctly set a timestamp', async t => {
      const ts = [100000, 200000]
      const originalNow = Date.now

      Date.now = () => ts.shift()
      t.assert.notDeepStrictEqual(sign({ a: 1 }, {}), sign({ a: 1 }, {}))
      Date.now = originalNow
    })

    test('respect the payload iat, if one is set', async t => {
      t.assert.equal(
        sign({ a: 1, iat: 123 }, {}),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEyM30.J-5nCdVMKQ0yqIIkKTPBuQf46vPXcbwdLpAcYBZ9EqU'
      )
    })

    test('respect the payload sub, if one is set', async t => {
      t.assert.equal(
        sign({ a: 1, sub: 'SUB' }, { noTimestamp: true }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJzdWIiOiJTVUIifQ.wweP9vNGt77bBGwZ_PLXfPxy2qcx2mnjUa0AWVA5bEM'
      )
    })

    test('uses the clockTimestamp option, if one is set', async t => {
      t.assert.equal(
        sign({ a: 1 }, { clockTimestamp: 123000 }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEyM30.J-5nCdVMKQ0yqIIkKTPBuQf46vPXcbwdLpAcYBZ9EqU'
      )
    })

    test('adds exp from expiresIn, overriding an existing payload exp claim', async t => {
      t.assert.equal(
        sign({ a: 1, iat: 100 }, { expiresIn: 1000 }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwiZXhwIjoxMDF9.ULKqTsvUYm7iNOKA6bP5NXsa1A8vofgPIGiC182Vf_Q'
      )

      t.assert.equal(
        sign({ a: 1, iat: 100, exp: 200 }, { expiresIn: 1000 }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwiZXhwIjoxMDF9.ULKqTsvUYm7iNOKA6bP5NXsa1A8vofgPIGiC182Vf_Q'
      )
    })

    test('supports expiresIn as a string', async t => {
      t.assert.equal(
        sign({ a: 1, iat: 100 }, { expiresIn: '1000' }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwiZXhwIjoxMDF9.ULKqTsvUYm7iNOKA6bP5NXsa1A8vofgPIGiC182Vf_Q'
      )

      t.assert.equal(
        sign({ a: 1, iat: 100 }, { expiresIn: '1s' }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwiZXhwIjoxMDF9.ULKqTsvUYm7iNOKA6bP5NXsa1A8vofgPIGiC182Vf_Q'
      )
    })

    test('supports negative expiresIn value', async t => {
      t.assert.equal(
        sign({ a: 1, iat: 100 }, { expiresIn: -1 }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwiZXhwIjo5OX0.KqZa0DfwU41PqeDTct_kWCUKXeyQpzJJSZhGd76TR40'
      )
    })

    test('adds the payload exp claim', async t => {
      t.assert.equal(
        sign({ a: 1, iat: 100, exp: 200 }, {}),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwiZXhwIjoyMDB9.RJbB3-VIjLIQr-VmZ1Kl42MrHr2pAU-CQuXK8jHMKR0'
      )
    })

    test('ignores invalid exp claim', async t => {
      t.assert.equal(
        sign({ a: 1, iat: 100, exp: Number.NaN }, {}),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMH0.5V5yFNSqmn0w6yDR1vUbykF36WwdQmADMTLJwiJtx8w'
      )

      t.assert.equal(
        sign({ a: 1, iat: 100, exp: null }, {}),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMH0.5V5yFNSqmn0w6yDR1vUbykF36WwdQmADMTLJwiJtx8w'
      )

      t.assert.equal(
        sign({ a: 1, iat: 100, exp: undefined }, {}),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMH0.5V5yFNSqmn0w6yDR1vUbykF36WwdQmADMTLJwiJtx8w'
      )
    })

    test('adds nbf from notBefore, overriding an existing payload nbf claim', async t => {
      t.assert.equal(
        sign({ a: 1, iat: 100 }, { notBefore: 1000 }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwibmJmIjoxMDF9.WhZeNowse7q1s5FSlcMcs_4KcxXpSdQ4yqv0xrGB3sU'
      )

      t.assert.equal(
        sign({ a: 1, iat: 100, nbf: 200 }, { notBefore: 1000 }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwibmJmIjoxMDF9.WhZeNowse7q1s5FSlcMcs_4KcxXpSdQ4yqv0xrGB3sU'
      )
    })

    test('supports notBefore as a string', async t => {
      t.assert.equal(
        sign({ a: 1, iat: 100 }, { notBefore: '1000' }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwibmJmIjoxMDF9.WhZeNowse7q1s5FSlcMcs_4KcxXpSdQ4yqv0xrGB3sU'
      )

      t.assert.equal(
        sign({ a: 1, iat: 100 }, { notBefore: '1s' }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwibmJmIjoxMDF9.WhZeNowse7q1s5FSlcMcs_4KcxXpSdQ4yqv0xrGB3sU'
      )
    })

    test('adds a jti claim, overriding the payload one, only if the payload is a object', async t => {
      t.assert.equal(
        sign({ a: 1 }, { jti: 'JTI', noTimestamp: true }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkifQ.Ew1eS3Pn9R0hqV0JCA5AECTSvaEm9glggxWlmq0cYl4'
      )

      t.assert.equal(
        sign({ a: 1, jti: 'original' }, { jti: 'JTI', noTimestamp: true }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkifQ.Ew1eS3Pn9R0hqV0JCA5AECTSvaEm9glggxWlmq0cYl4'
      )
    })

    test('adds a aud claim, overriding the payload one, only if the payload is a object', async t => {
      t.assert.equal(
        sign({ a: 1 }, { aud: 'AUD1', noTimestamp: true }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJhdWQiOiJBVUQxIn0.fplBCKNjVH2jjpk-hFQZ9jnG96nVFZqOeU-C97AvKAI'
      )

      t.assert.equal(
        sign({ a: 1, aud: 'original' }, { aud: 'AUD1', noTimestamp: true }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJhdWQiOiJBVUQxIn0.fplBCKNjVH2jjpk-hFQZ9jnG96nVFZqOeU-C97AvKAI'
      )

      t.assert.equal(
        sign({ a: 1, aud: 'original' }, { aud: ['AUD1', 'AUD2'], noTimestamp: true }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJhdWQiOlsiQVVEMSIsIkFVRDIiXX0.zRcmqvl1hRzaWa8qX_ge7mHeJNSH-Th-TLu0-62jFxc'
      )
    })

    test('adds a iss claim, overriding the payload one, only if the payload is a object', async t => {
      t.assert.equal(
        sign({ a: 1 }, { iss: 'ISS', noTimestamp: true }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpc3MiOiJJU1MifQ.YLEisGRTlJL9Y7KLHbIahXr1Zqu0of5w1mJf4aGphTE'
      )

      t.assert.equal(
        sign({ a: 1, iss: 'original' }, { iss: 'ISS', noTimestamp: true }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpc3MiOiJJU1MifQ.YLEisGRTlJL9Y7KLHbIahXr1Zqu0of5w1mJf4aGphTE'
      )
    })

    test('adds a sub claim, overriding the payload one, only if the payload is a object', async t => {
      t.assert.equal(
        sign({ a: 1 }, { sub: 'SUB', noTimestamp: true }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJzdWIiOiJTVUIifQ.wweP9vNGt77bBGwZ_PLXfPxy2qcx2mnjUa0AWVA5bEM'
      )

      t.assert.equal(
        sign({ a: 1, sub: 'original' }, { sub: 'SUB', noTimestamp: true }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJzdWIiOiJTVUIifQ.wweP9vNGt77bBGwZ_PLXfPxy2qcx2mnjUa0AWVA5bEM'
      )
    })

    test('adds a nonce claim, overriding the payload one, only if the payload is a object', async t => {
      t.assert.equal(
        sign({ a: 1 }, { nonce: 'NONCE', noTimestamp: true }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJub25jZSI6Ik5PTkNFIn0.NvCriFYuVDq0fTSf5t_92EwbxnwgjZVMBEMfW-RVl_k'
      )

      t.assert.equal(
        sign({ a: 1, nonce: 'original' }, { nonce: 'NONCE', noTimestamp: true }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJub25jZSI6Ik5PTkNFIn0.NvCriFYuVDq0fTSf5t_92EwbxnwgjZVMBEMfW-RVl_k'
      )
    })

    test('adds a kid to the header', async t => {
      t.assert.equal(
        sign({ a: 1 }, { kid: '123', noTimestamp: true }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMyJ9.eyJhIjoxfQ.7tQHnTc72lr2wAQeb7n-bDesok0WUHXCDGyNfOMA8CA'
      )
    })

    test('adds additional arbitrary fields to the header', async t => {
      t.assert.equal(
        sign({ a: 1 }, { header: { b: 2, c: 3 }, noTimestamp: true }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImIiOjIsImMiOjN9.eyJhIjoxfQ.pfoXZ4zIsYNDmvhFy7pX6dUaK7SV6NfwxTTISwqeFeY'
      )
    })

    test('mutates the payload if asked to', async t => {
      const payload = { a: 1, iat: 100 }

      t.assert.equal(
        sign(payload, { mutatePayload: true, expiresIn: 1000 }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwiZXhwIjoxMDF9.ULKqTsvUYm7iNOKA6bP5NXsa1A8vofgPIGiC182Vf_Q'
      )

      t.assert.equal(payload.exp, 101)
    })

    test('mutates the payload with the computed exp when expiresIn overrides an existing payload exp claim', async t => {
      const payload = { a: 1, iat: 100, exp: 200 }

      t.assert.equal(
        sign(payload, { mutatePayload: true, expiresIn: 1000 }),
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwiZXhwIjoxMDF9.ULKqTsvUYm7iNOKA6bP5NXsa1A8vofgPIGiC182Vf_Q'
      )

      t.assert.equal(payload.exp, 101)
    })
  })

  describe('error handling', () => {
    test('correctly handle errors - async callback', async t => {
      await t.assert.rejects(
        sign(
          { a: 1 },
          {
            key: async () => {
              throw new Error('FAILED')
            },
            noTimestamp: true
          }
        ),
        { message: 'Cannot fetch key.' }
      )

      await t.assert.rejects(
        sign(
          { a: 1 },
          {
            key: async () => {
              throw new TokenError(null, 'FAILED')
            },
            noTimestamp: true
          }
        ),
        { message: 'FAILED' }
      )
    })

    test('correctly handle errors - callback', t => {
      sign(
        { a: 1 },
        {
          key: (_decodedJwt, callback) => {
            callback(new Error('FAILED'))
          },
          noTimestamp: true
        },
        error => {
          t.assert.ok(error instanceof TokenError)
          t.assert.equal(error.message, 'Cannot fetch key.')
        }
      )
    })

    test('correctly validates the key received from the callback', t => {
      sign(
        { a: 1 },
        {
          key: (_decodedJwt, callback) => {
            callback(null, 123)
          },
          noTimestamp: true
        },
        error => {
          t.assert.ok(error instanceof TokenError)
          t.assert.equal(
            error.message,
            'The key returned from the callback must be a string or a buffer containing a secret or a private key.'
          )
        }
      )
    })

    test('correctly handle errors - evented callback', t => {
      sign(
        { a: 1 },
        {
          key: (_decodedJwt, callback) => {
            process.nextTick(() => callback(null, 'FAILED'))
          },
          noTimestamp: true,
          algorithm: 'RS256'
        },
        error => {
          t.assert.ok(error instanceof TokenError)
          t.assert.equal(error.message, 'Invalid private key provided for algorithm RS256.')
        }
      )
    })
  })

  test('returns a promise according to key option', async t => {
    const s1 = createSigner({ key: 'secret' })({ a: 'PAYLOAD' })
    const s2 = createSigner({ key: async () => 'secret' })({ a: 'PAYLOAD' })

    t.assert.ok(typeof s1.then === 'undefined')
    t.assert.ok(typeof s2.then === 'function')

    await s2.then(
      () => false,
      () => false
    )
  })

  test('payload validation', async t => {
    t.assert.throws(() => createSigner({ key: 'secret' })(123), {
      message: 'The payload must be an object.'
    })

    t.assert.rejects(async () => createSigner({ key: () => 'secret' })(123), {
      message: 'The payload must be an object.'
    })

    t.assert.throws(() => createSigner({ key: 'secret' })(null), {
      message: 'The payload must be an object.'
    })

    t.assert.rejects(async () => createSigner({ key: () => 'secret' })(null), {
      message: 'The payload must be an object.'
    })
  })

  test('exp claim validation', async t => {
    t.assert.throws(() => createSigner({ key: 'secret' })({ exp: 'exp' }), {
      message: 'The exp claim must be a positive integer.'
    })

    t.assert.throws(() => createSigner({ key: 'secret' })({ exp: -1 }), {
      message: 'The exp claim must be a positive integer.'
    })
  })

  describe('empty HMAC key', () => {
    const emptyKeyError = {
      code: 'FAST_JWT_INVALID_KEY',
      message: 'The key cannot be an empty string or buffer.'
    }

    test('rejects a static empty buffer key at construction', t => {
      t.assert.throws(() => createSigner({ key: Buffer.alloc(0) }), emptyKeyError)
    })

    for (const algorithm of ['HS256', 'HS384', 'HS512']) {
      test(`rejects a static empty buffer key with an explicit ${algorithm} algorithm`, t => {
        t.assert.throws(() => createSigner({ key: Buffer.alloc(0), algorithm }), emptyKeyError)
      })

      test(`rejects an empty string returned by an async key resolver with ${algorithm}`, async t => {
        const signer = createSigner({ key: async () => '', algorithm })

        await t.assert.rejects(signer({ sub: 'alice' }), emptyKeyError)
      })
    }

    test('rejects an empty buffer returned by an async key resolver', async t => {
      const signer = createSigner({ key: async () => Buffer.alloc(0) })

      await t.assert.rejects(signer({ sub: 'alice' }), emptyKeyError)
    })

    test('rejects an empty string returned by a callback-style key resolver', async t => {
      const signer = createSigner({ key: (_decoded, callback) => callback(null, '') })

      const signingError = await new Promise(resolve => signer({ sub: 'alice' }, error => resolve(error)))

      t.assert.equal(signingError.code, emptyKeyError.code)
      t.assert.equal(signingError.message, emptyKeyError.message)
    })

    test('keeps rejecting a static empty string key as an invalid option', t => {
      t.assert.throws(() => createSigner({ key: '' }), {
        code: 'FAST_JWT_INVALID_OPTION',
        message:
          'The key option must be a string, a buffer, an object containing key/passphrase properties or a function returning the algorithm secret or private key.'
      })
    })

    test('still signs with a non-empty async HMAC secret', async t => {
      const signer = createSigner({ key: async () => 'a-real-secret', algorithm: 'HS256', noTimestamp: true })
      const verifier = createVerifier({ key: 'a-real-secret', algorithms: ['HS256'] })

      t.assert.deepStrictEqual(verifier(await signer({ sub: 'alice' })), { sub: 'alice' })
    })

    test('leaves the "none" algorithm unaffected', t => {
      const unsignedToken = createSigner({ algorithm: 'none', noTimestamp: true })({ sub: 'alice' })

      t.assert.ok(unsignedToken.endsWith('.'))
    })
  })

  describe('options validation', () => {
    test('algorithm', async t => {
      createSigner({ key: 'secret' })

      t.assert.throws(() => createSigner({ key: 'secret', algorithm: 'FOO' }), {
        message:
          'The algorithm option must be one of the following values: HS256, HS384, HS512, ES256, ES384, ES512, RS256, RS384, RS512, PS256, PS384, PS512, EdDSA, none.'
      })
    })

    test('key', async t => {
      t.assert.throws(() => createSigner({ key: 123 }), {
        message:
          'The key option must be a string, a buffer, an object containing key/passphrase properties or a function returning the algorithm secret or private key.'
      })

      t.assert.throws(() => createSigner({ key: { key: privateKeys.PPRS } }), {
        message:
          'The key option must be a string, a buffer, an object containing key/passphrase properties or a function returning the algorithm secret or private key.'
      })

      t.assert.throws(() => createSigner({ key: { passphrase: 'secret' } }), {
        message:
          'The key option must be a string, a buffer, an object containing key/passphrase properties or a function returning the algorithm secret or private key.'
      })

      t.assert.throws(() => createSigner({ algorithm: 'none', key: 123 }), {
        message: 'The key option must not be provided when the algorithm option is "none".'
      })
    })

    test('clockTimestamp', async t => {
      t.assert.throws(() => createSigner({ key: 'secret', clockTimestamp: '123' }), {
        message: 'The clockTimestamp option must be a positive number.'
      })

      t.assert.throws(() => createSigner({ key: 'secret', clockTimestamp: -1 }), {
        message: 'The clockTimestamp option must be a positive number.'
      })

      t.assert.throws(() => createSigner({ key: 'secret', clockTimestamp: -Infinity }), {
        code: 'FAST_JWT_INVALID_OPTION',
        message: 'The clockTimestamp option must be a positive number.'
      })
    })

    describe('clockTimestamp values treated as unset', () => {
      for (const unsetClockTimestamp of [null, undefined, 0]) {
        test(`signs with the current time and does not warn when clockTimestamp is ${unsetClockTimestamp}`, t => {
          const emitWarning = t.mock.method(process, 'emitWarning', () => {})
          t.mock.timers.enable({ apis: ['Date'], now: 2_000_000 })

          const signer = createSigner({
            key: 'secret',
            clockTimestamp: unsetClockTimestamp,
            expiresIn: 1000,
            notBefore: 1000
          })
          const decodedPayload = createDecoder()(signer({ sub: 'alice' }))

          t.assert.deepStrictEqual(decodedPayload, { sub: 'alice', iat: 2000, exp: 2001, nbf: 2001 })
          t.assert.equal(nonFiniteTimeWarningCalls(emitWarning).length, 0)
        })
      }
    })

    describe('non-finite clockTimestamp', () => {
      test('warns and falls back to the current time when clockTimestamp is NaN', t => {
        const emitWarning = t.mock.method(process, 'emitWarning', () => {})
        t.mock.timers.enable({ apis: ['Date'], now: 2_000_000 })

        const signer = createSigner({ key: 'secret', clockTimestamp: Number.NaN, expiresIn: 1000 })
        const decodedPayload = createDecoder()(signer({ sub: 'alice' }))

        t.assert.deepStrictEqual(decodedPayload, { sub: 'alice', iat: 2000, exp: 2001 })
        const warningCalls = nonFiniteTimeWarningCalls(emitWarning)
        t.assert.equal(warningCalls.length, 1)
        t.assert.deepStrictEqual(warningCalls[0].arguments, [
          'The clockTimestamp option is NaN, so it is ignored and the current time is used. ' +
            'This will throw an error in the next major version.',
          { code: 'FAST_JWT_NON_FINITE_TIME_OPTION' }
        ])
      })

      test('warns and keeps encoding the derived claims as null when clockTimestamp is Infinity', t => {
        const emitWarning = t.mock.method(process, 'emitWarning', () => {})

        const signer = createSigner({ key: 'secret', clockTimestamp: Infinity, expiresIn: 1000, notBefore: 1000 })
        const decodedPayload = createDecoder()(signer({ sub: 'alice' }))

        t.assert.deepStrictEqual(decodedPayload, { sub: 'alice', iat: null, exp: null, nbf: null })
        const warningCalls = nonFiniteTimeWarningCalls(emitWarning)
        t.assert.equal(warningCalls.length, 1)
        t.assert.deepStrictEqual(warningCalls[0].arguments, [
          'The clockTimestamp option is Infinity, so the iat, exp and nbf claims computed from it are encoded as null. ' +
            'This will throw an error in the next major version.',
          { code: 'FAST_JWT_NON_FINITE_TIME_OPTION' }
        ])
      })

      test('does not warn when clockTimestamp is finite', t => {
        const emitWarning = t.mock.method(process, 'emitWarning', () => {})

        createSigner({ key: 'secret', clockTimestamp: 123000 })

        t.assert.equal(nonFiniteTimeWarningCalls(emitWarning).length, 0)
      })
    })

    test('expiresIn', async t => {
      t.assert.throws(() => createSigner({ key: 'secret', expiresIn: true }), {
        message: 'The expiresIn option must be a positive number or a valid string.'
      })

      t.assert.throws(() => createSigner({ key: 'secret', expiresIn: 'invalid string' }), {
        message: 'The expiresIn option must be a positive number or a valid string.'
      })

      t.assert.throws(() => createSigner({ key: 'secret', expiresIn: Number.NaN }), {
        code: 'FAST_JWT_INVALID_OPTION',
        message: 'The expiresIn option must be a positive number or a valid string.'
      })
    })

    test('notBefore', async t => {
      t.assert.throws(() => createSigner({ key: 'secret', notBefore: true }), {
        message: 'The notBefore option must be a positive number or a valid string.'
      })

      t.assert.throws(() => createSigner({ key: 'secret', notBefore: 'invalid string' }), {
        message: 'The notBefore option must be a positive number or a valid string.'
      })

      t.assert.throws(() => createSigner({ key: 'secret', notBefore: -1 }), {
        message: 'The notBefore option must be a positive number or a valid string.'
      })

      t.assert.throws(() => createSigner({ key: 'secret', notBefore: Number.NaN }), {
        code: 'FAST_JWT_INVALID_OPTION',
        message: 'The notBefore option must be a positive number or a valid string.'
      })
    })

    describe('infinite time spans', () => {
      for (const [optionName, claimName] of [
        ['expiresIn', 'exp'],
        ['notBefore', 'nbf']
      ]) {
        test(`warns once per signer and does not set ${claimName} when ${optionName} is Infinity`, t => {
          const emitWarning = t.mock.method(process, 'emitWarning', () => {})

          const signer = createSigner({ key: 'secret', [optionName]: Infinity })
          const firstDecodedPayload = createDecoder()(signer({ sub: 'alice' }))
          const secondDecodedPayload = createDecoder()(signer({ sub: 'bob' }))

          const warningCalls = nonFiniteTimeWarningCalls(emitWarning)
          t.assert.equal(warningCalls.length, 1)
          const [warningMessage, warningOptions] = warningCalls[0].arguments
          t.assert.equal(
            warningMessage,
            `The ${optionName} option is not a finite number, so it is ignored and does not set the ${claimName} claim. ` +
              'This will throw an error in the next major version.'
          )
          t.assert.deepStrictEqual(warningOptions, { code: 'FAST_JWT_NON_FINITE_TIME_OPTION' })
          t.assert.equal(firstDecodedPayload[claimName], undefined)
          t.assert.equal(secondDecodedPayload[claimName], undefined)
        })

        test(`keeps a ${claimName} claim from the payload when ${optionName} is Infinity`, t => {
          t.mock.method(process, 'emitWarning', () => {})
          const payloadClaimValue = 4_000_000_000

          const signer = createSigner({ key: 'secret', [optionName]: Infinity })
          const decodedPayload = createDecoder()(signer({ sub: 'alice', [claimName]: payloadClaimValue }))

          t.assert.equal(decodedPayload[claimName], payloadClaimValue)
        })

        test(`does not warn when ${optionName} is finite`, t => {
          const emitWarning = t.mock.method(process, 'emitWarning', () => {})

          createSigner({ key: 'secret', [optionName]: 1000 })

          t.assert.equal(nonFiniteTimeWarningCalls(emitWarning).length, 0)
        })
      }

      test('warns when expiresIn is negative Infinity', t => {
        const emitWarning = t.mock.method(process, 'emitWarning', () => {})

        createSigner({ key: 'secret', expiresIn: -Infinity })

        t.assert.equal(nonFiniteTimeWarningCalls(emitWarning).length, 1)
      })
    })

    test('aud', async t => {
      t.assert.throws(() => createSigner({ key: 'secret', aud: 123 }), {
        message: 'The aud option must be a string or an array of strings.'
      })
    })

    for (const option of ['jti', 'iss', 'sub', 'nonce', 'kid']) {
      test(`${option}`, async t => {
        t.assert.throws(() => createSigner({ key: 'secret', [option]: 123 }), {
          message: `The ${option} option must be a string.`
        })
      })
    }

    test('header', async t => {
      t.assert.throws(() => createSigner({ key: 'secret', header: 123 }), {
        message: 'The header option must be a object.'
      })
    })
  })
})

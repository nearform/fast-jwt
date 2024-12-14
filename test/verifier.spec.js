'use strict'

const { createHash } = require('node:crypto')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { test } = require('node:test')
const { install: fakeTime } = require('@sinonjs/fake-timers')

const { createSigner, createVerifier, TokenError } = require('../src')
const { hashToken } = require('../src/utils')

const privateKeys = {
  HS: 'secretsecretsecret',
  ES256: readFileSync(resolve(__dirname, '../benchmarks/keys/es-256-private.key')),
  ES384: readFileSync(resolve(__dirname, '../benchmarks/keys/es-384-private.key')),
  ES512: readFileSync(resolve(__dirname, '../benchmarks/keys/es-512-private.key')),
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
  RS: readFileSync(resolve(__dirname, '../benchmarks/keys/rs-512-public.key')),
  RSX509: readFileSync(resolve(__dirname, '../benchmarks/keys/rs-x509-public.key')),
  PPRS: readFileSync(resolve(__dirname, '../benchmarks/keys/pprs-512-public.key')),
  PS: readFileSync(resolve(__dirname, '../benchmarks/keys/ps-512-public.key')),
  Ed25519: readFileSync(resolve(__dirname, '../benchmarks/keys/ed-25519-public.key')),
  Ed448: readFileSync(resolve(__dirname, '../benchmarks/keys/ed-448-public.key'))
}

function verify(token, options, callback) {
  const verifier = createVerifier({ key: 'secret', ...options })
  return verifier(token, callback)
}

test('it gets the correct decoded jwt token as argument on the key callback', async t => {
  t.plan(1)
  verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
    key: async decoded => {
      t.assert.deepStrictEqual(decoded, {
        header: { typ: 'JWT', alg: 'HS256' },
        payload: { a: 1 },
        signature: '57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
      })

      return Buffer.from('secret', 'utf-8')
    },
    noTimestamp: true,
    complete: true
  })
})

test('it correctly verifies a token - sync', t => {
  t.assert.deepStrictEqual(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      noTimestamp: true
    }),
    { a: 1 }
  )

  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjIwMDAwMDAwMDAsImV4cCI6MjEwMDAwMDAwMH0.vrIO0e4YNXgzqdj7RcTqmP8AlCuvfYoxJCkma78eILA',
      { clockTimestamp: 2010000000 }
    ),
    { a: 1, iat: 2000000000, exp: 2100000000 }
  )

  t.assert.deepStrictEqual(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      checkTyp: 'jwt',
      noTimestamp: true
    }),
    { a: 1 }
  )

  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6ImFwcGxpY2F0aW9uL2p3dCJ9.eyJhIjoxfQ.1ptuaNj5R0owE-5663LpMknK3eRgZVDHkMkOKkxlteM',
      {
        checkTyp: 'jwt'
      }
    ),
    { a: 1 }
  )

  t.assert.throws(
    () => verify('eyJhbGciOiJIUzI1NiJ9.eyJhIjoxfQ.LrlPmSL4FxrzAHJSYbKzsA997COXdYCeFKlt3zt5DIY', { checkTyp: 'test' }),
    {
      message: 'Invalid typ.'
    }
  )

  t.assert.throws(
    () =>
      verify('eyJhbGciOiJIUzI1NiIsInR5cCI6MX0.eyJhIjoxfQ.V6I7eoKYlMG7ipqpsWoZcNZaGOVGPom0rnztq1q2tS4', {
        checkTyp: 'JWT'
      }),
    {
      message: 'Invalid typ.'
    }
  )

  t.assert.deepStrictEqual(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      noTimestamp: true,
      complete: true
    }),
    {
      header: { typ: 'JWT', alg: 'HS256' },
      payload: { a: 1 },
      signature: '57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM',
      input: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ'
    }
  )

  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCIsImt0eSI6Ik9LUCIsImNydiI6IkVkMjU1MTkifQ.eyJhIjoxfQ.n4isU7JqaKRVOyx2ni7b_iaAzB75pAUCW6CetcoClhtJ5yDM7YkNMbKqmDUhTKMpupAcztIjX8m4mZwpA33HAA',
      { key: publicKeys.Ed25519 }
    ),
    { a: 1 }
  )
})

test('it correctly verifies a token - async - key with callback', async t => {
  t.assert.deepStrictEqual(
    await verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      key: (_decodedJwt, callback) => setTimeout(() => callback(null, 'secret'), 10),
      noTimestamp: true
    }),
    { a: 1 }
  )

  t.assert.deepStrictEqual(
    await verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      algorithms: ['HS256'],
      key: (_decodedJwt, callback) => setTimeout(() => callback(null, 'secret'), 10),
      noTimestamp: true,
      complete: true
    }),
    {
      header: { typ: 'JWT', alg: 'HS256' },
      payload: { a: 1 },
      signature: '57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM',
      input: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
    }
  )
})

test('it correctly verifies a token - async - key as promise', async t => {
  t.assert.deepStrictEqual(
    await verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      key: async () => Buffer.from('secret', 'utf-8'),
      noTimestamp: true
    }),
    { a: 1 }
  )
})

test('it correctly verifies a token - async - static key', async t => {
  t.assert.deepStrictEqual(
    await verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      noTimestamp: true
    }),
    { a: 1 }
  )
})

test('it correctly verifies a token - callback - key as promise', t => {
  verify(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM',
    { key: async () => Buffer.from('secret', 'utf-8'), noTimestamp: true },
    (error, payload) => {
      t.assert.ok(error == null)
      t.assert.deepStrictEqual(payload, { a: 1 })
    }
  )
})

test('it correctly verifies a token - token signed with encrypted private key', async t => {
  const payload = verify(
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjE2MzU0MjY2OTl9.c5VeTRDL43sMxEk4pV7AV6nGJeRbJYw6tdKGfzq6bvjT-ai29gQc7baTAmoo16EuboUwBHoz_OEOtwsePetoc0wKtDoXY7t6dBWznV2Z4_7YSrnt2U62FZrlVDoLPYJRRHhB6sR2YyidoUWzfs821_SpeTeT4Ls-tlqWjIGkpUDktZiPKYIt9LkLFgZDaCBeQr39BMCagD3p0yGYIWZJNsIQKNvvUHjtF4Io9buPwKKA6FAfYgM5c1aTAkhhnRjZSjW0vu-Osxlbu-XO0-IF-0c4eGgf2LAh_jGM4bF1nQmExKI9Q0IpvbPD8pSzcIPndiHdgGxrJy7X9GktN6Vi2DQazcIXtjBIaBNO4VKew5GNIbSb-lHyeO7WBENE3WrVImS_9_i3z81M-F0w1C6MqmnKZ3qKLna3OG1pYU4mVQ2rvBNdHuVOrtJyE0IiCDQS-RKaKM0lOprHy_B6_TNRp_Y9oBCVOY1Kr8fczigfArwSlPai051AncK-zfHZwvP7_uBKitncmNDjr19xiLa79Fbm6mkSA8tZindDvBml1ZF9apNF51CCdO-ce9yqj3Aem2n1VXHLuq9sdIk_mlSZn9aLDOPUI22DcdhcSsySdKdWSf9F7dj5c1J9ppwxTxK3LHjIeiaCJWCmKvfu73j_rpKzbFzzwotQ3bsRave8gdY',
    { key: publicKeys.PPRS }
  )
  t.assert.deepStrictEqual(payload.a, 1)
})

test('it rejects invalid tokens', async t => {
  t.assert.throws(() => verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-aaa', {}), {
    message: 'The token signature is invalid.'
  })

  await t.assert.rejects(
    async () => {
      return verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-aaa', {
        key: async () => 'secret'
      })
    },
    { message: 'The token signature is invalid.' }
  )
})

test('it requires a signature or a key', async t => {
  t.assert.throws(() => verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.', {}), {
    message: 'The token signature is missing.'
  })

  t.assert.throws(
    () =>
      verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
        key: ''
      }),
    { message: 'The key option is missing.' }
  )
})

test('it correctly handle errors - async callback', async t => {
  await t.assert.rejects(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      key: async () => {
        throw new Error('FAILED')
      }
    }),
    { message: 'Cannot fetch key.' }
  )

  await t.assert.rejects(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      key: async () => {
        throw new TokenError(null, 'FAILED')
      }
    }),
    { message: 'FAILED' }
  )
})

test('it correctly handle errors - callback', t => {
  verify(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM',
    {
      key: (_decodedJwt, callback) => {
        callback(new Error('FAILED'))
      }
    },
    error => {
      t.assert.ok(error instanceof TokenError)
      t.assert.equal(error.message, 'Cannot fetch key.')
    }
  )
})

test('it correctly handle errors - evented callback', t => {
  verify(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM',
    {
      key: (_decodedJwt, callback) => {
        process.nextTick(() => callback(null, 'FAILED'))
      }
    },
    error => {
      t.assert.ok(error instanceof TokenError)
      t.assert.equal(error.message, 'The token signature is invalid.')
    }
  )
})

test('it handles decoding errors', async t => {
  t.assert.throws(() => verify('TOKEN', { algorithms: ['HS256'], key: 'secret' }), {
    message: 'The token is malformed.'
  })

  await t.assert.rejects(async () => verify('TOKEN', { algorithms: ['HS256'], key: () => 'secret' }), {
    message: 'The token is malformed.'
  })
})

test('it validates if the token is not using an allowed algorithm - sync ', t => {
  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjAsIm5iZiI6MjAwMDAwMDAwMH0.PlCCCgSnL38HaOY1-bkWnz-LX9WW2b772Zs3oxQJIv4',
        { algorithms: ['RS256', 'PS256'], key: publicKeys.RS }
      )
    },
    { message: 'The token algorithm is invalid.' }
  )
})

test('it validates if the token is using one of the allowed algorithm - sync ', t => {
  t.assert.deepStrictEqual(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      noTimestamp: true
    }),
    { a: 1 }
  )

  t.assert.deepStrictEqual(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      noTimestamp: true,
      algorithms: ['HS256']
    }),
    { a: 1 }
  )

  t.assert.deepStrictEqual(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      noTimestamp: true,
      algorithms: ['RS256', 'HS256']
    }),
    { a: 1 }
  )

  t.assert.deepStrictEqual(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      noTimestamp: true,
      algorithms: ['RS256', 'HS256'],
      key: 'secret'
    }),
    { a: 1 }
  )

  t.assert.deepStrictEqual(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      noTimestamp: true,
      algorithms: [
        'RS256',
        'RS384',
        'RS512',
        'HS256',
        'HS384',
        'HS512',
        'ES256',
        'ES384',
        'ES512',
        'PS256',
        'PS384',
        'PS512',
        'EdDSA'
      ]
    }),
    { a: 1 }
  )
})

test('it validates if the token can be verified with X509 public key certificate ', t => {
  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.daq6gJpUPB2daOBWB3SdhMZsXiFfeCflJ36uztKVAzQu0apv-RRewfCFL2-M8iAu1ndAc-a57pG4TkRZjYw4UXD28hFZYjc4fBteoXyFWySkuqlFVCOph8gKkiFszLutE5sAJEoiGD_wnPw38pYj3d0sqsnDUezzNvEDK5Oa2_PYTnsQJi0JGupy2oE1RX7CuVVLBRnI8HOruMagn25FLShjjiiGw90yKq5AYk_Jlv8XFt4rypZj_O1JaGHVp3MTzrJ-Ku95BPDuhH4awBy8MSpPBtCoRPAUuP6jTetpCsRhmWlqf0OrmEMF81ZXlmS4LcbborwSTZ8cZvgc4OwIVU2I19fYLwDRqgL3GQy5GS8WGPTNbvwouvyTFr-omZtSeHUbguLTib5WYZlI1Sq9IPIG5dUDAlfWflPgOInZaE2n4kgGj2iKmUKWiGfuABSdsPgw2a1vTwQ5HZsljV0gHaz7WeCGJ8MZOMa7nvb3pDWfPjTBdcTZWvpzQWagRqVxCMK0gvSOaFLuvk89NFS-jr3eFkLVSAu07YWpPc80_QDcCMCqWU9JcW-FSUV3XHB5U6Yl8zDO6QKT4V-nWxLt8q1He3xHf27-7UoczzDC0-H-uIRjx-dPV_1B-b5axibEcQeNTEjOQv6KTrUOXVwyimLGUkoNUl9bKWyCfZ0QF8Q',
      {
        noTimestamp: true,
        key: publicKeys.RSX509
      }
    ),
    { a: 1 }
  )
})

test('it validates if the public key is consistent with the allowed algorithms - sync ', t => {
  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjAsIm5iZiI6MjAwMDAwMDAwMH0.PlCCCgSnL38HaOY1-bkWnz-LX9WW2b772Zs3oxQJIv4',
        { algorithms: ['ES256'], key: publicKeys.RS }
      )
    },
    { message: 'Invalid public key provided for algorithms ES256.' }
  )
})

test('it validates if the token is active unless explicitily disabled', t => {
  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjAsIm5iZiI6MjAwMDAwMDAwMH0.PlCCCgSnL38HaOY1-bkWnz-LX9WW2b772Zs3oxQJIv4',
        {}
      )
    },
    { message: 'The token will be active at 2033-05-18T03:33:20.000Z.' }
  )

  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjAsIm5iZiI6MjAwMDAwMDAwMH0.PlCCCgSnL38HaOY1-bkWnz-LX9WW2b772Zs3oxQJIv4',
      {
        ignoreNotBefore: true
      }
    ),
    { a: 1, iat: 0, nbf: 2000000000 }
  )
})

test('it validates if the token is active including the clock tolerance', t => {
  const clockTimestamp = Date.now()
  const notBefore = 1000
  const token = createSigner({ key: 'secret', clockTimestamp, notBefore })({ a: 1 })

  t.assert.deepStrictEqual(
    verify(token, {
      clockTolerance: 5000
    }),
    {
      a: 1,
      iat: Math.floor(clockTimestamp / 1000),
      nbf: Math.floor((clockTimestamp + notBefore) / 1000)
    }
  )
})

test('it validates if the token has not expired (via exp) unless explicitily disabled', t => {
  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwiZXhwIjoxMDF9.ULKqTsvUYm7iNOKA6bP5NXsa1A8vofgPIGiC182Vf_Q',
        {}
      )
    },
    { message: 'The token has expired at 1970-01-01T00:01:41.000Z.' }
  )

  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwiZXhwIjoxMDF9.ULKqTsvUYm7iNOKA6bP5NXsa1A8vofgPIGiC182Vf_Q',
      {
        ignoreExpiration: true
      }
    ),
    { a: 1, iat: 100, exp: 101 }
  )
})

test('it validates if the token has not expired (via maxAge) only if explicitily enabled', t => {
  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMH0.5V5yFNSqmn0w6yDR1vUbykF36WwdQmADMTLJwiJtx8w',
        { maxAge: 200000 }
      )
    },
    { message: 'The token has expired at 1970-01-01T00:05:00.000Z.' }
  )

  t.assert.deepStrictEqual(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMH0.5V5yFNSqmn0w6yDR1vUbykF36WwdQmADMTLJwiJtx8w'),
    { a: 1, iat: 100 }
  )
})

test('it validates if the token has not expired including the clock tolerance', t => {
  const clockTimestamp = Date.now() - 5000
  const expiresIn = 1000
  const token = createSigner({ key: 'secret', clockTimestamp, expiresIn })({ a: 1 })

  t.assert.deepStrictEqual(
    verify(token, {
      clockTolerance: 5000
    }),
    {
      a: 1,
      iat: Math.floor(clockTimestamp / 1000),
      exp: Math.floor((clockTimestamp + expiresIn) / 1000)
    }
  )
})

test('it validates the jti claim only if explicitily enabled', t => {
  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOjEsImF1ZCI6MiwiaXNzIjozLCJzdWIiOjQsIm5vbmNlIjo1fQ.J-oaiNMlIJfH1jlNZcRjcEXdG5La4lKGjYtoLMs8vKM',
        { allowedJti: 'JTI1' }
      )
    },
    { message: 'The jti claim must be a string.' }
  )

  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedJti: 'JTI1' }
      )
    },
    { message: 'The jti claim value is not allowed.' }
  )

  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedJti: [/abc/, 'cde'] }
      )
    },
    { message: 'The jti claim value is not allowed.' }
  )

  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      { allowedJti: 'JTI' }
    ),
    {
      a: 1,
      jti: 'JTI',
      aud: ['AUD1', 'DUA2'],
      iss: 'ISS',
      sub: 'SUB',
      nonce: 'NONCE'
    }
  )

  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      { allowedJti: ['ABX', 'JTI'] }
    ),
    {
      a: 1,
      jti: 'JTI',
      aud: ['AUD1', 'DUA2'],
      iss: 'ISS',
      sub: 'SUB',
      nonce: 'NONCE'
    }
  )

  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      { allowedJti: ['ABX', /^J/] }
    ),
    {
      a: 1,
      jti: 'JTI',
      aud: ['AUD1', 'DUA2'],
      iss: 'ISS',
      sub: 'SUB',
      nonce: 'NONCE'
    }
  )
})

test('it validates the aud claim only if explicitily enabled', t => {
  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOjEsImF1ZCI6MiwiaXNzIjozLCJzdWIiOjQsIm5vbmNlIjo1fQ.J-oaiNMlIJfH1jlNZcRjcEXdG5La4lKGjYtoLMs8vKM',
        { allowedAud: 'AUD2' }
      )
    },
    { message: 'The aud claim must be a string or an array of strings.' }
  )

  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOjEsImF1ZCI6WzIuMSwyLjJdLCJpc3MiOjMsInN1YiI6NCwibm9uY2UiOjV9._qE95j2r4UQ8BEXGZRv9stn5OLg1I3nQBEV4WKdABMg',
        { allowedAud: 'AUD2' }
      )
    },
    { message: 'The aud claim must be a string or an array of strings.' }
  )

  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedAud: 'AUD2' }
      )
    },
    { message: 'None of aud claim values are allowed.' }
  )

  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedAud: [/abc/, 'cde'] }
      )
    },
    { message: 'None of aud claim values are allowed.' }
  )

  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEIiwiRFVBMiJdLCJpc3MiOiJJU1MiLCJzdWIiOiJTVUIiLCJub25jZSI6Ik5PTkNFIn0.lhu5t694BY0QmF7SChUw7Z9nUPtupWCkhrQ2rqN06GU',
      { allowedAud: 'AUD' }
    ),
    {
      a: 1,
      jti: 'JTI',
      aud: ['AUD', 'DUA2'],
      iss: 'ISS',
      sub: 'SUB',
      nonce: 'NONCE'
    }
  )

  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      { allowedAud: ['ABX', 'AUD1'] }
    ),
    {
      a: 1,
      jti: 'JTI',
      aud: ['AUD1', 'DUA2'],
      iss: 'ISS',
      sub: 'SUB',
      nonce: 'NONCE'
    }
  )

  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      { allowedAud: ['ABX', /^D/] }
    ),
    {
      a: 1,
      jti: 'JTI',
      aud: ['AUD1', 'DUA2'],
      iss: 'ISS',
      sub: 'SUB',
      nonce: 'NONCE'
    }
  )
})

test('it validates the iss claim only if explicitily enabled', t => {
  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOjEsImF1ZCI6MiwiaXNzIjozLCJzdWIiOjQsIm5vbmNlIjo1fQ.J-oaiNMlIJfH1jlNZcRjcEXdG5La4lKGjYtoLMs8vKM',
        { allowedIss: 'ISS1' }
      )
    },
    { message: 'The iss claim must be a string.' }
  )

  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedIss: 'ISS1' }
      )
    },
    { message: 'The iss claim value is not allowed.' }
  )

  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedIss: [/abc/, 'cde'] }
      )
    },
    { message: 'The iss claim value is not allowed.' }
  )

  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      { allowedIss: 'ISS' }
    ),
    {
      a: 1,
      jti: 'JTI',
      aud: ['AUD1', 'DUA2'],
      iss: 'ISS',
      sub: 'SUB',
      nonce: 'NONCE'
    }
  )

  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      { allowedIss: ['ABX', 'ISS'] }
    ),
    {
      a: 1,
      jti: 'JTI',
      aud: ['AUD1', 'DUA2'],
      iss: 'ISS',
      sub: 'SUB',
      nonce: 'NONCE'
    }
  )

  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      { allowedIss: ['ABX', /^I/] }
    ),
    {
      a: 1,
      jti: 'JTI',
      aud: ['AUD1', 'DUA2'],
      iss: 'ISS',
      sub: 'SUB',
      nonce: 'NONCE'
    }
  )
})

test('it validates the sub claim only if explicitily enabled', t => {
  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOjEsImF1ZCI6MiwiaXNzIjozLCJzdWIiOjQsIm5vbmNlIjo1fQ.J-oaiNMlIJfH1jlNZcRjcEXdG5La4lKGjYtoLMs8vKM',
        { allowedSub: 'SUB1' }
      )
    },
    { message: 'The sub claim must be a string.' }
  )

  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedSub: 'SUB1' }
      )
    },
    { message: 'The sub claim value is not allowed.' }
  )

  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedSub: [/abc/, 'cde'] }
      )
    },
    { message: 'The sub claim value is not allowed.' }
  )

  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      { allowedSub: 'SUB' }
    ),
    {
      a: 1,
      jti: 'JTI',
      aud: ['AUD1', 'DUA2'],
      iss: 'ISS',
      sub: 'SUB',
      nonce: 'NONCE'
    }
  )

  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      { allowedSub: ['ABX', 'SUB'] }
    ),
    {
      a: 1,
      jti: 'JTI',
      aud: ['AUD1', 'DUA2'],
      iss: 'ISS',
      sub: 'SUB',
      nonce: 'NONCE'
    }
  )

  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      { allowedSub: ['ABX', /^S/] }
    ),
    {
      a: 1,
      jti: 'JTI',
      aud: ['AUD1', 'DUA2'],
      iss: 'ISS',
      sub: 'SUB',
      nonce: 'NONCE'
    }
  )
})

test('it validates the nonce claim only if explicitily enabled', t => {
  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOjEsImF1ZCI6MiwiaXNzIjozLCJzdWIiOjQsIm5vbmNlIjo1fQ.J-oaiNMlIJfH1jlNZcRjcEXdG5La4lKGjYtoLMs8vKM',
        { allowedNonce: 'NONCE1' }
      )
    },
    { message: 'The nonce claim must be a string.' }
  )

  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedNonce: 'NONCE1' }
      )
    },
    { message: 'The nonce claim value is not allowed.' }
  )

  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedNonce: [/abc/, 'cde'] }
      )
    },
    { message: 'The nonce claim value is not allowed.' }
  )

  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      { allowedNonce: 'NONCE' }
    ),
    {
      a: 1,
      jti: 'JTI',
      aud: ['AUD1', 'DUA2'],
      iss: 'ISS',
      sub: 'SUB',
      nonce: 'NONCE'
    }
  )

  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      { allowedNonce: ['ABX', 'NONCE'] }
    ),
    {
      a: 1,
      jti: 'JTI',
      aud: ['AUD1', 'DUA2'],
      iss: 'ISS',
      sub: 'SUB',
      nonce: 'NONCE'
    }
  )

  t.assert.deepStrictEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      { allowedNonce: ['ABX', /^N/] }
    ),
    {
      a: 1,
      jti: 'JTI',
      aud: ['AUD1', 'DUA2'],
      iss: 'ISS',
      sub: 'SUB',
      nonce: 'NONCE'
    }
  )
})

test('it validates allowed claims values using equality when appropriate', t => {
  // The iss claim in the token starts with ISS
  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpc3MiOiJJU1NfUFJFRklYIn0.yAVrfuzH-1H_dzd8YhDV2ukWAGHB4DY4Wiv1cqz1JaY',
        { allowedIss: 'ISS' }
      )
    },
    { message: 'The iss claim value is not allowed.' }
  )

  // The iss claim in the token ends with ISS
  t.assert.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpc3MiOiJTVUZGSVhfSVNTIn0.YNfIVGQCnIk0sQzsvOnLl_ueRs64m2M2BgiKyczzsAk',
        { allowedIss: 'ISS' }
      )
    },
    { message: 'The iss claim value is not allowed.' }
  )
})

test('it validates whether a required claim is present in the payload or not', t => {
  // Token payload: { "iss": "ISS"}
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJJU1MifQ.FKjJd2A-T8ufN7Y0LpjMR23P7CwEQ3Y-LBIYd2Vh_Rs'

  t.assert.deepStrictEqual(verify(token, { allowedIss: 'ISS', requiredClaims: ['iss'] }), { iss: 'ISS' })

  t.assert.throws(
    () => {
      return verify(token, { allowedSub: 'SUB', requiredClaims: ['sub'] })
    },
    { message: 'The sub claim is required.' }
  )
})

test('it validates whether a required custom claim is present in the payload or not', t => {
  // Token payload: {"iss": "ISS", "custom": "custom", "iat": 1708023956}
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJJU1MiLCJjdXN0b20iOiJjdXN0b20iLCJpYXQiOjE3MDgwMjQxMTh9.rD9GaHxuSB7mPkVQ2shj4yqPsvEuXWByMDNhMoch0xY'

  t.assert.deepStrictEqual(verify(token, { requiredClaims: ['iss', 'custom'] }), {
    iss: 'ISS',
    custom: 'custom',
    iat: 1708024118
  })

  // Standard claim not covered by other validators
  t.assert.throws(
    () => {
      return verify(token, { requiredClaims: ['kid'] })
    },
    { message: 'The kid claim is required.' }
  )

  // Custom claim
  t.assert.throws(
    () => {
      return verify(token, { requiredClaims: ['customTwo'] })
    },
    { message: 'The customTwo claim is required.' }
  )
})

test("it skips validation when an allowed claim isn't present in the payload", t => {
  // Token payload: { "iss": "ISS"}
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJJU1MifQ.FKjJd2A-T8ufN7Y0LpjMR23P7CwEQ3Y-LBIYd2Vh_Rs'

  t.assert.deepStrictEqual(verify(token, { allowedIss: 'ISS', allowedAud: 'AUD' }), { iss: 'ISS' })
})

test('token type validation', t => {
  t.assert.throws(() => createVerifier({ key: 'secret' })(123), {
    message: 'The token must be a string or a buffer.'
  })
})

test('options validation - key', t => {
  t.assert.throws(() => createVerifier({ key: 123 }), {
    message: 'The key option must be a string, a buffer or a function returning the algorithm secret or public key.'
  })
})

test('options validation - clockTimestamp', t => {
  t.assert.throws(() => createVerifier({ key: 'secret', clockTimestamp: '123' }), {
    message: 'The clockTimestamp option must be a positive number.'
  })

  t.assert.throws(() => createVerifier({ key: 'secret', clockTimestamp: -1 }), {
    message: 'The clockTimestamp option must be a positive number.'
  })
})

test('options validation - clockTolerance', t => {
  t.assert.throws(() => createVerifier({ key: 'secret', clockTolerance: '123' }), {
    message: 'The clockTolerance option must be a positive number.'
  })

  t.assert.throws(() => createVerifier({ key: 'secret', clockTolerance: -1 }), {
    message: 'The clockTolerance option must be a positive number.'
  })
})

test('options validation - cacheTTL', t => {
  t.assert.throws(() => createVerifier({ key: 'secret', cacheTTL: '123' }), {
    message: 'The cacheTTL option must be a positive number.'
  })

  t.assert.throws(() => createVerifier({ key: 'secret', cacheTTL: -1 }), {
    message: 'The cacheTTL option must be a positive number.'
  })
})

test('options validation - requiredClaims', t => {
  t.assert.throws(() => createVerifier({ key: 'secret', requiredClaims: 'ISS' }), {
    message: 'The requiredClaims option must be an array.'
  })
})

test('caching - sync', t => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.aaa'

  const verifier = createVerifier({ key: 'secret', cache: true })

  t.assert.equal(verifier.cache.size, 0)
  t.assert.deepStrictEqual(verifier(token), { a: 1 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier(token), { a: 1 })
  t.assert.equal(verifier.cache.size, 1)

  t.assert.throws(() => verifier(invalidToken), { message: 'The token signature is invalid.' })
  t.assert.equal(verifier.cache.size, 2)
  t.assert.throws(() => verifier(invalidToken), { message: 'The token signature is invalid.' })
  t.assert.equal(verifier.cache.size, 2)

  t.assert.deepStrictEqual(verifier.cache.get(hashToken(token))[0], { a: 1 })
  t.assert.ok(verifier.cache.get(hashToken(invalidToken))[0] instanceof TokenError)
})

test('caching - sync - custom cacheKeyBuilder', t => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.aaa'

  const verifier = createVerifier({ key: 'secret', cache: true, cacheKeyBuilder: id => id })

  t.assert.equal(verifier.cache.size, 0)
  t.assert.deepStrictEqual(verifier(token), { a: 1 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier(token), { a: 1 })
  t.assert.equal(verifier.cache.size, 1)

  t.assert.throws(() => verifier(invalidToken), { message: 'The token signature is invalid.' })
  t.assert.equal(verifier.cache.size, 2)
  t.assert.throws(() => verifier(invalidToken), { message: 'The token signature is invalid.' })
  t.assert.equal(verifier.cache.size, 2)

  t.assert.deepStrictEqual(verifier.cache.get(token)[0], { a: 1 })
  t.assert.ok(verifier.cache.get(invalidToken)[0] instanceof TokenError)
})

test('caching - async', async t => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.aaa'

  const verifier = createVerifier({ key: async () => 'secret', cache: true })

  t.assert.equal(verifier.cache.size, 0)
  t.assert.deepStrictEqual(await verifier(token), { a: 1 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(await verifier(token), { a: 1 })
  t.assert.equal(verifier.cache.size, 1)

  await t.assert.rejects(async () => verifier(invalidToken), { message: 'The token signature is invalid.' })
  t.assert.equal(verifier.cache.size, 2)
  await t.assert.rejects(async () => verifier(invalidToken), { message: 'The token signature is invalid.' })
  t.assert.equal(verifier.cache.size, 2)

  t.assert.deepStrictEqual(verifier.cache.get(hashToken(token))[0], { a: 1 })
  t.assert.ok(verifier.cache.get(hashToken(invalidToken))[0] instanceof TokenError)
})

for (const type of ['HS', 'ES', 'RS', 'PS']) {
  for (const bits of ['256', '384', '512']) {
    const algorithm = `${type}${bits}`
    const privateKey = privateKeys[type === 'ES' ? algorithm : type]
    const publicKey = publicKeys[type === 'ES' ? algorithm : type]

    test(`caching - should use the right hash method for storing values - ${algorithm}`, t => {
      const signer = createSigner({ algorithm, key: privateKey, noTimestamp: 1 })
      const verifier = createVerifier({ algorithm, key: publicKey, cache: true })
      const token = signer({ a: 1 })

      const hash = createHash(`sha${bits}`).update(token).digest('hex')

      t.assert.deepStrictEqual(verifier(token), { a: 1 })
      t.assert.equal(verifier.cache.size, 1)
      t.assert.equal(Array.from(verifier.cache.keys())[0], hash)
    })
  }
}

test('caching - should use the right hash method for storing values - EdDSA with Ed25519', t => {
  const signer = createSigner({ algorithm: 'EdDSA', key: privateKeys.Ed25519, noTimestamp: 1 })
  const verifier = createVerifier({ key: publicKeys.Ed25519, cache: true })
  const token = signer({ a: 1 })
  const hash = createHash('sha512').update(token).digest('hex')

  t.assert.deepStrictEqual(verifier(token), { a: 1 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.equal(Array.from(verifier.cache.keys())[0], hash)
})

test('caching - should use the right hash method for storing values - EdDSA with Ed448', t => {
  const signer = createSigner({
    algorithm: 'EdDSA',
    key: privateKeys.Ed448,
    noTimestamp: 1,
    header: { crv: 'Ed448' }
  })
  const verifier = createVerifier({ key: publicKeys.Ed448, cache: true })
  const token = signer({ a: 1 })
  const hash = createHash('shake256', { outputLength: 114 }).update(token).digest('hex')

  t.assert.deepStrictEqual(verifier(token), { a: 1 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.equal(Array.from(verifier.cache.keys())[0], hash)
})

test('caching - should be able to manipulate cache directy', t => {
  const clock = fakeTime({ now: 100000 })

  const signer = createSigner({ key: 'secret', expiresIn: 100000 })
  const verifier = createVerifier({ key: 'secret', cache: true })
  const token = signer({ a: 1 })

  t.assert.equal(verifier.cache.size, 0)
  t.assert.deepStrictEqual(verifier(token), { a: 1, iat: 100, exp: 200 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier.cache.get(hashToken(token)), [{ a: 1, iat: 100, exp: 200 }, 0, 200000])
  verifier.cache.clear()
  t.assert.equal(verifier.cache.size, 0)
  verifier.cache.set(token, 'WHATEVER')
  t.assert.deepStrictEqual(verifier.cache.get(token), 'WHATEVER')
  verifier.cache.set(token, null)
  t.assert.deepStrictEqual(verifier.cache.get(token), null)

  clock.uninstall()
})

test('caching - should correctly expire cached token using the exp claim', t => {
  const clock = fakeTime({ now: 100000 })

  const signer = createSigner({ key: 'secret', expiresIn: 100000 })
  const verifier = createVerifier({ key: 'secret', cache: true })
  const token = signer({ a: 1 })

  // First of all, make a token and verify it's cached
  t.assert.equal(verifier.cache.size, 0)
  t.assert.deepStrictEqual(verifier(token), { a: 1, iat: 100, exp: 200 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier(token), { a: 1, iat: 100, exp: 200 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier.cache.get(hashToken(token)), [{ a: 1, iat: 100, exp: 200 }, 0, 200000])

  // Now advance to expired time
  clock.tick(200000)

  // The token should now be expired and the cache should have been updated to reflect it
  t.assert.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.ok(verifier.cache.get(hashToken(token))[0] instanceof TokenError)

  t.assert.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })
  t.assert.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })

  clock.uninstall()

  // Now the real time is used, make cache considers the clockTimestamp algorithm
  verifier.cache.clear()
  t.assert.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.ok(verifier.cache.get(hashToken(token))[0] instanceof TokenError)

  const verifierWithTimestamp = createVerifier({ key: 'secret', cache: true, clockTimestamp: 100000 })
  t.assert.deepStrictEqual(verifierWithTimestamp(token), { a: 1, iat: 100, exp: 200 })
  t.assert.equal(verifierWithTimestamp.cache.size, 1)
  t.assert.deepStrictEqual(verifierWithTimestamp.cache.get(hashToken(token)), [{ a: 1, iat: 100, exp: 200 }, 0, 200000])
})

test('caching - should correctly expire cached token using the maxAge claim', t => {
  const clock = fakeTime({ now: 100000 })

  const signer = createSigner({ key: 'secret' })
  const verifier = createVerifier({ key: 'secret', cache: true, maxAge: 100000 })
  const token = signer({ a: 1 })

  // First of all, make a token and verify it's cached
  t.assert.equal(verifier.cache.size, 0)
  t.assert.deepStrictEqual(verifier(token), { a: 1, iat: 100 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier(token), { a: 1, iat: 100 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier.cache.get(hashToken(token)), [{ a: 1, iat: 100 }, 0, 200000])

  // Now advance to expired time
  clock.tick(200000)

  // The token should now be expired and the cache should have been updated to reflect it
  t.assert.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.ok(verifier.cache.get(hashToken(token))[0] instanceof TokenError)
  t.assert.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })
  t.assert.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })

  clock.uninstall()
})

test('caching - should correctly expire not yet cached token using the nbf claim at exact notBefore time', t => {
  const clock = fakeTime({ now: 100000 })

  const signer = createSigner({ key: 'secret', notBefore: 200000 })
  const verifier = createVerifier({ key: 'secret', cache: true })
  const token = signer({ a: 1 })

  // First of all, make a token and verify it's cached and rejected
  t.assert.equal(verifier.cache.size, 0)
  t.assert.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:05:00.000Z.' })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:05:00.000Z.' })
  t.assert.ok(verifier.cache.get(hashToken(token))[0] instanceof TokenError)

  // Now advance to expired time
  clock.tick(200000)

  // The token should now be active and the cache should have been updated to reflect it
  t.assert.deepStrictEqual(verifier(token), { a: 1, iat: 100, nbf: 300 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier(token), { a: 1, iat: 100, nbf: 300 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier.cache.get(hashToken(token)), [{ a: 1, iat: 100, nbf: 300 }, 300000, 900000])

  clock.uninstall()
})

test('caching - should correctly expire not yet cached token using the nbf claim while checking after expiry period', t => {
  const clock = fakeTime({ now: 100000 })

  const signer = createSigner({ key: 'secret', notBefore: 200000 })
  const verifier = createVerifier({ key: 'secret', cache: true })
  const token = signer({ a: 1 })

  // First of all, make a token and verify it's cached and rejected
  t.assert.equal(verifier.cache.size, 0)
  t.assert.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:05:00.000Z.' })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:05:00.000Z.' })
  t.assert.ok(verifier.cache.get(hashToken(token))[0] instanceof TokenError)

  // Now advance after expired time
  clock.tick(200010)

  // The token should now be active and the cache should have been updated to reflect it
  t.assert.deepStrictEqual(verifier(token), { a: 1, iat: 100, nbf: 300 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier(token), { a: 1, iat: 100, nbf: 300 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier.cache.get(hashToken(token)), [{ a: 1, iat: 100, nbf: 300 }, 300000, 900010])

  clock.uninstall()
})

test('caching - should be able to consider both nbf and exp field at the same time', t => {
  const clock = fakeTime({ now: 100000 })

  const signer = createSigner({ key: 'secret', expiresIn: 400000, notBefore: 200000 })
  const verifier = createVerifier({ key: 'secret', cache: true })
  const token = signer({ a: 1 })

  // At the beginning, the token is not active yet
  t.assert.equal(verifier.cache.size, 0)
  t.assert.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:05:00.000Z.' })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:05:00.000Z.' })
  t.assert.ok(verifier.cache.get(hashToken(token))[0] instanceof TokenError)

  // Now advance to activation time
  clock.tick(200000)

  // The token should now be active and the cache should have been updated to reflect it
  t.assert.deepStrictEqual(verifier(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier.cache.get(hashToken(token)), [
    { a: 1, iat: 100, nbf: 300, exp: 500 },
    300000,
    500000
  ])

  // Now advance again after the expiry time
  clock.tick(210000)

  // The token should now be expired and the cache should have been updated to reflect it
  t.assert.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:08:20.000Z.' })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.ok(verifier.cache.get(hashToken(token))[0] instanceof TokenError)
  t.assert.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:08:20.000Z.' })
  t.assert.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:08:20.000Z.' })

  clock.uninstall()
})

test('caching - should be able to consider clockTolerance on both nbf and exp field', t => {
  const clock = fakeTime({ now: 100000 })

  const signer = createSigner({ key: 'secret', expiresIn: 400000, notBefore: 200000 })
  const verifier = createVerifier({ key: 'secret', cache: true, clockTolerance: 60000 })
  const token = signer({ a: 1 })

  // At the beginning, the token is not active yet
  t.assert.equal(verifier.cache.size, 0)
  t.assert.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:04:00.000Z.' })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:04:00.000Z.' })
  t.assert.ok(verifier.cache.get(hashToken(token))[0] instanceof TokenError)

  // Now advance before the activation time, in clockTolerance range
  clock.tick(140000)

  // The token should now be active and the cache should have been updated to reflect it
  t.assert.deepStrictEqual(verifier(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier.cache.get(hashToken(token)), [
    { a: 1, iat: 100, nbf: 300, exp: 500 },
    240000,
    560000
  ])

  // Now advance to activation time
  clock.tick(150000)

  // The token should now be active and the cache should have been updated to reflect it
  t.assert.deepStrictEqual(verifier(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier.cache.get(hashToken(token)), [
    { a: 1, iat: 100, nbf: 300, exp: 500 },
    240000,
    560000
  ])

  // Now advance again after the expiry time, in clockTolerance range (current time going to be 540000 )
  clock.tick(150000)
  t.assert.deepStrictEqual(verifier(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier.cache.get(hashToken(token)), [
    { a: 1, iat: 100, nbf: 300, exp: 500 },
    240000,
    560000
  ])

  clock.tick(100000)
  // The token should now be expired and the cache should have been updated to reflect it
  t.assert.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:09:20.000Z.' })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.ok(verifier.cache.get(hashToken(token))[0] instanceof TokenError)
  t.assert.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:09:20.000Z.' })
  t.assert.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:09:20.000Z.' })

  clock.uninstall()
})

test('caching - should ignore the nbf and exp when asked to', t => {
  const clock = fakeTime({ now: 100000 })

  const signer = createSigner({ key: 'secret', expiresIn: 400000, notBefore: 200000 })
  const verifier = createVerifier({ key: 'secret', cache: true })
  const verifierNoNbf = createVerifier({ key: 'secret', cache: true, ignoreNotBefore: true })
  const verifierNoExp = createVerifier({ key: 'secret', cache: true, ignoreExpiration: true })
  const token = signer({ a: 1 })

  // At the beginning, the token is not active yet
  t.assert.equal(verifier.cache.size, 0)
  t.assert.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:05:00.000Z.' })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:05:00.000Z.' })
  t.assert.ok(verifier.cache.get(hashToken(token))[0] instanceof TokenError)

  // For the verifier which ignores notBefore, the token is already active
  t.assert.deepStrictEqual(verifierNoNbf(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.assert.equal(verifierNoNbf.cache.size, 1)
  t.assert.deepStrictEqual(verifierNoNbf(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.assert.equal(verifierNoNbf.cache.size, 1)
  t.assert.deepStrictEqual(verifierNoNbf.cache.get(hashToken(token)), [
    { a: 1, iat: 100, nbf: 300, exp: 500 },
    0,
    500000
  ])

  // Now advance to activation time
  clock.tick(200000)

  // The token should now be active and the cache should have been updated to reflect it
  t.assert.deepStrictEqual(verifier(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier.cache.get(hashToken(token)), [
    { a: 1, iat: 100, nbf: 300, exp: 500 },
    300000,
    500000
  ])

  // Now advance again after the expiry time
  clock.tick(210000)

  // The token should now be expired and the cache should have been updated to reflect it
  t.assert.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:08:20.000Z.' })
  t.assert.equal(verifier.cache.size, 1)
  t.assert.ok(verifier.cache.get(hashToken(token))[0] instanceof TokenError)
  t.assert.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:08:20.000Z.' })
  t.assert.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:08:20.000Z.' })

  // For the verifier which ignores expiration, the token is still active
  t.assert.deepStrictEqual(verifierNoExp(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.assert.equal(verifierNoExp.cache.size, 1)
  t.assert.deepStrictEqual(verifierNoExp(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.assert.equal(verifierNoExp.cache.size, 1)
  t.assert.deepStrictEqual(verifierNoExp.cache.get(hashToken(token)), [
    { a: 1, iat: 100, nbf: 300, exp: 500 },
    300000,
    1110000
  ])

  clock.uninstall()
})

test('options validation - errorCacheTTL', t => {
  t.assert.throws(() => createVerifier({ key: 'secret', errorCacheTTL: '123' }), {
    message: 'The errorCacheTTL option must be a number greater than -1 or a function.'
  })

  t.assert.throws(() => createVerifier({ key: 'secret', errorCacheTTL: -2 }), {
    message: 'The errorCacheTTL option must be a number greater than -1 or a function.'
  })
})

test('default errorCacheTTL should not cache errors', async t => {
  const clock = fakeTime({ now: 0 })
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  const verifier = createVerifier({
    key: async () => {
      throw new Error('invalid')
    },
    cache: true,
    clockTolerance: 0
  })

  t.assert.equal(verifier.cache.size, 0)
  await t.assert.rejects(async () => verifier(token))
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier.cache.get(hashToken(token))[2], -1)
  clock.uninstall()
})

test('errors should have ttl equal to errorCacheTTL', async t => {
  const clock = fakeTime({ now: 0 })
  const errorCacheTTL = 20000
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  const verifier = createVerifier({
    key: async () => {
      throw new Error('invalid')
    },
    cache: true,
    clockTolerance: 0,
    errorCacheTTL
  })

  t.assert.equal(verifier.cache.size, 0)
  await t.assert.rejects(async () => verifier(token))
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier.cache.get(hashToken(token))[2], errorCacheTTL)
  clock.uninstall()
})

test('errors should have ttl equal to errorCacheTTL', async t => {
  const clock = fakeTime({ now: 0 })
  const errorCacheTTL = 20000
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  const verifier = createVerifier({
    key: async () => {
      throw new Error('invalid')
    },
    cache: true,
    clockTolerance: 0,
    errorCacheTTL
  })

  t.assert.equal(verifier.cache.size, 0)
  await t.assert.rejects(async () => verifier(token))
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier.cache.get(hashToken(token))[2], errorCacheTTL)

  clock.tick(1000)
  // cache hit and ttl not changed
  await t.assert.rejects(async () => verifier(token))
  t.assert.deepStrictEqual(verifier.cache.get(hashToken(token))[2], errorCacheTTL)

  clock.tick(errorCacheTTL)
  // cache expired, request performed, new ttl
  await t.assert.rejects(async () => verifier(token))
  t.assert.deepStrictEqual(verifier.cache.get(hashToken(token))[2], errorCacheTTL + 1000 + errorCacheTTL)

  clock.uninstall()
})

test('errors should have ttl equal to errorCacheTTL as function', async t => {
  const clock = fakeTime({ now: 0 })

  const fetchKeyErrorTTL = 2000
  const errorCacheTTL = tokenError => {
    if (tokenError.code === 'FAST_JWT_KEY_FETCHING_ERROR') {
      return fetchKeyErrorTTL
    }
    return 1000
  }

  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  const verifier = createVerifier({
    key: async () => {
      throw new Error('error fetching key')
    },
    cache: true,
    clockTolerance: 0,
    errorCacheTTL
  })

  t.assert.equal(verifier.cache.size, 0)
  await t.assert.rejects(async () => verifier(token))
  t.assert.equal(verifier.cache.size, 1)
  t.assert.deepStrictEqual(verifier.cache.get(hashToken(token))[2], fetchKeyErrorTTL)

  clock.uninstall()
})

test('invalid errorCacheTTL function should be handle ', async t => {
  const clock = fakeTime({ now: 0 })

  const errorCacheTTL = () => {
    throw new Error('invalid errorCacheTTL function')
  }

  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  const verifier = createVerifier({
    key: () => {
      throw new Error('invalid')
    },
    cache: true,
    clockTolerance: 0,
    errorCacheTTL
  })

  t.assert.equal(verifier.cache.size, 0)
  t.assert.throws(() => verifier(token))
  t.assert.equal(verifier.cache.size, 0)

  clock.uninstall()
})

test('default errorCacheTTL should not cache errors when sub millisecond execution', async t => {
  const clock = fakeTime({ now: 0 })

  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  const verifier = createVerifier({
    key: async () => {
      throw new Error('invalid')
    },
    cache: true
  })
  const checkToken = 'check'
  t.assert.equal(verifier.cache.size, 0)
  await t.assert.rejects(async () => verifier(token))
  t.assert.equal(verifier.cache.size, 1)

  // change cache to check if hits
  verifier.cache.set(hashToken(token), [checkToken, 0, -1])

  await t.assert.rejects(async () => verifier(token))

  t.assert.notDeepStrictEqual(verifier.cache.get(hashToken(token))[0], checkToken)

  clock.uninstall()
})

'use strict'

const { readFileSync } = require('fs')
const { resolve } = require('path')
const { test } = require('tap')

const { createSigner, createVerifier, TokenError } = require('../src')
const { useNewCrypto } = require('../src/crypto')

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

function sign(payload, options, callback) {
  const signer = createSigner({ key: 'secret', ...options })
  return signer(payload, callback)
}

test('it correctly returns a token - sync', t => {
  t.equal(
    sign({ a: 1 }, { noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  )

  t.equal(
    sign({ a: 1 }, { key: undefined, algorithm: 'none', noTimestamp: true }),
    'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJhIjoxfQ.'
  )

  t.equal(
    sign({ a: 1 }, { noTimestamp: true, algorithm: 'none', key: null }),
    'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJhIjoxfQ.'
  )

  if (useNewCrypto) {
    t.equal(
      sign({ a: 1 }, { noTimestamp: true, key: privateKeys.Ed25519 }),
      'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.pIRjmLR-JW4sTCslD24h5fs0sTUpGYBG7zh4Z_UyEZ_u29NojdH2dSNKQZwwgjl1WvfYNtBCCF_EnYTazAXmDQ'
    )
  } else {
    t.throws(() => sign({ a: 1 }, { noTimestamp: true, key: privateKeys.Ed25519 }), {
      message: 'Cannot create the signature.',
      originalError: {
        message: 'EdDSA algorithms are not supported by your Node.js version.'
      }
    })
  }

  t.end()
})

test('it correctly returns a token - async - key with callback', async t => {
  t.equal(
    await sign({ a: 1 }, { key: (_h, callback) => setTimeout(() => callback(null, 'secret'), 10), noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  )
})

test('it correctly returns a token - async - key as promise', async t => {
  t.equal(
    await sign({ a: 1 }, { key: async () => 'secret', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  )
})

test('it correctly returns a token - async - static key', async t => {
  t.equal(
    await sign({ a: 1 }, { noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  )
})

test('it correctly returns a token - callback - key as promise', t => {
  sign({ a: 1 }, { key: async () => Buffer.from('secret', 'utf-8'), noTimestamp: true }, (error, token) => {
    t.type(error, 'null')
    t.equal(token, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM')
    t.end()
  })
})

test('it correctly autodetects the algorithm depending on the secret provided', t => {
  const hsVerifier = createVerifier({ complete: true, key: publicKeys.HS })
  const rsVerifier = createVerifier({ complete: true, key: publicKeys.RS })
  const psVerifier = createVerifier({ complete: true, key: publicKeys.PS })
  const es256Verifier = createVerifier({ complete: true, key: publicKeys.ES256 })
  const es384Verifier = createVerifier({ complete: true, key: publicKeys.ES384 })
  const es512Verifier = createVerifier({ complete: true, key: publicKeys.ES512 })
  const es25519Verifier = createVerifier({ complete: true, key: publicKeys.Ed25519 })
  const es448Verifier = createVerifier({ complete: true, key: publicKeys.Ed448 })

  let token = createSigner({ key: privateKeys.HS })({ a: 1 })
  let verification = hsVerifier(token)
  t.is(verification.header.alg, 'HS256')

  token = createSigner({ key: privateKeys.RS })({ a: 1 })
  verification = rsVerifier(token)
  t.is(verification.header.alg, 'RS256')

  token = createSigner({ key: privateKeys.PS })({ a: 1 })
  verification = psVerifier(token)
  t.is(verification.header.alg, 'RS256')

  token = createSigner({ key: privateKeys.ES256 })({ a: 1 })
  verification = es256Verifier(token)
  t.is(verification.header.alg, 'ES256')

  token = createSigner({ key: privateKeys.ES384 })({ a: 1 })
  verification = es384Verifier(token)
  t.is(verification.header.alg, 'ES384')

  token = createSigner({ key: privateKeys.ES512 })({ a: 1 })
  verification = es512Verifier(token)
  t.is(verification.header.alg, 'ES512')

  if (useNewCrypto) {
    token = createSigner({ key: privateKeys.Ed25519 })({ a: 1 })
    verification = es25519Verifier(token)
    t.is(verification.header.alg, 'EdDSA')

    token = createSigner({ key: privateKeys.Ed448 })({ a: 1 })
    verification = es448Verifier(token)
    t.is(verification.header.alg, 'EdDSA')
  }

  t.end()
})

test('it correctly set a timestamp', t => {
  const ts = [100000, 200000]
  const originalNow = Date.now

  Date.now = () => ts.shift()
  t.not(sign({ a: 1 }, {}), sign({ a: 1 }, {}))
  Date.now = originalNow

  t.end()
})

test('it respect the payload iat, if one is set', t => {
  t.equal(
    sign({ a: 1, iat: 123 }, {}),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEyM30.J-5nCdVMKQ0yqIIkKTPBuQf46vPXcbwdLpAcYBZ9EqU'
  )

  t.end()
})

test('it respect the payload sub, if one is set', t => {
  t.equal(
    sign({ a: 1, sub: 'SUB' }, { noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJzdWIiOiJTVUIifQ.wweP9vNGt77bBGwZ_PLXfPxy2qcx2mnjUa0AWVA5bEM'
  )

  t.end()
})

test('it uses the clockTimestamp option, if one is set', t => {
  t.equal(
    sign({ a: 1 }, { clockTimestamp: 123000 }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEyM30.J-5nCdVMKQ0yqIIkKTPBuQf46vPXcbwdLpAcYBZ9EqU'
  )

  t.end()
})

test('it adds a exp claim, overriding the payload one, only if the payload is a object', t => {
  t.equal(
    sign({ a: 1, iat: 100 }, { expiresIn: 1000 }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwiZXhwIjoxMDF9.ULKqTsvUYm7iNOKA6bP5NXsa1A8vofgPIGiC182Vf_Q'
  )

  t.equal(
    sign({ a: 1, iat: 100, exp: 200 }, { expiresIn: 1000 }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwiZXhwIjoxMDF9.ULKqTsvUYm7iNOKA6bP5NXsa1A8vofgPIGiC182Vf_Q'
  )

  t.end()
})

test('it adds a nbf claim, overriding the payload one, only if the payload is a object', t => {
  t.equal(
    sign({ a: 1, iat: 100 }, { notBefore: 1000 }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwibmJmIjoxMDF9.WhZeNowse7q1s5FSlcMcs_4KcxXpSdQ4yqv0xrGB3sU'
  )

  t.equal(
    sign({ a: 1, iat: 100, nbf: 200 }, { notBefore: 1000 }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwibmJmIjoxMDF9.WhZeNowse7q1s5FSlcMcs_4KcxXpSdQ4yqv0xrGB3sU'
  )

  t.end()
})

test('it adds a jti claim, overriding the payload one, only if the payload is a object', t => {
  t.equal(
    sign({ a: 1 }, { jti: 'JTI', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkifQ.Ew1eS3Pn9R0hqV0JCA5AECTSvaEm9glggxWlmq0cYl4'
  )

  t.equal(
    sign({ a: 1, jti: 'original' }, { jti: 'JTI', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkifQ.Ew1eS3Pn9R0hqV0JCA5AECTSvaEm9glggxWlmq0cYl4'
  )

  t.end()
})

test('it adds a aud claim, overriding the payload one, only if the payload is a object', t => {
  t.equal(
    sign({ a: 1 }, { aud: 'AUD1', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJhdWQiOiJBVUQxIn0.fplBCKNjVH2jjpk-hFQZ9jnG96nVFZqOeU-C97AvKAI'
  )

  t.equal(
    sign({ a: 1, aud: 'original' }, { aud: 'AUD1', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJhdWQiOiJBVUQxIn0.fplBCKNjVH2jjpk-hFQZ9jnG96nVFZqOeU-C97AvKAI'
  )

  t.equal(
    sign({ a: 1, aud: 'original' }, { aud: ['AUD1', 'AUD2'], noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJhdWQiOlsiQVVEMSIsIkFVRDIiXX0.zRcmqvl1hRzaWa8qX_ge7mHeJNSH-Th-TLu0-62jFxc'
  )

  t.end()
})

test('it adds a iss claim, overriding the payload one, only if the payload is a object', t => {
  t.equal(
    sign({ a: 1 }, { iss: 'ISS', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpc3MiOiJJU1MifQ.YLEisGRTlJL9Y7KLHbIahXr1Zqu0of5w1mJf4aGphTE'
  )

  t.equal(
    sign({ a: 1, iss: 'original' }, { iss: 'ISS', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpc3MiOiJJU1MifQ.YLEisGRTlJL9Y7KLHbIahXr1Zqu0of5w1mJf4aGphTE'
  )

  t.end()
})

test('it adds a sub claim, overriding the payload one, only if the payload is a object', t => {
  t.equal(
    sign({ a: 1 }, { sub: 'SUB', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJzdWIiOiJTVUIifQ.wweP9vNGt77bBGwZ_PLXfPxy2qcx2mnjUa0AWVA5bEM'
  )

  t.equal(
    sign({ a: 1, sub: 'original' }, { sub: 'SUB', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJzdWIiOiJTVUIifQ.wweP9vNGt77bBGwZ_PLXfPxy2qcx2mnjUa0AWVA5bEM'
  )

  t.end()
})

test('it adds a nonce claim, overriding the payload one, only if the payload is a object', t => {
  t.equal(
    sign({ a: 1 }, { nonce: 'NONCE', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJub25jZSI6Ik5PTkNFIn0.NvCriFYuVDq0fTSf5t_92EwbxnwgjZVMBEMfW-RVl_k'
  )

  t.equal(
    sign({ a: 1, nonce: 'original' }, { nonce: 'NONCE', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJub25jZSI6Ik5PTkNFIn0.NvCriFYuVDq0fTSf5t_92EwbxnwgjZVMBEMfW-RVl_k'
  )

  t.end()
})

test('it adds a kid to the header', t => {
  t.equal(
    sign({ a: 1 }, { kid: '123', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMyJ9.eyJhIjoxfQ.7tQHnTc72lr2wAQeb7n-bDesok0WUHXCDGyNfOMA8CA'
  )

  t.end()
})

test('it adds additional arbitrary fields to the header', t => {
  t.equal(
    sign({ a: 1 }, { header: { b: 2, c: 3 }, noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImIiOjIsImMiOjN9.eyJhIjoxfQ.pfoXZ4zIsYNDmvhFy7pX6dUaK7SV6NfwxTTISwqeFeY'
  )

  t.end()
})

test('it mutates the payload if asked to', t => {
  const payload = { a: 1, iat: 100 }

  t.equal(
    sign(payload, { mutatePayload: true, expiresIn: 1000 }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwiZXhwIjoxMDF9.ULKqTsvUYm7iNOKA6bP5NXsa1A8vofgPIGiC182Vf_Q'
  )

  t.equal(payload.exp, 101)

  t.end()
})

test('it correctly handle errors - async callback', async t => {
  await t.rejects(
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

  await t.rejects(
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

test('it correctly handle errors - callback', t => {
  sign(
    { a: 1 },
    {
      key: (header, callback) => {
        callback(new Error('FAILED'))
      },
      noTimestamp: true
    },
    (error, token) => {
      t.true(error instanceof TokenError)
      t.equal(error.message, 'Cannot fetch key.')

      t.end()
    }
  )
})

test('it correctly validates the key received from the callback', t => {
  sign(
    { a: 1 },
    {
      key: (header, callback) => {
        callback(null, 123)
      },
      noTimestamp: true
    },
    (error, token) => {
      t.true(error instanceof TokenError)
      t.equal(
        error.message,
        'The key returned from the callback must be a string or a buffer containing a secret or a private key.'
      )

      t.end()
    }
  )
})

test('it correctly handle errors - evented callback', t => {
  sign(
    { a: 1 },
    {
      key: (header, callback) => {
        process.nextTick(() => callback(null, 'FAILED'))
      },
      noTimestamp: true,
      algorithm: 'RS256'
    },
    (error, token) => {
      t.true(error instanceof TokenError)
      t.equal(error.message, 'Invalid private key provided for algorithm RS256.')

      t.end()
    }
  )
})

test('returns a promise according to key option', t => {
  const s1 = createSigner({ key: 'secret' })({ a: 'PAYLOAD' })
  const s2 = createSigner({ key: async () => 'secret' })({ a: 'PAYLOAD' })

  t.true(typeof s1.then === 'undefined')
  t.true(typeof s2.then === 'function')

  s2.then(
    () => false,
    () => false
  )

  t.end()
})

test('payload validation', t => {
  t.throws(() => createSigner({ key: 'secret' })(123), {
    message: 'The payload must be a object, a string or a buffer.'
  })

  t.rejects(async () => createSigner({ key: () => 'secret' })(123), {
    message: 'The payload must be a object, a string or a buffer.'
  })

  t.end()
})

test('options validation - algorithm', t => {
  createSigner({ key: 'secret' })

  t.throws(() => createSigner({ key: 'secret', algorithm: 'FOO' }), {
    message:
      'The algorithm option must be one of the following values: HS256, HS384, HS512, ES256, ES384, ES512, RS256, RS384, RS512, PS256, PS384, PS512, EdDSA, none.'
  })

  t.end()
})

test('options validation - key', t => {
  t.throws(() => createSigner({ key: 123 }), {
    message: 'The key option must be a string, a buffer or a function returning the algorithm secret or private key.'
  })

  t.throws(() => createSigner({ algorithm: 'none', key: 123 }), {
    message: 'The key option must not be provided when the algorithm option is "none".'
  })

  t.end()
})

test('options validation - clockTimestamp', t => {
  t.throws(() => createSigner({ key: 'secret', clockTimestamp: '123' }), {
    message: 'The clockTimestamp option must be a positive number.'
  })

  t.throws(() => createSigner({ key: 'secret', clockTimestamp: -1 }), {
    message: 'The clockTimestamp option must be a positive number.'
  })

  t.end()
})

test('options validation - expiresIn', t => {
  t.throws(() => createSigner({ key: 'secret', expiresIn: '123' }), {
    message: 'The expiresIn option must be a positive number.'
  })

  t.throws(() => createSigner({ key: 'secret', expiresIn: -1 }), {
    message: 'The expiresIn option must be a positive number.'
  })

  t.end()
})

test('options validation - notBefore', t => {
  t.throws(() => createSigner({ key: 'secret', notBefore: '123' }), {
    message: 'The notBefore option must be a positive number.'
  })

  t.throws(() => createSigner({ key: 'secret', notBefore: -1 }), {
    message: 'The notBefore option must be a positive number.'
  })

  t.end()
})

test('options validation - aud', t => {
  t.throws(() => createSigner({ key: 'secret', aud: 123 }), {
    message: 'The aud option must be a string or an array of strings.'
  })

  t.end()
})

for (const option of ['jti', 'iss', 'sub', 'nonce', 'kid']) {
  test(`options validation - ${option}`, t => {
    t.throws(() => createSigner({ key: 'secret', [option]: 123 }), {
      message: `The ${option} option must be a string.`
    })

    t.end()
  })
}

test('options validation - header', t => {
  t.throws(() => createSigner({ key: 'secret', header: 123 }), {
    message: 'The header option must be a object.'
  })

  t.end()
})

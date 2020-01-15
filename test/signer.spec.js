const test = require('ava')

const { createSigner, TokenError } = require('../src')

function sign(payload, options, callback) {
  const signer = createSigner({ secret: 'secret', ...options })
  return signer(payload, callback)
}

test('it correctly returns a token - sync', t => {
  t.is(
    sign({ a: 1 }, { noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  )
  t.is(sign('123', { noTimestamp: true }), 'eyJhbGciOiJIUzI1NiJ9.IjEyMyI.qlR6P9GjQnYDvvNTkUH7bQfUkUYKAI05uXFvnQn-JhU')
  t.is(
    sign(Buffer.from('123'), { noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiJ9.IjEyMyI.qlR6P9GjQnYDvvNTkUH7bQfUkUYKAI05uXFvnQn-JhU'
  )
})

test('it correctly returns a token - async - secret with callback', async t => {
  t.is(
    await sign(
      { a: 1 },
      { secret: (_h, callback) => setTimeout(() => callback(null, 'secret'), 10), noTimestamp: true }
    ),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  )
})

test('it correctly returns a token - async - secret as promise', async t => {
  t.is(
    await sign({ a: 1 }, { secret: async () => 'secret', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  )
})

test('it correctly returns a token - async - static secret', async t => {
  t.is(
    await sign({ a: 1 }, { noTimestamp: true, useWorkerThreads: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  )
})

test.cb('it correctly returns a token - callback - secret as promise', t => {
  sign({ a: 1 }, { secret: async () => 'secret', noTimestamp: true }, (error, token) => {
    t.is(token, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM')
    t.end(error, token)
  })
})

test('it correctly set a timestamp', async t => {
  const first = sign({ a: 1 }, {})
  await new Promise(resolve => setTimeout(resolve, 1000))
  const second = sign({ a: 1 }, {})

  t.not(first, second)
})

test('it respect the payload iat, if one is set', t => {
  t.is(
    sign({ a: 1, iat: 123 }, {}),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEyM30.J-5nCdVMKQ0yqIIkKTPBuQf46vPXcbwdLpAcYBZ9EqU'
  )
})

test('it adds a exp claim, overriding the payload one, only if the payload is a object', t => {
  t.is(
    sign({ a: 1, iat: 100 }, { expiresIn: 1000 }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwiZXhwIjoxMDF9.ULKqTsvUYm7iNOKA6bP5NXsa1A8vofgPIGiC182Vf_Q'
  )

  t.is(
    sign({ a: 1, iat: 100, exp: 200 }, { expiresIn: 1000 }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwiZXhwIjoxMDF9.ULKqTsvUYm7iNOKA6bP5NXsa1A8vofgPIGiC182Vf_Q'
  )

  t.is(sign('123', { expiresIn: 1000 }), 'eyJhbGciOiJIUzI1NiJ9.IjEyMyI.qlR6P9GjQnYDvvNTkUH7bQfUkUYKAI05uXFvnQn-JhU')
})

test('it adds a nbf claim, overriding the payload one, only if the payload is a object', t => {
  t.is(
    sign({ a: 1, iat: 100 }, { notBefore: 1000 }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwibmJmIjoxMDF9.WhZeNowse7q1s5FSlcMcs_4KcxXpSdQ4yqv0xrGB3sU'
  )

  t.is(
    sign({ a: 1, iat: 100, nbf: 200 }, { notBefore: 1000 }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwibmJmIjoxMDF9.WhZeNowse7q1s5FSlcMcs_4KcxXpSdQ4yqv0xrGB3sU'
  )

  t.is(sign('123', { notBefore: 1000 }), 'eyJhbGciOiJIUzI1NiJ9.IjEyMyI.qlR6P9GjQnYDvvNTkUH7bQfUkUYKAI05uXFvnQn-JhU')
})

test('it adds a jti claim, overriding the payload one, only if the payload is a object', t => {
  t.is(
    sign({ a: 1 }, { jti: 'JTI', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkifQ.Ew1eS3Pn9R0hqV0JCA5AECTSvaEm9glggxWlmq0cYl4'
  )

  t.is(
    sign({ a: 1, jti: 'original' }, { jti: 'JTI', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkifQ.Ew1eS3Pn9R0hqV0JCA5AECTSvaEm9glggxWlmq0cYl4'
  )

  t.is(sign('123', { jti: 'JTI' }), 'eyJhbGciOiJIUzI1NiJ9.IjEyMyI.qlR6P9GjQnYDvvNTkUH7bQfUkUYKAI05uXFvnQn-JhU')
})

test('it adds a aud claim, overriding the payload one, only if the payload is a object', t => {
  t.is(
    sign({ a: 1 }, { aud: 'AUD1', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJhdWQiOiJBVUQxIn0.fplBCKNjVH2jjpk-hFQZ9jnG96nVFZqOeU-C97AvKAI'
  )

  t.is(
    sign({ a: 1, aud: 'original' }, { aud: 'AUD1', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJhdWQiOiJBVUQxIn0.fplBCKNjVH2jjpk-hFQZ9jnG96nVFZqOeU-C97AvKAI'
  )

  t.is(
    sign({ a: 1, aud: 'original' }, { aud: ['AUD1', 'AUD2'], noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJhdWQiOlsiQVVEMSIsIkFVRDIiXX0.zRcmqvl1hRzaWa8qX_ge7mHeJNSH-Th-TLu0-62jFxc'
  )

  t.is(sign('123', { aud: 'AUD1' }), 'eyJhbGciOiJIUzI1NiJ9.IjEyMyI.qlR6P9GjQnYDvvNTkUH7bQfUkUYKAI05uXFvnQn-JhU')
})

test('it adds a iss claim, overriding the payload one, only if the payload is a object', t => {
  t.is(
    sign({ a: 1 }, { iss: 'ISS', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpc3MiOiJJU1MifQ.YLEisGRTlJL9Y7KLHbIahXr1Zqu0of5w1mJf4aGphTE'
  )

  t.is(
    sign({ a: 1, iss: 'original' }, { iss: 'ISS', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpc3MiOiJJU1MifQ.YLEisGRTlJL9Y7KLHbIahXr1Zqu0of5w1mJf4aGphTE'
  )

  t.is(sign('123', { iss: 'ISS' }), 'eyJhbGciOiJIUzI1NiJ9.IjEyMyI.qlR6P9GjQnYDvvNTkUH7bQfUkUYKAI05uXFvnQn-JhU')
})

test('it adds a sub claim, overriding the payload one, only if the payload is a object', t => {
  t.is(
    sign({ a: 1 }, { sub: 'SUB', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJzdWIiOiJTVUIifQ.wweP9vNGt77bBGwZ_PLXfPxy2qcx2mnjUa0AWVA5bEM'
  )

  t.is(
    sign({ a: 1, sub: 'original' }, { sub: 'SUB', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJzdWIiOiJTVUIifQ.wweP9vNGt77bBGwZ_PLXfPxy2qcx2mnjUa0AWVA5bEM'
  )

  t.is(sign('123', { sub: 'SUB' }), 'eyJhbGciOiJIUzI1NiJ9.IjEyMyI.qlR6P9GjQnYDvvNTkUH7bQfUkUYKAI05uXFvnQn-JhU')
})

test('it adds a nonce claim, overriding the payload one, only if the payload is a object', t => {
  t.is(
    sign({ a: 1 }, { nonce: 'NONCE', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJub25jZSI6Ik5PTkNFIn0.NvCriFYuVDq0fTSf5t_92EwbxnwgjZVMBEMfW-RVl_k'
  )

  t.is(
    sign({ a: 1, nonce: 'original' }, { nonce: 'NONCE', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJub25jZSI6Ik5PTkNFIn0.NvCriFYuVDq0fTSf5t_92EwbxnwgjZVMBEMfW-RVl_k'
  )

  t.is(sign('123', { nonce: 'NONCE' }), 'eyJhbGciOiJIUzI1NiJ9.IjEyMyI.qlR6P9GjQnYDvvNTkUH7bQfUkUYKAI05uXFvnQn-JhU')
})

test('it adds a kid to the header', t => {
  t.is(
    sign({ a: 1 }, { kid: '123', noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMyJ9.eyJhIjoxfQ.7tQHnTc72lr2wAQeb7n-bDesok0WUHXCDGyNfOMA8CA'
  )
})

test('it adds additional arbitrary fields to the header', t => {
  t.is(
    sign({ a: 1 }, { header: { b: 2, c: 3 }, noTimestamp: true }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImIiOjIsImMiOjN9.eyJhIjoxfQ.pfoXZ4zIsYNDmvhFy7pX6dUaK7SV6NfwxTTISwqeFeY'
  )
})

test('it mutates the payload if asked to', t => {
  const payload = { a: 1, iat: 100 }

  t.is(
    sign(payload, { mutatePayload: true, expiresIn: 1000 }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwiZXhwIjoxMDF9.ULKqTsvUYm7iNOKA6bP5NXsa1A8vofgPIGiC182Vf_Q'
  )

  t.is(payload.exp, 101)
})

test('it correctly handle errors - async', async t => {
  await t.throwsAsync(
    () => {
      return sign(
        { a: 1 },
        {
          secret: async () => {
            throw new Error('FAILED')
          },
          noTimestamp: true
        }
      )
    },
    {
      instanceOf: TokenError,
      message: 'Cannot fetch secret.'
    }
  )
})

test.cb('it correctly handle errors - callback', t => {
  sign(
    { a: 1 },
    {
      secret: (header, callback) => {
        callback(new Error('FAILED'))
      },
      noTimestamp: true
    },
    (error, token) => {
      t.true(error instanceof TokenError)
      t.is(error.message, 'Cannot fetch secret.')

      t.end()
    }
  )
})

test('returns a different function type according to secret or useWorkerThreads options', t => {
  t.is(createSigner({ secret: 'secret' }).constructor.name, 'Function')
  t.is(createSigner({ secret: 'secret', useWorkerThreads: true }).constructor.name, 'AsyncFunction')
  t.is(createSigner({ secret: async () => 'secret' }).constructor.name, 'AsyncFunction')
})

test('payload validation', t => {
  t.throws(() => createSigner({ secret: 'secret' })(123), {
    instanceOf: TokenError,
    message: 'The payload must be a object, a string or a buffer.'
  })
})

test('options validation - algorithm', t => {
  t.throws(() => createSigner({ secret: 'secret', algorithm: 'FOO' }), {
    instanceOf: TokenError,
    message:
      'The algorithm option must be one of the following values: RS256, RS384, RS512, ES256, ES384, ES512, PS256, PS384, PS512, HS256, HS384, HS512, none.'
  })
})

test('options validation - secret', t => {
  t.throws(() => createSigner({ secret: 123 }), {
    instanceOf: TokenError,
    message: 'The secret option must be a string, buffer, object or callback containing a secret or a private key.'
  })
})

test('options validation - encoding', t => {
  t.throws(() => createSigner({ secret: 'secret', encoding: 123 }), {
    instanceOf: TokenError,
    message: 'The encoding option must be a string.'
  })
})

test('options validation - expiresIn', t => {
  t.throws(() => createSigner({ secret: 'secret', expiresIn: '123' }), {
    instanceOf: TokenError,
    message: 'The expiresIn option must be a positive number.'
  })

  t.throws(() => createSigner({ secret: 'secret', expiresIn: -1 }), {
    instanceOf: TokenError,
    message: 'The expiresIn option must be a positive number.'
  })
})

test('options validation - notBefore', t => {
  t.throws(() => createSigner({ secret: 'secret', notBefore: '123' }), {
    instanceOf: TokenError,
    message: 'The notBefore option must be a positive number.'
  })

  t.throws(() => createSigner({ secret: 'secret', notBefore: -1 }), {
    instanceOf: TokenError,
    message: 'The notBefore option must be a positive number.'
  })
})

test('options validation - aud', t => {
  t.throws(() => createSigner({ secret: 'secret', aud: 123 }), {
    instanceOf: TokenError,
    message: 'The aud option must be a string or an array of strings.'
  })
})

for (const option of ['jti', 'iss', 'sub', 'nonce', 'kid']) {
  test(`options validation - ${option}`, t => {
    t.throws(() => createSigner({ secret: 'secret', [option]: 123 }), {
      instanceOf: TokenError,
      message: `The ${option} option must be a string.`
    })
  })
}

test('options validation - header', t => {
  t.throws(() => createSigner({ secret: 'secret', header: 123 }), {
    instanceOf: TokenError,
    message: 'The header option must be a object.'
  })
})

'use strict'

const test = require('ava')

const { createVerifier, TokenError } = require('../src')

function verify(token, options, callback) {
  const verifier = createVerifier({ secret: 'secret', ...options })
  return verifier(token, callback)
}

test('it correctly verifies a token - sync', t => {
  t.deepEqual(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      noTimestamp: true
    }),
    { a: 1 }
  )

  t.is(verify('eyJhbGciOiJIUzI1NiJ9.MTIz.UqiZ2LDYZqYB3xJgkHaihGQnJ_WPTz3hERDpA7bWYjA', { noTimestamp: true }), '123')

  t.is(
    verify(Buffer.from('eyJhbGciOiJIUzI1NiJ9.MTIz.UqiZ2LDYZqYB3xJgkHaihGQnJ_WPTz3hERDpA7bWYjA'), {
      noTimestamp: true
    }),
    '123'
  )

  t.deepEqual(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      noTimestamp: true,
      complete: true
    }),
    {
      header: { typ: 'JWT', alg: 'HS256' },
      payload: { a: 1 },
      signature: '57TF7smP9XDhIexBqPC+F1toZReYZLWb/YRU5tv0sxM='
    }
  )

  t.is(
    verify(Buffer.from('eyJhbGciOiJub25lIn0.MTIz.'), {
      noTimestamp: true,
      secret: ''
    }),
    '123'
  )
})

test('it correctly verifies a token - async - secret with callback', async t => {
  t.deepEqual(
    await verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      secret: (_h, callback) => setTimeout(() => callback(null, 'secret'), 10),
      noTimestamp: true
    }),
    { a: 1 }
  )

  t.deepEqual(
    await verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      secret: (_h, callback) => setTimeout(() => callback(null, 'secret'), 10),
      noTimestamp: true,
      complete: true
    }),
    {
      header: { typ: 'JWT', alg: 'HS256' },
      payload: { a: 1 },
      signature: '57TF7smP9XDhIexBqPC+F1toZReYZLWb/YRU5tv0sxM='
    }
  )
})

test('it correctly verifies a token - async - secret as promise', async t => {
  t.deepEqual(
    await verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      secret: async () => 'secret',
      noTimestamp: true
    }),
    { a: 1 }
  )
})

test('it correctly verifies a token - async - static secret', async t => {
  t.deepEqual(
    await verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      noTimestamp: true,
      useWorkerThreads: true
    }),
    { a: 1 }
  )
})

test.cb('it correctly verifies a token - callback - secret as promise', t => {
  verify(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM',
    { secret: async () => 'secret', noTimestamp: true },
    (error, payload) => {
      t.deepEqual(payload, { a: 1 })
      t.end(error)
    }
  )
})

test('it rejects invalid tokens', async t => {
  t.throws(() => verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-aaa', {}), {
    instanceOf: TokenError,
    message: 'The token signature is invalid.'
  })

  await t.throwsAsync(
    () => {
      return verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-aaa', {
        secret: async () => 'secret'
      })
    },
    {
      instanceOf: TokenError,
      message: 'The token signature is invalid.'
    }
  )
})

test('it requires a signature or a secret', async t => {
  t.throws(() => verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.', {}), {
    instanceOf: TokenError,
    message: 'The token signature is missing.'
  })

  t.throws(
    () =>
      verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
        secret: ''
      }),
    {
      instanceOf: TokenError,
      message: 'The secret is missing.'
    }
  )
})

test('it correctly handle errors - async', async t => {
  await t.throwsAsync(
    () => {
      return verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
        secret: async () => {
          throw new Error('FAILED')
        }
      })
    },
    {
      instanceOf: TokenError,
      message: 'Cannot fetch secret.'
    }
  )
})

test.cb('it correctly handle errors - callback', t => {
  verify(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM',
    {
      secret: (header, callback) => {
        callback(new Error('FAILED'))
      }
    },
    (error, token) => {
      t.true(error instanceof TokenError)
      t.is(error.message, 'Cannot fetch secret.')

      t.end()
    }
  )
})

test('it validates if the token is using an allowed algorithm', t => {
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjAsIm5iZiI6MjAwMDAwMDAwMH0.PlCCCgSnL38HaOY1-bkWnz-LX9WW2b772Zs3oxQJIv4',
        { algorithms: ['RS256'] }
      )
    },
    {
      instanceOf: TokenError,
      message: 'The token algorithm is invalid.'
    }
  )
})

test('it validates if the token is active unless explicitily disabled', t => {
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjAsIm5iZiI6MjAwMDAwMDAwMH0.PlCCCgSnL38HaOY1-bkWnz-LX9WW2b772Zs3oxQJIv4',
        {}
      )
    },
    {
      instanceOf: TokenError,
      message: 'The token will be active at 2033-05-18T03:33:20.000Z.'
    }
  )

  t.deepEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjAsIm5iZiI6MjAwMDAwMDAwMH0.PlCCCgSnL38HaOY1-bkWnz-LX9WW2b772Zs3oxQJIv4',
      {
        ignoreNotBefore: true
      }
    ),
    { a: 1, iat: 0, nbf: 2000000000 }
  )
})

test('it validates if the token has not expired (via exp) unless explicitily disabled', t => {
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwiZXhwIjoxMDF9.ULKqTsvUYm7iNOKA6bP5NXsa1A8vofgPIGiC182Vf_Q',
        {}
      )
    },
    {
      instanceOf: TokenError,
      message: 'The token has expired at 1970-01-01T00:01:41.000Z.'
    }
  )

  t.deepEqual(
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
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMH0.5V5yFNSqmn0w6yDR1vUbykF36WwdQmADMTLJwiJtx8w',
        { maxAge: 200000 }
      )
    },
    {
      instanceOf: TokenError,
      message: 'The token has expired at 1970-01-01T00:05:00.000Z.'
    }
  )

  t.deepEqual(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMH0.5V5yFNSqmn0w6yDR1vUbykF36WwdQmADMTLJwiJtx8w'),
    { a: 1, iat: 100 }
  )
})

test('it validates the jti claim only if explicitily enabled', t => {
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedJti: 'JTI1' }
      )
    },
    {
      instanceOf: TokenError,
      message: 'The jti claim value is not allowed.'
    }
  )

  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedJti: [/abc/, 'cde'] }
      )
    },
    {
      instanceOf: TokenError,
      message: 'The jti claim value is not allowed.'
    }
  )

  t.deepEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      {
        allowedJti: 'JTI'
      }
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

  t.deepEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      {
        allowedJti: ['ABX', 'JTI']
      }
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

  t.deepEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      {
        allowedJti: ['ABX', /^J/]
      }
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
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedAud: 'AUD2' }
      )
    },
    {
      instanceOf: TokenError,
      message: 'None of aud claim values is allowed.'
    }
  )

  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedAud: [/abc/, 'cde'] }
      )
    },
    {
      instanceOf: TokenError,
      message: 'None of aud claim values is allowed.'
    }
  )

  t.deepEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      {
        allowedAud: 'AUD'
      }
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

  t.deepEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      {
        allowedAud: ['ABX', 'AUD1']
      }
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

  t.deepEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      {
        allowedAud: ['ABX', /^D/]
      }
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
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedIss: 'ISS1' }
      )
    },
    {
      instanceOf: TokenError,
      message: 'The iss claim value is not allowed.'
    }
  )

  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedIss: [/abc/, 'cde'] }
      )
    },
    {
      instanceOf: TokenError,
      message: 'The iss claim value is not allowed.'
    }
  )

  t.deepEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      {
        allowedIss: 'ISS'
      }
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

  t.deepEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      {
        allowedIss: ['ABX', 'ISS']
      }
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

  t.deepEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      {
        allowedIss: ['ABX', /^I/]
      }
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
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedSub: 'SUB1' }
      )
    },
    {
      instanceOf: TokenError,
      message: 'The sub claim value is not allowed.'
    }
  )

  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedSub: [/abc/, 'cde'] }
      )
    },
    {
      instanceOf: TokenError,
      message: 'The sub claim value is not allowed.'
    }
  )

  t.deepEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      {
        allowedSub: 'SUB'
      }
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

  t.deepEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      {
        allowedSub: ['ABX', 'SUB']
      }
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

  t.deepEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      {
        allowedSub: ['ABX', /^S/]
      }
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
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedNonce: 'NONCE1' }
      )
    },
    {
      instanceOf: TokenError,
      message: 'The nonce claim value is not allowed.'
    }
  )

  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedNonce: [/abc/, 'cde'] }
      )
    },
    {
      instanceOf: TokenError,
      message: 'The nonce claim value is not allowed.'
    }
  )

  t.deepEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      {
        allowedNonce: 'NONCE'
      }
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

  t.deepEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      {
        allowedNonce: ['ABX', 'NONCE']
      }
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

  t.deepEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      {
        allowedNonce: ['ABX', /^N/]
      }
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

test('token type validation', t => {
  t.throws(() => createVerifier({ secret: 'secret' })(123), {
    instanceOf: TokenError,
    message: 'The token must be a string or a buffer.'
  })
})

test('options validation - secret', t => {
  t.throws(() => createVerifier({ secret: 123 }), {
    instanceOf: TokenError,
    message: 'The secret option must be a string, buffer, object or callback containing a secret or a public key.'
  })
})

test('options validation - clockTimestamp', t => {
  t.throws(() => createVerifier({ secret: 'secret', clockTimestamp: '123' }), {
    instanceOf: TokenError,
    message: 'The clockTimestamp option must be a positive number.'
  })

  t.throws(() => createVerifier({ secret: 'secret', clockTimestamp: -1 }), {
    instanceOf: TokenError,
    message: 'The clockTimestamp option must be a positive number.'
  })
})

test('options validation - clockTolerance', t => {
  t.throws(() => createVerifier({ secret: 'secret', clockTolerance: '123' }), {
    instanceOf: TokenError,
    message: 'The clockTolerance option must be a positive number.'
  })

  t.throws(() => createVerifier({ secret: 'secret', clockTolerance: -1 }), {
    instanceOf: TokenError,
    message: 'The clockTolerance option must be a positive number.'
  })
})

test('options validation - encoding', t => {
  t.throws(() => createVerifier({ secret: 'secret', encoding: 123 }), {
    instanceOf: TokenError,
    message: 'The encoding option must be a string.'
  })
})

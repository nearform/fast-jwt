'use strict'

const { test } = require('tap')
const { install: fakeTime } = require('lolex')
const { createSigner, createVerifier, TokenError } = require('../src')

function verify(token, options, callback) {
  const verifier = createVerifier({ secret: 'secret', ...options })
  return verifier(token, callback)
}

test('it correctly verifies a token - sync', t => {
  t.strictDeepEqual(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      noTimestamp: true
    }),
    { a: 1 }
  )

  t.strictDeepEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjIwMDAwMDAwMDAsImV4cCI6MjEwMDAwMDAwMH0.vrIO0e4YNXgzqdj7RcTqmP8AlCuvfYoxJCkma78eILA',
      { clockTimestamp: 2010000000 }
    ),
    { a: 1, iat: 2000000000, exp: 2100000000 }
  )

  t.equal(verify('eyJhbGciOiJIUzI1NiJ9.MTIz.UqiZ2LDYZqYB3xJgkHaihGQnJ_WPTz3hERDpA7bWYjA', { noTimestamp: true }), '123')

  t.equal(
    verify(Buffer.from('eyJhbGciOiJIUzI1NiJ9.MTIz.UqiZ2LDYZqYB3xJgkHaihGQnJ_WPTz3hERDpA7bWYjA'), {
      noTimestamp: true
    }),
    '123'
  )

  t.strictDeepEqual(
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

  t.equal(
    verify(Buffer.from('eyJhbGciOiJub25lIn0.MTIz.'), {
      noTimestamp: true,
      secret: ''
    }),
    '123'
  )

  t.end()
})

test('it correctly verifies a token - async - secret with callback', async t => {
  t.strictDeepEqual(
    await verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      secret: (_h, callback) => setTimeout(() => callback(null, 'secret'), 10),
      noTimestamp: true
    }),
    { a: 1 }
  )

  t.strictDeepEqual(
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
  t.strictDeepEqual(
    await verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      secret: async () => 'secret',
      noTimestamp: true
    }),
    { a: 1 }
  )
})

test('it correctly verifies a token - async - static secret', async t => {
  t.strictDeepEqual(
    await verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      noTimestamp: true
    }),
    { a: 1 }
  )
})

test('it correctly verifies a token - callback - secret as promise', t => {
  verify(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM',
    { secret: async () => 'secret', noTimestamp: true },
    (error, payload) => {
      t.type(error, 'null')
      t.strictDeepEqual(payload, { a: 1 })
      t.end()
    }
  )
})

test('it rejects invalid tokens', async t => {
  t.throws(() => verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-aaa', {}), {
    message: 'The token signature is invalid.'
  })

  await t.rejects(
    async () => {
      return verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-aaa', {
        secret: async () => 'secret'
      })
    },
    { message: 'The token signature is invalid.' }
  )
})

test('it requires a signature or a secret', async t => {
  t.throws(() => verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.', {}), {
    message: 'The token signature is missing.'
  })

  t.throws(
    () =>
      verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
        secret: ''
      }),
    { message: 'The secret is missing.' }
  )
})

test('it correctly handle errors - async callback', async t => {
  await t.rejects(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      secret: async () => {
        throw new Error('FAILED')
      }
    }),
    { message: 'Cannot fetch secret.' }
  )

  await t.rejects(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      secret: async () => {
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
      secret: (header, callback) => {
        callback(new Error('FAILED'))
      }
    },
    (error, token) => {
      t.true(error instanceof TokenError)
      t.equal(error.message, 'Cannot fetch secret.')

      t.end()
    }
  )
})

test('it correctly handle errors - evented callback', t => {
  verify(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM',
    {
      secret: (header, callback) => {
        process.nextTick(() => callback(null, 'FAILED'))
      }
    },
    (error, token) => {
      t.true(error instanceof TokenError)
      t.equal(error.message, 'The token signature is invalid.')

      t.end()
    }
  )
})

test('it handles decoding errors', async t => {
  t.throws(() => verify('TOKEN', { algorithms: ['RS256'], secret: 'secret' }), {
    message: 'The token is malformed.'
  })

  await t.rejects(async () => verify('TOKEN', { algorithms: ['RS256'], secret: () => 'secret' }), {
    message: 'The token is malformed.'
  })
})

test('it validates if the token is using an allowed algorithm - sync ', t => {
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjAsIm5iZiI6MjAwMDAwMDAwMH0.PlCCCgSnL38HaOY1-bkWnz-LX9WW2b772Zs3oxQJIv4',
        { algorithms: ['RS256'] }
      )
    },
    { message: 'The token algorithm is invalid.' }
  )

  t.end()
})

test('it validates if the token is active unless explicitily disabled', t => {
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjAsIm5iZiI6MjAwMDAwMDAwMH0.PlCCCgSnL38HaOY1-bkWnz-LX9WW2b772Zs3oxQJIv4',
        {}
      )
    },
    { message: 'The token will be active at 2033-05-18T03:33:20.000Z.' }
  )

  t.strictDeepEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjAsIm5iZiI6MjAwMDAwMDAwMH0.PlCCCgSnL38HaOY1-bkWnz-LX9WW2b772Zs3oxQJIv4',
      {
        ignoreNotBefore: true
      }
    ),
    { a: 1, iat: 0, nbf: 2000000000 }
  )

  t.end()
})

test('it validates if the token has not expired (via exp) unless explicitily disabled', t => {
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwiZXhwIjoxMDF9.ULKqTsvUYm7iNOKA6bP5NXsa1A8vofgPIGiC182Vf_Q',
        {}
      )
    },
    { message: 'The token has expired at 1970-01-01T00:01:41.000Z.' }
  )

  t.strictDeepEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMCwiZXhwIjoxMDF9.ULKqTsvUYm7iNOKA6bP5NXsa1A8vofgPIGiC182Vf_Q',
      {
        ignoreExpiration: true
      }
    ),
    { a: 1, iat: 100, exp: 101 }
  )

  t.end()
})

test('it validates if the token has not expired (via maxAge) only if explicitily enabled', t => {
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMH0.5V5yFNSqmn0w6yDR1vUbykF36WwdQmADMTLJwiJtx8w',
        { maxAge: 200000 }
      )
    },
    { message: 'The token has expired at 1970-01-01T00:05:00.000Z.' }
  )

  t.strictDeepEqual(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjEwMH0.5V5yFNSqmn0w6yDR1vUbykF36WwdQmADMTLJwiJtx8w'),
    { a: 1, iat: 100 }
  )

  t.end()
})

test('it validates the jti claim only if explicitily enabled', t => {
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOjEsImF1ZCI6MiwiaXNzIjozLCJzdWIiOjQsIm5vbmNlIjo1fQ.J-oaiNMlIJfH1jlNZcRjcEXdG5La4lKGjYtoLMs8vKM',
        { allowedJti: 'JTI1' }
      )
    },
    { message: 'The jti claim must be a string.' }
  )

  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedJti: 'JTI1' }
      )
    },
    { message: 'The jti claim value is not allowed.' }
  )

  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedJti: [/abc/, 'cde'] }
      )
    },
    { message: 'The jti claim value is not allowed.' }
  )

  t.strictDeepEqual(
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

  t.strictDeepEqual(
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

  t.strictDeepEqual(
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

  t.end()
})

test('it validates the aud claim only if explicitily enabled', t => {
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOjEsImF1ZCI6MiwiaXNzIjozLCJzdWIiOjQsIm5vbmNlIjo1fQ.J-oaiNMlIJfH1jlNZcRjcEXdG5La4lKGjYtoLMs8vKM',
        { allowedAud: 'AUD2' }
      )
    },
    { message: 'The aud claim must be a string or an array of strings.' }
  )

  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOjEsImF1ZCI6WzIuMSwyLjJdLCJpc3MiOjMsInN1YiI6NCwibm9uY2UiOjV9._qE95j2r4UQ8BEXGZRv9stn5OLg1I3nQBEV4WKdABMg',
        { allowedAud: 'AUD2' }
      )
    },
    { message: 'The aud claim must be a string or an array of strings.' }
  )

  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedAud: 'AUD2' }
      )
    },
    { message: 'None of aud claim values is allowed.' }
  )

  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedAud: [/abc/, 'cde'] }
      )
    },
    { message: 'None of aud claim values is allowed.' }
  )

  t.strictDeepEqual(
    verify(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
      { allowedAud: 'AUD' }
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

  t.strictDeepEqual(
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

  t.strictDeepEqual(
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

  t.end()
})

test('it validates the iss claim only if explicitily enabled', t => {
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOjEsImF1ZCI6MiwiaXNzIjozLCJzdWIiOjQsIm5vbmNlIjo1fQ.J-oaiNMlIJfH1jlNZcRjcEXdG5La4lKGjYtoLMs8vKM',
        { allowedIss: 'ISS1' }
      )
    },
    { message: 'The iss claim must be a string.' }
  )

  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedIss: 'ISS1' }
      )
    },
    { message: 'The iss claim value is not allowed.' }
  )

  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedIss: [/abc/, 'cde'] }
      )
    },
    { message: 'The iss claim value is not allowed.' }
  )

  t.strictDeepEqual(
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

  t.strictDeepEqual(
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

  t.strictDeepEqual(
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

  t.end()
})

test('it validates the sub claim only if explicitily enabled', t => {
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOjEsImF1ZCI6MiwiaXNzIjozLCJzdWIiOjQsIm5vbmNlIjo1fQ.J-oaiNMlIJfH1jlNZcRjcEXdG5La4lKGjYtoLMs8vKM',
        { allowedSub: 'SUB1' }
      )
    },
    { message: 'The sub claim must be a string.' }
  )

  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedSub: 'SUB1' }
      )
    },
    { message: 'The sub claim value is not allowed.' }
  )

  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedSub: [/abc/, 'cde'] }
      )
    },
    { message: 'The sub claim value is not allowed.' }
  )

  t.strictDeepEqual(
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

  t.strictDeepEqual(
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

  t.strictDeepEqual(
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

  t.end()
})

test('it validates the nonce claim only if explicitily enabled', t => {
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOjEsImF1ZCI6MiwiaXNzIjozLCJzdWIiOjQsIm5vbmNlIjo1fQ.J-oaiNMlIJfH1jlNZcRjcEXdG5La4lKGjYtoLMs8vKM',
        { allowedNonce: 'NONCE1' }
      )
    },
    { message: 'The nonce claim must be a string.' }
  )

  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedNonce: 'NONCE1' }
      )
    },
    { message: 'The nonce claim value is not allowed.' }
  )

  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedNonce: [/abc/, 'cde'] }
      )
    },
    { message: 'The nonce claim value is not allowed.' }
  )

  t.strictDeepEqual(
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

  t.strictDeepEqual(
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

  t.strictDeepEqual(
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

  t.end()
})

test('token type validation', t => {
  t.throws(() => createVerifier({ secret: 'secret' })(123), {
    message: 'The token must be a string or a buffer.'
  })

  t.end()
})

test('options validation - secret', t => {
  t.throws(() => createVerifier({ secret: 123 }), {
    message: 'The secret option must be a string, a buffer or a function returning the algorithm secret or public key.'
  })

  t.end()
})

test('options validation - clockTimestamp', t => {
  t.throws(() => createVerifier({ secret: 'secret', clockTimestamp: '123' }), {
    message: 'The clockTimestamp option must be a positive number.'
  })

  t.throws(() => createVerifier({ secret: 'secret', clockTimestamp: -1 }), {
    message: 'The clockTimestamp option must be a positive number.'
  })

  t.end()
})

test('options validation - clockTolerance', t => {
  t.throws(() => createVerifier({ secret: 'secret', clockTolerance: '123' }), {
    message: 'The clockTolerance option must be a positive number.'
  })

  t.throws(() => createVerifier({ secret: 'secret', clockTolerance: -1 }), {
    message: 'The clockTolerance option must be a positive number.'
  })

  t.end()
})

test('options validation - encoding', t => {
  t.throws(() => createVerifier({ secret: 'secret', encoding: 123 }), {
    message: 'The encoding option must be a string.'
  })

  t.end()
})

test('cache support - sync', t => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.aaa'

  const verifier = createVerifier({ secret: 'secret', cache: true })

  t.equal(verifier.cache.size, 0)
  t.strictDeepEqual(verifier(token), { a: 1 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier(token), { a: 1 })
  t.equal(verifier.cache.size, 1)

  t.throws(() => verifier(invalidToken), { message: 'The token signature is invalid.' })
  t.equal(verifier.cache.size, 2)
  t.throws(() => verifier(invalidToken), { message: 'The token signature is invalid.' })
  t.equal(verifier.cache.size, 2)

  t.strictDeepEqual(verifier.cache.get(token)[0], { a: 1 })
  t.true(verifier.cache.get(invalidToken)[0] instanceof TokenError)

  t.end()
})

test('cache support - async', async t => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.aaa'

  const verifier = createVerifier({ secret: async () => 'secret', cache: true })

  t.equal(verifier.cache.size, 0)
  t.strictDeepEqual(await verifier(token), { a: 1 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(await verifier(token), { a: 1 })
  t.equal(verifier.cache.size, 1)

  await t.rejects(async () => verifier(invalidToken), { message: 'The token signature is invalid.' })
  t.equal(verifier.cache.size, 2)
  await t.rejects(async () => verifier(invalidToken), { message: 'The token signature is invalid.' })
  t.equal(verifier.cache.size, 2)

  t.strictDeepEqual(verifier.cache.get(token)[0], { a: 1 })
  t.true(verifier.cache.get(invalidToken)[0] instanceof TokenError)
})

test('cache support - should correctly expire cached token using the exp claim', t => {
  const clock = fakeTime({ now: 100000 })

  const signer = createSigner({ secret: 'secret', expiresIn: 100000 })
  const verifier = createVerifier({ secret: 'secret', cache: true })
  const token = signer({ a: 1 })

  // First of all, make a token and verify it's cached
  t.equal(verifier.cache.size, 0)
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100, exp: 200 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100, exp: 200 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier.cache.get(token), [{ a: 1, iat: 100, exp: 200 }, 0, 200000])

  // Now advance to expired time
  clock.tick(200000)

  // The token should now be expired and the cache should have been updated to reflect it
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })
  t.equal(verifier.cache.size, 1)
  t.true(verifier.cache.get(token)[0] instanceof TokenError)

  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })

  clock.uninstall()

  // Now the real time is used, make cache considers the clockTimestamp algorithm
  verifier.cache.clear()
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })
  t.equal(verifier.cache.size, 1)
  t.true(verifier.cache.get(token)[0] instanceof TokenError)

  const verifierWithTimestamp = createVerifier({ secret: 'secret', cache: true, clockTimestamp: 100000 })
  t.strictDeepEqual(verifierWithTimestamp(token), { a: 1, iat: 100, exp: 200 })
  t.equal(verifierWithTimestamp.cache.size, 1)
  t.strictDeepEqual(verifierWithTimestamp.cache.get(token), [{ a: 1, iat: 100, exp: 200 }, 0, 200000])

  t.end()
})

test('cache support - should correctly expire cached token using the maxAge claim', t => {
  const clock = fakeTime({ now: 100000 })

  const signer = createSigner({ secret: 'secret' })
  const verifier = createVerifier({ secret: 'secret', cache: true, maxAge: 100000 })
  const token = signer({ a: 1 })

  // First of all, make a token and verify it's cached
  t.equal(verifier.cache.size, 0)
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier.cache.get(token), [{ a: 1, iat: 100 }, 0, 200000])

  // Now advance to expired time
  clock.tick(200000)

  // The token should now be expired and the cache should have been updated to reflect it
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })
  t.equal(verifier.cache.size, 1)
  t.true(verifier.cache.get(token)[0] instanceof TokenError)
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })

  clock.uninstall()
  t.end()
})

test('cache support - should correctly expire not yet cached token using the nbf claim', t => {
  const clock = fakeTime({ now: 100000 })

  const signer = createSigner({ secret: 'secret', notBefore: 200000 })
  const verifier = createVerifier({ secret: 'secret', cache: true })
  const token = signer({ a: 1 })

  // First of all, make a token and verify it's cached and rejected
  t.equal(verifier.cache.size, 0)
  t.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:05:00.000Z.' })
  t.equal(verifier.cache.size, 1)
  t.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:05:00.000Z.' })
  t.true(verifier.cache.get(token)[0] instanceof TokenError)

  // Now advance to expired time
  clock.tick(200000)

  // The token should now be active and the cache should have been updated to reflect it
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100, nbf: 300 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100, nbf: 300 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier.cache.get(token), [{ a: 1, iat: 100, nbf: 300 }, 300000, 0])

  clock.uninstall()
  t.end()
})

test('cache support - should be able to consider both nbf and exp field at the same time', t => {
  const clock = fakeTime({ now: 100000 })

  const signer = createSigner({ secret: 'secret', expiresIn: 400000, notBefore: 200000 })
  const verifier = createVerifier({ secret: 'secret', cache: true })
  const token = signer({ a: 1 })

  // At the beginning, the token is not active yet
  t.equal(verifier.cache.size, 0)
  t.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:05:00.000Z.' })
  t.equal(verifier.cache.size, 1)
  t.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:05:00.000Z.' })
  t.true(verifier.cache.get(token)[0] instanceof TokenError)

  // Now advance to activation time
  clock.tick(200000)

  // The token should now be active and the cache should have been updated to reflect it
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier.cache.get(token), [{ a: 1, iat: 100, nbf: 300, exp: 500 }, 300000, 500000])

  // Now advance again after the expiry time
  clock.tick(210000)

  // The token should now be expired and the cache should have been updated to reflect it
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:08:20.000Z.' })
  t.equal(verifier.cache.size, 1)
  t.true(verifier.cache.get(token)[0] instanceof TokenError)
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:08:20.000Z.' })
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:08:20.000Z.' })

  clock.uninstall()
  t.end()
})

test('cache support - should ignore the nbf and exp when asked to', t => {
  const clock = fakeTime({ now: 100000 })

  const signer = createSigner({ secret: 'secret', expiresIn: 400000, notBefore: 200000 })
  const verifier = createVerifier({ secret: 'secret', cache: true })
  const verifierNoNbf = createVerifier({ secret: 'secret', cache: true, ignoreNotBefore: true })
  const verifierNoExp = createVerifier({ secret: 'secret', cache: true, ignoreExpiration: true })
  const token = signer({ a: 1 })

  // At the beginning, the token is not active yet
  t.equal(verifier.cache.size, 0)
  t.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:05:00.000Z.' })
  t.equal(verifier.cache.size, 1)
  t.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:05:00.000Z.' })
  t.true(verifier.cache.get(token)[0] instanceof TokenError)

  // For the verifier which ignores notBefore, the token is already active
  t.strictDeepEqual(verifierNoNbf(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.equal(verifierNoNbf.cache.size, 1)
  t.strictDeepEqual(verifierNoNbf(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.equal(verifierNoNbf.cache.size, 1)
  t.strictDeepEqual(verifierNoNbf.cache.get(token), [{ a: 1, iat: 100, nbf: 300, exp: 500 }, 0, 500000])

  // Now advance to activation time
  clock.tick(200000)

  // The token should now be active and the cache should have been updated to reflect it
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier.cache.get(token), [{ a: 1, iat: 100, nbf: 300, exp: 500 }, 300000, 500000])

  // Now advance again after the expiry time
  clock.tick(210000)

  // The token should now be expired and the cache should have been updated to reflect it
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:08:20.000Z.' })
  t.equal(verifier.cache.size, 1)
  t.true(verifier.cache.get(token)[0] instanceof TokenError)
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:08:20.000Z.' })
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:08:20.000Z.' })

  // For the verifier which ignores expiration, the token is still active
  t.strictDeepEqual(verifierNoExp(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.equal(verifierNoExp.cache.size, 1)
  t.strictDeepEqual(verifierNoExp(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.equal(verifierNoExp.cache.size, 1)
  t.strictDeepEqual(verifierNoExp.cache.get(token), [{ a: 1, iat: 100, nbf: 300, exp: 500 }, 300000, 0])

  clock.uninstall()
  t.end()
})

'use strict'

const { createHash } = require('crypto')
const { readFileSync } = require('fs')
const { resolve } = require('path')
const { test } = require('tap')
const { install: fakeTime } = require('@sinonjs/fake-timers')

const { createSigner, createVerifier, TokenError } = require('../src')
const { useNewCrypto } = require('../src/crypto')
const { hashToken } = require('../src/utils')

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

function verify(token, options, callback) {
  const verifier = createVerifier({ key: 'secret', ...options })
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

  t.strictDeepEqual(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      checkTyp: 'jwt',
      noTimestamp: true
    }),
    { a: 1 }
  )

  t.strictDeepEqual(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6ImFwcGxpY2F0aW9uL2p3dCJ9.eyJhIjoxfQ.1ptuaNj5R0owE-5663LpMknK3eRgZVDHkMkOKkxlteM', {
      checkTyp: 'jwt'
    }),
    { a: 1 }
  )

  t.throws(
    () =>
      verify(
        'eyJhbGciOiJIUzI1NiJ9.eyJhIjoxfQ.LrlPmSL4FxrzAHJSYbKzsA997COXdYCeFKlt3zt5DIY',
        { checkTyp: 'test' }
      ),
    {
      message: 'Invalid typ.'
    }
  )

  t.throws(
    () =>
      verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6MX0.eyJhIjoxfQ.V6I7eoKYlMG7ipqpsWoZcNZaGOVGPom0rnztq1q2tS4',
        { checkTyp: 'JWT' }
      ),
    {
      message: 'Invalid typ.'
    }
  )

  t.strictDeepEqual(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      noTimestamp: true,
      complete: true
    }),
    {
      header: { typ: 'JWT', alg: 'HS256' },
      payload: { a: 1 },
      signature: '57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
    }
  )

  if (useNewCrypto) {
    t.strictDeepEqual(
      verify(
        'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCIsImt0eSI6Ik9LUCIsImNydiI6IkVkMjU1MTkifQ.eyJhIjoxfQ.n4isU7JqaKRVOyx2ni7b_iaAzB75pAUCW6CetcoClhtJ5yDM7YkNMbKqmDUhTKMpupAcztIjX8m4mZwpA33HAA',
        { key: publicKeys.Ed25519 }
      ),
      { a: 1 }
    )
  } else {
    t.throws(
      () =>
        verify(
          'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCIsImt0eSI6Ik9LUCIsImNydiI6IkVkMjU1MTkifQ.eyJhIjoxfQ.n4isU7JqaKRVOyx2ni7b_iaAzB75pAUCW6CetcoClhtJ5yDM7YkNMbKqmDUhTKMpupAcztIjX8m4mZwpA33HAA',
          { key: publicKeys.Ed25519 }
        ),
      {
        message: 'Cannot verify the signature.',
        originalError: {
          message: 'EdDSA algorithms are not supported by your Node.js version.'
        }
      }
    )
  }

  t.end()
})

test('it correctly verifies a token - async - key with callback', async t => {
  t.strictDeepEqual(
    await verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      key: (_h, callback) => setTimeout(() => callback(null, 'secret'), 10),
      noTimestamp: true
    }),
    { a: 1 }
  )

  t.strictDeepEqual(
    await verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      algorithms: ['HS256'],
      key: (_h, callback) => setTimeout(() => callback(null, 'secret'), 10),
      noTimestamp: true,
      complete: true
    }),
    {
      header: { typ: 'JWT', alg: 'HS256' },
      payload: { a: 1 },
      signature: '57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
    }
  )
})

test('it correctly verifies a token - async - key as promise', async t => {
  t.strictDeepEqual(
    await verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      key: async () => Buffer.from('secret', 'utf-8'),
      noTimestamp: true
    }),
    { a: 1 }
  )
})

test('it correctly verifies a token - async - static key', async t => {
  t.strictDeepEqual(
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
        key: async () => 'secret'
      })
    },
    { message: 'The token signature is invalid.' }
  )
})

test('it requires a signature or a key', async t => {
  t.throws(() => verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.', {}), {
    message: 'The token signature is missing.'
  })

  t.throws(
    () =>
      verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
        key: ''
      }),
    { message: 'The key option is missing.' }
  )
})

test('it correctly handle errors - async callback', async t => {
  await t.rejects(
    verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM', {
      key: async () => {
        throw new Error('FAILED')
      }
    }),
    { message: 'Cannot fetch key.' }
  )

  await t.rejects(
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
      key: (header, callback) => {
        callback(new Error('FAILED'))
      }
    },
    (error, token) => {
      t.true(error instanceof TokenError)
      t.equal(error.message, 'Cannot fetch key.')

      t.end()
    }
  )
})

test('it correctly handle errors - evented callback', t => {
  verify(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM',
    {
      key: (header, callback) => {
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
  t.throws(() => verify('TOKEN', { algorithms: ['HS256'], key: 'secret' }), {
    message: 'The token is malformed.'
  })

  await t.rejects(async () => verify('TOKEN', { algorithms: ['HS256'], key: () => 'secret' }), {
    message: 'The token is malformed.'
  })
})

test('it validates if the token is using an allowed algorithm - sync ', t => {
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjAsIm5iZiI6MjAwMDAwMDAwMH0.PlCCCgSnL38HaOY1-bkWnz-LX9WW2b772Zs3oxQJIv4',
        { algorithms: ['RS256', 'PS256'], key: publicKeys.RS }
      )
    },
    { message: 'The token algorithm is invalid.' }
  )

  t.end()
})

test('it validates if the public is consistent with the allowed algorithms - sync ', t => {
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpYXQiOjAsIm5iZiI6MjAwMDAwMDAwMH0.PlCCCgSnL38HaOY1-bkWnz-LX9WW2b772Zs3oxQJIv4',
        { algorithms: ['ES256'], key: publicKeys.RS }
      )
    },
    { message: 'Invalid public key provided for algorithms ES256.' }
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
    { message: 'None of aud claim values are allowed.' }
  )

  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJqdGkiOiJKVEkiLCJhdWQiOlsiQVVEMSIsIkRVQTIiXSwiaXNzIjoiSVNTIiwic3ViIjoiU1VCIiwibm9uY2UiOiJOT05DRSJ9.8fqzi23J-GjaD7rW3OYJv8UtBYkx8MOkViJjS4sXmVw',
        { allowedAud: [/abc/, 'cde'] }
      )
    },
    { message: 'None of aud claim values are allowed.' }
  )

  t.strictDeepEqual(
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

test('it validates allowed claims values using equality when appropriate', t => {
  // The iss claim in the token starts with ISS
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpc3MiOiJJU1NfUFJFRklYIn0.yAVrfuzH-1H_dzd8YhDV2ukWAGHB4DY4Wiv1cqz1JaY',
        { allowedIss: 'ISS' }
      )
    },
    { message: 'The iss claim value is not allowed.' }
  )

  // The iss claim in the token ends with ISS
  t.throws(
    () => {
      return verify(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJpc3MiOiJTVUZGSVhfSVNTIn0.YNfIVGQCnIk0sQzsvOnLl_ueRs64m2M2BgiKyczzsAk',
        { allowedIss: 'ISS' }
      )
    },
    { message: 'The iss claim value is not allowed.' }
  )

  t.end()
})

test('token type validation', t => {
  t.throws(() => createVerifier({ key: 'secret' })(123), {
    message: 'The token must be a string or a buffer.'
  })

  t.end()
})

test('options validation - key', t => {
  t.throws(() => createVerifier({ key: 123 }), {
    message: 'The key option must be a string, a buffer or a function returning the algorithm secret or public key.'
  })

  t.end()
})

test('options validation - clockTimestamp', t => {
  t.throws(() => createVerifier({ key: 'secret', clockTimestamp: '123' }), {
    message: 'The clockTimestamp option must be a positive number.'
  })

  t.throws(() => createVerifier({ key: 'secret', clockTimestamp: -1 }), {
    message: 'The clockTimestamp option must be a positive number.'
  })

  t.end()
})

test('options validation - clockTolerance', t => {
  t.throws(() => createVerifier({ key: 'secret', clockTolerance: '123' }), {
    message: 'The clockTolerance option must be a positive number.'
  })

  t.throws(() => createVerifier({ key: 'secret', clockTolerance: -1 }), {
    message: 'The clockTolerance option must be a positive number.'
  })

  t.end()
})

test('options validation - cacheTTL', t => {
  t.throws(() => createVerifier({ key: 'secret', cacheTTL: '123' }), {
    message: 'The cacheTTL option must be a positive number.'
  })

  t.throws(() => createVerifier({ key: 'secret', cacheTTL: -1 }), {
    message: 'The cacheTTL option must be a positive number.'
  })

  t.end()
})

test('caching - sync', t => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.aaa'

  const verifier = createVerifier({ key: 'secret', cache: true })

  t.equal(verifier.cache.size, 0)
  t.strictDeepEqual(verifier(token), { a: 1 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier(token), { a: 1 })
  t.equal(verifier.cache.size, 1)

  t.throws(() => verifier(invalidToken), { message: 'The token signature is invalid.' })
  t.equal(verifier.cache.size, 2)
  t.throws(() => verifier(invalidToken), { message: 'The token signature is invalid.' })
  t.equal(verifier.cache.size, 2)

  t.strictDeepEqual(verifier.cache.get(hashToken(token))[0], { a: 1 })
  t.true(verifier.cache.get(hashToken(invalidToken))[0] instanceof TokenError)

  t.end()
})

test('caching - async', async t => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.57TF7smP9XDhIexBqPC-F1toZReYZLWb_YRU5tv0sxM'
  const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxfQ.aaa'

  const verifier = createVerifier({ key: async () => 'secret', cache: true })

  t.equal(verifier.cache.size, 0)
  t.strictDeepEqual(await verifier(token), { a: 1 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(await verifier(token), { a: 1 })
  t.equal(verifier.cache.size, 1)

  await t.rejects(async () => verifier(invalidToken), { message: 'The token signature is invalid.' })
  t.equal(verifier.cache.size, 2)
  await t.rejects(async () => verifier(invalidToken), { message: 'The token signature is invalid.' })
  t.equal(verifier.cache.size, 2)

  t.strictDeepEqual(verifier.cache.get(hashToken(token))[0], { a: 1 })
  t.true(verifier.cache.get(hashToken(invalidToken))[0] instanceof TokenError)
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

      const hash = createHash(`sha${bits}`)
        .update(token)
        .digest('hex')

      t.strictDeepEqual(verifier(token), { a: 1 })
      t.equal(verifier.cache.size, 1)
      t.equal(Array.from(verifier.cache.keys())[0], hash)

      t.end()
    })
  }
}

if (useNewCrypto) {
  test('caching - should use the right hash method for storing values - EdDSA with Ed25519', t => {
    const signer = createSigner({ algorithm: 'EdDSA', key: privateKeys.Ed25519, noTimestamp: 1 })
    const verifier = createVerifier({ key: publicKeys.Ed25519, cache: true })
    const token = signer({ a: 1 })
    const hash = createHash('sha512')
      .update(token)
      .digest('hex')

    t.strictDeepEqual(verifier(token), { a: 1 })
    t.equal(verifier.cache.size, 1)
    t.equal(Array.from(verifier.cache.keys())[0], hash)

    t.end()
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
    const hash = createHash('shake256', { outputLength: 114 })
      .update(token)
      .digest('hex')

    t.strictDeepEqual(verifier(token), { a: 1 })
    t.equal(verifier.cache.size, 1)
    t.equal(Array.from(verifier.cache.keys())[0], hash)

    t.end()
  })
}

test('caching - should be able to manipulate cache directy', t => {
  const clock = fakeTime({ now: 100000 })

  const signer = createSigner({ key: 'secret', expiresIn: 100000 })
  const verifier = createVerifier({ key: 'secret', cache: true })
  const token = signer({ a: 1 })

  t.equal(verifier.cache.size, 0)
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100, exp: 200 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier.cache.get(hashToken(token)), [{ a: 1, iat: 100, exp: 200 }, 0, 200000])
  verifier.cache.clear()
  t.equal(verifier.cache.size, 0)
  verifier.cache.set(token, 'WHATEVER')
  t.strictDeepEqual(verifier.cache.get(token), 'WHATEVER')
  verifier.cache.set(token, null)
  t.strictDeepEqual(verifier.cache.get(token), null)

  clock.uninstall()

  t.end()
})

test('caching - should correctly expire cached token using the exp claim', t => {
  const clock = fakeTime({ now: 100000 })

  const signer = createSigner({ key: 'secret', expiresIn: 100000 })
  const verifier = createVerifier({ key: 'secret', cache: true })
  const token = signer({ a: 1 })

  // First of all, make a token and verify it's cached
  t.equal(verifier.cache.size, 0)
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100, exp: 200 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100, exp: 200 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier.cache.get(hashToken(token)), [{ a: 1, iat: 100, exp: 200 }, 0, 200000])

  // Now advance to expired time
  clock.tick(200000)

  // The token should now be expired and the cache should have been updated to reflect it
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })
  t.equal(verifier.cache.size, 1)
  t.true(verifier.cache.get(hashToken(token))[0] instanceof TokenError)

  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })

  clock.uninstall()

  // Now the real time is used, make cache considers the clockTimestamp algorithm
  verifier.cache.clear()
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })
  t.equal(verifier.cache.size, 1)
  t.true(verifier.cache.get(hashToken(token))[0] instanceof TokenError)

  const verifierWithTimestamp = createVerifier({ key: 'secret', cache: true, clockTimestamp: 100000 })
  t.strictDeepEqual(verifierWithTimestamp(token), { a: 1, iat: 100, exp: 200 })
  t.equal(verifierWithTimestamp.cache.size, 1)
  t.strictDeepEqual(verifierWithTimestamp.cache.get(hashToken(token)), [{ a: 1, iat: 100, exp: 200 }, 0, 200000])

  t.end()
})

test('caching - should correctly expire cached token using the maxAge claim', t => {
  const clock = fakeTime({ now: 100000 })

  const signer = createSigner({ key: 'secret' })
  const verifier = createVerifier({ key: 'secret', cache: true, maxAge: 100000 })
  const token = signer({ a: 1 })

  // First of all, make a token and verify it's cached
  t.equal(verifier.cache.size, 0)
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier.cache.get(hashToken(token)), [{ a: 1, iat: 100 }, 0, 200000])

  // Now advance to expired time
  clock.tick(200000)

  // The token should now be expired and the cache should have been updated to reflect it
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })
  t.equal(verifier.cache.size, 1)
  t.true(verifier.cache.get(hashToken(token))[0] instanceof TokenError)
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:03:20.000Z.' })

  clock.uninstall()
  t.end()
})

test('caching - should correctly expire not yet cached token using the nbf claim', t => {
  const clock = fakeTime({ now: 100000 })

  const signer = createSigner({ key: 'secret', notBefore: 200000 })
  const verifier = createVerifier({ key: 'secret', cache: true })
  const token = signer({ a: 1 })

  // First of all, make a token and verify it's cached and rejected
  t.equal(verifier.cache.size, 0)
  t.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:05:00.000Z.' })
  t.equal(verifier.cache.size, 1)
  t.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:05:00.000Z.' })
  t.true(verifier.cache.get(hashToken(token))[0] instanceof TokenError)

  // Now advance to expired time
  clock.tick(200000)

  // The token should now be active and the cache should have been updated to reflect it
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100, nbf: 300 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100, nbf: 300 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier.cache.get(hashToken(token)), [{ a: 1, iat: 100, nbf: 300 }, 300000, 900000])

  clock.uninstall()
  t.end()
})

test('caching - should be able to consider both nbf and exp field at the same time', t => {
  const clock = fakeTime({ now: 100000 })

  const signer = createSigner({ key: 'secret', expiresIn: 400000, notBefore: 200000 })
  const verifier = createVerifier({ key: 'secret', cache: true })
  const token = signer({ a: 1 })

  // At the beginning, the token is not active yet
  t.equal(verifier.cache.size, 0)
  t.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:05:00.000Z.' })
  t.equal(verifier.cache.size, 1)
  t.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:05:00.000Z.' })
  t.true(verifier.cache.get(hashToken(token))[0] instanceof TokenError)

  // Now advance to activation time
  clock.tick(200000)

  // The token should now be active and the cache should have been updated to reflect it
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier.cache.get(hashToken(token)), [{ a: 1, iat: 100, nbf: 300, exp: 500 }, 300000, 500000])

  // Now advance again after the expiry time
  clock.tick(210000)

  // The token should now be expired and the cache should have been updated to reflect it
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:08:20.000Z.' })
  t.equal(verifier.cache.size, 1)
  t.true(verifier.cache.get(hashToken(token))[0] instanceof TokenError)
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:08:20.000Z.' })
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:08:20.000Z.' })

  clock.uninstall()
  t.end()
})

test('caching - should ignore the nbf and exp when asked to', t => {
  const clock = fakeTime({ now: 100000 })

  const signer = createSigner({ key: 'secret', expiresIn: 400000, notBefore: 200000 })
  const verifier = createVerifier({ key: 'secret', cache: true })
  const verifierNoNbf = createVerifier({ key: 'secret', cache: true, ignoreNotBefore: true })
  const verifierNoExp = createVerifier({ key: 'secret', cache: true, ignoreExpiration: true })
  const token = signer({ a: 1 })

  // At the beginning, the token is not active yet
  t.equal(verifier.cache.size, 0)
  t.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:05:00.000Z.' })
  t.equal(verifier.cache.size, 1)
  t.throws(() => verifier(token), { message: 'The token will be active at 1970-01-01T00:05:00.000Z.' })
  t.true(verifier.cache.get(hashToken(token))[0] instanceof TokenError)

  // For the verifier which ignores notBefore, the token is already active
  t.strictDeepEqual(verifierNoNbf(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.equal(verifierNoNbf.cache.size, 1)
  t.strictDeepEqual(verifierNoNbf(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.equal(verifierNoNbf.cache.size, 1)
  t.strictDeepEqual(verifierNoNbf.cache.get(hashToken(token)), [{ a: 1, iat: 100, nbf: 300, exp: 500 }, 0, 500000])

  // Now advance to activation time
  clock.tick(200000)

  // The token should now be active and the cache should have been updated to reflect it
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.equal(verifier.cache.size, 1)
  t.strictDeepEqual(verifier.cache.get(hashToken(token)), [{ a: 1, iat: 100, nbf: 300, exp: 500 }, 300000, 500000])

  // Now advance again after the expiry time
  clock.tick(210000)

  // The token should now be expired and the cache should have been updated to reflect it
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:08:20.000Z.' })
  t.equal(verifier.cache.size, 1)
  t.true(verifier.cache.get(hashToken(token))[0] instanceof TokenError)
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:08:20.000Z.' })
  t.throws(() => verifier(token), { message: 'The token has expired at 1970-01-01T00:08:20.000Z.' })

  // For the verifier which ignores expiration, the token is still active
  t.strictDeepEqual(verifierNoExp(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.equal(verifierNoExp.cache.size, 1)
  t.strictDeepEqual(verifierNoExp(token), { a: 1, iat: 100, nbf: 300, exp: 500 })
  t.equal(verifierNoExp.cache.size, 1)
  t.strictDeepEqual(verifierNoExp.cache.get(hashToken(token)), [
    { a: 1, iat: 100, nbf: 300, exp: 500 },
    300000,
    1110000
  ])

  clock.uninstall()
  t.end()
})

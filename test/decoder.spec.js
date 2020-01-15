const test = require('ava')

const { createDecoder, TokenError } = require('../src')

const defaultDecoder = createDecoder()
const jsonDecoder = createDecoder({ json: true })
const completeDecoder = createDecoder({ complete: true })

test('should return a valid token', t => {
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik9LIiwiaWF0Ijo5ODc2NTQzMjEwfQ.gWCa6uhcbaAgVmJC46OAIl-9yTBDAdIphDq_NP6fenY'
  const nonJwtToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVEFBIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik9LIiwiaWF0Ijo5ODc2NTQzMjEwfQ.Tauq025SLRNP4qTYsr_FHXwjQ_ZTsAjBGwE-2h6if4k'

  t.deepEqual(defaultDecoder(token), { sub: '1234567890', name: 'OK', iat: 9876543210 })

  t.deepEqual(completeDecoder(Buffer.from(token)), {
    header: {
      alg: 'HS256',
      typ: 'JWT'
    },
    payload: {
      sub: '1234567890',
      name: 'OK',
      iat: 9876543210
    },
    signature: 'gWCa6uhcbaAgVmJC46OAIl+9yTBDAdIphDq/NP6fenY='
  })

  t.deepEqual(defaultDecoder(nonJwtToken), '{"sub":"1234567890","name":"OK","iat":9876543210}')
  t.deepEqual(jsonDecoder(nonJwtToken), { sub: '1234567890', name: 'OK', iat: 9876543210 })
})

test('token must be a string', t => {
  for (const token of [false, null, 0, NaN, []]) {
    t.throws(() => defaultDecoder(token), {
      instanceOf: TokenError,
      message: 'The token must be a string or a buffer.'
    })
  }
})

test('token must be well formed', t => {
  for (const token of ['foo', 'foo.bar', 'foo.bar.{{']) {
    t.throws(() => defaultDecoder(token), {
      instanceOf: TokenError,
      message: 'The token is malformed.'
    })
  }
})

test('invalid header', t => {
  t.throws(() => defaultDecoder('aaa.bbb.ccc'), {
    instanceOf: TokenError,
    message: 'The token header is not a valid base64url serialized JSON.'
  })

  t.throws(() => defaultDecoder('Zm9v.bbb.ccc'), {
    instanceOf: TokenError,
    message: 'The token header is not a valid base64url serialized JSON.'
  })
})

test('invalid payload', t => {
  t.throws(() => defaultDecoder('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.bbb.ccc'), {
    instanceOf: TokenError,
    message: 'The token payload is not a valid base64url serialized JSON.'
  })
})

'use strict'

const { test } = require('tap')

const { createDecoder, TokenError } = require('../src')

const defaultDecoder = createDecoder()
const jsonDecoder = createDecoder({ json: true })
const completeDecoder = createDecoder({ complete: true })
const cachedDecoder = createDecoder({ cache: 10 })

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik9LIiwiaWF0Ijo5ODc2NTQzMjEwfQ.gWCa6uhcbaAgVmJC46OAIl-9yTBDAdIphDq_NP6fenY'
const nonJwtToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVEFBIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik9LIiwiaWF0Ijo5ODc2NTQzMjEwfQ.Tauq025SLRNP4qTYsr_FHXwjQ_ZTsAjBGwE-2h6if4k'

test('should return a valid token', t => {
  t.strictDeepEqual(defaultDecoder(token), { sub: '1234567890', name: 'OK', iat: 9876543210 })

  t.strictDeepEqual(completeDecoder(Buffer.from(token)), {
    header: {
      alg: 'HS256',
      typ: 'JWT'
    },
    payload: {
      sub: '1234567890',
      name: 'OK',
      iat: 9876543210
    },
    signature: 'gWCa6uhcbaAgVmJC46OAIl+9yTBDAdIphDq/NP6fenY=',
    input: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik9LIiwiaWF0Ijo5ODc2NTQzMjEwfQ'
  })

  t.strictDeepEqual(defaultDecoder(nonJwtToken), '{"sub":"1234567890","name":"OK","iat":9876543210}')
  t.strictDeepEqual(jsonDecoder(nonJwtToken), { sub: '1234567890', name: 'OK', iat: 9876543210 })

  t.end()
})

test('token must be a string', t => {
  for (const token of [false, null, 0, NaN, []]) {
    t.throws(() => defaultDecoder(token), { message: 'The token must be a string or a buffer.' })
  }

  t.end()
})

test('token must be well formed', t => {
  for (const token of ['foo', 'foo.bar']) {
    t.throws(() => defaultDecoder(token), { message: 'The token is malformed.' })
  }

  t.end()
})

test('invalid header', t => {
  t.throws(() => defaultDecoder('a.b.c'), { message: 'The token header is not a valid base64url serialized JSON.' })

  t.throws(() => defaultDecoder('Zm9v.b.c'), { message: 'The token header is not a valid base64url serialized JSON.' })

  t.end()
})

test('invalid payload', t => {
  t.throws(() => defaultDecoder('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.bbb.ccc'), {
    message: 'The token payload is not a valid base64url serialized JSON.'
  })

  t.end()
})

test('caching', t => {
  t.equal(cachedDecoder.cache.size, 0)
  t.strictDeepEqual(cachedDecoder(token), { sub: '1234567890', name: 'OK', iat: 9876543210 })
  t.equal(cachedDecoder.cache.size, 1)
  t.strictDeepEqual(cachedDecoder(token), { sub: '1234567890', name: 'OK', iat: 9876543210 })
  t.equal(cachedDecoder.cache.size, 1)

  t.throws(() => cachedDecoder('a.b.c'), { message: 'The token header is not a valid base64url serialized JSON.' })
  t.equal(cachedDecoder.cache.size, 2)
  t.throws(() => cachedDecoder('a.b.c'), { message: 'The token header is not a valid base64url serialized JSON.' })
  t.equal(cachedDecoder.cache.size, 2)

  t.strictDeepEqual(cachedDecoder.cache.get(token), { sub: '1234567890', name: 'OK', iat: 9876543210 })
  t.true(cachedDecoder.cache.get('a.b.c') instanceof TokenError)

  t.end()
})

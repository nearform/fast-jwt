'use strict'

const { test } = require('tap')

const { createDecoder } = require('../src')

const defaultDecoder = createDecoder()
const rawDecoder = createDecoder({ json: false })
const completeDecoder = createDecoder({ complete: true })

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik9LIiwiaWF0Ijo5ODc2NTQzMjEwfQ.gWCa6uhcbaAgVmJC46OAIl-9yTBDAdIphDq_NP6fenY'
const nonJwtToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVEFBIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik9LIiwiaWF0Ijo5ODc2NTQzMjEwfQ.Tauq025SLRNP4qTYsr_FHXwjQ_ZTsAjBGwE-2h6if4k'

test('should return a valid token', t => {
  t.strictDeepEqual(defaultDecoder(token), { sub: '1234567890', name: 'OK', iat: 9876543210 })

  t.strictDeepEqual(completeDecoder(Buffer.from(token, 'utf-8')), {
    header: {
      alg: 'HS256',
      typ: 'JWT'
    },
    payload: {
      sub: '1234567890',
      name: 'OK',
      iat: 9876543210
    },
    signature: 'gWCa6uhcbaAgVmJC46OAIl-9yTBDAdIphDq_NP6fenY',
    input: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik9LIiwiaWF0Ijo5ODc2NTQzMjEwfQ'
  })

  t.strictDeepEqual(defaultDecoder(nonJwtToken), { sub: '1234567890', name: 'OK', iat: 9876543210 })
  t.strictDeepEqual(rawDecoder(nonJwtToken), '{"sub":"1234567890","name":"OK","iat":9876543210}')

  t.end()
})

test('token must be a string', t => {
  for (const token of [false, null, 0, NaN, [], { a: 1 }]) {
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

// https://tools.ietf.org/html/rfc7519#section-7.2
//
// 10.  Verify that the resulting octet sequence is a UTF-8-encoded
//      representation of a completely valid JSON object conforming to
//      RFC 7159 [RFC7159]; let the JWT Claims Set be this JSON object.
test('payload must be a JSON object', t => {
  t.throws(() => defaultDecoder('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.MTIz.5frDWv6bqXyHPXl3oZYOTnALMCGwfEYjQZbke2iyR3Y'), {
    message: 'The payload must be an object'
  })

  t.end()
})

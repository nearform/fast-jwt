'use strict'

const { test } = require('tap')

const { base64UrlDecode, base64UrlEncode } = require('../src/utils')

test('base64UrlEncode should correctly convert formats', t => {
  t.equal(base64UrlEncode('YW55IGN+hcm5hb+CBwb/GVhc3VyZS4='), 'YW55IGN-hcm5hb-CBwb_GVhc3VyZS4')

  t.end()
})

test('base64UrlDecode should correctly convert formats', t => {
  t.equal(base64UrlDecode('YW55IGN-hcm5hb-CBwb_GVhc3VyZS4'), 'YW55IGN+hcm5hb+CBwb/GVhc3VyZS4==')

  t.end()
})

'use strict'

const test = require('ava')

const { base64UrlDecode, base64UrlEncode } = require('../src/utils')

test('base64UrlEncode should correctly convert formats', t => {
  t.is(base64UrlEncode('YW55IGN+hcm5hb+CBwb/GVhc3VyZS4='), 'YW55IGN-hcm5hb-CBwb_GVhc3VyZS4')
})

test('base64UrlDecode should correctly convert formats', t => {
  t.is(base64UrlDecode('YW55IGN-hcm5hb-CBwb_GVhc3VyZS4'), 'YW55IGN+hcm5hb+CBwb/GVhc3VyZS4==')
})

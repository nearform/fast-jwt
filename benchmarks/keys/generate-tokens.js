'use strict'

const { readFileSync } = require('fs')
const { resolve } = require('path')

const { createSigner } = require('../../src')

const privateKeys = {
  HS: 'secretsecretsecret',
  ES256: readFileSync(resolve(__dirname, './es-256-private.key')),
  ES384: readFileSync(resolve(__dirname, './es-384-private.key')),
  ES512: readFileSync(resolve(__dirname, './es-512-private.key')),
  RS: readFileSync(resolve(__dirname, './rs-512-private.key')),
  PS: readFileSync(resolve(__dirname, './ps-512-private.key'))
}

for (const type of ['HS', 'ES', 'RS', 'PS']) {
  for (const bits of ['256', '384', '512']) {
    const algorithm = `${type}${bits}`
    const key = privateKeys[type === 'ES' ? algorithm : type]

    const sign = createSigner({ algorithm, key, kid: '123' })
    console.log(`------- ${algorithm} -------`)
    console.log(`${sign({ a: 1, b: 2, c: 3 })}\n`)
  }
}

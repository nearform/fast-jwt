#!/usr/bin/env node

const { generateKeyPair } = require('crypto')
const { writeFileSync } = require('fs')
const { resolve } = require('path')

const configurations = {
  es: { 256: 'prime256v1', 384: 'secp384r1', 512: 'secp521r1' },
  rs: { 512: null },
  ps: { 512: null }
}

for (const [prefix, configuration] of Object.entries(configurations)) {
  for (const [bits, namedCurve] of Object.entries(configuration)) {
    generateKeyPair(
      prefix === 'es' ? 'ec' : 'rsa',
      {
        modulusLength: 4096,
        namedCurve,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      },
      (err, publicKey, privateKey) => {
        if (err) {
          throw err
        }

        writeFileSync(resolve(__dirname, `${prefix}-${bits}-private.key`), privateKey)
        writeFileSync(resolve(__dirname, `${prefix}-${bits}-public.key`), publicKey)
      }
    )
  }
}

#!/usr/bin/env node

const { generateKeyPair } = require('crypto')
const { writeFileSync } = require('fs')
const { resolve } = require('path')

const configurations = {
  es: { 256: 'prime256v1', 384: 'secp384r1', 512: 'secp521r1' },
  rs: { 512: null },
  ps: { 512: null },
  ed: { 25519: null, 448: null }
}

for (const [prefix, configuration] of Object.entries(configurations)) {
  if (prefix === 'ed') {
    for (const namedCurve of Object.keys(configuration)) {
      generateKeyPair(
        `ed${namedCurve}`,
        {
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

          writeFileSync(resolve(__dirname, `${prefix}-${namedCurve}-private.key`), privateKey)
          writeFileSync(resolve(__dirname, `${prefix}-${namedCurve}-public.key`), publicKey)
        }
      )
    }
  } else {
    for (const [bits, namedCurve] of Object.entries(configuration)) {
      let type = 'pkcs8'
      let format = 'pem'

      if (prefix === 'ps') {
        type = 'pkcs1'
        format = 'der'
      } else if (prefix === 'es' && bits === '256') {
        type = 'sec1'
        format = 'der'
      }

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
            type,
            format
          }
        },
        (err, publicKey, privateKey) => {
          if (err) {
            throw err
          }

          if (format === 'der') {
            const label = prefix === 'es' ? 'EC' : 'RSA'

            const lines = privateKey
              .toString('base64')
              .match(/.{1,64}/g)
              .join('\n')

            privateKey = `-----BEGIN ${label} PRIVATE KEY-----\n${lines}\n-----END ${label} PRIVATE KEY-----`
          }

          writeFileSync(resolve(__dirname, `${prefix}-${bits}-private.key`), privateKey)
          writeFileSync(resolve(__dirname, `${prefix}-${bits}-public.key`), publicKey)
        }
      )
    }
  }
}

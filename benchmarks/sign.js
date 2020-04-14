'use strict'

const { readFileSync } = require('fs')
const { resolve } = require('path')

const { compareSigningJose, compareSigningJWT, saveLogs } = require('./utils')

const esPrivateKey = readFileSync(resolve(__dirname, './keys/es-512-private.key'))
const rsPrivateKey = readFileSync(resolve(__dirname, './keys/rs-512-private.key'))
const psPrivateKey = readFileSync(resolve(__dirname, './keys/ps-512-private.key'))
const edPrivateKey = readFileSync(resolve(__dirname, './keys/ed-25519-private.key'))
const esPublicKey = readFileSync(resolve(__dirname, './keys/es-512-public.key'))
const rsPublicKey = readFileSync(resolve(__dirname, './keys/rs-512-public.key'))
const psPublicKey = readFileSync(resolve(__dirname, './keys/ps-512-public.key'))
const edPublicKey = readFileSync(resolve(__dirname, './keys/ed-25519-public.key'))

async function runSuites() {
  await compareSigningJWT({ a: 1, b: 2, c: 3 }, 'HS512', 'secretsecretsecret', 'secretsecretsecret')
  await compareSigningJWT({ a: 1, b: 2, c: 3 }, 'ES512', esPrivateKey, esPublicKey)
  await compareSigningJWT({ a: 1, b: 2, c: 3 }, 'RS512', rsPrivateKey, rsPublicKey)
  await compareSigningJWT({ a: 1, b: 2, c: 3 }, 'PS512', psPrivateKey, psPublicKey)
  await compareSigningJose({ a: 1, b: 2, c: 3 }, 'EdDSA', edPrivateKey, edPublicKey)

  await saveLogs('sign')
}

runSuites().catch(console.error)

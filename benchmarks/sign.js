'use strict'

const { readFileSync } = require('fs')
const { resolve } = require('path')

const { compareSigning, saveLogs } = require('./utils')

const esPrivateKey = readFileSync(resolve(__dirname, './keys/es-private.key'))
const rsPrivateKey = readFileSync(resolve(__dirname, './keys/rs-512-private.key'))
const psPrivateKey = readFileSync(resolve(__dirname, './keys/ps-512-private.key'))
const esPublicKey = readFileSync(resolve(__dirname, './keys/es-512-public.key'))
const rsPublicKey = readFileSync(resolve(__dirname, './keys/rs-512-public.key'))
const psPublicKey = readFileSync(resolve(__dirname, './keys/ps-512-public.key'))

async function runSuites() {
  await compareSigning({ a: 1, b: 2, c: 3 }, 'HS512', 'secretsecretsecret', 'secretsecretsecret')
  await compareSigning({ a: 1, b: 2, c: 3 }, 'ES512', esPrivateKey, esPublicKey)
  await compareSigning({ a: 1, b: 2, c: 3 }, 'RS512', rsPrivateKey, rsPublicKey)
  await compareSigning({ a: 1, b: 2, c: 3 }, 'PS512', psPrivateKey, psPublicKey)

  await saveLogs('sign')
}

runSuites().catch(console.error)

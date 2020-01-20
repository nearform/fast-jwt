const { readFileSync } = require('fs')
const { resolve } = require('path')

const { compareSigning } = require('./utils')

const esPrivateKey = readFileSync(resolve(__dirname, './keys/es-private.key'))
const rsPrivateKey = readFileSync(resolve(__dirname, './keys/rs-private.key'))
const psPrivateKey = readFileSync(resolve(__dirname, './keys/ps-private.key'))
const esPublicKey = readFileSync(resolve(__dirname, './keys/es-public.key'))
const rsPublicKey = readFileSync(resolve(__dirname, './keys/rs-public.key'))
const psPublicKey = readFileSync(resolve(__dirname, './keys/ps-public.key'))

async function runSuites() {
  await compareSigning({ a: 1, b: 2, c: 3 }, 'HS512', 'secretsecretsecret', 'secretsecretsecret')
  await compareSigning({ a: 1, b: 2, c: 3 }, 'ES512', esPrivateKey, esPublicKey)
  await compareSigning({ a: 1, b: 2, c: 3 }, 'RS512', rsPrivateKey, rsPublicKey)
  await compareSigning({ a: 1, b: 2, c: 3 }, 'PS512', psPrivateKey, psPublicKey)
}

runSuites().catch(console.error)

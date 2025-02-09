'use strict'

import { privateKeys, publicKeys, compareSigning, saveLogs } from './utils.mjs'

async function runSuites() {

  for (const algorithm of ['HS512', 'ES512', 'RS512', 'PS512', 'EdDSA']) {
    await compareSigning({ a: 1, b: 2, c: 3 }, algorithm, privateKeys[algorithm], publicKeys[algorithm])
  }
  
  await saveLogs('sign')
}

runSuites().catch(console.error)

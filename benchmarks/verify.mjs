'use strict'

import { tokens, publicKeys, compareVerifying, saveLogs } from './utils.mjs'

async function runSuites() {

  for (const algorightm of ['HS512', 'ES512', 'RS512', 'PS512', 'EdDSA']) {
    await compareVerifying(tokens[algorightm], algorightm, publicKeys[algorightm])
  }
  
  await saveLogs('verify')
}

runSuites().catch(console.error)

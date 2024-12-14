'use strict'

import { isMainThread } from 'worker_threads'
import { tokens, publicKeys, compareVerifying, saveLogs } from './utils.mjs'

async function runSuites() {
  if (!isMainThread) {
    const algorightm = process.env.CURRENT_ALGORITHM
    compareVerifying(tokens[algorightm], algorightm, publicKeys[algorightm])
    return
  } else {
    for (const algorightm of ['HS512', 'ES512', 'RS512', 'PS512', 'EdDSA']) {
      process.env.CURRENT_ALGORITHM = algorightm
      await compareVerifying(tokens[algorightm], algorightm, publicKeys[algorightm])
    }
  }

  await saveLogs('verify')
}

runSuites().catch(console.error)

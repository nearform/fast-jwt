'use strict'

import { isMainThread } from 'worker_threads'
import {
  privateKeys,
  publicKeys,
  compareSigning,
  saveLogs
} from './utils.mjs'

async function runSuites() {
  if (!isMainThread) {
    const algorightm = process.env.CURRENT_ALGORITHM
    compareSigning({ a: 1, b: 2, c: 3 }, algorightm, privateKeys[algorightm], publicKeys[algorightm])
    return
  } else {
    for (const algorightm of ['HS512', 'ES512', 'RS512', 'PS512', 'EdDSA']) {
      process.env.CURRENT_ALGORITHM = algorightm
      await compareSigning({ a: 1, b: 2, c: 3 }, algorightm, privateKeys[algorightm], publicKeys[algorightm])
    }
  }

  await saveLogs('sign')
}

runSuites().catch(console.error)

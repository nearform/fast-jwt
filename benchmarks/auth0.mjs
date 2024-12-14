'use strict'

import { isMainThread } from 'worker_threads'

import { tokens, privateKeys, publicKeys, compareSigning, compareVerifying, saveLogs } from './utils.mjs'

async function runSuites() {
  if (!isMainThread) {
    const algorightm = process.env.CURRENT_ALGORITHM

    if (process.env.CURRENT_PHASE === 'sign') {
      compareSigning({ a: 1, b: 2, c: 3 }, algorightm, privateKeys[algorightm], publicKeys[algorightm])
    } else {
      compareVerifying(tokens[algorightm], algorightm, publicKeys[algorightm])
    }

    return
  } else {
    for (const algorightm of ['HS256', 'RS256']) {
      process.env.CURRENT_ALGORITHM = algorightm

      process.env.CURRENT_PHASE = 'sign'
      await compareSigning({ a: 1, b: 2, c: 3 }, algorightm, privateKeys[algorightm], publicKeys[algorightm])
      process.env.CURRENT_PHASE = 'verify'
      await compareVerifying(tokens[algorightm], algorightm, publicKeys[algorightm])
    }
  }

  await saveLogs('auth0')
}

runSuites().catch(console.error)

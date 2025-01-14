'use strict'

import { isMainThread } from 'worker_threads'

import { tokens, privateKeys, publicKeys, compareSigning, compareVerifying, saveLogs } from './utils.mjs'

async function runSuites() {
  if (!isMainThread) {
    const algorithm = process.env.CURRENT_ALGORITHM

    if (process.env.CURRENT_PHASE === 'sign') {
      compareSigning({ a: 1, b: 2, c: 3 }, algorithm, privateKeys[algorithm], publicKeys[algorithm])
    } else {
      compareVerifying(tokens[algorithm], algorithm, publicKeys[algorithm])
    }

    return
  } else {
    for (const algorithm of ['HS256', 'RS256']) {
      process.env.CURRENT_ALGORITHM = algorithm

      process.env.CURRENT_PHASE = 'sign'
      await compareSigning({ a: 1, b: 2, c: 3 }, algorithm, privateKeys[algorithm], publicKeys[algorithm])
      process.env.CURRENT_PHASE = 'verify'
      await compareVerifying(tokens[algorithm], algorithm, publicKeys[algorithm])
    }
  }

  await saveLogs('auth0')
}

runSuites().catch(console.error)

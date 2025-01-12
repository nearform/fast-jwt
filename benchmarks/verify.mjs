'use strict'

import { isMainThread } from 'worker_threads'
import { tokens, publicKeys, compareVerifying, saveLogs, algorithms } from './utils.mjs'

async function runSuites() {
  if (!isMainThread) {
    const algorithm = process.env.CURRENT_ALGORITHM
    compareVerifying(tokens[algorithm], algorithm, publicKeys[algorithm])
    return
  } else {
    for (const algorithm of algorithms) {
      process.env.CURRENT_ALGORITHM = algorithm
      await compareVerifying(tokens[algorithm], algorithm, publicKeys[algorithm])
    }
  }

  await saveLogs('verify')
}

runSuites().catch(console.error)

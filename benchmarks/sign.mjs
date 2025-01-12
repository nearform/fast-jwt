'use strict'

import { isMainThread } from 'worker_threads'
import { privateKeys, publicKeys, compareSigning, saveLogs, algorithms } from './utils.mjs'

async function runSuites() {
  if (!isMainThread) {
    const algorithm = process.env.CURRENT_ALGORITHM
    compareSigning({ a: 1, b: 2, c: 3 }, algorithm, privateKeys[algorithm], publicKeys[algorithm])
    return
  } else {
    for (const algorithm of algorithms) {
      process.env.CURRENT_ALGORITHM = algorithm
      await compareSigning({ a: 1, b: 2, c: 3 }, algorithm, privateKeys[algorithm], publicKeys[algorithm])
    }
  }

  await saveLogs('sign')
}

runSuites().catch(console.error)

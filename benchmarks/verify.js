'use strict'

const { isMainThread } = require('worker_threads')
const { tokens, publicKeys, compareVerifying, saveLogs } = require('./utils')

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

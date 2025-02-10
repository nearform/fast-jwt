'use strict'

import { tokens, publicKeys, compareVerifying, saveLogs } from './utils.mjs'

export async function runSuites() {
  const benchmarkOutput = []
  for (const algorightm of ['HS512', 'ES512', 'RS512', 'PS512', 'EdDSA']) {
    benchmarkOutput.push(await compareVerifying(tokens[algorightm], algorightm, publicKeys[algorightm]))
  }

  await saveLogs('verify')
  return benchmarkOutput.join('\n')
}

if (import.meta.filename === process.argv[1]) runSuites().catch(console.error)

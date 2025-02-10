'use strict'

import { tokens, publicKeys, compareVerifying, saveLogs } from './utils.mjs'

export async function runSuites() {
  const benchmarkResults = []
  for (const algorithm of ['HS512', 'ES512', 'RS512', 'PS512', 'EdDSA']) {
    const result = await compareVerifying(tokens[algorithm], algorithm, publicKeys[algorithm])
    benchmarkResults.push({ algorithm, result })
  }

  await saveLogs('verify')
  return benchmarkResults
}

if (import.meta.filename === process.argv[1]) runSuites().catch(console.error)

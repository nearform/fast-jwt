'use strict'

import { privateKeys, publicKeys, compareSigning, saveLogs } from './utils.mjs'

export async function runSuites() {
  const benchmarkResults = []
  for (const algorithm of ['HS256', 'HS512', 'ES512', 'RS512', 'PS512', 'EdDSA']) {
    const result = await compareSigning({ a: 1, b: 2, c: 3 }, algorithm, privateKeys[algorithm], publicKeys[algorithm])
    benchmarkResults.push({ algorithm, result })
  }

  await saveLogs('sign')
  return benchmarkResults
}

if (import.meta.filename === process.argv[1]) await runSuites()

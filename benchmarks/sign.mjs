'use strict'

import { privateKeys, publicKeys, compareSigning, saveLogs } from './utils.mjs'

export async function runSuites() {
  let benchmarkOutput = []
  for (const algorithm of ['HS512', 'ES512', 'RS512', 'PS512', 'EdDSA']) {
    const out = await compareSigning({ a: 1, b: 2, c: 3 }, algorithm, privateKeys[algorithm], publicKeys[algorithm])
    benchmarkOutput.push(out)
  }

  await saveLogs('sign')
  return benchmarkOutput.join('\n')
}

if (import.meta.filename === process.argv[1]) runSuites().catch(console.error)

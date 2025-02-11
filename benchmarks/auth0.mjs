'use strict'

import { tokens, privateKeys, publicKeys, compareSigning, compareVerifying, saveLogs } from './utils.mjs'

async function runSuites() {
  for (const algorithm of ['HS256', 'RS256']) {
    await compareSigning({ a: 1, b: 2, c: 3 }, algorithm, privateKeys[algorithm], publicKeys[algorithm])
    await compareVerifying(tokens[algorithm], algorithm, publicKeys[algorithm])
  }

  await saveLogs('auth0')
}

runSuites()

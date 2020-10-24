/* eslint-disable @typescript-eslint/no-unused-expressions */

import { createDecoder, createSigner, createVerifier, TokenError } from '..'

// Signing
// Buffer key, both async/callback styles
const signer = createSigner({ key: Buffer.from('KEY'), algorithm: 'RS256' })
signer({ key: '1' }).then(console.log, console.log)
signer({ key: '1' }, (_e: Error | null, _token?: string) => {})

// Dynamic key in callback style
createSigner({
  clockTimestamp: 10,
  key(_key: string, _header: string, cb: (e: Error | null, key: string) => void): void {
    cb(null, 'KEY')
  }
})({ key: 1 }).then(console.log, console.log)

// Dynamic key in async style
createSigner({
  clockTimestamp: 10,
  async key(_key: string, _header: string) {
    return 'KEY'
  }
})({ key: 1 }).then(console.log, console.log)

// Decoding
const decoder = createDecoder({ checkTyp: 'true' })
decoder('FOO')
decoder(Buffer.from('FOO'))

// Verifying
// String key, both async/callback styles
const verifier = createVerifier({ key: 'KEY', algorithms: ['RS256'] })
verifier('123').then(console.log, console.log)
verifier(Buffer.from('456'), (_e: Error | null, _token?: string) => {})

// Dynamic key in callback style
createVerifier({
  clockTimestamp: 10,
  key(_key: string, _header: string, cb: (e: Error | null, key: string) => void): void {
    cb(null, 'KEY')
  }
})('123').then(console.log, console.log)

// Dynamic key in async style
createVerifier({
  clockTimestamp: 10,
  async key(_key: string, _header: string) {
    return 'KEY'
  }
})('456').then(console.log, console.log)

// Errors
const wrapped = TokenError.wrap(new Error('ORIGINAL'), 'CODE', 'MESSAGE')
wrapped.code === 'CODE'
wrapped.message === 'MESSAGE'
Array.isArray(wrapped.stack)
wrapped.originalError.message === 'ORIGINAL'

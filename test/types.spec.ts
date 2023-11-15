/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import { createDecoder, createSigner, createVerifier, DecodedJwt, JwtHeader, TokenError, TokenValidationErrorCode } from '..'
import { expectAssignable, expectNotAssignable, expectType } from 'tsd'

// Signing
// Buffer key, both async/callback styles
const signerSync = createSigner({ key: Buffer.from('KEY'), algorithm: 'RS256' })
signerSync({ key: '1' })

const signerAsync = createSigner({ key: () => Buffer.from('KEY'), algorithm: 'RS256' })
signerAsync({ key: '1' }).then(console.log, console.log)
signerAsync({ key: '1' }, (_e: Error | null, _token?: string) => {})

// Dynamic key in callback style
createSigner({
  clockTimestamp: 10,
  key(_decodedJwt: DecodedJwt, cb: (e: Error | null, key: string) => void): void {
    cb(null, 'KEY')
  }
})({ key: 1 }).then(console.log, console.log)

// Dynamic key in async style
createSigner({
  clockTimestamp: 10,
  async key(_decodedJwt: DecodedJwt) {
    return 'KEY'
  }
})({ key: 1 }).then(console.log, console.log)

// expiresIn as a string
createSigner({
  expiresIn: '10min',
  key: Buffer.from('KEY'),
  algorithm: 'RS256'
})

// Decoding
const decoder = createDecoder({ checkTyp: 'true' })
decoder('FOO')
decoder(Buffer.from('FOO'))

// Verifying
// String key, both async/callback styles
const verifierSync = createVerifier({ key: 'KEY', algorithms: ['RS256'], requiredClaims: ['aud'], checkTyp: 'JWT' })
verifierSync('2134')

const verifierAsync = createVerifier({ key: ((_decodedJwt: DecodedJwt) => 'KEY', algorithms: ['RS256'] })
verifierAsync('123').then(console.log, console.log)
verifierAsync(Buffer.from('456'), (_e: Error | null, _token?: string) => {})

// Dynamic key in callback style
createVerifier({
  clockTimestamp: 10,
  key(_decodedJwt: DecodedJwt, cb: (e: Error | null, key: string) => void): void {
    cb(null, 'KEY')
  }
})('123').then(console.log, console.log)

// Dynamic key in async style
createVerifier({
  clockTimestamp: 10,
  async key(_decodedJwt: DecodedJwt) {
    return 'KEY'
  }
})('456').then(console.log, console.log)

// Errors
const wrapped = TokenError.wrap(new Error('ORIGINAL'), 'FAST_JWT_INVALID_TYPE', 'MESSAGE')
wrapped.code === 'FAST_JWT_INVALID_TYPE'
wrapped.message === 'MESSAGE'
Array.isArray(wrapped.stack)
wrapped.originalError.message === 'ORIGINAL'

const signerOptions = {
  header: {
    alg: 'RS256',
    typ: '',
    cty: '',
    crit: [''],
    kid: '',
    jku: '',
    x5u: '',
    'x5t#S256': '',
    x5t: '',
    x5c: ''
  }
}
expectAssignable<JwtHeader>(signerOptions.header)

const signerOptionsNoAlg = {
  header: {
    typ: '',
    cty: '',
    crit: [''],
    kid: '',
    jku: '',
    x5u: '',
    'x5t#S256': '',
    x5t: '',
    x5c: ''
  }
}
expectNotAssignable<JwtHeader>(signerOptionsNoAlg.header)

// Check all errors are typed correctly
expectType<TokenValidationErrorCode[]>(Object.values(TokenError.codes))

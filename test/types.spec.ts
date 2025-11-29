/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { expectAssignable, expectNotAssignable, expectType } from 'tsd'
import {
  createDecoder,
  createSigner,
  createVerifier,
  DecodedJwt,
  JwtHeader,
  TokenError,
  TokenValidationErrorCode,
  TOKEN_ERROR_CODES
} from '..'

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

// Generic signer
const signer = createSigner<Record<string, number>>({
  expiresIn: '10min',
  key: Buffer.from('KEY'),
  algorithm: 'RS256'
})
signer({ key: 1 })

// Decoding
const decoder = createDecoder({ checkTyp: 'true' })
decoder('FOO')
decoder(Buffer.from('FOO'))

// Verifying
// String key, both async/callback styles
const verifierSync = createVerifier({ key: 'KEY', algorithms: ['RS256'], requiredClaims: ['aud'], checkTyp: 'JWT' })
verifierSync('2134')

const verifierAsync = createVerifier({ key: () => 'KEY', algorithms: ['RS256'] })
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
  async key(decodedJwt: DecodedJwt) {
    if (decodedJwt.payload.iss) {
      return 'ISS_KEY'
    }
    return 'KEY'
  }
})('456').then(console.log, console.log)

// Generic verifier
createVerifier<Record<string, number>>({
  key: 'KEY',
  algorithms: ['RS256'],
  requiredClaims: ['aud'],
  checkTyp: 'JWT'
})({ key: 1 }).then(console.log, console.log)

// Verifier with cacheKeyBuilder
createVerifier<Record<string, number>>({
  key: 'KEY',
  algorithms: ['RS256'],
  requiredClaims: ['aud'],
  checkTyp: 'JWT',
  cacheKeyBuilder: (token: string) => token
})({ key: 1 }).then(console.log, console.log)

// Errors
const errorWithNoMsg = new TokenError(TokenError.codes.expired)
expectType<TokenError>(errorWithNoMsg)
expectType<string>(errorWithNoMsg.message)

const errorWithMsg = new TokenError(TokenError.codes.expired, 'MESSAGE')
expectType<TokenError>(errorWithMsg)
expectType<string>(errorWithMsg.message)

const errorWithAdditional = new TokenError(TokenError.codes.expired, 'MESSAGE', { additional: 'data' })
expectType<TokenError>(errorWithAdditional)
expectType<string>(errorWithAdditional.message)
expectType<any>(errorWithAdditional.additional)

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

const signerOptionsCustomHeaders = {
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
    x5c: '',
    customClaim: 'my-custom-claim',
    customClaim2: 'my-custom-claim2'
  }
}
expectAssignable<JwtHeader>(signerOptionsCustomHeaders.header)

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
expectAssignable<Record<string, TokenValidationErrorCode>>(TOKEN_ERROR_CODES)

const decodedJwt: DecodedJwt = {
  header: { alg: 'RS256', typ: 'JWT' },
  payload: { sub: '12345', iss: 'iss' },
  signature: 'abc123',
  input: 'input'
}

expectType<DecodedJwt>(decodedJwt)
expectType<Record<string, any>>(decodedJwt.header)
expectType<any>(decodedJwt.payload)
expectType<string>(decodedJwt.signature)
expectType<string>(decodedJwt.input)

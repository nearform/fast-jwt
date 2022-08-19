/* eslint-disable @typescript-eslint/no-unused-expressions */

import { createDecoder, createSigner, createVerifier, JwtHeader, TokenError } from '..'
import { expectAssignable, expectNotAssignable } from 'tsd'

// Signing
// Buffer key, both async/callback styles
const signerSync = createSigner({ key: Buffer.from('KEY'), algorithm: 'RS256' })
signerSync({ key: '1' })

// Inline type
signerSync<{ key: '1' }>({ key: '1' })

// With specific payload type
const signerAsyncTyped = createSigner<{ key: '1' }>({ key: () => Buffer.from('KEY'), algorithm: 'RS256' })
signerAsyncTyped({ key: '1' }).then(console.log, console.log)
signerAsyncTyped({ key: '1' }, (_e: Error | null, _token?: string) => {})

// Without specific payload type
const signerAsyncAny = createSigner({ key: () => Buffer.from('KEY'), algorithm: 'RS256' })
signerAsyncAny({ key: '1', yek: '2' }).then(console.log, console.log)
signerAsyncAny({ key: '1', yek: '2', eyk: '3' }).then(console.log, console.log)

// Dynamic key in callback style
createSigner({
  clockTimestamp: 10,
  key(_header: { [key: string]: any }, cb: (e: Error | null, key: string) => void): void {
    cb(null, 'KEY')
  }
})({ key: 1 }).then(console.log, console.log)

// Dynamic key in async style
createSigner({
  clockTimestamp: 10,
  async key(_header: { [key: string]: any }) {
    return 'KEY'
  }
})({ key: 1 }).then(console.log, console.log)

// Decoding
const decoder = createDecoder({ checkTyp: 'true' })
decoder('FOO')

// Specify type inline
const { key: _key }  = decoder<Record<'key', any>>(Buffer.from('FOO'))

// Specify type in createDecoder
const decoderTyped = createDecoder<{ sub: string }>({ checkTyp: 'true' })
const { sub: _sub } = decoderTyped('FOO')

// Verifying
// String key, both async/callback styles
const verifierSync = createVerifier({ key: 'KEY', algorithms: ['RS256'] })
verifierSync('2134')

const verifierAsync = createVerifier({ key: () => 'KEY', algorithms: ['RS256'] })
verifierAsync('123').then(console.log, console.log)
verifierAsync(Buffer.from('456'), (_e: Error | null, _payload: any) => {})

// Specify type inline
verifierAsync<{ key: 'a' }>('123').then(({ key }) => console.log(key))

// Specify type in createVerifier
type TestType = { foo: 'bar' }
const verifierAsyncTyped = createVerifier<TestType>({ key: () => 'KEY' })
verifierAsyncTyped('123').then(({ foo }) => console.log(foo))
verifierAsyncTyped('123', (_err: Error | TokenError | null, { foo }: TestType) => console.log(foo))


// Dynamic key in callback style
createVerifier({
  clockTimestamp: 10,
  key(_header: { [key: string]: any }, cb: (e: Error | null, key: string) => void): void {
    cb(null, 'KEY')
  }
})('123').then(console.log, console.log)

// Dynamic key in async style
createVerifier({
  clockTimestamp: 10,
  async key(_header: { [key: string]: any }) {
    return 'KEY'
  }
})('456').then(console.log, console.log)

// Errors
const wrapped = TokenError.wrap(new Error('ORIGINAL'), 'CODE', 'MESSAGE')
wrapped.code === 'CODE'
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

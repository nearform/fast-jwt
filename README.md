# fast-jwt

[![Package Version](https://img.shields.io/npm/v/fast-jwt.svg)](https://npm.im/fast-jwt)
[![Dependency Status](https://img.shields.io/david/nearform/fast-jwt)](https://david-dm.org/nearform/fast-jwt)
[![Build](https://github.com/nearform/fast-jwt/workflows/CI/badge.svg)](https://github.com/nearform/fast-jwt/actions?query=workflow%3ACI)

<!-- [![Code Coverage](https://img.shields.io/codecov/c/gh/nearform/-verify?token=)](https://codecov.io/gh/nearform/fast-jwt) -->

Fast JSON Web Token implementation

## Installation

Just run:

```bash
npm install fast-jwt
```

## Usage

### createSigner

Create a signer function by calling `createSigner` and providing one or more of the following options:

- `key`: A string, buffer or object containing the secret for `HS*` algorithms or the PEM encoded public key for `RS*`, `PS*`, `ES*` and `EdDSA` algorithms. The key can also be a function accepting a Node style callback or a function returning a promise. This is the only mandatory option.
- `algorithm`: The algorithm to use to sign the token. The default is autodetected from the key, using `RS256` for RSA private keys, `HS256` for plain secrets and the correspondent `ES` or `EdDSA` algorithms for EC or Ed\* private keys.
- `mutatePayload`: If the original payload must be modified in place (via `Object.assign`) and thus will result changed to the caller funciton.
- `expiresIn`: Time span (in milliseconds) after which the token expires, added as the `exp` claim in the payload. This will override any existing value in the claim.
- `notBefore`: Time span (in milliseconds) before the token is active, added as the `nbf` claim in the payload. This will override any existing value in the claim.
- `jti`: The token id, added as the `jti` claim in the payload. This will override any existing value in the claim.
- `aud`: The token audience, added as the `aud` claim in the payload. It must be a string or an array of strings. This will override any existing value in the claim.
- `iss`: The token audience, added as the `iss` claim in the payload. It must be a string. This will override any existing value in the claim.
- `sub`: The token audience, added as the `sub` claim in the payload. It must be a string. This will override any existing value in the claim.
- `nonce`: The token audience, added as the `nonce` claim in the payload. It must be a string. This will override any existing value in the claim.
- `kid`: The token key id, added as the `kid` claim in the header section. It must be a string.
- `header`: Additional claims to add to the header section. This will override the `typ` and `kid` claims.
- `noTimestamp`: If the `iat` claim should not be added to the token.
- `clockTimestamp`: The timestamp in milliseconds (like the output of `Date.now()`) that should be used as the current time for all necessary time comparisons. Default is the system time.

The signer is a function which accepts a payload and returns the token.

The payload must be a object, a buffer or a string. If not a object, all the options of the signer which modify the the payload will be ignored. If `iat` claim is already present, it won't be overwritten with the current timestamp.

If the `key` option is a function, the signer will also accept a Node style callback and will return a promise, supporting therefore both callback and async/await styles.

#### Example

```javascript
const {createSigner} = require('fast-jwt')

// Sync style
const signSync = createSigner({ key: 'secret' })
const token = signSync({a: 1, b: 2, c: 3})
// => eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1Nzk1MjEyMTJ9.mIcxteEVjbh2MnKQ3EQlojZojGSyA_guqRBYHQURcfnCSSBTT2OShF8lo9_ogjAv-5oECgmCur_cDWB7x3X53g

// Callback style
const signWithCallback = createSigner({ key: (callback) => callback(null, 'secret') })

signWithCallback({a: 1, b: 2, c: 3}, (err, token) => {
  // token === eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1Nzk1MjEyMTJ9.mIcxteEVjbh2MnKQ3EQlojZojGSyA_guqRBYHQURcfnCSSBTT2OShF8lo9_ogjAv-5oECgmCur_cDWB7x3X53g
})

// Promise style - Note that the key function style and the signer function style are unrelated
async function test() {
  const signWithPromise = createSigner({ async key(): => 'secret' })

  const token = await signWithPromise({a: 1, b: 2, c: 3})
  // => eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1Nzk1MjEyMTJ9.mIcxteEVjbh2MnKQ3EQlojZojGSyA_guqRBYHQURcfnCSSBTT2OShF8lo9_ogjAv-5oECgmCur_cDWB7x3X53g
}
```

### createDecoder

Create a decoder function by calling `createDecoder` and providing one or more of the following options:

- `complete`: Return an object with the decoded header, payload, signature and input (the token part before the signature), instead of just the content of the payload. Default is `false`.
- `json`: Always parse the payload as JSON even if the `typ` claim of the header is not `JWT`. Default is `true`.

The decoder is a function which accepts a token (as Buffer or string) and returns the payload or the sections of the token.

#### Examples

```javascript
const { createDecoder } = require('fast-jwt')
const token =
  'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1Nzk1MjEyMTJ9.mIcxteEVjbh2MnKQ3EQlojZojGSyA_guqRBYHQURcfnCSSBTT2OShF8lo9_ogjAv-5oECgmCur_cDWB7x3X53g'

// Standard decoder
const decode = createDecoder()
const payload = decode(token)
// => { a: 1, b: 2, c: 3, iat: 1579521212 }

// Complete decoder
const decodeComplete = createDecoder({ complete: true })
const sections = decodeComplete(token)
/* => 
  { 
    header: { alg: 'HS512', typ: 'JWT' }, 
    payload: { a: 1, b: 2, c: 3, iat: 1579521212 },
    signature: 'mIcxteEVjbh2MnKQ3EQlojZojGSyA/guqRBYHQURcfnCSSBTT2OShF8lo9/ogjAv+5oECgmCur/cDWB7x3X53g==',
    input: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1Nzk1MjEyMTJ9' 
  }
*/
```

### createVerifier

Create a verifier function by calling `createVerifier` and providing one or more of the following options:

- `key`: A string or a buffer containing the secret for `HS*` algorithms or the PEM encoded public key for `RS*`, `PS*`, `ES*` and `EdDSA` algorithms. The key can also be a function accepting a Node style callback or a function returning a promise. This is the only mandatory option, which must NOT be provided if the token algorithm is `none`.
- `algorithms`: List of strings with the names of the allowed algorithms. By default, all algorithms are accepted.
- `complete`: Return an object with the decoded header, payload, signature and input (the token part before the signature), instead of just the content of the payload. Default is `false`.
- `json`: Always parse the payload as JSON even if the `typ` claim of the header is not `JWT`. Default is `true`.
- `cache`: A positive number specifying the size of the verified tokens cache (using LRU strategy). Setting to `true` is equivalent to provide the size `1000`. When enabled, as you can see in the benchmarks section below, performances dramatically improve. By default the cache is disabled.
- `cacheTTL`: The maximum time to live of a cache entry (in milliseconds). If the token has a earlier expiration or the verifier has a shorter `maxAge`, the earlier takes precedence. The default is `600000`, which is 10 minutes.
- `allowedJti`: A string, a regular expression, an array of strings or an array of regular expressions containing allowed values for the id claim (`jti`). By default, all values are accepted.
- `allowedAud`: A string, a regular expression, an array of strings or an array of regular expressions containing allowed values for the audience claim (`aud`). By default, all values are accepted.
- `allowedIss`: A string, a regular expression, an array of strings or an array of regular expressions containing allowed values for the issuer claim (`iss`). By default, all values are accepted.
- `allowedSub`: A string, a regular expression, an array of strings or an array of regular expressions containing allowed values for the subject claim (`sub`). By default, all values are accepted.
- `allowedNonce`: A string, a regular expression, an array of strings or an array of regular expressions containing allowed values for the nonce claim (`nonce`). By default, all values are accepted.
- `ignoreExpiration`: Do not validate the expiration of the token. Default is `false`.
- `ignoreNotBefore`: Do not validate the activation of the token. Default is `false`.
- `maxAge`: The maximum allowed age (in milliseconds) for tokens to still be valid. By default this is not checked.
- `clockTimestamp`: The timestamp in milliseconds (like the output of `Date.now()`) that should be used as the current time for all necessary time comparisons. Default is the system time.
- `clockTolerance`: Timespan in milliseconds to add the current timestamp when performing time comparisons. Default is `0`.

The verifier is a function which accepts a token (as Buffer or string) and returns the payload or the sections of the token.

If the `key` option is a function, the signer will also accept a Node style callback and will return a promise, supporting therefore both callback and async/await styles.

#### Examples

```javascript
const { createVerifier } = require('fast-jwt')
const token =
  'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1Nzk1MjEyMTJ9.mIcxteEVjbh2MnKQ3EQlojZojGSyA_guqRBYHQURcfnCSSBTT2OShF8lo9_ogjAv-5oECgmCur_cDWB7x3X53g'

// Sync style
const verifySync = createVerifier({ key: 'secret' })
const payload = verifySync(token)
// => { a: 1, b: 2, c: 3, iat: 1579521212 }

// Callback style with complete return
const verifyWithCallback = createVerifier({ key: callback => callback(null, 'secret'), complete: true })

verifyWithCallback(token, (err, sections) => {
  /*
  sections === {
    header: { alg: 'HS512', typ: 'JWT' },
    payload: { a: 1, b: 2, c: 3, iat: 1579521212 },
    signature: 'mIcxteEVjbh2MnKQ3EQlojZojGSyA/guqRBYHQURcfnCSSBTT2OShF8lo9/ogjAv+5oECgmCur/cDWB7x3X53g==',
    input: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1Nzk1MjEyMTJ9'
  }
*/
})

// Promise style - Note that the key function style and the verifier function style are unrelated
async function test() {
  const verifyWithPromise = createVerifier({ async key(): => 'secret' })

  const payload = await verifyWithPromise(token)
  // => { a: 1, b: 2, c: 3, iat: 1579521212 }
}
```

## Algorithms supported

This is the lisf of currently supported algorithms:

| Name    | Description                                                             |
| ------- | ----------------------------------------------------------------------- |
| `none`  | Empty algorithm - The token signature section will empty                |
| `HS256` | HMAC using SHA-256 hash algorithm                                       |
| `HS384` | HMAC using SHA-384 hash algorithm                                       |
| `HS512` | HMAC using SHA-512 hash algorithm                                       |
| `ES256` | ECDSA using P-256 curve and SHA-256 hash algorithm                      |
| `ES384` | ECDSA using P-384 curve and SHA-384 hash algorithm                      |
| `ES512` | ECDSA using P-521 curve and SHA-512 hash algorithm                      |
| `RS256` | RSASSA-PKCS1-v1_5 using SHA-256 hash algorithm                          |
| `RS384` | RSASSA-PKCS1-v1_5 using SHA-384 hash algorithm                          |
| `RS512` | RSASSA-PKCS1-v1_5 using SHA-512 hash algorithm                          |
| `PS256` | RSASSA-PSS using SHA-256 hash algorithm                                 |
| `PS384` | RSASSA-PSS using SHA-384 hash algorithm                                 |
| `PS512` | RSASSA-PSS using SHA-512 hash algorithm                                 |
| `EdDSA` | EdDSA tokens using Ed25519 or Ed448 keys, only supported on Node.js 12+ |

## Caching

fast-jwt supports caching of verified tokens.

The cache layer, powered by [mnemonist](https://www.npmjs.com/package/mnemonist), is a LRU cache which dimension is controlled by the user, as described in the options list.

When caching is enabled, verified tokens are always stored in cache. If the verification fails once, the error is cached as well and the operation is not retried.

For verified tokens, caching considers the time sensitive claims of the token (`iat`, `nbf` and `exp`) and make sure the verification is retried after a token becomes valid or after a token becomes expired.

Performances improvements varies by uses cases and by the type of the operation performed and the algorithm used.

## Benchmarks

### Signing

```
╔═════════════════════════════════════╤═════════╤═════════════════╤═══════════╤═════════════════════════════════════════════════════╗
║ Test                                │ Samples │          Result │ Tolerance │ Difference with HS512 - sign - jsonwebtoken (async) ║
╟─────────────────────────────────────┼─────────┼─────────────────┼───────────┼─────────────────────────────────────────────────────╢
║ HS512 - sign - jsonwebtoken (async) │   10000 │ 77023.84 op/sec │  ± 1.21 % │                                                     ║
║ HS512 - sign - fast-jwt (async)     │   10000 │ 87328.70 op/sec │  ± 1.53 % │ + 13.38 %                                           ║
║ HS512 - sign - jsonwebtoken (sync)  │   10000 │ 91971.52 op/sec │  ± 1.04 % │ + 19.41 %                                           ║
╟─────────────────────────────────────┼─────────┼─────────────────┼───────────┼─────────────────────────────────────────────────────╢
║ Fastest test                        │ Samples │          Result │ Tolerance │ Difference with HS512 - sign - jsonwebtoken (async) ║
╟─────────────────────────────────────┼─────────┼─────────────────┼───────────┼─────────────────────────────────────────────────────╢
║ HS512 - sign - fast-jwt (sync)      │   10000 │ 94088.95 op/sec │  ± 2.42 % │ + 22.16 %                                           ║
╚═════════════════════════════════════╧═════════╧═════════════════╧═══════════╧═════════════════════════════════════════════════════╝

╔═════════════════════════════════════╤═════════╤═══════════════╤═══════════╤════════════════════════════════════════════════╗
║ Test                                │ Samples │        Result │ Tolerance │ Difference with ES512 - sign - fast-jwt (sync) ║
╟─────────────────────────────────────┼─────────┼───────────────┼───────────┼────────────────────────────────────────────────╢
║ ES512 - sign - fast-jwt (sync)      │    1500 │ 425.29 op/sec │  ± 0.26 % │                                                ║
║ ES512 - sign - jsonwebtoken (sync)  │    1500 │ 437.75 op/sec │  ± 0.21 % │ + 2.93 %                                       ║
║ ES512 - sign - jsonwebtoken (async) │    1500 │ 440.15 op/sec │  ± 0.17 % │ + 3.49 %                                       ║
╟─────────────────────────────────────┼─────────┼───────────────┼───────────┼────────────────────────────────────────────────╢
║ Fastest test                        │ Samples │        Result │ Tolerance │ Difference with ES512 - sign - fast-jwt (sync) ║
╟─────────────────────────────────────┼─────────┼───────────────┼───────────┼────────────────────────────────────────────────╢
║ ES512 - sign - fast-jwt (async)     │    1500 │ 442.77 op/sec │  ± 0.18 % │ + 4.11 %                                       ║
╚═════════════════════════════════════╧═════════╧═══════════════╧═══════════╧════════════════════════════════════════════════╝

╔═════════════════════════════════════╤═════════╤═══════════════╤═══════════╤═════════════════════════════════════════════════╗
║ Test                                │ Samples │        Result │ Tolerance │ Difference with RS512 - sign - fast-jwt (async) ║
╟─────────────────────────────────────┼─────────┼───────────────┼───────────┼─────────────────────────────────────────────────╢
║ RS512 - sign - fast-jwt (async)     │    1500 │ 214.83 op/sec │  ± 0.10 % │                                                 ║
║ RS512 - sign - jsonwebtoken (async) │    1500 │ 215.59 op/sec │  ± 0.14 % │ + 0.35 %                                        ║
║ RS512 - sign - jsonwebtoken (sync)  │    1500 │ 217.11 op/sec │  ± 0.12 % │ + 1.06 %                                        ║
╟─────────────────────────────────────┼─────────┼───────────────┼───────────┼─────────────────────────────────────────────────╢
║ Fastest test                        │ Samples │        Result │ Tolerance │ Difference with RS512 - sign - fast-jwt (async) ║
╟─────────────────────────────────────┼─────────┼───────────────┼───────────┼─────────────────────────────────────────────────╢
║ RS512 - sign - fast-jwt (sync)      │    1500 │ 217.44 op/sec │  ± 0.07 % │ + 1.21 %                                        ║
╚═════════════════════════════════════╧═════════╧═══════════════╧═══════════╧═════════════════════════════════════════════════╝

╔═════════════════════════════════════╤═════════╤═══════════════╤═══════════╤════════════════════════════════════════════════╗
║ Test                                │ Samples │        Result │ Tolerance │ Difference with PS512 - sign - fast-jwt (sync) ║
╟─────────────────────────────────────┼─────────┼───────────────┼───────────┼────────────────────────────────────────────────╢
║ PS512 - sign - fast-jwt (sync)      │    1500 │ 213.55 op/sec │  ± 0.16 % │                                                ║
║ PS512 - sign - fast-jwt (async)     │    1500 │ 213.59 op/sec │  ± 0.17 % │ + 0.02 %                                       ║
║ PS512 - sign - jsonwebtoken (async) │    1500 │ 214.63 op/sec │  ± 0.12 % │ + 0.51 %                                       ║
╟─────────────────────────────────────┼─────────┼───────────────┼───────────┼────────────────────────────────────────────────╢
║ Fastest test                        │ Samples │        Result │ Tolerance │ Difference with PS512 - sign - fast-jwt (sync) ║
╟─────────────────────────────────────┼─────────┼───────────────┼───────────┼────────────────────────────────────────────────╢
║ PS512 - sign - jsonwebtoken (sync)  │    1500 │ 217.79 op/sec │  ± 0.14 % │ + 1.99 %                                       ║
╚═════════════════════════════════════╧═════════╧═══════════════╧═══════════╧════════════════════════════════════════════════╝

╔═════════════════════════╤═════════╤═════════════════╤═══════════╤═════════════════════════════════════════╗
║ Test                    │ Samples │          Result │ Tolerance │ Difference with EdDSA - sign - fast-jwt ║
╟─────────────────────────┼─────────┼─────────────────┼───────────┼─────────────────────────────────────────╢
║ EdDSA - sign - fast-jwt │    2001 │  9778.74 op/sec │  ± 0.82 % │                                         ║
╟─────────────────────────┼─────────┼─────────────────┼───────────┼─────────────────────────────────────────╢
║ Fastest test            │ Samples │          Result │ Tolerance │ Difference with EdDSA - sign - fast-jwt ║
╟─────────────────────────┼─────────┼─────────────────┼───────────┼─────────────────────────────────────────╢
║ EdDSA - sign - jose     │    1500 │ 17481.74 op/sec │  ± 0.66 % │ + 78.77 %                               ║
╚═════════════════════════╧═════════╧═════════════════╧═══════════╧═════════════════════════════════════════╝
```

### Decoding

```
╔══════════════════════════════════════════╤═════════╤══════════════════╤═══════════╤═══════════════════════════════════════════════╗
║ Test                                     │ Samples │           Result │ Tolerance │ Difference with RS512 - decode - jsonwebtoken ║
╟──────────────────────────────────────────┼─────────┼──────────────────┼───────────┼───────────────────────────────────────────────╢
║ RS512 - decode - jsonwebtoken            │   10000 │ 170684.76 op/sec │  ± 2.36 % │                                               ║
║ RS512 - decode - jsonwebtoken - complete │    1500 │ 177241.15 op/sec │  ± 0.71 % │ + 3.84 %                                      ║
║ RS512 - decode - fast-jwt                │   10000 │ 303276.86 op/sec │  ± 1.18 % │ + 77.68 %                                     ║
╟──────────────────────────────────────────┼─────────┼──────────────────┼───────────┼───────────────────────────────────────────────╢
║ Fastest test                             │ Samples │           Result │ Tolerance │ Difference with RS512 - decode - jsonwebtoken ║
╟──────────────────────────────────────────┼─────────┼──────────────────┼───────────┼───────────────────────────────────────────────╢
║ RS512 - decode - fast-jwt (complete)     │    2001 │ 315956.12 op/sec │  ± 0.94 % │ + 85.11 %                                     ║
╚══════════════════════════════════════════╧═════════╧══════════════════╧═══════════╧═══════════════════════════════════════════════╝
```

Note that for decoding the algorithm is irrelevant, so only one was measured.

### Verifying

```
╔══════════════════════════════════════════════╤═════════╤══════════════════╤═══════════╤══════════════════════════════════════════════════════╗
║ Test                                         │ Samples │           Result │ Tolerance │ Difference with HS512 - verify - jsonwebtoken (sync) ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────────╢
║ HS512 - verify - jsonwebtoken (sync)         │   10000 │  62806.23 op/sec │  ± 1.64 % │                                                      ║
║ HS512 - verify - jsonwebtoken (async)        │   10000 │  64435.19 op/sec │  ± 1.18 % │ + 2.59 %                                             ║
║ HS512 - verify - fast-jwt (async)            │   10000 │  86702.48 op/sec │  ± 2.41 % │ + 38.05 %                                            ║
║ HS512 - verify - fast-jwt (sync)             │    1500 │ 108510.88 op/sec │  ± 0.44 % │ + 72.77 %                                            ║
║ HS512 - verify - fast-jwt (async with cache) │   10000 │ 210133.23 op/sec │  ± 7.05 % │ + 234.57 %                                           ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────────╢
║ Fastest test                                 │ Samples │           Result │ Tolerance │ Difference with HS512 - verify - jsonwebtoken (sync) ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────────╢
║ HS512 - verify - fast-jwt (sync with cache)  │   10000 │ 233131.07 op/sec │  ± 6.13 % │ + 271.19 %                                           ║
╚══════════════════════════════════════════════╧═════════╧══════════════════╧═══════════╧══════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════╤═════════╤══════════════════╤═══════════╤══════════════════════════════════════════════════════╗
║ Test                                         │ Samples │           Result │ Tolerance │ Difference with ES512 - verify - jsonwebtoken (sync) ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────────╢
║ ES512 - verify - jsonwebtoken (sync)         │    1500 │    572.12 op/sec │  ± 0.29 % │                                                      ║
║ ES512 - verify - fast-jwt (sync)             │    1500 │    577.09 op/sec │  ± 0.36 % │ + 0.87 %                                             ║
║ ES512 - verify - fast-jwt (async)            │    1500 │    591.88 op/sec │  ± 0.27 % │ + 3.45 %                                             ║
║ ES512 - verify - jsonwebtoken (async)        │    1500 │    592.70 op/sec │  ± 0.25 % │ + 3.60 %                                             ║
║ ES512 - verify - fast-jwt (async with cache) │   10000 │ 204739.32 op/sec │  ± 5.15 % │ + 35686.28 %                                         ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────────╢
║ Fastest test                                 │ Samples │           Result │ Tolerance │ Difference with ES512 - verify - jsonwebtoken (sync) ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────────╢
║ ES512 - verify - fast-jwt (sync with cache)  │   10000 │ 207621.47 op/sec │  ± 6.37 % │ + 36190.05 %                                         ║
╚══════════════════════════════════════════════╧═════════╧══════════════════╧═══════════╧══════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════╤═════════╤══════════════════╤═══════════╤═══════════════════════════════════════════════════════╗
║ Test                                         │ Samples │           Result │ Tolerance │ Difference with RS512 - verify - jsonwebtoken (async) ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼───────────────────────────────────────────────────────╢
║ RS512 - verify - jsonwebtoken (async)        │    1500 │   9018.20 op/sec │  ± 0.47 % │                                                       ║
║ RS512 - verify - jsonwebtoken (sync)         │    2001 │   9345.97 op/sec │  ± 0.81 % │ + 3.63 %                                              ║
║ RS512 - verify - fast-jwt (async)            │    1500 │   9997.00 op/sec │  ± 0.60 % │ + 10.85 %                                             ║
║ RS512 - verify - fast-jwt (sync)             │    1500 │  10208.34 op/sec │  ± 0.30 % │ + 13.20 %                                             ║
║ RS512 - verify - fast-jwt (async with cache) │   10000 │ 197003.67 op/sec │  ± 4.56 % │ + 2084.51 %                                           ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼───────────────────────────────────────────────────────╢
║ Fastest test                                 │ Samples │           Result │ Tolerance │ Difference with RS512 - verify - jsonwebtoken (async) ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼───────────────────────────────────────────────────────╢
║ RS512 - verify - fast-jwt (sync with cache)  │    1500 │ 215015.05 op/sec │  ± 0.86 % │ + 2284.24 %                                           ║
╚══════════════════════════════════════════════╧═════════╧══════════════════╧═══════════╧═══════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════╤═════════╤══════════════════╤═══════════╤══════════════════════════════════════════════════════╗
║ Test                                         │ Samples │           Result │ Tolerance │ Difference with PS512 - verify - jsonwebtoken (sync) ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────────╢
║ PS512 - verify - jsonwebtoken (sync)         │    2001 │   8938.14 op/sec │  ± 0.82 % │                                                      ║
║ PS512 - verify - jsonwebtoken (async)        │    1500 │   9076.96 op/sec │  ± 0.59 % │ + 1.55 %                                             ║
║ PS512 - verify - fast-jwt (async)            │    1500 │   9272.08 op/sec │  ± 0.65 % │ + 3.74 %                                             ║
║ PS512 - verify - fast-jwt (sync)             │    1500 │   9928.77 op/sec │  ± 0.51 % │ + 11.08 %                                            ║
║ PS512 - verify - fast-jwt (async with cache) │    1500 │ 206165.87 op/sec │  ± 0.45 % │ + 2206.59 %                                          ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────────╢
║ Fastest test                                 │ Samples │           Result │ Tolerance │ Difference with PS512 - verify - jsonwebtoken (sync) ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────────╢
║ PS512 - verify - fast-jwt (sync with cache)  │    1500 │ 215266.10 op/sec │  ± 0.55 % │ + 2308.40 %                                          ║
╚══════════════════════════════════════════════╧═════════╧══════════════════╧═══════════╧══════════════════════════════════════════════════════╝

╔════════════════════════════════════════╤═════════╤══════════════════╤═══════════╤═══════════════════════════════════════╗
║ Test                                   │ Samples │           Result │ Tolerance │ Difference with EdDSA - verify - jose ║
╟────────────────────────────────────────┼─────────┼──────────────────┼───────────┼───────────────────────────────────────╢
║ EdDSA - verify - jose                  │    1500 │   3650.41 op/sec │  ± 0.88 % │                                       ║
║ EdDSA - verify - fast-jwt              │    1500 │   6941.20 op/sec │  ± 0.67 % │ + 90.15 %                             ║
╟────────────────────────────────────────┼─────────┼──────────────────┼───────────┼───────────────────────────────────────╢
║ Fastest test                           │ Samples │           Result │ Tolerance │ Difference with EdDSA - verify - jose ║
╟────────────────────────────────────────┼─────────┼──────────────────┼───────────┼───────────────────────────────────────╢
║ EdDSA - verify - fast-jwt (with cache) │   10000 │ 214001.77 op/sec │  ± 3.12 % │ + 5762.40 %                           ║
╚════════════════════════════════════════╧═════════╧══════════════════╧═══════════╧═══════════════════════════════════════╝
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

Copyright NearForm Ltd 2020. Licensed under the [Apache-2.0 license](http://www.apache.org/licenses/LICENSE-2.0).

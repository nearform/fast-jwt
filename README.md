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
╔═════════════════════════════════════╤═════════╤══════════════════╤═══════════╤═════════════════════════════════════════════════════╗
║ Test                                │ Samples │           Result │ Tolerance │ Difference with HS512 - sign - jsonwebtoken (async) ║
╟─────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────────────────────────────────╢
║ HS512 - sign - jsonwebtoken (async) │   10000 │  77806.61 op/sec │  ± 1.47 % │                                                     ║
║ HS512 - sign - fast-jwt (async)     │   10000 │  86666.20 op/sec │  ± 1.95 % │ + 11.39 %                                           ║
║ HS512 - sign - jsonwebtoken (sync)  │    1500 │ 102947.55 op/sec │  ± 0.86 % │ + 32.31 %                                           ║
╟─────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────────────────────────────────╢
║ Fastest test                        │ Samples │           Result │ Tolerance │ Difference with HS512 - sign - jsonwebtoken (async) ║
╟─────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────────────────────────────────╢
║ HS512 - sign - fast-jwt (sync)      │   10000 │ 109559.17 op/sec │  ± 1.76 % │ + 40.81 %                                           ║
╚═════════════════════════════════════╧═════════╧══════════════════╧═══════════╧═════════════════════════════════════════════════════╝

╔═════════════════════════════════════╤═════════╤═══════════════╤═══════════╤═════════════════════════════════════════════════╗
║ Test                                │ Samples │        Result │ Tolerance │ Difference with ES512 - sign - fast-jwt (async) ║
╟─────────────────────────────────────┼─────────┼───────────────┼───────────┼─────────────────────────────────────────────────╢
║ ES512 - sign - fast-jwt (async)     │    1500 │ 462.93 op/sec │  ± 0.26 % │                                                 ║
║ ES512 - sign - jsonwebtoken (sync)  │    1500 │ 463.05 op/sec │  ± 0.21 % │ + 0.03 %                                        ║
║ ES512 - sign - fast-jwt (sync)      │    1500 │ 473.86 op/sec │  ± 0.21 % │ + 2.36 %                                        ║
╟─────────────────────────────────────┼─────────┼───────────────┼───────────┼─────────────────────────────────────────────────╢
║ Fastest test                        │ Samples │        Result │ Tolerance │ Difference with ES512 - sign - fast-jwt (async) ║
╟─────────────────────────────────────┼─────────┼───────────────┼───────────┼─────────────────────────────────────────────────╢
║ ES512 - sign - jsonwebtoken (async) │    1500 │ 474.28 op/sec │  ± 0.21 % │ + 2.45 %                                        ║
╚═════════════════════════════════════╧═════════╧═══════════════╧═══════════╧═════════════════════════════════════════════════╝

╔═════════════════════════════════════╤═════════╤═══════════════╤═══════════╤════════════════════════════════════════════════════╗
║ Test                                │ Samples │        Result │ Tolerance │ Difference with RS512 - sign - jsonwebtoken (sync) ║
╟─────────────────────────────────────┼─────────┼───────────────┼───────────┼────────────────────────────────────────────────────╢
║ RS512 - sign - jsonwebtoken (sync)  │    1500 │ 224.22 op/sec │  ± 0.10 % │                                                    ║
║ RS512 - sign - jsonwebtoken (async) │    1500 │ 224.29 op/sec │  ± 0.11 % │ + 0.03 %                                           ║
║ RS512 - sign - fast-jwt (sync)      │    1500 │ 224.74 op/sec │  ± 0.15 % │ + 0.23 %                                           ║
╟─────────────────────────────────────┼─────────┼───────────────┼───────────┼────────────────────────────────────────────────────╢
║ Fastest test                        │ Samples │        Result │ Tolerance │ Difference with RS512 - sign - jsonwebtoken (sync) ║
╟─────────────────────────────────────┼─────────┼───────────────┼───────────┼────────────────────────────────────────────────────╢
║ RS512 - sign - fast-jwt (async)     │    1500 │ 227.55 op/sec │  ± 0.11 % │ + 1.48 %                                           ║
╚═════════════════════════════════════╧═════════╧═══════════════╧═══════════╧════════════════════════════════════════════════════╝

╔═════════════════════════════════════╤═════════╤═══════════════╤═══════════╤═════════════════════════════════════════════════════╗
║ Test                                │ Samples │        Result │ Tolerance │ Difference with PS512 - sign - jsonwebtoken (async) ║
╟─────────────────────────────────────┼─────────┼───────────────┼───────────┼─────────────────────────────────────────────────────╢
║ PS512 - sign - jsonwebtoken (async) │    1500 │ 215.85 op/sec │  ± 0.18 % │                                                     ║
║ PS512 - sign - jsonwebtoken (sync)  │    1500 │ 223.10 op/sec │  ± 0.19 % │ + 3.36 %                                            ║
║ PS512 - sign - fast-jwt (sync)      │    1500 │ 225.33 op/sec │  ± 0.14 % │ + 4.39 %                                            ║
╟─────────────────────────────────────┼─────────┼───────────────┼───────────┼─────────────────────────────────────────────────────╢
║ Fastest test                        │ Samples │        Result │ Tolerance │ Difference with PS512 - sign - jsonwebtoken (async) ║
╟─────────────────────────────────────┼─────────┼───────────────┼───────────┼─────────────────────────────────────────────────────╢
║ PS512 - sign - fast-jwt (async)     │    1500 │ 228.16 op/sec │  ± 0.11 % │ + 5.70 %                                            ║
╚═════════════════════════════════════╧═════════╧═══════════════╧═══════════╧═════════════════════════════════════════════════════╝
```

### Decoding

```
╔══════════════════════════════════════════╤═════════╤══════════════════╤═══════════╤══════════════════════════════════════════════════════════╗
║ Test                                     │ Samples │           Result │ Tolerance │ Difference with RS512 - decode - jsonwebtoken - complete ║
╟──────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────────────╢
║ RS512 - decode - jsonwebtoken - complete │    5500 │ 177441.01 op/sec │  ± 0.95 % │                                                          ║
║ RS512 - decode - jsonwebtoken            │    1500 │ 182976.52 op/sec │  ± 0.64 % │ + 3.12 %                                                 ║
║ RS512 - decode - fast-jwt                │    1500 │ 219636.92 op/sec │  ± 0.73 % │ + 23.78 %                                                ║
╟──────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────────────╢
║ Fastest test                             │ Samples │           Result │ Tolerance │ Difference with RS512 - decode - jsonwebtoken - complete ║
╟──────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────────────╢
║ RS512 - decode - fast-jwt (complete)     │   10000 │ 258624.39 op/sec │  ± 3.58 % │ + 45.75 %                                                ║
╚══════════════════════════════════════════╧═════════╧══════════════════╧═══════════╧══════════════════════════════════════════════════════════╝
```

Note that for decoding the algorithm is irrelevant, so only one was measured.

### Verifying

```
╔══════════════════════════════════════════════╤═════════╤══════════════════╤═══════════╤══════════════════════════════════════════════════════╗
║ Test                                         │ Samples │           Result │ Tolerance │ Difference with HS512 - verify - jsonwebtoken (sync) ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────────╢
║ HS512 - verify - jsonwebtoken (sync)         │   10000 │  67165.37 op/sec │  ± 1.42 % │                                                      ║
║ HS512 - verify - jsonwebtoken (async)        │   10000 │  69813.10 op/sec │  ± 1.10 % │ + 3.94 %                                             ║
║ HS512 - verify - fast-jwt (async)            │   10000 │  85643.35 op/sec │  ± 1.99 % │ + 27.51 %                                            ║
║ HS512 - verify - fast-jwt (sync)             │   10000 │  88782.20 op/sec │  ± 1.94 % │ + 32.18 %                                            ║
║ HS512 - verify - fast-jwt (async with cache) │   10000 │ 221961.68 op/sec │  ± 6.78 % │ + 230.47 %                                           ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────────╢
║ Fastest test                                 │ Samples │           Result │ Tolerance │ Difference with HS512 - verify - jsonwebtoken (sync) ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────────╢
║ HS512 - verify - fast-jwt (sync with cache)  │    2001 │ 258436.85 op/sec │  ± 0.87 % │ + 284.78 %                                           ║
╚══════════════════════════════════════════════╧═════════╧══════════════════╧═══════════╧══════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════╤═════════╤══════════════════╤═══════════╤══════════════════════════════════════════════════════╗
║ Test                                         │ Samples │           Result │ Tolerance │ Difference with ES512 - verify - jsonwebtoken (sync) ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────────╢
║ ES512 - verify - jsonwebtoken (sync)         │    1500 │    592.77 op/sec │  ± 0.34 % │                                                      ║
║ ES512 - verify - jsonwebtoken (async)        │    1500 │    619.44 op/sec │  ± 0.20 % │ + 4.50 %                                             ║
║ ES512 - verify - fast-jwt (async)            │    1500 │    627.47 op/sec │  ± 0.14 % │ + 5.85 %                                             ║
║ ES512 - verify - fast-jwt (sync)             │    1500 │    631.01 op/sec │  ± 0.15 % │ + 6.45 %                                             ║
║ ES512 - verify - fast-jwt (async with cache) │   10000 │ 208602.94 op/sec │  ± 6.84 % │ + 35090.94 %                                         ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────────╢
║ Fastest test                                 │ Samples │           Result │ Tolerance │ Difference with ES512 - verify - jsonwebtoken (sync) ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────────╢
║ ES512 - verify - fast-jwt (sync with cache)  │    1500 │ 247597.89 op/sec │  ± 0.98 % │ + 41669.31 %                                         ║
╚══════════════════════════════════════════════╧═════════╧══════════════════╧═══════════╧══════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════╤═════════╤══════════════════╤═══════════╤═══════════════════════════════════════════════════════╗
║ Test                                         │ Samples │           Result │ Tolerance │ Difference with RS512 - verify - jsonwebtoken (async) ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼───────────────────────────────────────────────────────╢
║ RS512 - verify - jsonwebtoken (async)        │    1500 │   8980.64 op/sec │  ± 0.70 % │                                                       ║
║ RS512 - verify - jsonwebtoken (sync)         │    1500 │   9060.55 op/sec │  ± 1.00 % │ + 0.89 %                                              ║
║ RS512 - verify - fast-jwt (sync)             │    1500 │  10055.72 op/sec │  ± 0.15 % │ + 11.97 %                                             ║
║ RS512 - verify - fast-jwt (async)            │    1500 │  10055.92 op/sec │  ± 0.64 % │ + 11.97 %                                             ║
║ RS512 - verify - fast-jwt (sync with cache)  │   10000 │ 180277.60 op/sec │  ± 5.26 % │ + 1907.40 %                                           ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼───────────────────────────────────────────────────────╢
║ Fastest test                                 │ Samples │           Result │ Tolerance │ Difference with RS512 - verify - jsonwebtoken (async) ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼───────────────────────────────────────────────────────╢
║ RS512 - verify - fast-jwt (async with cache) │    1500 │ 193234.10 op/sec │  ± 0.53 % │ + 2051.67 %                                           ║
╚══════════════════════════════════════════════╧═════════╧══════════════════╧═══════════╧═══════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════╤═════════╤══════════════════╤═══════════╤══════════════════════════════════════════════════╗
║ Test                                         │ Samples │           Result │ Tolerance │ Difference with PS512 - verify - fast-jwt (sync) ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────╢
║ PS512 - verify - fast-jwt (sync)             │    1500 │   8811.84 op/sec │  ± 0.39 % │                                                  ║
║ PS512 - verify - jsonwebtoken (sync)         │    2001 │   9073.02 op/sec │  ± 0.87 % │ + 2.96 %                                         ║
║ PS512 - verify - jsonwebtoken (async)        │    1500 │   9192.43 op/sec │  ± 0.61 % │ + 4.32 %                                         ║
║ PS512 - verify - fast-jwt (async)            │    1500 │   9972.23 op/sec │  ± 0.62 % │ + 13.17 %                                        ║
║ PS512 - verify - fast-jwt (async with cache) │   10000 │ 185040.49 op/sec │  ± 5.53 % │ + 1999.91 %                                      ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────╢
║ Fastest test                                 │ Samples │           Result │ Tolerance │ Difference with PS512 - verify - fast-jwt (sync) ║
╟──────────────────────────────────────────────┼─────────┼──────────────────┼───────────┼──────────────────────────────────────────────────╢
║ PS512 - verify - fast-jwt (sync with cache)  │    1500 │ 202087.05 op/sec │  ± 0.52 % │ + 2193.36 %                                      ║
╚══════════════════════════════════════════════╧═════════╧══════════════════╧═══════════╧══════════════════════════════════════════════════╝
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

Copyright NearForm Ltd 2020. Licensed under the [Apache-2.0 license](http://www.apache.org/licenses/LICENSE-2.0).

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

- `key`: A string, buffer or object containing the secret for `HS*` algorithms or the PEM encoded public key for `RS*`, `PS*` and `ES*` algorithms. The key can also be a function accepting a Node style callback or a function returning a promise. This is the only mandatory option.
- `algorithm`: The algorithm to use to sign the token. The default is autodetected from the key, using `RS256` for RSA private keys, `HS256` for plain secrets and the correspondent `ES` algorithm for EC private keys.
- `cache`: A positive number specifying the size of the signed tokens cache (using LRU strategy). Setting to `true` is equivalent to provide the size `1000`. When enabled, as you can see in the benchmarks section below, performances dramatically improve. A error will be thrown if this option is provided and the `noTimestamp` option is not `true` or any of the `mutatePayload`, `expiresIn` or `notBefore` are set.
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
- `cache`: A positive number specifying the size of the decoded tokens cache (using LRU strategy). Setting to `true` is equivalent to provide the size `1000`. When enabled, as you can see in the benchmarks section below, performances dramatically improve. By default the cache is disabled.

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

- `key`: A string, buffer or object containing the secret for `HS*` algorithms or the PEM encoded public key for `RS*`, `PS*` and `ES*` algorithms. The key can also be a function accepting a Node style callback or a function returning a promise. This is the only mandatory option, which must NOT be provided if the token algorithm is `none`.
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

| Name    | Description                                              |
| ------- | -------------------------------------------------------- |
| `none`  | Empty algorithm - The token signature section will empty |
| `HS256` | HMAC using SHA-256 hash algorithm                        |
| `HS384` | HMAC using SHA-384 hash algorithm                        |
| `HS512` | HMAC using SHA-512 hash algorithm                        |
| `ES256` | ECDSA using P-256 curve and SHA-256 hash algorithm       |
| `ES384` | ECDSA using P-384 curve and SHA-384 hash algorithm       |
| `ES512` | ECDSA using P-521 curve and SHA-512 hash algorithm       |
| `RS256` | RSASSA-PKCS1-v1_5 using SHA-256 hash algorithm           |
| `RS384` | RSASSA-PKCS1-v1_5 using SHA-384 hash algorithm           |
| `RS512` | RSASSA-PKCS1-v1_5 using SHA-512 hash algorithm           |
| `PS256` | RSASSA-PSS using SHA-256 hash algorithm                  |
| `PS384` | RSASSA-PSS using SHA-384 hash algorithm                  |
| `PS512` | RSASSA-PSS using SHA-512 hash algorithm                  |

## Caching

fast-jwt supports caching of decoded and verified tokens.

The cache layer, powered by [mnemonist](https://www.npmjs.com/package/mnemonist), is a LRU cache which dimension is controlled by the user, as described in the option list.

When caching is enabled, decoded and verified tokens are always stored in cache. If the decoding fails once, the error is cached as well and the operation is not retried.

For verified tokens, caching considers the time sensitive claims of the token (`iat`, `nbf` and `exp`) and make sure the verification is retried after a token becomes valid or after a token becomes expired.

Performances improvements varies by uses cases and by the type of the operation performed and the algorithm used.

## Benchmarks

### Signing

```
╔════════════════════════════════════════════╤═════════╤═══════════════════╤═══════════╗
║ Test                                       │ Samples │            Result │ Tolerance ║
╟────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ HS512 - sign - jsonwebtoken (async)        │   10000 │   68651.23 op/sec │ ±  1.71 % ║
║ HS512 - sign - jsonwebtoken (sync)         │   10000 │   74610.01 op/sec │ ±  1.87 % ║
║ HS512 - sign - fast-jwt (sync)             │   10000 │   81847.37 op/sec │ ±  2.19 % ║
║ HS512 - sign - fast-jwt (async)            │   10000 │   93871.52 op/sec │ ±  2.09 % ║
║ HS512 - sign - fast-jwt (async with cache) │   10000 │ 1657089.24 op/sec │ ± 27.18 % ║
╟────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ Fastest test                               │ Samples │            Result │ Tolerance ║
╟────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ HS512 - sign - fast-jwt (sync with cache)  │   10000 │ 1699953.17 op/sec │ ± 22.65 % ║
╚════════════════════════════════════════════╧═════════╧═══════════════════╧═══════════╝

╔════════════════════════════════════════════╤═════════╤═══════════════════╤═══════════╗
║ Test                                       │ Samples │            Result │ Tolerance ║
╟────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ ES512 - sign - fast-jwt (sync)             │    3000 │   10565.37 op/sec │ ±  0.96 % ║
║ ES512 - sign - jsonwebtoken (sync)         │    2001 │   10841.32 op/sec │ ±  0.89 % ║
║ ES512 - sign - jsonwebtoken (async)        │    1500 │   10957.96 op/sec │ ±  0.82 % ║
║ ES512 - sign - fast-jwt (async)            │    1500 │   11619.48 op/sec │ ±  0.85 % ║
║ ES512 - sign - fast-jwt (sync with cache)  │   10000 │ 2676030.63 op/sec │ ± 25.56 % ║
╟────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ Fastest test                               │ Samples │            Result │ Tolerance ║
╟────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ ES512 - sign - fast-jwt (async with cache) │   10000 │ 3483443.02 op/sec │ ± 12.08 % ║
╚════════════════════════════════════════════╧═════════╧═══════════════════╧═══════════╝

╔════════════════════════════════════════════╤═════════╤═══════════════════╤═══════════╗
║ Test                                       │ Samples │            Result │ Tolerance ║
╟────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ RS512 - sign - fast-jwt (sync)             │    1500 │     218.45 op/sec │ ±  0.23 % ║
║ RS512 - sign - fast-jwt (async)            │    1500 │     223.78 op/sec │ ±  0.15 % ║
║ RS512 - sign - jsonwebtoken (async)        │    1500 │     226.58 op/sec │ ±  0.14 % ║
║ RS512 - sign - jsonwebtoken (sync)         │    1500 │     228.36 op/sec │ ±  0.11 % ║
║ RS512 - sign - fast-jwt (async with cache) │   10000 │ 1395754.26 op/sec │ ± 64.43 % ║
╟────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ Fastest test                               │ Samples │            Result │ Tolerance ║
╟────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ RS512 - sign - fast-jwt (sync with cache)  │   10000 │ 1496408.77 op/sec │ ± 64.24 % ║
╚════════════════════════════════════════════╧═════════╧═══════════════════╧═══════════╝

╔════════════════════════════════════════════╤═════════╤═══════════════════╤═══════════╗
║ Test                                       │ Samples │            Result │ Tolerance ║
╟────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ PS512 - sign - fast-jwt (sync)             │    1500 │     225.55 op/sec │ ±  0.12 % ║
║ PS512 - sign - fast-jwt (async)            │    1500 │     226.44 op/sec │ ±  0.15 % ║
║ PS512 - sign - jsonwebtoken (sync)         │    1500 │     227.84 op/sec │ ±  0.12 % ║
║ PS512 - sign - jsonwebtoken (async)        │    1500 │     228.34 op/sec │ ±  0.13 % ║
║ PS512 - sign - fast-jwt (async with cache) │   10000 │ 1531958.02 op/sec │ ± 66.76 % ║
╟────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ Fastest test                               │ Samples │            Result │ Tolerance ║
╟────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ PS512 - sign - fast-jwt (sync with cache)  │   10000 │ 1556430.65 op/sec │ ± 64.51 % ║
╚════════════════════════════════════════════╧═════════╧═══════════════════╧═══════════╝
```

### Decoding

```
╔═════════════════════════════════════════════════╤═══════════════════╤═══════════╗
║ Test                                            │            Result │ Tolerance ║
╟─────────────────────────────────────────────────┼───────────────────┼───────────╢
║ HS512 - decode - jsonwebtoken                   │  133590.42 op/sec │ ±  2.15 % ║
║ HS512 - decode - jsonwebtoken - complete        │  146678.27 op/sec │ ±  2.49 % ║
║ HS512 - decode - fast-jwt (complete)            │  157087.46 op/sec │ ±  2.54 % ║
║ HS512 - decode - fast-jwt                       │  169393.63 op/sec │ ±  3.04 % ║
║ HS512 - decode - fast-jwt (with cache)          │ 1346410.52 op/sec │ ± 22.80 % ║
╟─────────────────────────────────────────────────┼───────────────────┼───────────╢
║ Fastest test                                    │            Result │ Tolerance ║
╟─────────────────────────────────────────────────┼───────────────────┼───────────╢
║ HS512 - decode - fast-jwt (complete with cache) │ 2260927.95 op/sec │ ± 23.91 % ║
╚═════════════════════════════════════════════════╧═══════════════════╧═══════════╝

╔═════════════════════════════════════════════════╤═══════════════════╤═══════════╗
║ Test                                            │            Result │ Tolerance ║
╟─────────────────────────────────────────────────┼───────────────────┼───────────╢
║ ES512 - decode - jsonwebtoken                   │  149777.70 op/sec │  ± 1.80 % ║
║ ES512 - decode - jsonwebtoken - complete        │  160821.20 op/sec │  ± 1.27 % ║
║ ES512 - decode - fast-jwt (complete)            │  186599.21 op/sec │  ± 0.65 % ║
║ ES512 - decode - fast-jwt                       │  223111.91 op/sec │  ± 0.87 % ║
║ ES512 - decode - fast-jwt (with cache)          │ 3035478.46 op/sec │  ± 7.62 % ║
╟─────────────────────────────────────────────────┼───────────────────┼───────────╢
║ Fastest test                                    │            Result │ Tolerance ║
╟─────────────────────────────────────────────────┼───────────────────┼───────────╢
║ ES512 - decode - fast-jwt (complete with cache) │ 4131311.34 op/sec │  ± 1.79 % ║
╚═════════════════════════════════════════════════╧═══════════════════╧═══════════╝

╔═════════════════════════════════════════════════╤═══════════════════╤═══════════╗
║ Test                                            │            Result │ Tolerance ║
╟─────────────────────────────────────────────────┼───────────────────┼───────────╢
║ RS512 - decode - fast-jwt (complete)            │  130119.11 op/sec │  ± 0.62 % ║
║ RS512 - decode - jsonwebtoken                   │  147891.25 op/sec │  ± 0.44 % ║
║ RS512 - decode - jsonwebtoken - complete        │  149441.58 op/sec │  ± 0.48 % ║
║ RS512 - decode - fast-jwt                       │  225592.85 op/sec │  ± 0.84 % ║
║ RS512 - decode - fast-jwt (complete with cache) │ 4283876.07 op/sec │  ± 6.09 % ║
╟─────────────────────────────────────────────────┼───────────────────┼───────────╢
║ Fastest test                                    │            Result │ Tolerance ║
╟─────────────────────────────────────────────────┼───────────────────┼───────────╢
║ RS512 - decode - fast-jwt (with cache)          │ 4910784.87 op/sec │  ± 2.36 % ║
╚═════════════════════════════════════════════════╧═══════════════════╧═══════════╝

╔═════════════════════════════════════════════════╤═══════════════════╤═══════════╗
║ Test                                            │            Result │ Tolerance ║
╟─────────────────────────────────────────────────┼───────────────────┼───────────╢
║ PS512 - decode - fast-jwt (complete)            │  131923.01 op/sec │  ± 0.58 % ║
║ PS512 - decode - jsonwebtoken                   │  148500.24 op/sec │  ± 0.39 % ║
║ PS512 - decode - jsonwebtoken - complete        │  149895.47 op/sec │  ± 0.29 % ║
║ PS512 - decode - fast-jwt                       │  224998.94 op/sec │  ± 0.43 % ║
║ PS512 - decode - fast-jwt (complete with cache) │ 4557971.14 op/sec │  ± 2.55 % ║
╟─────────────────────────────────────────────────┼───────────────────┼───────────╢
║ Fastest test                                    │            Result │ Tolerance ║
╟─────────────────────────────────────────────────┼───────────────────┼───────────╢
║ PS512 - decode - fast-jwt (with cache)          │ 4814183.86 op/sec │  ± 2.32 % ║
╚═════════════════════════════════════════════════╧═══════════════════╧═══════════╝
```

### Verifying

```
╔══════════════════════════════════════════════╤═════════╤═══════════════════╤═══════════╗
║ Test                                         │ Samples │            Result │ Tolerance ║
╟──────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ HS512 - verify - jsonwebtoken (sync)         │   10000 │   54602.83 op/sec │ ±  1.41 % ║
║ HS512 - verify - fast-jwt (sync)             │   10000 │   55864.01 op/sec │ ±  1.64 % ║
║ HS512 - verify - fast-jwt (async)            │   10000 │   62636.54 op/sec │ ±  1.71 % ║
║ HS512 - verify - jsonwebtoken (async)        │   10000 │   63385.51 op/sec │ ±  0.99 % ║
║ HS512 - verify - fast-jwt (async with cache) │   10000 │ 1462111.43 op/sec │ ± 21.81 % ║
╟──────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ Fastest test                                 │ Samples │            Result │ Tolerance ║
╟──────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ HS512 - verify - fast-jwt (sync with cache)  │   10000 │ 1480927.94 op/sec │ ± 19.13 % ║
╚══════════════════════════════════════════════╧═════════╧═══════════════════╧═══════════╝

╔══════════════════════════════════════════════╤═════════╤═══════════════════╤═══════════╗
║ Test                                         │ Samples │            Result │ Tolerance ║
╟──────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ ES512 - verify - fast-jwt (sync)             │    2001 │    7060.35 op/sec │  ± 0.88 % ║
║ ES512 - verify - jsonwebtoken (sync)         │    1500 │    7428.13 op/sec │  ± 0.93 % ║
║ ES512 - verify - fast-jwt (async)            │    1500 │    7665.73 op/sec │  ± 0.74 % ║
║ ES512 - verify - jsonwebtoken (async)        │    1500 │    8282.75 op/sec │  ± 0.63 % ║
║ ES512 - verify - fast-jwt (sync with cache)  │   10000 │ 2473653.73 op/sec │  ± 9.94 % ║
╟──────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ Fastest test                                 │ Samples │            Result │ Tolerance ║
╟──────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ ES512 - verify - fast-jwt (async with cache) │   10000 │ 3419232.43 op/sec │  ± 8.76 % ║
╚══════════════════════════════════════════════╧═════════╧═══════════════════╧═══════════╝

╔══════════════════════════════════════════════╤═════════╤═══════════════════╤═══════════╗
║ Test                                         │ Samples │            Result │ Tolerance ║
╟──────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ RS512 - verify - fast-jwt (sync)             │    1500 │    9437.64 op/sec │ ±  0.70 % ║
║ RS512 - verify - jsonwebtoken (async)        │    1500 │    9445.71 op/sec │ ±  0.63 % ║
║ RS512 - verify - jsonwebtoken (sync)         │    1500 │    9484.53 op/sec │ ±  0.74 % ║
║ RS512 - verify - fast-jwt (async)            │    1500 │    9735.93 op/sec │ ±  0.53 % ║
║ RS512 - verify - fast-jwt (sync with cache)  │   10000 │ 3556539.37 op/sec │ ± 10.80 % ║
╟──────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ Fastest test                                 │ Samples │            Result │ Tolerance ║
╟──────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ RS512 - verify - fast-jwt (async with cache) │   10000 │ 3658708.37 op/sec │ ± 10.05 % ║
╚══════════════════════════════════════════════╧═════════╧═══════════════════╧═══════════╝

╔══════════════════════════════════════════════╤═════════╤═══════════════════╤═══════════╗
║ Test                                         │ Samples │            Result │ Tolerance ║
╟──────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ PS512 - verify - jsonwebtoken (async)        │    1500 │    8158.49 op/sec │ ±  0.93 % ║
║ PS512 - verify - fast-jwt (sync)             │    2001 │    8600.43 op/sec │ ±  0.86 % ║
║ PS512 - verify - jsonwebtoken (sync)         │    1500 │    8617.49 op/sec │ ±  0.68 % ║
║ PS512 - verify - fast-jwt (async)            │    1500 │    8876.50 op/sec │ ±  0.69 % ║
║ PS512 - verify - fast-jwt (sync with cache)  │   10000 │ 3395266.39 op/sec │ ± 10.28 % ║
╟──────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ Fastest test                                 │ Samples │            Result │ Tolerance ║
╟──────────────────────────────────────────────┼─────────┼───────────────────┼───────────╢
║ PS512 - verify - fast-jwt (async with cache) │   10000 │ 3625159.91 op/sec │ ±  8.13 % ║
╚══════════════════════════════════════════════╧═════════╧═══════════════════╧═══════════╝
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

Copyright NearForm Ltd 2020. Licensed under the [Apache-2.0 license](http://www.apache.org/licenses/LICENSE-2.0).

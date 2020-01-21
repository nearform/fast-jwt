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

- `secret`: A string, buffer or object containing the secret for `HS*` algorithms or the PEM encoded public key for `RS*`, `PS*` and `ES*` algorithms (whose format is defined by the Node's crypto module documentation). The secret can also be a function accepting a Node style callback or a function returning a promise. This is the only mandatory option.
- `algorithm`: The algorithm to use to sign the token, default is `HS256`.
- `encoding`: The token encoding, default is `utf-8`.
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

If the `secret` option is a function, the signer will also accept a Node style callback and will return a promise, supporting therefore both callback and async/await styles.

#### Example

```javascript
const {createSigner} = require('fast-jwt')

// Sync style
const signSync = createSigner({ secret: 'secret' })
const token = signSync({a: 1, b: 2, c: 3})
// => eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1Nzk1MjEyMTJ9.mIcxteEVjbh2MnKQ3EQlojZojGSyA_guqRBYHQURcfnCSSBTT2OShF8lo9_ogjAv-5oECgmCur_cDWB7x3X53g

// Callback style
const signWithCallback = createSigner({ secret: (callback) => callback(null, 'secret') })

signWithCallback({a: 1, b: 2, c: 3}, (err, token) => {
  // token === eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1Nzk1MjEyMTJ9.mIcxteEVjbh2MnKQ3EQlojZojGSyA_guqRBYHQURcfnCSSBTT2OShF8lo9_ogjAv-5oECgmCur_cDWB7x3X53g
})

// Promise style - Note that the secret function style and the signer function style are unrelated
async function test() {
  const signWithPromise = createSigner({ async secret(): => 'secret' })

  const token = await signWithPromise({a: 1, b: 2, c: 3})
  // => eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1Nzk1MjEyMTJ9.mIcxteEVjbh2MnKQ3EQlojZojGSyA_guqRBYHQURcfnCSSBTT2OShF8lo9_ogjAv-5oECgmCur_cDWB7x3X53g
}
```

### createDecoder

Create a decoder function by calling `createDecoder` and providing one or more of the following options:

- `complete`: Return an object with the decoded header, payload, signature and input (the token part before the signature), instead of just the content of the payload. Default is `false`.
- `json`: Always parse the payload as JSON even if the `typ` claim of the header is not `JWT`. Default is `false`.
- `encoding`: The token encoding, default is `utf-8`.

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

- `secret`: A string, buffer or object containing the secret for `HS*` algorithms or the PEM encoded public key for `RS*`, `PS*` and `ES*` algorithms (whose format is defined by the Node's crypto module documentation). The secret can also be a function accepting a Node style callback or a function returning a promise. This is the only mandatory option, which must NOT be provided if the token algorithm is `none`.
- `algorithms`: List of strings with the names of the allowed algorithms. By default, all algorithms are accepted.
- `complete`: Return an object with the decoded header, payload, signature and input (the token part before the signature), instead of just the content of the payload. Default is `false`.
- `encoding`: The token encoding. Default is `utf-8`.
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

If the `secret` option is a function, the signer will also accept a Node style callback and will return a promise, supporting therefore both callback and async/await styles.

#### Examples

```javascript
const { createVerifier } = require('fast-jwt')
const token =
  'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1Nzk1MjEyMTJ9.mIcxteEVjbh2MnKQ3EQlojZojGSyA_guqRBYHQURcfnCSSBTT2OShF8lo9_ogjAv-5oECgmCur_cDWB7x3X53g'

// Sync style
const verifySync = createVerifier({ secret: 'secret' })
const payload = verifySync(token)
// => { a: 1, b: 2, c: 3, iat: 1579521212 }

// Callback style with complete return
const verifyWithCallback = createVerifier({ secret: callback => callback(null, 'secret'), complete: true })

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

// Promise style - Note that the secret function style and the verifier function style are unrelated
async function test() {
  const verifyWithPromise = createVerifier({ async secret(): => 'secret' })

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

## Benchmarks

### Signing

```
Executed: HS512 - sign - fast-jwt (sync) x 101,851 ops/sec ±1.77% (85 runs sampled)
Executed: HS512 - sign - fast-jwt (async) x 90,458 ops/sec ±1.92% (73 runs sampled)
Executed: HS512 - sign - jsonwebtoken (sync) x 91,368 ops/sec ±2.13% (85 runs sampled)
Executed: HS512 - sign - jsonwebtoken (async) x 66,956 ops/sec ±6.20% (76 runs sampled)
Fastest HS512 sign implementation is: fast-jwt (sync)

Executed: ES512 - sign - fast-jwt (sync) x 11,740 ops/sec ±0.87% (86 runs sampled)
Executed: ES512 - sign - fast-jwt (async) x 10,613 ops/sec ±1.11% (81 runs sampled)
Executed: ES512 - sign - jsonwebtoken (sync) x 11,115 ops/sec ±0.92% (87 runs sampled)
Executed: ES512 - sign - jsonwebtoken (async) x 9,905 ops/sec ±1.07% (82 runs sampled)
Fastest ES512 sign implementation is: fast-jwt (sync)

Executed: RS512 - sign - fast-jwt (sync) x 214 ops/sec ±0.95% (82 runs sampled)
Executed: RS512 - sign - fast-jwt (async) x 197 ops/sec ±0.95% (82 runs sampled)
Executed: RS512 - sign - jsonwebtoken (sync) x 204 ops/sec ±0.68% (81 runs sampled)
Executed: RS512 - sign - jsonwebtoken (async) x 193 ops/sec ±1.18% (81 runs sampled)
Fastest RS512 sign implementation is: fast-jwt (sync)

Executed: PS512 - sign - fast-jwt (sync) x 213 ops/sec ±0.78% (82 runs sampled)
Executed: PS512 - sign - fast-jwt (async) x 200 ops/sec ±1.00% (77 runs sampled)
Executed: PS512 - sign - jsonwebtoken (sync) x 207 ops/sec ±1.27% (79 runs sampled)
Executed: PS512 - sign - jsonwebtoken (async) x 183 ops/sec ±1.73% (76 runs sampled)
Fastest PS512 sign implementation is: fast-jwt (sync)
```

### Decoding

```
Executed: HS512 - decode - fast-jwt x 284,617 ops/sec ±1.18% (89 runs sampled)
Executed: HS512 - decode - fast-jwt - complete x 226,624 ops/sec ±0.59% (91 runs sampled)
Executed: HS512 - decode - jsonwebtoken x 196,440 ops/sec ±0.74% (93 runs sampled)
Executed: HS512 - decode - jsonwebtoken - complete x 192,882 ops/sec ±1.25% (87 runs sampled)
Fastest HS512 decode implementation is: fast-jwt

Executed: ES512 - decode - fast-jwt x 276,455 ops/sec ±0.99% (89 runs sampled)
Executed: ES512 - decode - fast-jwt - complete x 226,998 ops/sec ±1.45% (87 runs sampled)
Executed: ES512 - decode - jsonwebtoken x 175,990 ops/sec ±1.50% (87 runs sampled)
Executed: ES512 - decode - jsonwebtoken - complete x 179,662 ops/sec ±1.20% (88 runs sampled)
Fastest ES512 decode implementation is: fast-jwt

Executed: RS512 - decode - fast-jwt x 252,576 ops/sec ±1.97% (83 runs sampled)
Executed: RS512 - decode - fast-jwt - complete x 144,362 ops/sec ±1.00% (87 runs sampled)
Executed: RS512 - decode - jsonwebtoken x 158,120 ops/sec ±1.41% (87 runs sampled)
Executed: RS512 - decode - jsonwebtoken - complete x 170,522 ops/sec ±1.11% (89 runs sampled)
Fastest RS512 decode implementation is: fast-jwt

Executed: PS512 - decode - fast-jwt x 268,977 ops/sec ±1.34% (84 runs sampled)
Executed: PS512 - decode - fast-jwt - complete x 156,379 ops/sec ±1.17% (87 runs sampled)
Executed: PS512 - decode - jsonwebtoken x 169,545 ops/sec ±1.01% (88 runs sampled)
Executed: PS512 - decode - jsonwebtoken - complete x 172,095 ops/sec ±1.23% (90 runs sampled)
Fastest PS512 decode implementation is: fast-jwt
```

### Verifying

```
Executed: HS512 - verify - fast-jwt (sync) x 93,823 ops/sec ±0.61% (91 runs sampled)
Executed: HS512 - verify - fast-jwt (async) x 76,477 ops/sec ±1.82% (81 runs sampled)
Executed: HS512 - verify - jsonwebtoken (sync) x 65,303 ops/sec ±1.92% (87 runs sampled)
Executed: HS512 - verify - jsonwebtoken (async) x 34,475 ops/sec ±5.26% (61 runs sampled)
Fastest HS512 verify implementation is: fast-jwt (sync)

Executed: ES512 - verify - fast-jwt (sync) x 7,701 ops/sec ±1.27% (89 runs sampled)
Executed: ES512 - verify - fast-jwt (async) x 7,381 ops/sec ±0.92% (82 runs sampled)
Executed: ES512 - verify - jsonwebtoken (sync) x 7,607 ops/sec ±0.71% (88 runs sampled)
Executed: ES512 - verify - jsonwebtoken (async) x 7,071 ops/sec ±1.27% (79 runs sampled)
Fastest ES512 verify implementation is: fast-jwt (sync)

Executed: RS512 - verify - fast-jwt (sync) x 9,237 ops/sec ±0.65% (91 runs sampled)
Executed: RS512 - verify - fast-jwt (async) x 8,596 ops/sec ±1.16% (82 runs sampled)
Executed: RS512 - verify - jsonwebtoken (sync) x 8,870 ops/sec ±0.61% (90 runs sampled)
Executed: RS512 - verify - jsonwebtoken (async) x 8,231 ops/sec ±0.86% (83 runs sampled)
Fastest RS512 verify implementation is: fast-jwt (sync)

Executed: PS512 - verify - fast-jwt (sync) x 8,405 ops/sec ±0.72% (90 runs sampled)
Executed: PS512 - verify - fast-jwt (async) x 7,919 ops/sec ±0.81% (81 runs sampled)
Executed: PS512 - verify - jsonwebtoken (sync) x 7,921 ops/sec ±1.30% (88 runs sampled)
Executed: PS512 - verify - jsonwebtoken (async) x 7,456 ops/sec ±0.99% (81 runs sampled)
Fastest PS512 verify implementation is: fast-jwt (sync)
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

Copyright NearForm Ltd 2020. Licensed under the [Apache-2.0 license](http://www.apache.org/licenses/LICENSE-2.0).

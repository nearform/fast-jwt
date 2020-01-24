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
- `cache`: Enable caching of signed tokens, which will dramatically improve performances (see benchmarks section below). This is only available if `noTimestamp` option is `true` and `mutatePayload`, `expiresIn` and `notBefore` options are either unset or `false`. Default is `false`.
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
- `cache`: Enable caching of decoded tokens, which will dramatically improve performances (see benchmarks section below). Default is `false`.

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
- `cache`: Enable caching of verified tokens, which will dramatically improve performances (see benchmarks section below). This will consider token time claims about expiration and validity. If the verifier is set to use asynchronous secret fetching and the response are time sensitive, this should probably be left disabled. Default is `false`.
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
Executed: HS512 - sign - fast-jwt (sync) x 100,450 ops/sec ±1.45% (82 runs sampled)
Executed: HS512 - sign - fast-jwt (async) x 91,219 ops/sec ±1.35% (78 runs sampled)
Executed: HS512 - sign - fast-jwt (sync with cache) x 8,718,626 ops/sec ±1.28% (87 runs sampled)
Executed: HS512 - sign - fast-jwt (async with cache) x 164,722 ops/sec ±2.44% (59 runs sampled)
Executed: HS512 - sign - jsonwebtoken (sync) x 95,234 ops/sec ±1.19% (89 runs sampled)
Executed: HS512 - sign - jsonwebtoken (async) x 69,411 ops/sec ±0.88% (79 runs sampled)
Fastest HS512 sign implementation is: fast-jwt (sync with cache)

Executed: ES512 - sign - fast-jwt (sync) x 11,351 ops/sec ±1.24% (86 runs sampled)
Executed: ES512 - sign - fast-jwt (async) x 10,155 ops/sec ±0.83% (82 runs sampled)
Executed: ES512 - sign - fast-jwt (sync with cache) x 9,135,171 ops/sec ±0.92% (90 runs sampled)
Executed: ES512 - sign - fast-jwt (async with cache) x 168,939 ops/sec ±21.41% (24 runs sampled)
Executed: ES512 - sign - jsonwebtoken (sync) x 10,923 ops/sec ±1.07% (85 runs sampled)
Executed: ES512 - sign - jsonwebtoken (async) x 9,593 ops/sec ±0.94% (81 runs sampled)
Fastest ES512 sign implementation is: fast-jwt (sync with cache)

Executed: RS512 - sign - fast-jwt (sync) x 215 ops/sec ±0.81% (83 runs sampled)
Executed: RS512 - sign - fast-jwt (async) x 193 ops/sec ±1.05% (81 runs sampled)
Executed: RS512 - sign - fast-jwt (sync with cache) x 8,804,472 ops/sec ±1.17% (90 runs sampled)
Executed: RS512 - sign - fast-jwt (async with cache) x 148,252 ops/sec ±6.99% (77 runs sampled)
Executed: RS512 - sign - jsonwebtoken (sync) x 217 ops/sec ±0.75% (83 runs sampled)
Executed: RS512 - sign - jsonwebtoken (async) x 193 ops/sec ±0.85% (81 runs sampled)
Fastest RS512 sign implementation is: fast-jwt (sync with cache)

Executed: PS512 - sign - fast-jwt (sync) x 216 ops/sec ±0.83% (82 runs sampled)
Executed: PS512 - sign - fast-jwt (async) x 193 ops/sec ±1.11% (80 runs sampled)
Executed: PS512 - sign - fast-jwt (sync with cache) x 8,409,535 ops/sec ±1.84% (83 runs sampled)
Executed: PS512 - sign - fast-jwt (async with cache) x 123,051 ops/sec ±42.34% (36 runs sampled)
Executed: PS512 - sign - jsonwebtoken (sync) x 207 ops/sec ±1.32% (80 runs sampled)
Executed: PS512 - sign - jsonwebtoken (async) x 191 ops/sec ±1.15% (74 runs sampled)
Fastest PS512 sign implementation is: fast-jwt (sync with cache)
```

### Decoding

```
Executed: HS512 - decode - fast-jwt x 279,474 ops/sec ±1.66% (85 runs sampled)
Executed: HS512 - decode - fast-jwt (complete) x 214,984 ops/sec ±1.19% (88 runs sampled)
Executed: HS512 - decode - fast-jwt (with cache) x 31,297,380 ops/sec ±1.04% (86 runs sampled)
Executed: HS512 - decode - fast-jwt (complete with cache) x 31,231,233 ops/sec ±1.16% (89 runs sampled)
Executed: HS512 - decode - jsonwebtoken x 193,014 ops/sec ±1.04% (89 runs sampled)
Executed: HS512 - decode - jsonwebtoken - complete x 184,695 ops/sec ±1.26% (86 runs sampled)
Fastest HS512 decode implementation is: fast-jwt (with cache) OR fast-jwt (complete with cache)

Executed: ES512 - decode - fast-jwt x 281,957 ops/sec ±1.36% (85 runs sampled)
Executed: ES512 - decode - fast-jwt (complete) x 221,500 ops/sec ±1.19% (89 runs sampled)
Executed: ES512 - decode - fast-jwt (with cache) x 23,560,218 ops/sec ±0.92% (87 runs sampled)
Executed: ES512 - decode - fast-jwt (complete with cache) x 23,667,858 ops/sec ±0.94% (90 runs sampled)
Executed: ES512 - decode - jsonwebtoken x 189,484 ops/sec ±0.83% (90 runs sampled)
Executed: ES512 - decode - jsonwebtoken - complete x 186,878 ops/sec ±1.59% (88 runs sampled)
Fastest ES512 decode implementation is: fast-jwt (complete with cache) OR fast-jwt (with cache)

Executed: RS512 - decode - fast-jwt x 270,117 ops/sec ±2.15% (84 runs sampled)
Executed: RS512 - decode - fast-jwt (complete) x 161,117 ops/sec ±0.98% (90 runs sampled)
Executed: RS512 - decode - fast-jwt (with cache) x 23,574,709 ops/sec ±0.72% (89 runs sampled)
Executed: RS512 - decode - fast-jwt (complete with cache) x 23,881,450 ops/sec ±0.62% (90 runs sampled)
Executed: RS512 - decode - jsonwebtoken x 175,141 ops/sec ±1.06% (91 runs sampled)
Executed: RS512 - decode - jsonwebtoken - complete x 174,509 ops/sec ±0.76% (88 runs sampled)
Fastest RS512 decode implementation is: fast-jwt (complete with cache)

Executed: PS512 - decode - fast-jwt x 280,091 ops/sec ±1.50% (88 runs sampled)
Executed: PS512 - decode - fast-jwt (complete) x 159,377 ops/sec ±1.37% (86 runs sampled)
Executed: PS512 - decode - fast-jwt (with cache) x 22,586,591 ops/sec ±1.26% (87 runs sampled)
Executed: PS512 - decode - fast-jwt (complete with cache) x 22,799,881 ops/sec ±1.05% (88 runs sampled)
Executed: PS512 - decode - jsonwebtoken x 170,633 ops/sec ±1.87% (88 runs sampled)
Executed: PS512 - decode - jsonwebtoken - complete x 176,970 ops/sec ±0.60% (91 runs sampled)
Fastest PS512 decode implementation is: fast-jwt (complete with cache) OR fast-jwt (with cache)
```

### Verifying

```
Executed: HS512 - verify - fast-jwt (sync) x 83,074 ops/sec ±1.67% (85 runs sampled)
Executed: HS512 - verify - fast-jwt (async) x 73,180 ops/sec ±1.32% (77 runs sampled)
Executed: HS512 - verify - fast-jwt (sync with cache) x 10,513,746 ops/sec ±1.49% (84 runs sampled)
Executed: HS512 - verify - fast-jwt (async with cache) x 264,280 ops/sec ±1.12% (66 runs sampled)
Executed: HS512 - verify - jsonwebtoken (sync) x 68,314 ops/sec ±1.33% (87 runs sampled)
Executed: HS512 - verify - jsonwebtoken (async) x 24,863 ops/sec ±15.24% (53 runs sampled)
Fastest HS512 verify implementation is: fast-jwt (sync with cache)

Executed: ES512 - verify - fast-jwt (sync) x 7,689 ops/sec ±1.60% (89 runs sampled)
Executed: ES512 - verify - fast-jwt (async) x 7,097 ops/sec ±0.98% (80 runs sampled)
Executed: ES512 - verify - fast-jwt (sync with cache) x 8,928,787 ops/sec ±5.13% (82 runs sampled)
Executed: ES512 - verify - fast-jwt (async with cache) x 224,465 ops/sec ±20.72% (35 runs sampled)
Executed: ES512 - verify - jsonwebtoken (sync) x 7,126 ops/sec ±2.23% (83 runs sampled)
Executed: ES512 - verify - jsonwebtoken (async) x 6,947 ops/sec ±1.77% (81 runs sampled)
Fastest ES512 verify implementation is: fast-jwt (sync with cache)

Executed: RS512 - verify - fast-jwt (sync) x 8,799 ops/sec ±3.30% (89 runs sampled)
Executed: RS512 - verify - fast-jwt (async) x 8,171 ops/sec ±1.40% (80 runs sampled)
Executed: RS512 - verify - fast-jwt (sync with cache) x 9,267,146 ops/sec ±1.74% (83 runs sampled)
Executed: RS512 - verify - fast-jwt (async with cache) x 230,088 ops/sec ±4.39% (48 runs sampled)
Executed: RS512 - verify - jsonwebtoken (sync) x 7,731 ops/sec ±2.09% (83 runs sampled)
Executed: RS512 - verify - jsonwebtoken (async) x 7,790 ops/sec ±1.68% (79 runs sampled)
Fastest RS512 verify implementation is: fast-jwt (sync with cache)

Executed: PS512 - verify - fast-jwt (sync) x 7,972 ops/sec ±1.57% (82 runs sampled)
Executed: PS512 - verify - fast-jwt (async) x 7,619 ops/sec ±1.13% (78 runs sampled)
Executed: PS512 - verify - fast-jwt (sync with cache) x 9,275,591 ops/sec ±1.77% (86 runs sampled)
Executed: PS512 - verify - fast-jwt (async with cache) x 224,085 ops/sec ±16.53% (53 runs sampled)
Executed: PS512 - verify - jsonwebtoken (sync) x 7,928 ops/sec ±1.32% (89 runs sampled)
Executed: PS512 - verify - jsonwebtoken (async) x 6,803 ops/sec ±1.64% (78 runs sampled)
Fastest PS512 verify implementation is: fast-jwt (sync with cache)
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

Copyright NearForm Ltd 2020. Licensed under the [Apache-2.0 license](http://www.apache.org/licenses/LICENSE-2.0).

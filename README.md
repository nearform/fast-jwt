# fast-jwt

[![Package Version](https://img.shields.io/npm/v/fast-jwt.svg)](https://npm.im/fast-jwt)
[![CI](https://github.com/nearform/fast-jwt/actions/workflows/ci.yml/badge.svg)](https://github.com/nearform/fast-jwt/actions/workflows/ci.yml)

<!-- [![Code Coverage](https://img.shields.io/codecov/c/gh/nearform/-verify?token=)](https://codecov.io/gh/nearform/fast-jwt) -->

Fast JSON Web Token implementation.

## Installation

Just run:

```bash
npm install fast-jwt
```

## Usage

### createSigner

Create a signer function by calling `createSigner` and providing one or more of the following options:

- `key`: A string or a buffer containing the secret for `HS*` algorithms or the PEM encoded private key for `RS*`, `PS*`, `ES*` and `EdDSA` algorithms. If the `key` is a passphrase protected private key it must be an object (more details below). The key can also be a function accepting a Node style callback or a function returning a promise. This is the only mandatory option, which MUST NOT be provided if the token algorithm is `none`.

- `algorithm`: The algorithm to use to sign the token. The default value is autodetected from the key, using `RS256` for RSA private keys, `HS256` for plain secrets and the corresponding `ES` or `EdDSA` algorithms for EC or Ed\* private keys.

- `mutatePayload`: If set to `true`, the original payload will be modified in place (via `Object.assign`) by the signing function. This is useful if you need a raw reference to the payload after claims have been applied to it but before it has been encoded into a token. Default is `false`.

- `expiresIn`: Time span (in milliseconds) after which the token expires, added as the `exp` claim in the payload as defined by the [section 4.1.4 of RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.4). This will override any existing value in the claim.

- `notBefore`: Time span (in milliseconds) before the token is active, added as the `nbf` claim in the payload as defined by the [section 4.1.5 of RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.5). This will override any existing value in the claim.

- `jti`: The token unique identifier, added as the `jti` claim in the payload as defined by the [section 4.1.7 of RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.7). This will override any existing value in the claim.

- `aud`: The token audience, added as the `aud` claim in the payload as defined by the [section 4.1.3 of RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.3). This claim identifies the recipients that the token is intended for. It must be a string or an array of strings. This will override any existing value in the claim.

- `iss`: The token issuer, added as the `iss` claim in the payload as defined by the [section 4.1.1 of RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.1). It must be a string. This will override any existing value in the claim.

- `sub`: The token subject, added as the `sub` claim in the payload as defined by the [section 4.1.2 of RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1.2). It must be a string. This will override any existing value in the claim.

- `nonce`: The token nonce, added as the `nonce` claim in the payload. The `nonce` value is used to associate a Client session with an ID Token. Note that this is a [IANA JSON Web Token Claims Registry](https://www.iana.org/assignments/jwt/jwt.xhtml#claims) public claim registered by OpenID Connect (OIDC). It must be a string. This will override any existing value in the claim.

- `kid`: The token key id, added as the `kid` claim in the header section (see [section 4.1.4 of RFC 7515](https://www.rfc-editor.org/rfc/rfc7515#section-4.1.4) and [section 4.5 of RFC 7517](https://datatracker.ietf.org/doc/html/rfc7517#section-4.5)). It must be a string.

- `header`: Additional claims to add to the header section. This will override the `typ` and `kid` claims.

- `noTimestamp`: If set to `true`, the `iat` claim should not be added to the token. Default is `false`.

- `clockTimestamp`: The timestamp in milliseconds (like the output of `Date.now()`) that should be used as the current time for all necessary time comparisons. Default is the system time.

The signer is a function which accepts a payload and returns the token.

The payload must be an object.

If the `key` option is a function, the signer will also accept a Node style callback and will return a promise, supporting therefore both callback and async/await styles.

If the `key` is a passphrase protected private key, the `algorithm` option must be provided and must be either a `RS*` or `ES*` encoded key and the `key` option must be an object with the following structure:

```js
{
  key: '<YOUR_RSA_ENCRYPTED_PRIVATE_KEY>',
  passphrase: '<PASSPHRASE_THAT_WAS_USED_TO_ENCRYPT_THE_PRIVATE_KEY>'
}
```

#### Example

```javascript
const { createSigner } = require('fast-jwt')

// Sync style
const signSync = createSigner({ key: 'secret' })
const token = signSync({ a: 1, b: 2, c: 3 })
// => eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1Nzk1MjEyMTJ9.mIcxteEVjbh2MnKQ3EQlojZojGSyA_guqRBYHQURcfnCSSBTT2OShF8lo9_ogjAv-5oECgmCur_cDWB7x3X53g

// Callback style
const signWithCallback = createSigner({ key: (callback) => callback(null, 'secret') })

signWithCallback({ a: 1, b: 2, c: 3 }, (err, token) => {
  // token === eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1Nzk1MjEyMTJ9.mIcxteEVjbh2MnKQ3EQlojZojGSyA_guqRBYHQURcfnCSSBTT2OShF8lo9_ogjAv-5oECgmCur_cDWB7x3X53g
})

// Promise style - Note that the key function style and the signer function style are unrelated
async function test() {
  const signWithPromise = createSigner({ key: async () => 'secret' })

  const token = await signWithPromise({ a: 1, b: 2, c: 3 })
  // => eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1Nzk1MjEyMTJ9.mIcxteEVjbh2MnKQ3EQlojZojGSyA_guqRBYHQURcfnCSSBTT2OShF8lo9_ogjAv-5oECgmCur_cDWB7x3X53g
}

// Using password protected private key - in this case you MUST provide the algorithm as well
const signSync = createSigner({
  algorithm: '<ANY_RS*_OR_ES*_ALGORITHM>',
  key: {
    key: '<YOUR_RSA_ENCRYPTED_PRIVATE_KEY>',
    passphrase: '<PASSPHRASE_THAT_WAS_USED_TO_ENCRYPT_THE_PRIVATE_KEY>'
  })
const token = signSync({ a: 1, b: 2, c: 3 })
```

### createDecoder

Create a decoder function by calling `createDecoder` and providing one or more of the following options:

- `complete`: Return an object with the decoded header, payload, signature and input (the token part before the signature), instead of just the content of the payload. Default is `false`.

- `checkTyp`: When validating the decoded header, setting this option forces the check of the `typ` property against this value. Example: `checkTyp: 'JWT'`. Default is `undefined`.

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

- `key`: A string or a buffer containing the secret for `HS*` algorithms or the PEM encoded public key for `RS*`, `PS*`, `ES*` and `EdDSA` algorithms. The key can also be a function accepting a Node style callback or a function returning a promise. This is the only mandatory option, which MUST NOT be provided if the token algorithm is `none`.

- `algorithms`: List of strings with the names of the allowed algorithms. By default, all algorithms are accepted.

- `complete`: Return an object with the decoded header, payload, signature and input (the token part before the signature), instead of just the content of the payload. Default is `false`.

- `cache`: A positive number specifying the size of the verified tokens cache (using LRU strategy). Setting to `true` is equivalent to provide the size `1000`. When enabled, as you can see in the benchmarks section below, performances dramatically improve. By default the cache is disabled.

- `cacheTTL`: The maximum time to live of a cache entry (in milliseconds). If the token has a earlier expiration or the verifier has a shorter `maxAge`, the earlier takes precedence. The default is `600000`, which is 10 minutes.

- `errorCacheTTL`: A number or function `function (tokenError) => number` that represents the maximum time to live of a cache error entry (in milliseconds). Example: the `key` function fails or does not return a secret or public key. By default **errors are not cached**, the `errorCacheTTL` default value is `-1`.

- `allowedJti`: A string, a regular expression, an array of strings or an array of regular expressions containing allowed values for the id claim (`jti`). By default, all values are accepted.

- `allowedAud`: A string, a regular expression, an array of strings or an array of regular expressions containing allowed values for the audience claim (`aud`). By default, all values are accepted.

- `allowedIss`: A string, a regular expression, an array of strings or an array of regular expressions containing allowed values for the issuer claim (`iss`). By default, all values are accepted.

- `allowedSub`: A string, a regular expression, an array of strings or an array of regular expressions containing allowed values for the subject claim (`sub`). By default, all values are accepted.

- `allowedNonce`: A string, a regular expression, an array of strings or an array of regular expressions containing allowed values for the nonce claim (`nonce`). By default, all values are accepted.

- `requiredClaims`: An array of strings containing which claims should exist in the token. By default, no claim is marked as required.

- `ignoreExpiration`: Do not validate the expiration of the token. Default is `false`.

- `ignoreNotBefore`: Do not validate the activation of the token. Default is `false`.

- `maxAge`: The maximum allowed age (in milliseconds) for tokens to still be valid. By default this is not checked.

- `clockTimestamp`: The timestamp in milliseconds (like the output of `Date.now()`) that should be used as the current time for all necessary time comparisons. Default is the system time.

- `clockTolerance`: Timespan in milliseconds is the tolerance to apply to the current timestamp when performing time comparisons. Default is `0`.

The verifier is a function which accepts a token (as Buffer or string) and returns the payload or the sections of the token.

If the `key` option is a function, the signer will also accept a Node style callback and will return a promise, supporting therefore both callback and async/await styles.

#### Examples

```javascript
const { createVerifier, TOKEN_ERROR_CODES } = require('fast-jwt')
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
  const verifyWithPromise = createVerifier({ key: async () => 'secret' })

  const payload = await verifyWithPromise(token)
  // => { a: 1, b: 2, c: 3, iat: 1579521212 }
}

// custom errorCacheTTL verifier
const verifier = createVerifier({
  key: 'secret',
  cache: true,
  errorCacheTTL: tokenError => {
    // customize the ttl based on the error code
    if (tokenError.code === TOKEN_ERROR_CODES.invalidKey) {
      return 1000
    }
    return 2000
  }
})
```

## Algorithms supported

This is the lisf of currently supported algorithms:

| Name    | Description                                                             |
| ------- | ----------------------------------------------------------------------- |
| `none`  | Empty algorithm - The token signature section will be empty             |
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

When caching is enabled, verified tokens are always stored in cache. If the verification fails once, the error is cached as well for the time set by `errorCacheTTL` and the operation is not retried.

For verified tokens, caching considers the time sensitive claims of the token (`iat`, `nbf` and `exp`) and make sure the verification is retried after a token becomes valid or after a token becomes expired.

Performances improvements varies by uses cases and by the type of the operation performed and the algorithm used.

> **_Note:_** Errors are not cached by default, to change this behaviour use the `errorCacheTTL` option.

## Token Error Codes

[Error codes](https://github.com/nearform/fast-jwt/blob/master/src/error.js) exported by `TOKEN_ERROR_CODES`.

## JWKS

JWKS is supported via [get-jwks](https://github.com/nearform/get-jwks). Check out the documentation for integration examples.

## Benchmarks

### Signing

```
╔══════════════════════════════╤═════════╤═════════════════╤═══════════╤═════════════════════════╗
║ Slower tests                 │ Samples │          Result │ Tolerance │ Difference with slowest ║
╟──────────────────────────────┼─────────┼─────────────────┼───────────┼─────────────────────────╢
║ HS512 - fast-jwt (async)     │   10000 │ 55766.29 op/sec │  ± 2.85 % │                         ║
║ HS512 - jsonwebtoken (async) │   10000 │ 68764.89 op/sec │  ± 1.25 % │ + 23.31 %               ║
║ HS512 - jsonwebtoken (sync)  │   10000 │ 70191.14 op/sec │  ± 1.84 % │ + 25.87 %               ║
║ HS512 - jose (sync)          │   10000 │ 72844.84 op/sec │  ± 1.72 % │ + 30.63 %               ║
╟──────────────────────────────┼─────────┼─────────────────┼───────────┼─────────────────────────╢
║ Fastest test                 │ Samples │          Result │ Tolerance │ Difference with slowest ║
╟──────────────────────────────┼─────────┼─────────────────┼───────────┼─────────────────────────╢
║ HS512 - fast-jwt (sync)      │   10000 │ 97602.16 op/sec │  ± 1.83 % │ + 75.02 %               ║
╚══════════════════════════════╧═════════╧═════════════════╧═══════════╧═════════════════════════╝

╔══════════════════════════════╤═════════╤═══════════════╤═══════════╤═════════════════════════╗
║ Slower tests                 │ Samples │        Result │ Tolerance │ Difference with slowest ║
╟──────────────────────────────┼─────────┼───────────────┼───────────┼─────────────────────────╢
║ ES512 - fast-jwt (async)     │    1000 │ 419.29 op/sec │  ± 0.34 % │                         ║
║ ES512 - jsonwebtoken (async) │    1000 │ 440.53 op/sec │  ± 0.26 % │ + 5.07 %                ║
║ ES512 - jsonwebtoken (sync)  │    1000 │ 445.91 op/sec │  ± 0.16 % │ + 6.35 %                ║
║ ES512 - jose (sync)          │    1000 │ 452.01 op/sec │  ± 0.20 % │ + 7.80 %                ║
╟──────────────────────────────┼─────────┼───────────────┼───────────┼─────────────────────────╢
║ Fastest test                 │ Samples │        Result │ Tolerance │ Difference with slowest ║
╟──────────────────────────────┼─────────┼───────────────┼───────────┼─────────────────────────╢
║ ES512 - fast-jwt (sync)      │    1000 │ 467.54 op/sec │  ± 0.15 % │ + 11.51 %               ║
╚══════════════════════════════╧═════════╧═══════════════╧═══════════╧═════════════════════════╝

╔══════════════════════════════╤═════════╤═══════════════╤═══════════╤═════════════════════════╗
║ Slower tests                 │ Samples │        Result │ Tolerance │ Difference with slowest ║
╟──────────────────────────────┼─────────┼───────────────┼───────────┼─────────────────────────╢
║ RS512 - fast-jwt (async)     │    1000 │ 196.13 op/sec │  ± 0.28 % │                         ║
║ RS512 - jsonwebtoken (async) │    1000 │ 200.15 op/sec │  ± 0.23 % │ + 2.05 %                ║
║ RS512 - jsonwebtoken (sync)  │    1000 │ 203.72 op/sec │  ± 0.18 % │ + 3.87 %                ║
║ RS512 - jose (sync)          │    1000 │ 245.89 op/sec │  ± 0.39 % │ + 25.37 %               ║
╟──────────────────────────────┼─────────┼───────────────┼───────────┼─────────────────────────╢
║ Fastest test                 │ Samples │        Result │ Tolerance │ Difference with slowest ║
╟──────────────────────────────┼─────────┼───────────────┼───────────┼─────────────────────────╢
║ RS512 - fast-jwt (sync)      │    1000 │ 273.31 op/sec │  ± 0.27 % │ + 39.36 %               ║
╚══════════════════════════════╧═════════╧═══════════════╧═══════════╧═════════════════════════╝

╔══════════════════════════════╤═════════╤═══════════════╤═══════════╤═════════════════════════╗
║ Slower tests                 │ Samples │        Result │ Tolerance │ Difference with slowest ║
╟──────────────────────────────┼─────────┼───────────────┼───────────┼─────────────────────────╢
║ PS512 - jsonwebtoken (sync)  │    1000 │ 194.00 op/sec │  ± 0.27 % │                         ║
║ PS512 - jsonwebtoken (async) │    1000 │ 202.08 op/sec │  ± 0.21 % │ + 4.17 %                ║
║ PS512 - fast-jwt (async)     │    1000 │ 203.36 op/sec │  ± 0.19 % │ + 4.82 %                ║
║ PS512 - jose (sync)          │    1000 │ 266.54 op/sec │  ± 0.29 % │ + 37.39 %               ║
╟──────────────────────────────┼─────────┼───────────────┼───────────┼─────────────────────────╢
║ Fastest test                 │ Samples │        Result │ Tolerance │ Difference with slowest ║
╟──────────────────────────────┼─────────┼───────────────┼───────────┼─────────────────────────╢
║ PS512 - fast-jwt (sync)      │    1000 │ 272.11 op/sec │  ± 0.24 % │ + 40.26 %               ║
╚══════════════════════════════╧═════════╧═══════════════╧═══════════╧═════════════════════════╝

╔══════════════════════════╤═════════╤═════════════════╤═══════════╤═════════════════════════╗
║ Slower tests             │ Samples │          Result │ Tolerance │ Difference with slowest ║
╟──────────────────────────┼─────────┼─────────────────┼───────────┼─────────────────────────╢
║ EdDSA - fast-jwt (async) │    1000 │  8301.50 op/sec │  ± 0.70 % │                         ║
║ EdDSA - jose (sync)      │    1500 │ 16561.83 op/sec │  ± 0.88 % │ + 99.50 %               ║
╟──────────────────────────┼─────────┼─────────────────┼───────────┼─────────────────────────╢
║ Fastest test             │ Samples │          Result │ Tolerance │ Difference with slowest ║
╟──────────────────────────┼─────────┼─────────────────┼───────────┼─────────────────────────╢
║ EdDSA - fast-jwt (sync)  │    3000 │ 17514.99 op/sec │  ± 0.94 % │ + 110.99 %              ║
╚══════════════════════════╧═════════╧═════════════════╧═══════════╧═════════════════════════╝
```

### Decoding

```
╔═════════════════════════════════╤═════════╤══════════════════╤═══════════╤═════════════════════════╗
║ Slower tests                    │ Samples │           Result │ Tolerance │ Difference with slowest ║
╟─────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ RS512 - jsonwebtoken - complete │   10000 │ 126201.23 op/sec │  ± 2.84 % │                         ║
║ RS512 - jsonwebtoken            │   10000 │ 143571.03 op/sec │  ± 1.82 % │ + 13.76 %               ║
║ RS512 - jose - complete         │   10000 │ 252738.76 op/sec │  ± 5.62 % │ + 100.27 %              ║
║ RS512 - fast-jwt                │   10000 │ 254921.59 op/sec │  ± 3.39 % │ + 102.00 %              ║
║ RS512 - jose                    │   10000 │ 266197.51 op/sec │  ± 4.02 % │ + 110.93 %              ║
╟─────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ Fastest test                    │ Samples │           Result │ Tolerance │ Difference with slowest ║
╟─────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ RS512 - fast-jwt - complete     │   10000 │ 284719.82 op/sec │  ± 3.39 % │ + 125.61 %              ║
╚═════════════════════════════════╧═════════╧══════════════════╧═══════════╧═════════════════════════╝
```

Note that for decoding the algorithm is irrelevant, so only one was measured.

### Verifying

```
╔═════════════════════════════════════╤═════════╤══════════════════╤═══════════╤═════════════════════════╗
║ Slower tests                        │ Samples │           Result │ Tolerance │ Difference with slowest ║
╟─────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ HS512 - jsonwebtoken (sync)         │   10000 │  49275.12 op/sec │  ± 1.41 % │                         ║
║ HS512 - fast-jwt (async)            │   10000 │  51353.81 op/sec │  ± 2.98 % │ + 4.22 %                ║
║ HS512 - jsonwebtoken (async)        │   10000 │  51610.98 op/sec │  ± 1.51 % │ + 4.74 %                ║
║ HS512 - jose (sync)                 │   10000 │  64280.92 op/sec │  ± 1.73 % │ + 30.45 %               ║
║ HS512 - fast-jwt (sync)             │   10000 │  75067.57 op/sec │  ± 2.40 % │ + 52.34 %               ║
║ HS512 - fast-jwt (async with cache) │   10000 │ 175013.21 op/sec │  ± 4.42 % │ + 255.18 %              ║
╟─────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ Fastest test                        │ Samples │           Result │ Tolerance │ Difference with slowest ║
╟─────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ HS512 - fast-jwt (sync with cache)  │   10000 │ 207199.64 op/sec │  ± 3.15 % │ + 320.50 %              ║
╚═════════════════════════════════════╧═════════╧══════════════════╧═══════════╧═════════════════════════╝

╔═════════════════════════════════════╤═════════╤══════════════════╤═══════════╤═════════════════════════╗
║ Slower tests                        │ Samples │           Result │ Tolerance │ Difference with slowest ║
╟─────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ ES512 - fast-jwt (async)            │    1000 │    561.01 op/sec │  ± 0.44 % │                         ║
║ ES512 - jsonwebtoken (sync)         │    1000 │    573.52 op/sec │  ± 0.27 % │ + 2.23 %                ║
║ ES512 - jsonwebtoken (async)        │    1000 │    573.74 op/sec │  ± 0.26 % │ + 2.27 %                ║
║ ES512 - fast-jwt (sync)             │    1000 │    597.68 op/sec │  ± 0.30 % │ + 6.54 %                ║
║ ES512 - jose (sync)                 │    1000 │    604.42 op/sec │  ± 0.27 % │ + 7.74 %                ║
║ ES512 - fast-jwt (async with cache) │   10000 │ 189999.48 op/sec │  ± 4.49 % │ + 33767.60 %            ║
╟─────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ Fastest test                        │ Samples │           Result │ Tolerance │ Difference with slowest ║
╟─────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ ES512 - fast-jwt (sync with cache)  │   10000 │ 192353.61 op/sec │  ± 4.79 % │ + 34187.22 %            ║
╚═════════════════════════════════════╧═════════╧══════════════════╧═══════════╧═════════════════════════╝

╔═════════════════════════════════════╤═════════╤══════════════════╤═══════════╤═════════════════════════╗
║ Slower tests                        │ Samples │           Result │ Tolerance │ Difference with slowest ║
╟─────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ RS512 - jsonwebtoken (async)        │    1500 │   7551.10 op/sec │  ± 0.92 % │                         ║
║ RS512 - jsonwebtoken (sync)         │    4500 │   7750.46 op/sec │  ± 0.96 % │ + 2.64 %                ║
║ RS512 - fast-jwt (async)            │    1000 │   8413.41 op/sec │  ± 0.99 % │ + 11.42 %               ║
║ RS512 - jose (sync)                 │    4500 │  12382.58 op/sec │  ± 0.94 % │ + 63.98 %               ║
║ RS512 - fast-jwt (sync)             │    4500 │  12665.45 op/sec │  ± 0.90 % │ + 67.73 %               ║
║ RS512 - fast-jwt (sync with cache)  │   10000 │ 145107.65 op/sec │  ± 7.54 % │ + 1821.68 %             ║
╟─────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ Fastest test                        │ Samples │           Result │ Tolerance │ Difference with slowest ║
╟─────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ RS512 - fast-jwt (async with cache) │   10000 │ 158780.83 op/sec │  ± 3.90 % │ + 2002.75 %             ║
╚═════════════════════════════════════╧═════════╧══════════════════╧═══════════╧═════════════════════════╝

╔═════════════════════════════════════╤═════════╤══════════════════╤═══════════╤═════════════════════════╗
║ Slower tests                        │ Samples │           Result │ Tolerance │ Difference with slowest ║
╟─────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ PS512 - jsonwebtoken (async)        │    2500 │   7240.21 op/sec │  ± 0.89 % │                         ║
║ PS512 - jsonwebtoken (sync)         │    2000 │   7449.38 op/sec │  ± 0.91 % │ + 2.89 %                ║
║ PS512 - fast-jwt (async)            │    1500 │   8301.99 op/sec │  ± 0.81 % │ + 14.67 %               ║
║ PS512 - jose (sync)                 │    4000 │  11944.57 op/sec │  ± 0.99 % │ + 64.98 %               ║
║ PS512 - fast-jwt (sync)             │    1000 │  12881.96 op/sec │  ± 0.76 % │ + 77.92 %               ║
║ PS512 - fast-jwt (async with cache) │   10000 │ 155603.59 op/sec │  ± 4.27 % │ + 2049.16 %             ║
╟─────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ Fastest test                        │ Samples │           Result │ Tolerance │ Difference with slowest ║
╟─────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ PS512 - fast-jwt (sync with cache)  │   10000 │ 172097.91 op/sec │  ± 4.58 % │ + 2276.97 %             ║
╚═════════════════════════════════════╧═════════╧══════════════════╧═══════════╧═════════════════════════╝

╔═════════════════════════════════════╤═════════╤══════════════════╤═══════════╤═════════════════════════╗
║ Slower tests                        │ Samples │           Result │ Tolerance │ Difference with slowest ║
╟─────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ EdDSA - fast-jwt (async)            │    1000 │   6370.58 op/sec │  ± 0.59 % │                         ║
║ EdDSA - jose (sync)                 │    1000 │   6538.90 op/sec │  ± 0.83 % │ + 2.64 %                ║
║ EdDSA - fast-jwt (sync)             │    1000 │   7078.93 op/sec │  ± 0.87 % │ + 11.12 %               ║
║ EdDSA - fast-jwt (async with cache) │   10000 │ 177457.09 op/sec │  ± 5.36 % │ + 2685.57 %             ║
╟─────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ Fastest test                        │ Samples │           Result │ Tolerance │ Difference with slowest ║
╟─────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ EdDSA - fast-jwt (sync with cache)  │   10000 │ 202628.41 op/sec │  ± 3.12 % │ + 3080.69 %             ║
╚═════════════════════════════════════╧═════════╧══════════════════╧═══════════╧═════════════════════════╝
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

Copyright NearForm Ltd 2020-2021. Licensed under the [Apache-2.0 license](http://www.apache.org/licenses/LICENSE-2.0).

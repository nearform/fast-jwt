'use strict'

const asn = require('asn1.js')
const {
  createHmac,
  createVerify,
  createSign,
  timingSafeEqual,
  createPublicKey,
  constants: {
    RSA_PKCS1_PSS_PADDING,
    RSA_PSS_SALTLEN_DIGEST,
    RSA_PKCS1_PADDING,
    RSA_PSS_SALTLEN_MAX_SIGN,
    RSA_PSS_SALTLEN_AUTO
  }
} = require('node:crypto')
let { sign: directSign, verify: directVerify } = require('node:crypto')
const { joseToDer, derToJose } = require('ecdsa-sig-formatter')
const Cache = require('mnemonist/lru-cache')
const { TokenError } = require('./error')

const useNewCrypto = typeof directSign === 'function'

const base64UrlMatcher = /[=+/]/g
const encoderMap = { '=': '', '+': '-', '/': '_' }

const privateKeyPemMatcher = /^-----BEGIN(?: (RSA|EC|ENCRYPTED))? PRIVATE KEY-----/
const publicKeyPemMatcher = /^-----BEGIN(?: (RSA))? PUBLIC KEY-----/
const publicKeyX509CertMatcher = '-----BEGIN CERTIFICATE-----'
const privateKeysCache = new Cache(1000)
const publicKeysCache = new Cache(1000)

const hsAlgorithms = ['HS256', 'HS384', 'HS512']
const esAlgorithms = ['ES256', 'ES384', 'ES512']
const rsaAlgorithms = ['RS256', 'RS384', 'RS512', 'PS256', 'PS384', 'PS512']
const edAlgorithms = ['EdDSA']
const ecCurves = {
  '1.2.840.10045.3.1.7': { bits: '256', names: ['P-256', 'prime256v1'] },
  '1.3.132.0.10': { bits: '256', names: ['secp256k1'] },
  '1.3.132.0.34': { bits: '384', names: ['P-384', 'secp384r1'] },
  '1.3.132.0.35': { bits: '512', names: ['P-521', 'secp521r1'] }
}

/* istanbul ignore next */
if (!useNewCrypto) {
  directSign = function (alg, data, options) {
    if (typeof alg === 'undefined') {
      throw new TokenError(TokenError.codes.signError, 'EdDSA algorithms are not supported by your Node.js version.')
    }

    return createSign(alg)
      .update(data)
      .sign(options)
  }
}

const PrivateKey = asn.define('PrivateKey', function () {
  this.seq().obj(
    this.key('version').int(),
    this.key('algorithm')
      .seq()
      .obj(
        this.key('algorithm').objid(),
        this.key('parameters')
          .optional()
          .objid()
      )
  )
})

const PublicKey = asn.define('PublicKey', function () {
  this.seq().obj(
    this.key('algorithm')
      .seq()
      .obj(
        this.key('algorithm').objid(),
        this.key('parameters')
          .optional()
          .objid()
      )
  )
})

const ECPrivateKey = asn.define('ECPrivateKey', function () {
  this.seq().obj(
    this.key('version').int(),
    this.key('privateKey').octstr(),
    this.key('parameters')
      .explicit(0)
      .optional()
      .choice({ namedCurve: this.objid() })
  )
})

function base64UrlReplacer(c) {
  return encoderMap[c]
}

function cacheSet(cache, key, value, error) {
  cache.set(key, [value, error])
  return value || error
}

function performDetectPrivateKeyAlgorithm(key) {
  if (key.match(publicKeyPemMatcher) || key.includes(publicKeyX509CertMatcher)) {
    throw new TokenError(TokenError.codes.invalidKey, 'Public keys are not supported for signing.')
  }

  const pemData = key.trim().match(privateKeyPemMatcher)

  if (!pemData) {
    return 'HS256'
  }

  let keyData
  let oid
  let curveId

  switch (pemData[1]) {
    case 'RSA': // pkcs1 format - Can only be RSA key
      return 'RS256'
    case 'EC': // sec1 format - Can only be a EC key
      keyData = ECPrivateKey.decode(key, 'pem', { label: 'EC PRIVATE KEY' })
      curveId = keyData.parameters.value.join('.')
      break
    case 'ENCRYPTED': // Can be either RSA or EC key - we'll used the supplied algorithm
      return 'ENCRYPTED'
    default:
      // pkcs8
      keyData = PrivateKey.decode(key, 'pem', { label: 'PRIVATE KEY' })
      oid = keyData.algorithm.algorithm.join('.')

      switch (oid) {
        case '1.2.840.113549.1.1.1': // RSA
          return 'RS256'
        case '1.2.840.10045.2.1': // EC
          curveId = keyData.algorithm.parameters.join('.')
          break
        case '1.3.101.112': // Ed25519
        case '1.3.101.113': // Ed448
          return 'EdDSA'
        default:
          throw new TokenError(TokenError.codes.invalidKey, `Unsupported PEM PCKS8 private key with OID ${oid}.`)
      }
  }

  const curve = ecCurves[curveId]

  if (!curve) {
    throw new TokenError(TokenError.codes.invalidKey, `Unsupported EC private key with curve ${curveId}.`)
  }

  return `ES${curve.bits}`
}

function performDetectPublicKeyAlgorithms(key) {
  const publicKeyPemMatch = key.match(publicKeyPemMatcher)

  if (key.match(privateKeyPemMatcher)) {
    throw new TokenError(TokenError.codes.invalidKey, 'Private keys are not supported for verifying.')
  } else if (publicKeyPemMatch && publicKeyPemMatch[1] === 'RSA') {
    // pkcs1 format - Can only be RSA key
    return rsaAlgorithms
  } else if (!publicKeyPemMatch && !key.includes(publicKeyX509CertMatcher)) {
    // Not a PEM, assume a plain secret
    return hsAlgorithms
  }

  // if the key is a X509 cert we need to convert it
  if (key.includes(publicKeyX509CertMatcher)) {
    key = createPublicKey(key).export({ type: 'spki', format: 'pem' })
  }

  const keyData = PublicKey.decode(key, 'pem', { label: 'PUBLIC KEY' })
  const oid = keyData.algorithm.algorithm.join('.')
  let curveId

  switch (oid) {
    case '1.2.840.113549.1.1.1': // RSA
      return rsaAlgorithms
    case '1.2.840.10045.2.1': // EC
      curveId = keyData.algorithm.parameters.join('.')
      break
    case '1.3.101.112': // Ed25519
    case '1.3.101.113': // Ed448
      return ['EdDSA']
    default:
      throw new TokenError(TokenError.codes.invalidKey, `Unsupported PEM PCKS8 public key with OID ${oid}.`)
  }

  const curve = ecCurves[curveId]

  if (!curve) {
    throw new TokenError(TokenError.codes.invalidKey, `Unsupported EC public key with curve ${curveId}.`)
  }

  return [`ES${curve.bits}`]
}

function detectPrivateKeyAlgorithm(key, providedAlgorithm) {
  if (key instanceof Buffer) {
    key = key.toString('utf-8')
  } else if (typeof key !== 'string') {
    throw new TokenError(TokenError.codes.invalidKey, 'The private key must be a string or a buffer.')
  }

  // Check cache first
  const [cached, error] = privateKeysCache.get(key) || []

  if (cached) {
    return cached
  } else if (error) {
    throw error
  }

  // Try detecting
  try {
    const detectedAlgorithm = performDetectPrivateKeyAlgorithm(key)

    if (detectedAlgorithm === 'ENCRYPTED') {
      return cacheSet(privateKeysCache, key, providedAlgorithm)
    }
    return cacheSet(privateKeysCache, key, detectedAlgorithm)
  } catch (e) {
    throw cacheSet(privateKeysCache, key, null, TokenError.wrap(e, TokenError.codes.invalidKey, 'Unsupported PEM private key.'))
  }
}

function detectPublicKeyAlgorithms(key) {
  if (!key) {
    return 'none'
  }
  // Check cache first
  const [cached, error] = publicKeysCache.get(key) || []

  if (cached) {
    return cached
  } else if (error) {
    throw error
  }

  // Try detecting
  try {
    if (key instanceof Buffer) {
      key = key.toString('utf-8')
    } else if (typeof key !== 'string') {
      throw new TokenError(TokenError.codes.invalidKey, 'The public key must be a string or a buffer.')
    }
    return cacheSet(publicKeysCache, key, performDetectPublicKeyAlgorithms(key))
  } catch (e) {
    throw cacheSet(
      publicKeysCache,
      key,
      null,
      TokenError.wrap(e, TokenError.codes.invalidKey, 'Unsupported PEM public key.')
    )
  }
}

function createSignature(algorithm, key, input) {
  try {
    const type = algorithm.slice(0, 2)
    const alg = `sha${algorithm.slice(2)}`

    let raw
    let options

    switch (type) {
      case 'HS':
        raw = createHmac(alg, key)
          .update(input)
          .digest('base64')
        break
      case 'ES':
        raw = derToJose(directSign(alg, Buffer.from(input, 'utf-8'), key), algorithm).toString('base64')
        break
      case 'RS':
      case 'PS':
        options = {
          key,
          padding: RSA_PKCS1_PADDING,
          saltLength: RSA_PSS_SALTLEN_MAX_SIGN
        }

        if (type === 'PS') {
          options.padding = RSA_PKCS1_PSS_PADDING
          options.saltLength = RSA_PSS_SALTLEN_DIGEST
        }

        raw = createSign(alg)
          .update(input)
          .sign(options)
          .toString('base64')
        break
      case 'Ed':
        raw = directSign(undefined, Buffer.from(input, 'utf-8'), key).toString('base64')
    }

    return raw.replace(base64UrlMatcher, base64UrlReplacer)
  } catch (e) {
    /* istanbul ignore next */
    throw new TokenError(TokenError.codes.signError, 'Cannot create the signature.', { originalError: e })
  }
}

function verifySignature(algorithm, key, input, signature) {
  try {
    const type = algorithm.slice(0, 2)
    const alg = `SHA${algorithm.slice(2)}`

    signature = Buffer.from(signature, 'base64')

    if (type === 'HS') {
      try {
        return timingSafeEqual(
          createHmac(alg, key)
            .update(input)
            .digest(),
          signature
        )
      } catch (e) {
        return false
      }
    } else if (type === 'Ed') {
      // Check if supported on Node 10
      /* istanbul ignore next */
      if (typeof directVerify === 'function') {
        return directVerify(undefined, Buffer.from(input, 'utf-8'), key, signature)
      } else {
        throw new TokenError(TokenError.codes.signError, 'EdDSA algorithms are not supported by your Node.js version.')
      }
    }

    const options = { key, padding: RSA_PKCS1_PADDING, saltLength: RSA_PSS_SALTLEN_AUTO }

    if (type === 'PS') {
      options.padding = RSA_PKCS1_PSS_PADDING
      options.saltLength = RSA_PSS_SALTLEN_DIGEST
    } else if (type === 'ES') {
      signature = joseToDer(signature, algorithm)
    }

    return createVerify('RSA-' + alg)
      .update(input)
      .verify(options, signature)
  } catch (e) {
    /* istanbul ignore next */
    throw new TokenError(TokenError.codes.verifyError, 'Cannot verify the signature.', { originalError: e })
  }
}

module.exports = {
  useNewCrypto,
  base64UrlMatcher,
  base64UrlReplacer,
  hsAlgorithms,
  rsaAlgorithms,
  esAlgorithms,
  edAlgorithms,
  detectPrivateKeyAlgorithm,
  detectPublicKeyAlgorithms,
  createSignature,
  verifySignature
}

'use strict'

const asn = require('asn1.js')
const Cache = require('mnemonist/lru-cache')

const TokenError = require('./error')

const privateKeyPemMatcher = /^-----BEGIN(?: (RSA|EC))? PRIVATE KEY-----/
const publicKeyPemMatcher = '-----BEGIN PUBLIC KEY-----'

const hsAlgorithms = ['HS256', 'HS384', 'HS512']
const esAlgorithms = ['ES256', 'ES384', 'ES512']
const rsaAlgorithms = ['RS256', 'RS384', 'RS512', 'PS256', 'PS384', 'PS512']
const edAlgorithms = ['EdDSA']

const ecCurves = {
  '1.2.840.10045.3.1.7': { bits: '256', names: ['P-256', 'prime256v1'] },
  '1.3.132.0.10': { bits: '256', names: ['P-256', 'secp256k1'] },
  '1.3.132.0.34': { bits: '384', names: ['P-384', 'secp384r1'] },
  '1.3.132.0.35': { bits: '512', names: ['P-521', 'secp521r1'] }
}

const privateKeysCache = new Cache(1000)
const publicKeysCache = new Cache(1000)

const PrivateKey = asn.define('PrivateKey', function() {
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

const PublicKey = asn.define('PublicKey', function() {
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

const ECPrivateKey = asn.define('ECPrivateKey', function() {
  this.seq().obj(
    this.key('version').int(),
    this.key('privateKey').octstr(),
    this.key('parameters')
      .explicit(0)
      .optional()
      .choice({ namedCurve: this.objid() })
  )
})

function cacheSet(cache, key, value, error) {
  cache.set(key, [value, error])
  return value || error
}

function validatePrivateKey(key) {
  if (typeof key === 'object' && !(key instanceof Buffer)) {
    if (
      (typeof key.key !== 'string' && !(key.key instanceof Buffer)) ||
      (key.passphrase && typeof key.passphrase !== 'string' && !(key.passphrase instanceof Buffer))
    ) {
      throw new TokenError(TokenError.codes.invalidKey, 'Unsupported PEM key.')
    } else if (key.passphrase && key.passphrase.length) {
      throw new TokenError(
        TokenError.codes.invalidKey,
        'Encrypted PEM keys are not supported when autodetecting the algorithm.'
      )
    }

    // Perform decryption
    key = key.key
  }

  return key.toString().trim()
}

function validatePublicKey(key) {
  if (typeof key === 'object' && !(key instanceof Buffer)) {
    if (typeof key.key !== 'string' && !(key.key instanceof Buffer)) {
      throw new TokenError(TokenError.codes.invalidKey, 'Unsupported PEM key.')
    }

    // Perform decryption
    key = key.key
  }

  return key.toString().trim()
}

function detectPrivateKeyAlgoritm(key, pemData) {
  let keyData
  let oid
  let curveId

  switch (pemData[1]) {
    case 'RSA': // pkcs1 format - Can only be a RSA key
      return ['RS256']
    case 'EC': // sec1 format - Can only be a EC key
      keyData = ECPrivateKey.decode(key, 'pem', { label: 'EC PRIVATE KEY' })
      curveId = keyData.parameters.value.join('.')
      break
    default:
      // pkcs8
      keyData = PrivateKey.decode(key, 'pem', { label: 'PRIVATE KEY' })
      oid = keyData.algorithm.algorithm.join('.')

      switch (oid) {
        case '1.2.840.113549.1.1.1': // RSA
          return ['RS256']
        case '1.3.101.112': // Ed25519
          return ['EdDSA', 'Ed25519']
        case '1.3.101.113': // Ed448
          return ['EdDSA', 'Ed448']
        case '1.2.840.10045.2.1': // EC
          curveId = keyData.algorithm.parameters.join('.')
          break
        default:
          throw new TokenError(TokenError.codes.invalidKey, `Unsupported PEM PCKS8 private key with OID ${oid}.`)
      }
  }

  const curve = ecCurves[curveId]

  if (!curve) {
    throw new TokenError(TokenError.codes.invalidKey, `Unsupported EC private key with curve ${curveId}.`)
  }

  return [`ES${curve.bits}`, curve.names[0]]
}

function detectPublicKeyAlgoritms(key) {
  // We only support a single format for public keys. Legacy "BEGIN RSA PUBLIC KEY" are not supported
  const keyData = PublicKey.decode(key, 'pem', { label: 'PUBLIC KEY' })
  const oid = keyData.algorithm.algorithm.join('.')
  let curveId

  switch (oid) {
    case '1.2.840.113549.1.1.1': // RSA
      return rsaAlgorithms
    case '1.3.101.112': // Ed25519
      return 'EdDSA'
    case '1.3.101.113': // Ed448
      return 'EdDSA'
    case '1.2.840.10045.2.1': // EC
      curveId = keyData.algorithm.parameters.join('.')
      break
    default:
      throw new TokenError(TokenError.codes.invalidKey, `Unsupported PEM PCKS8 public key with OID ${oid}.`)
  }

  const curve = ecCurves[curveId]

  if (!curve) {
    throw new TokenError(TokenError.codes.invalidKey, `Unsupported EC public key with curve ${curveId}.`)
  }

  return [`ES${curve.bits}`]
}

function detectPrivateKey(key) {
  key = validatePrivateKey(key)

  // Check cache first
  const cached = privateKeysCache.get(key) || []

  if (cached[0]) {
    return cached[0]
  } else if (cached[1]) {
    throw cached[1]
  }

  // Try detecting
  try {
    if (key.includes(publicKeyPemMatcher)) {
      throw new TokenError(TokenError.codes.invalidKey, 'Public keys are not supported for signing.')
    }

    const pemData = key.match(privateKeyPemMatcher)
    return cacheSet(privateKeysCache, key, pemData ? detectPrivateKeyAlgoritm(key, pemData) : ['HS256'])
  } catch (e) {
    throw cacheSet(privateKeysCache, key, null, TokenError.wrap(e, TokenError.codes.invalidKey, 'Unsupported PEM key.'))
  }
}

function detectPublicKeySupportedAlgorithms(key) {
  if (!key) {
    return 'none'
  }

  key = validatePublicKey(key)

  // Check cache first
  const cached = publicKeysCache.get(key) || []

  if (cached[0]) {
    return cached[0]
  } else if (cached[1]) {
    throw cached[1]
  }

  // Try detecting
  try {
    if (key.match(privateKeyPemMatcher)) {
      throw new TokenError(TokenError.codes.invalidKey, 'Private keys are not supported for verifying.')
    } else if (!key.includes(publicKeyPemMatcher)) {
      // Not a PEM, assume a plain secret
      return cacheSet(publicKeysCache, key, hsAlgorithms)
    }

    return cacheSet(publicKeysCache, key, detectPublicKeyAlgoritms(key))
  } catch (e) {
    throw cacheSet(publicKeysCache, key, null, TokenError.wrap(e, TokenError.codes.invalidKey, 'Unsupported PEM key.'))
  }
}

module.exports = {
  hsAlgorithms,
  rsaAlgorithms,
  esAlgorithms,
  edAlgorithms,
  detectPrivateKey,
  detectPublicKeySupportedAlgorithms
}

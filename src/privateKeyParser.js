'use strict'

const asn = require('asn1.js')

const TokenError = require('./error')

const pemMatcher = /(?:-+)(?:BEGIN|END)(?:\s+(RSA|EC))?\s+(?:PRIVATE|PUBLIC)\s+KEY(?:-+)/
const ecCurves = {
  '1.2.840.10045.3.1.7': { bits: '256', names: ['P-256', 'prime256v1'] },
  '1.3.132.0.10': { bits: '256', names: ['P-256', 'secp256k1'] },
  '1.3.132.0.34': { bits: '384', names: ['P-384', 'secp384r1'] },
  '1.3.132.0.35': { bits: '512', names: ['P-521', 'secp521r1'] }
}

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

function detectAlgorithm(key) {
  try {
    if (typeof key === 'object' && !(key instanceof Buffer)) {
      if (
        (typeof key.key !== 'string' && !(key.key instanceof Buffer)) ||
        (typeof key.passphrase !== 'string' && !(key.passphrase instanceof Buffer))
      ) {
        throw new TokenError(TokenError.codes.invalidKey, 'Unsupported PEM key.')
      } else if (key.passphrase.length) {
        throw new TokenError(
          TokenError.codes.invalidKey,
          'Encrypted PEM keys are not supported when autodetecting the algorithm.'
        )
      }

      // Perform decryption
      key = key.key
    }

    const pemData = key.toString().match(pemMatcher)

    if (!pemData) {
      // Not a PEM, assume a plain secret
      return 'HS256'
    }

    let keyData
    let oid
    let curveId

    switch (pemData[1]) {
      case 'RSA': // pkcs1 format - Can only be a RSA key
        return 'RS256'
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
            return 'RS256'
          case '1.2.840.10045.2.1': // EC
            curveId = keyData.algorithm.parameters.join('.')
            break
          default:
            throw new TokenError(TokenError.codes.invalidKey, `Unsupported PEM PCKS8 key with OID ${oid}.`)
        }
    }

    const curve = ecCurves[curveId]

    if (!curve) {
      throw new TokenError(TokenError.codes.invalidKey, `Unsupported EC private key with curve ${curveId}.`)
    }

    return `ES${curve.bits}`
  } catch (e) {
    if (e instanceof TokenError) {
      throw e
    }

    throw new TokenError(TokenError.codes.invalidKey, 'Unsupported PEM key.')
  }
}

module.exports = { detectAlgorithm }

'use strict'

const TokenError = require('./error')
const createDecoder = require('./decoder')
const createVerifier = require('./verifier')
const createSigner = require('./signer')

module.exports = {
  TokenError,
  createDecoder,
  createVerifier,
  createSigner
}

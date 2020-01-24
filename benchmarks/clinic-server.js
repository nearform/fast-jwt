'use strict'

const fastify = require('fastify')()
const { readFileSync } = require('fs')
const { resolve } = require('path')

const { createSigner, createVerifier } = require('../src')
const privateKey = readFileSync(resolve(__dirname, './keys/rs-private.key'))
const publicKey = readFileSync(resolve(__dirname, './keys/rs-public.key'))

const { sign: signerJwt, verify: verifierJwt } = require('jsonwebtoken')
const signerFast = createSigner({ algorithm: 'RS256', secret: async () => privateKey, cache: true })
const verifierFast = createVerifier({ secret: async () => publicKey, cache: true })

fastify.post('/sign-jwt', {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        payload: {
          type: 'string'
        }
      },
      required: ['payload'],
      additionalProperties: false
    },
    response: {
      200: {
        type: 'object',
        properties: {
          token: {
            type: 'string'
          }
        },
        required: ['token'],
        additionalProperties: false
      }
    }
  },
  async handler(request, reply) {
    return { token: signerJwt(request.query, privateKey, { algorithm: 'RS256' }) }
  }
})

fastify.post('/sign-fast', {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          token: {
            type: 'string'
          }
        },
        required: ['token'],
        additionalProperties: false
      }
    }
  },
  async handler(request, reply) {
    return { token: await signerFast(request.query) }
  }
})

fastify.get('/auth-jwt', {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          payload: {
            type: 'object',
            additionalProperties: true
          }
        },
        required: ['payload'],
        additionalProperties: false
      }
    }
  },
  async handler(request, reply) {
    return {
      payload: verifierJwt(request.headers.authorization.replace(/^Bearer\s/, ''), publicKey, { algorithm: 'RS256' })
    }
  }
})

fastify.get('/auth-fast', {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          payload: {
            type: 'object',
            additionalProperties: true
          }
        },
        required: ['payload'],
        additionalProperties: false
      }
    }
  },
  async handler(request, reply) {
    return { payload: await verifierFast(request.headers.authorization.replace(/^Bearer\s/, '')) }
  }
})

// Run the server
async function start() {
  try {
    await fastify.listen(3000)
    fastify.log.info(`Server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()

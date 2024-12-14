'use strict'

const fastify = require('fastify')()

const { createSigner, createVerifier } = require('../src')
const key = 'secretsecretsecret'

const { sign: signerJwt, verify: verifierJwt } = require('jsonwebtoken')
const signerFast = createSigner({ key })
const verifierFast = createVerifier({ key, cache: true })

const signRoute = {
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
  }
}

const authRoute = {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        token: {
          type: 'string'
        }
      },
      required: ['token'],
      additionalProperties: false
    },
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
  }
}

fastify.post('/sign-jwt', {
  ...signRoute,
  async handler(request) {
    return { token: signerJwt(request.query, key, { algorithm: 'HS256' }) }
  }
})

fastify.post('/sign-fast', {
  ...signRoute,
  async handler(request) {
    return { token: await signerFast(request.query) }
  }
})

fastify.get('/auth-jwt', {
  ...authRoute,
  async handler(request) {
    return {
      payload: verifierJwt(request.query.token, key, { algorithm: 'HS256' })
    }
  }
})

fastify.get('/auth-fast', {
  ...authRoute,
  async handler(request) {
    return { payload: await verifierFast(request.query.token) }
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

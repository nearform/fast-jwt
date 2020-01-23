const fastify = require('fastify')()
const { readFileSync } = require('fs')
const { resolve } = require('path')

const { createSigner, startWorkers } = require('../src')
const privateKey = readFileSync(resolve(__dirname, './keys/rs-private.key'))

const { sign: signerJwt } = require('jsonwebtoken')
const signerFast = createSigner({ algorithm: 'RS256', secret: privateKey })

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
    return { token: await signerFast(request.query) }
  }
})

// Run the server
async function start() {
  try {
    await startWorkers()
    await fastify.listen(3000)
    fastify.log.info(`Server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()

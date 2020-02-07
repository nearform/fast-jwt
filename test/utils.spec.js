'use strict'

const { test } = require('tap')

const { base64UrlEncode, hashKey } = require('../src/utils')

test('base64UrlEncode should correctly convert formats', t => {
  t.equal(base64UrlEncode('YW55IGN+hcm5hb+CBwb/GVhc3VyZS4='), 'YW55IGN-hcm5hb-CBwb_GVhc3VyZS4')

  t.end()
})

test('hashKey should generate correct hash keys', t => {
  // HS256
  t.equal(
    hashKey(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozfQ.CVJPF2VOvJnvtxdnolkPQcMNLum7PKNoNIe07mv20'
    ),
    '0553c2c7fe95d35d3fe2ba792ee805f33028f755db8dd7f6e4d60443d03f54c8'
  )

  // RS384
  t.equal(
    hashKey(
      'eyJhbGciOiJSUzM4NCIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozfQ.T6AqHQYelC2yopIbuBNxwUSJaF1mLAyasBi5Swn28d967-aXJ8zRFFtMnAEG6yxqLnKhW63s2egoPkvkx22E9ci6lBh5daEfXllvJMPpv2oV-umVVzN6c69nW--XNdoHyXsRrHvwykOrRVl7h3QTbBeWYw5s01l4TtBLSvioVBBGieCynYiQPLUHCXSzL9A0xPmO82HVxp4AIf5HUUTmouvt2CfU8tX75IawOKbqj2gFvDRVWnFVN0pAs9WRHeNetQICt3fTo3uVjKcPR3ocz9Iu9LG9nuENTpd0lA8GyG3U5aYJd9c0hF7ESaJNm7kWEdF5YuUAbo-qTQkjry9cO-to7Vhbf9pmdogl6HjucAZ8FDaErOlwLS2vsaJFv3v38MKmaIgN3uNUDaSZh2ZXHwtId0dXmICSK4t81xPKkYc56IFv1fbnyY1ZLNzfssXWdO7xwyhoZaXBZCAJReUC7hbRbUWUZCteW28HGom8BF1BQtWxwxE1btifDh8athXkBqrgenI5HBxba5v2vLpYWGa5GlFhJWagSGKcU6AUM8h3rEtbCJzlgbIjT56i07VWQTHctjDCZMQ-3HzDDs33cF6qvQSE5WrECp5ZfXC7yh3XQNjF32c5BEs6BSpmIxCCdFufIk4Hdx30YisA-nHIPp30c'
    ),
    'f1ff95294588997e31304cb8ef5f7b5fa5ecc7afe02f3bb36797836094a76419dfe90aacce7c0b0cf7f85ddb6c36b479'
  )

  // ES512
  t.equal(
    hashKey(
      'eyJhbGciOiJFUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozfQ.AYuE59JJD1938C96QIoVmG0oW1jYwsqjpxf7yYTWpBdGZT2aqwtozm9hhZTCaJwAiMRw2FRKKjIU0nXrpZAK69pKZNDzdLC8scESd1kP8j5zTKXJZYVUcJTpGHtHapVZNzVeM5VxZpTre5d7yniZ9w50DLPvfAKzpAKVyjd9'
    ),
    'b136b09dfb851be0307388cb94a44e9a809b97b3e5deb6f28520d18075b4e43f9de549bc88c52270e2ac3f2b7aea99355b54eed9496c9e7c3423baa484ee3c45'
  )

  t.end()
})

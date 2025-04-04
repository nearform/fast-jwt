'use strict'

import { compareDecoding, saveLogs } from './utils.mjs'

// Regenerate this token after regenerating the keys by running `npm run generate-tokens` and getting the RS512 token
const rsToken =
  'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1Nzk1MjEyNjF9.X04Dy1GqFCuduViZIqfKzxAXINszEEaywTwh1xU1Q2j03FCHGLe4kM6AmdMeuzPZQgcBxW-R2mGJfpcjDF83iH6fsd0Xs8Boyoml8_AEE9uZTCwpnQEXDHopmAPZ3zijbwgfrJKd0uwzMTi0iJelUhmFz65T_SlW3ZCyK150D7Xwvjq0LaieTFUbAtuJ5rpgHTtiFEtkChAb8lFl3sUYtWKPrmkcmqSQUR660j0jciLBYLG7eymsBiLJz9Knlwg6p5C_Y4hFg-oXKEEIq4G6OFdcfsBGLXhj9rogHRUDBpT_ud7SFYnpvBb3s9pgRM9y8X3eDGqVILSKGrTx4R6tpS1CGvgfUFwtFJk-wgx6JnJUcFFkrRKQ-RQK08AqPDAEZuEOictGsA7uYK5E2IpUSDiYgoZxCYx00NrwTmnvA1f_fz8vVsbfZnGLCwOmQUmFHl3MLZTLk9ti0dW5dWwZU4u-4qTvvytLF4jEKEfvnCv6IjnfYfBo9nAh6zTW5lueT3rehre0lhW6wxfjgflTafeq2C8PV89t1vvy-iIxTz5PoXN-GeyEdChtjbzfT0Tg2pdMAmT6fisGKIYioqSG_0ugn7SskgYrH_SSk8UzkJFd0ksG5DJ3YYwjmrRi3Ll8S46DoxX6v7NOsq9xPiV4wTc8yQnK7zG2P5MdX-uJBK8'

export async function runSuites() {
  const result = await compareDecoding(rsToken, 'RS512')

  await saveLogs('decode')

  return [{ algorithm: 'RS512', result }]
}

if (import.meta.filename === process.argv[1]) await runSuites()

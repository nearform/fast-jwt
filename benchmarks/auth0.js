'use strict'

const { readFileSync } = require('fs')
const { resolve } = require('path')

const { compareSigning, compareVerifying, saveLogs } = require('./utils')

const hsToken =
  'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1Nzk1MjEyMTJ9.mIcxteEVjbh2MnKQ3EQlojZojGSyA_guqRBYHQURcfnCSSBTT2OShF8lo9_ogjAv-5oECgmCur_cDWB7x3X53g'
const hsSecret = 'secretsecretsecret'

// Regenerate this token after regenerating the keys by running `npm run generate-tokens` and getting the RS256 token
const rsToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMyJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1ODA5MTYyNzZ9.T-OvxnAotVWXwChnMDfobYwcZ16fxEEKv_J1nYpZ_1JNywzlUDgr0NdIOaN1kILgq9aCAwGA5Qp6f_IF39FROOwTIXtaCbLK9X5jwi_suFdTPDnFwp-Z6MNEFsdNUN_e8bRGNcE0gFf8U5e6MCfLVSeIM0nw44d_Vki8oNPQ_5uFlKfLAOl-QpF8dwdfF_PprgDSflP-T8gxqGfJxPO-aZEP5Wg5YQx69U6G7jwI7YJWF8TMHeVQAZWfw1t0zSsXwk1zfRDKTeuZg-nwQCV5125Pna0AqvSX4NmQ6roH-32K3sGYQ2t9uUeusHCShtFkIIflRlpYrF03vUMcemDyEEnN4CfA93bDNihYZPOuZQ4IX1lLfh2v_8JTsRnVXnKwQVmXoH2fZsKwkz2vROLqXPqr22n1YtzLCQH5gVdT7djfjxbnJKKVLk-SHZmtstUFHwGukjUiHj3IGMYQkN6IxYDYRei6HHhJF9aE_xtOQi4ukILHk3dLjpT5EfR-aQay1x_Yj8JE5o7sU6WYhT7HDe6JUieqOHGlpKgnphuGAONqrJFfvspUYPbVyCOjEgA88fyv60dl4uaApl2a0XLNyT5OiiEWM9nvThNrfLgZAfXZbyI0pXSmh4n5SYwG2QhbLppKXCZIWjN0DP6n4nizp-tOG3Zzlx3XdyPuEewjsPY'
const rsPrivateKey = readFileSync(resolve(__dirname, './keys/rs-512-private.key'))
const rsPublicKey = readFileSync(resolve(__dirname, './keys/rs-512-public.key'))

async function runSuites() {
  await compareSigning({ a: 1, b: 2, c: 3 }, 'HS256', hsSecret, hsSecret)
  await compareVerifying(hsToken, 'HS256', hsSecret, hsSecret)
  await compareSigning({ a: 1, b: 2, c: 3 }, 'RS256', rsPrivateKey, rsPublicKey)
  await compareVerifying(rsToken, 'RS256', rsPublicKey)

  await saveLogs('auth0')
}

runSuites().catch(console.error)

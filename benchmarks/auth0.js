'use strict'

const { readFileSync } = require('fs')
const { resolve } = require('path')

const { compareSigning, compareVerifying, saveLogs } = require('./utils')

const hsToken =
  'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1Nzk1MjEyMTJ9.mIcxteEVjbh2MnKQ3EQlojZojGSyA_guqRBYHQURcfnCSSBTT2OShF8lo9_ogjAv-5oECgmCur_cDWB7x3X53g'
const hsSecret = 'secretsecretsecret'

// Remember to update this token when you regenerate the keys by running: NODE_DEBUG=fast-jwt npm run benchmark:auth0
const rsToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1Nzk1MjE1Mzh9.U3EmKWLOhw0PaaxOTrOVmvpV4U2H9XtceEVUA7-FjXe9Ht3C5elLLthi49f2eqgdCNoXlec8BD_CzE0I9oQc_ysZkvsYIFY4QanlEcdHxNLyFw33OxR_HEhq31KAe96FudrXQo7hBt8U2wV8Lj_uk45UsxEGqmYLw0Qz51epsC75bQIC9oyGEZwWn9qM4YWGmoEndrgHlNUXsg8FWsgCoaTeS8GQ3jtttm2rTfE7ZjDy8Ko62ixxR0Px-QJMGMbem_kzUzcByELUL7Q-R4WCOL4cowu0VxrGipAqTEiKuTD84FMOB7DNQg9pWkebYAtDpbiQ2kyR5dh8tqp3lm46RqV_RxpIW2WcaRVthrm6whRdEiLcB9OFBUOUyIEUo_XCNnfvtzCImgfKbX_QYZIuUnPlPjeiGYUhM_TOZokHO_dpIgN1p4PLALMbWa0xphiOEyqCEVQpvV-bwWiQldDZDCX5DuuMjwfDkwPK_pj54VQcSQhrqnkQYqmO0fK9cKDI8fwJrBNVVxXlC7Dn2HhGqtLuDCHbMqLzXT9hVjT5MkJb-TfntHbe7iG_jRbp5IZ73MkVStLoev5iQdsKJI3Ad0eaMDM3pdQIxRGkzWTyFAhAd8vUVgZIKzytWcifQosrWj7OIyazWNoexTR5y47tGQo4QrqLIzdhrq__gUdbGqo'
const rsPrivateKey = readFileSync(resolve(__dirname, './keys/rs-private.key'))
const rsPublicKey = readFileSync(resolve(__dirname, './keys/rs-public.key'))

async function runSuites() {
  await compareSigning({ a: 1, b: 2, c: 3 }, 'HS256', hsSecret, hsSecret)
  await compareVerifying(hsToken, 'HS256', hsSecret, hsSecret)
  await compareSigning({ a: 1, b: 2, c: 3 }, 'RS256', rsPrivateKey, rsPublicKey)
  await compareVerifying(rsToken, 'RS256', rsPublicKey)

  await saveLogs('auth0')
}

runSuites().catch(console.error)

'use strict'

const { readFileSync } = require('fs')
const { resolve } = require('path')

const { compareVerifyingJose, compareVerifyingJWT, saveLogs } = require('./utils')

const hsToken =
  'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1Nzk1MjEyMTJ9.mIcxteEVjbh2MnKQ3EQlojZojGSyA_guqRBYHQURcfnCSSBTT2OShF8lo9_ogjAv-5oECgmCur_cDWB7x3X53g'
/*
  Regenerate these tokens after regenerating the keys
  by running `npm run test:generate-tokens` and getting the ES512, RS512, PS512 and EdDSA tokens
*/
const esToken =
  'eyJhbGciOiJFUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMyJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1ODA5MTUyOTZ9.ARkECNhVBhn3Ac6BRJaX-8-HLTX9r11m9mXN96jWyAYJiJqify8brOdIVqYXoLW67bRSreOaK1966AalZavicMf0AN1FUDBYi9JBnW2p9-ZSfa3b95fAcMRDD5xOoYTJNtEF4SNQSEFgflWzaPzlVhKNzZC7273SFvRtkJC4QI-U-Y-l'
const rsToken =
  'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMyJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1ODA5MTUyOTZ9.JEHZDpA99hww-5-PKcCvwialNy1QcyDSJXJ-qvzV0fU56NXPxZRfn2rEwdX4g-8N-oXLsjCjNZzr0Hl39FXSK0ke_vnzwPW6D4r5mVL6Ak0K-jMgNFidxElM7PRg2XE7N72dI5ClQJCJMqex7NYmIN4OUj9psx1NDv8bM_Oj44kXyI6ozYrkV-6tvowLXUX9BOZH55jF3aAA1DLI4rVBKc_JYqiHf376xu6zvFxzZ8XP3-S-dTR7OBRZLe5_Y6YJweWiL2n0lRkEjYrpK3Ht9MlfaCmW2_KMH0DpUKVS6nnKmzqGjdutnzP6PYXZsJikCQOrIcPW97LdQWLLRIptSpn7YHH1xbNbq__kryaggwpKuNd6qhdXqREEhpaYl3Xc4yjGnBR0zMq7J-GxDo7mSujMMFmb4ZQLQWwANCEHSfqYIJYp7Upc1Rd__lo56Mr1Bd9claZPBNgKqAvhlmjZT9lELA-eyEzhH_yrcVzMcVpCC_oVIzvpiDQ0jgOLcDIz0q8uzoSCks3M0IK3flefopY8g1e-OExqBoYrfoktFciabLfTM5g-rIpC0CrrDN-TfXLqZAPkIv7suGBmQn9-HbcFL8eZEIg-q6D3o7EAfCO7ki9ncrm47C2y5SX3zDOjG37_5pN2JGWztfSFRQ-YbbEV13-TuKvRG3HLJjJQk6g'
const psToken =
  'eyJhbGciOiJQUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMyJ9.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1ODA5MTUyOTd9.IfPgE2aPz9dBzvb8hvn_RjBvdq5jLgfzRw-lM5Q2Ah67NYuRYjCzpvywJASY-0Y-tvk94kwwmDUpqR7nPPPlcv9o_OYQVGhPnndh6iMww0D-MGZwP0sqIauu6NgUsCY4rFG2_K8lxCYbdNThJJVDDN8v_VmKrK3qh7DJC89PE-ZbIMr4N3AuLww-vPgB-9hFmuVnjgO43scZb8C_SaA1HuSbw_SU6OWguAlaTP3zUKlyQmTvvx843J8byi5jDcqK4Rtah5gRaO8U1l6bzmVCKs8Fh3tv7A7GWs-eFukFu5dUr-Ig0iyIhPSAVOjnk0dEZ4s5YI1XaPrnm3wAKV9fyzSri2LaaElp_8Cy7xyJNDPgWSTUmm4BGU7m5x_zwamRbQ1zI7p-YxftwkL4Jl8VD1km7CP9T_6cOEt6RzSTNbTgkk3XhcqYZ0oTgAJ4nXa4j47-7E0n5drtM1xoYeWBaWQvXPdMwGTAwXMx33B1WOm80B7Ncn6AzZKtJtEYalFEKntNfJhWi5x9nZNc4-3cja4o1appVm5PWSOtV4mkLsrLL1T0x1c9ymyF_XtYkRAuxdOKaRs2N5YxHcikgX-iifI1Ih4l79BrWAgyioGjMTU78VMV_gLRQ1VLexmgYJLKL2fBUrBR-k8fI4VwbKEtEZF3wBINWBAp4-urFV3QVig'
const edToken =
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCIsImt0eSI6Ik9LUCIsImNydiI6IkVkMjU1MTkiLCJraWQiOiIxMjMifQ.eyJhIjoxLCJiIjoyLCJjIjozLCJpYXQiOjE1ODY3ODQ3ODF9.PDIxWOWhAHr-7Zy7UC8W4pRuk7dMYTD8xy0DR0N102P0pXK6U4r6THHe66muTdSM3qiDHZnync1WQp-10QFLCQ'

async function runSuites() {
  await compareVerifyingJWT(hsToken, 'HS512', 'secretsecretsecret')
  await compareVerifyingJWT(esToken, 'ES512', readFileSync(resolve(__dirname, './keys/es-512-public.key')))
  await compareVerifyingJWT(rsToken, 'RS512', readFileSync(resolve(__dirname, './keys/rs-512-public.key')))
  await compareVerifyingJWT(psToken, 'PS512', readFileSync(resolve(__dirname, './keys/ps-512-public.key')))
  await compareVerifyingJose(edToken, 'EdDSA', readFileSync(resolve(__dirname, './keys/ed-25519-public.key')))

  await saveLogs('verify')
}

runSuites().catch(console.error)

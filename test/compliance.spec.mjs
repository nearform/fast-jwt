'use strict'

import { test } from 'node:test'
import { default as jose } from 'jose'
const { asKey } = jose.JWK

import { createSigner, createVerifier } from '../src/index.mjs'

const payload = {
  text: "It’s a dangerous business, Frodo, going out your door. You step onto the road, and if you don't keep your feet, there’s no knowing where you might be swept off to."
}

// All the keys here are extracted from https://tools.ietf.org/html/rfc7520
const symmetricKey = asKey({
  kty: 'oct',
  kid: '018c0ae5-4d9b-471b-bfd6-eef314bc7037',
  use: 'sig',
  alg: 'HS256',
  k: 'hJtXIZ2uSN5kbQfbtTNWbpdmhkV8FJG-Onbc6mxCcYg'
})

const rsaPublicKey = asKey({
  kty: 'RSA',
  kid: 'bilbo.baggins@hobbiton.example',
  use: 'sig',
  n: 'n4EPtAOCc9AlkeQHPzHStgAbgs7bTZLwUBZdR8_KuKPEHLd4rHVTeT-O-XV2jRojdNhxJWTDvNd7nqQ0VEiZQHz_AJmSCpMaJMRBSFKrKb2wqVwGU_NsYOYL-QtiWN2lbzcEe6XC0dApr5ydQLrHqkHHig3RBordaZ6Aj-oBHqFEHYpPe7Tpe-OfVfHd1E6cS6M1FZcD1NNLYD5lFHpPI9bTwJlsde3uhGqC0ZCuEHg8lhzwOHrtIQbS0FVbb9k3-tVTU4fg_3L_vniUFAKwuCLqKnS2BYwdq_mzSnbLY7h_qixoR7jig3__kRhuaxwUkRz5iaiQkqgc5gHdrNP5zw',
  e: 'AQAB'
}).toPEM()

const rsaPrivateKey = asKey({
  kty: 'RSA',
  kid: 'bilbo.baggins@hobbiton.example',
  use: 'sig',
  n: 'n4EPtAOCc9AlkeQHPzHStgAbgs7bTZLwUBZdR8_KuKPEHLd4rHVTeT-O-XV2jRojdNhxJWTDvNd7nqQ0VEiZQHz_AJmSCpMaJMRBSFKrKb2wqVwGU_NsYOYL-QtiWN2lbzcEe6XC0dApr5ydQLrHqkHHig3RBordaZ6Aj-oBHqFEHYpPe7Tpe-OfVfHd1E6cS6M1FZcD1NNLYD5lFHpPI9bTwJlsde3uhGqC0ZCuEHg8lhzwOHrtIQbS0FVbb9k3-tVTU4fg_3L_vniUFAKwuCLqKnS2BYwdq_mzSnbLY7h_qixoR7jig3__kRhuaxwUkRz5iaiQkqgc5gHdrNP5zw',
  e: 'AQAB',
  d: 'bWUC9B-EFRIo8kpGfh0ZuyGPvMNKvYWNtB_ikiH9k20eT-O1q_I78eiZkpXxXQ0UTEs2LsNRS-8uJbvQ-A1irkwMSMkK1J3XTGgdrhCku9gRldY7sNA_AKZGh-Q661_42rINLRCe8W-nZ34ui_qOfkLnK9QWDDqpaIsA-bMwWWSDFu2MUBYwkHTMEzLYGqOe04noqeq1hExBTHBOBdkMXiuFhUq1BU6l-DqEiWxqg82sXt2h-LMnT3046AOYJoRioz75tSUQfGCshWTBnP5uDjd18kKhyv07lhfSJdrPdM5Plyl21hsFf4L_mHCuoFau7gdsPfHPxxjVOcOpBrQzwQ',
  p: '3Slxg_DwTXJcb6095RoXygQCAZ5RnAvZlno1yhHtnUex_fp7AZ_9nRaO7HX_-SFfGQeutao2TDjDAWU4Vupk8rw9JR0AzZ0N2fvuIAmr_WCsmGpeNqQnev1T7IyEsnh8UMt-n5CafhkikzhEsrmndH6LxOrvRJlsPp6Zv8bUq0k',
  q: 'uKE2dh-cTf6ERF4k4e_jy78GfPYUIaUyoSSJuBzp3Cubk3OCqs6grT8bR_cu0Dm1MZwWmtdqDyI95HrUeq3MP15vMMON8lHTeZu2lmKvwqW7anV5UzhM1iZ7z4yMkuUwFWoBvyY898EXvRD-hdqRxHlSqAZ192zB3pVFJ0s7pFc',
  dp: 'B8PVvXkvJrj2L-GYQ7v3y9r6Kw5g9SahXBwsWUzp19TVlgI-YV85q1NIb1rxQtD-IsXXR3-TanevuRPRt5OBOdiMGQp8pbt26gljYfKU_E9xn-RULHz0-ed9E9gXLKD4VGngpz-PfQ_q29pk5xWHoJp009Qf1HvChixRX59ehik',
  dq: 'CLDmDGduhylc9o7r84rEUVn7pzQ6PF83Y-iBZx5NT-TpnOZKF1pErAMVeKzFEl41DlHHqqBLSM0W1sOFbwTxYWZDm6sI6og5iTbwQGIC3gnJKbi_7k_vJgGHwHxgPaX2PnvP-zyEkDERuf-ry4c_Z11Cq9AqC2yeL6kdKT1cYF8',
  qi: '3PiqvXQN0zwMeE-sBvZgi289XP9XCQF3VWqPzMKnIgQp7_Tugo6-NZBKCQsMf3HaEGBjTVJs_jcK8-TRXvaKe-7ZMaQj8VfBdYkssbu0NKDDhjJ-GtiseaDVWt7dcH0cfwxgFUHpQh7FoCrjFJ6h6ZEpMF6xmujs4qMpPz8aaI4'
}).toPEM(true)

const ecPublicKey = asKey({
  kty: 'EC',
  kid: 'bilbo.baggins@hobbiton.example',
  use: 'sig',
  crv: 'P-521',
  x: 'AHKZLLOsCOzz5cY97ewNUajB957y-C-U88c3v13nmGZx6sYl_oJXu9A5RkTKqjqvjyekWF-7ytDyRXYgCF5cj0Kt',
  y: 'AdymlHvOiLxXkEhayXQnNCvDX4h9htZaCJN34kfmC6pV5OhQHiraVySsUdaQkAgDPrwQrJmbnX9cwlGfP-HqHZR1'
}).toPEM()

const ecPrivateKey = asKey({
  kty: 'EC',
  kid: 'bilbo.baggins@hobbiton.example',
  use: 'sig',
  crv: 'P-521',
  x: 'AHKZLLOsCOzz5cY97ewNUajB957y-C-U88c3v13nmGZx6sYl_oJXu9A5RkTKqjqvjyekWF-7ytDyRXYgCF5cj0Kt',
  y: 'AdymlHvOiLxXkEhayXQnNCvDX4h9htZaCJN34kfmC6pV5OhQHiraVySsUdaQkAgDPrwQrJmbnX9cwlGfP-HqHZR1',
  d: 'AAhRON2r9cqXX1hg-RoI6R1tX5p2rUAYdmpHZoC1XNM56KtscrX6zbKipQrCW9CGZH3T4ubpnoTKLDYJ_fF3_rJt'
}).toPEM(true)

test('HS256', t => {
  const expectedToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjAxOGMwYWU1LTRkOWItNDcxYi1iZmQ2LWVlZjMxNGJjNzAzNyJ9.eyJ0ZXh0IjoiSXTigJlzIGEgZGFuZ2Vyb3VzIGJ1c2luZXNzLCBGcm9kbywgZ29pbmcgb3V0IHlvdXIgZG9vci4gWW91IHN0ZXAgb250byB0aGUgcm9hZCwgYW5kIGlmIHlvdSBkb24ndCBrZWVwIHlvdXIgZmVldCwgdGhlcmXigJlzIG5vIGtub3dpbmcgd2hlcmUgeW91IG1pZ2h0IGJlIHN3ZXB0IG9mZiB0by4ifQ.1rxc48IZZfiOQFzXieSY08XI5bimhiyCPWTjCzZ3G2Y'

  const key = Buffer.from(symmetricKey.k, 'base64')

  const token = createSigner({
    algorithm: 'HS256',
    key,
    kid: '018c0ae5-4d9b-471b-bfd6-eef314bc7037',
    noTimestamp: true
  })(payload)

  const verified = createVerifier({ key })(token)

  t.assert.deepStrictEqual(verified, payload)
  t.assert.equal(token, expectedToken)
})

test('RS256', t => {
  const expectedToken =
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImJpbGJvLmJhZ2dpbnNAaG9iYml0b24uZXhhbXBsZSJ9.eyJ0ZXh0IjoiSXTigJlzIGEgZGFuZ2Vyb3VzIGJ1c2luZXNzLCBGcm9kbywgZ29pbmcgb3V0IHlvdXIgZG9vci4gWW91IHN0ZXAgb250byB0aGUgcm9hZCwgYW5kIGlmIHlvdSBkb24ndCBrZWVwIHlvdXIgZmVldCwgdGhlcmXigJlzIG5vIGtub3dpbmcgd2hlcmUgeW91IG1pZ2h0IGJlIHN3ZXB0IG9mZiB0by4ifQ.IVYRXcdRwWOx1Gvz3iag8td3cIf4EdeIjrDM79vDwZwEBhipoeJz1JKW22Ag7BUE_Wsl-ONufHwbAP4Sr0dJUAJL9ZsAoH1UIkR5Xm4kpk-8gSAR4LB3RhHAfvbgDC-V2E91szKRHNKbvGtQLInCO7MADg9GMold_U74jDSYZE9nZVwkN5CebYeFUEsiLwq2_bKB3fCHJGh2fDzTXpkc2pm_h_oLxYuig8SB5dvPRg_j5I5y3DDyxvYluB3oMi4QUYYvNG5AnNufkPrlnjCw6QhHM1Ct3ocz1pOXmH3JCr3twXF0GUfY3H4MJTbBtmmxRmyErLEKcpRXHFWjT3DKGA'

  const token = createSigner({
    algorithm: 'RS256',
    key: rsaPrivateKey,
    kid: 'bilbo.baggins@hobbiton.example',
    noTimestamp: true
  })(payload)

  const verified = createVerifier({ key: rsaPublicKey })(token)

  t.assert.deepStrictEqual(verified, payload)
  t.assert.equal(token, expectedToken)
})

test('PS384', t => {
  const expectedToken =
    'eyJhbGciOiJQUzM4NCIsInR5cCI6IkpXVCIsImtpZCI6ImJpbGJvLmJhZ2dpbnNAaG9iYml0b24uZXhhbXBsZSJ9.eyJ0ZXh0IjoiSXTigJlzIGEgZGFuZ2Vyb3VzIGJ1c2luZXNzLCBGcm9kbywgZ29pbmcgb3V0IHlvdXIgZG9vci4gWW91IHN0ZXAgb250byB0aGUgcm9hZCwgYW5kIGlmIHlvdSBkb24ndCBrZWVwIHlvdXIgZmVldCwgdGhlcmXigJlzIG5vIGtub3dpbmcgd2hlcmUgeW91IG1pZ2h0IGJlIHN3ZXB0IG9mZiB0by4ifQ.dM4A9qfogzmTfIB0-dbUcXUD9TfGC4wa6cft9wzuUmYBQEKpeAMOmtn3nTXAp3jFuhGCzmCHT2_y0-HKO2R55oewCiIAyPVHIffVK_Vga0eezX_wglVY1dtYvBaCpA6zYA3nJwmDsnK_Ivb-B5tuQYHuZUkL6A-SoLT2TfKic7yuLUs-Z5i58_f0ExwSwEPiMdbPXrg8azaAtiy5caNi76Vd_ROqNuhuFlgDAsACJPtJOpwmcgQ_er865QIkdvfV_UfOrcGPavjdKtj-h4UkikeX5YHsVYKoNJCo5hEAAgGcJKjGS4Bthm67y4Z_DfTxzxRfkFE7Sj15gSAZcSEONw'

  const token = createSigner({
    algorithm: 'PS384',
    key: rsaPrivateKey,
    kid: 'bilbo.baggins@hobbiton.example',
    noTimestamp: true
  })(payload)

  const verified = createVerifier({ key: rsaPublicKey })(token)

  t.assert.deepStrictEqual(verified, payload)
  // Since PS algorithm uses random data, we cannot match the signature
  t.assert.equal(token.replace(/\..+/, ''), expectedToken.replace(/\..+/, ''))
})

test('ES512', t => {
  const expectedToken =
    'eyJhbGciOiJFUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImJpbGJvLmJhZ2dpbnNAaG9iYml0b24uZXhhbXBsZSJ9.eyJ0ZXh0IjoiSXTigJlzIGEgZGFuZ2Vyb3VzIGJ1c2luZXNzLCBGcm9kbywgZ29pbmcgb3V0IHlvdXIgZG9vci4gWW91IHN0ZXAgb250byB0aGUgcm9hZCwgYW5kIGlmIHlvdSBkb24ndCBrZWVwIHlvdXIgZmVldCwgdGhlcmXigJlzIG5vIGtub3dpbmcgd2hlcmUgeW91IG1pZ2h0IGJlIHN3ZXB0IG9mZiB0by4ifQ.AKrrbzQgTVYtM9iJGq2mzAAwAD0tK0sU2Oa3FqelV7Zc_VeC1VgApx9vkeZGen36CEcAvPpIAtcVZeWqp0nEB4JfAMsFhZI8QSuHnY152Abxi6WxaOXH22wYsYPYF_H4J41JG10C2X3ORHDsPrvIO8yfXdJ4AyNLOg6s0Suqq8YQP_8q'

  const token = createSigner({
    algorithm: 'ES512',
    key: ecPrivateKey,
    kid: 'bilbo.baggins@hobbiton.example',
    noTimestamp: true
  })(payload)

  const verified = createVerifier({ key: ecPublicKey })(token)

  t.assert.deepStrictEqual(verified, payload)
  // Since ES algorithm uses random data, we cannot match the signature
  t.assert.equal(token.replace(/\..+/, ''), expectedToken.replace(/\..+/, ''))
})

// All the keys here are extracted from https://tools.ietf.org/html/rfc8037
const ed25519PublicKey = asKey({
  kty: 'OKP',
  crv: 'Ed25519',
  x: '11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo'
}).toPEM()

const ed25519PrivateKey = asKey({
  kty: 'OKP',
  crv: 'Ed25519',
  d: 'nWGxne_9WmC6hEr0kuwsxERJxWl7MmkZcDusAxyuf2A',
  x: '11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo'
}).toPEM(true)

test('EdDSA - Ed25519', t => {
  const expectedToken =
    'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ0ZXh0IjoiSXTigJlzIGEgZGFuZ2Vyb3VzIGJ1c2luZXNzLCBGcm9kbywgZ29pbmcgb3V0IHlvdXIgZG9vci4gWW91IHN0ZXAgb250byB0aGUgcm9hZCwgYW5kIGlmIHlvdSBkb24ndCBrZWVwIHlvdXIgZmVldCwgdGhlcmXigJlzIG5vIGtub3dpbmcgd2hlcmUgeW91IG1pZ2h0IGJlIHN3ZXB0IG9mZiB0by4ifQ.s6A86zrJs551R4UxXwJsfRCGswdTJYFeNWjHUkZvragJ7hN43T5UetbpG4S6L2G7wOq5N_JJKrkbs0q0Gd-EAQ'

  const token = createSigner({ algorithm: 'EdDSA', key: ed25519PrivateKey, noTimestamp: true })(payload)

  const verified = createVerifier({ key: ed25519PublicKey })(token)

  t.assert.deepStrictEqual(verified, payload)
  t.assert.equal(token, expectedToken)
})

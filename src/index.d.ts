import 'node'

export type Algorithm =
  | 'none'
  | 'HS256'
  | 'HS384'
  | 'HS512'
  | 'ES256'
  | 'ES384'
  | 'ES512'
  | 'RS256'
  | 'RS384'
  | 'RS512'
  | 'PS256'
  | 'PS384'
  | 'PS512'
  | 'EdDSA'

type SignerCallback = (e: Error | null, token: string) => void
type VerifierCallback = (e: Error | null, payload: any) => void

type KeyFetcher =
  | ((key: string, header: string) => Promise<string | Buffer>)
  | ((key: string, header: string, cb: (err: Error | null, key: string | Buffer) => void) => void)

declare function Signer(payload: string | Buffer | { [key: string]: any }): Promise<string>
declare function Signer(payload: string | Buffer | { [key: string]: any }, cb: SignerCallback): void

declare function Verifier(token: string | Buffer): Promise<any>
declare function Verifier(token: string | Buffer, cb: object): void

export interface SignerOptions {
  key: string | Buffer | KeyFetcher
  algorithm: Algorithm
  mutatePayload: boolean
  expiresIn: number
  notBefore: number
  jti: string
  aud: string
  iss: string
  sub: string
  nonce: string
  kid: string
  header: { [key: string]: string }
  noTimestamp: boolean
  clockTimestamp: number
}

export interface DecoderOptions {
  complete: boolean
  checkTyp: string
}

export interface VerifierOptions {
  key: string | Buffer | KeyFetcher
  algorithms: Algorithm[]
  complete: boolean
  cache: boolean | number
  cacheTTL: number
  allowedJti: string | RegExp | Array<string | RegExp>
  allowedAud: string | RegExp | Array<string | RegExp>
  allowedIss: string | RegExp | Array<string | RegExp>
  allowedSub: string | RegExp | Array<string | RegExp>
  allowedNonce: string | RegExp | Array<string | RegExp>
  ignoreExpiration: boolean
  ignoreNotBefore: boolean
  maxAge: number
  clockTimestamp: number
  clockTolerance: number
}

export function createSigner(options?: Partial<SignerOptions>): typeof Signer
export function createDecoder(options: Partial<DecoderOptions>): (token: string | Buffer) => any
export function createVerifier(options: Partial<VerifierOptions>): typeof Verifier

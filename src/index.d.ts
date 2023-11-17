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

export type TokenValidationErrorCode =
  | 'FAST_JWT_INVALID_TYPE'
  | 'FAST_JWT_INVALID_OPTION'
  | 'FAST_JWT_INVALID_ALGORITHM'
  | 'FAST_JWT_INVALID_CLAIM_TYPE'
  | 'FAST_JWT_INVALID_CLAIM_VALUE'
  | 'FAST_JWT_INVALID_KEY'
  | 'FAST_JWT_INVALID_SIGNATURE'
  | 'FAST_JWT_INVALID_PAYLOAD'
  | 'FAST_JWT_MALFORMED'
  | 'FAST_JWT_INACTIVE'
  | 'FAST_JWT_EXPIRED'
  | 'FAST_JWT_MISSING_KEY'
  | 'FAST_JWT_KEY_FETCHING_ERROR'
  | 'FAST_JWT_SIGN_ERROR'
  | 'FAST_JWT_VERIFY_ERROR'
  | 'FAST_JWT_MISSING_REQUIRED_CLAIM'
  | 'FAST_JWT_MISSING_SIGNATURE'

declare class TokenError extends Error {
  static wrap(originalError: Error, code: TokenValidationErrorCode, message: string): TokenError
  static codes: {
    invalidType: 'FAST_JWT_INVALID_TYPE'
    invalidOption: 'FAST_JWT_INVALID_OPTION'
    invalidAlgorithm: 'FAST_JWT_INVALID_ALGORITHM'
    invalidClaimType: 'FAST_JWT_INVALID_CLAIM_TYPE'
    invalidClaimValue: 'FAST_JWT_INVALID_CLAIM_VALUE'
    invalidKey: 'FAST_JWT_INVALID_KEY'
    invalidSignature: 'FAST_JWT_INVALID_SIGNATURE'
    invalidPayload: 'FAST_JWT_INVALID_PAYLOAD'
    malformed: 'FAST_JWT_MALFORMED'
    inactive: 'FAST_JWT_INACTIVE'
    expired: 'FAST_JWT_EXPIRED'
    missingKey: 'FAST_JWT_MISSING_KEY'
    keyFetchingError: 'FAST_JWT_KEY_FETCHING_ERROR'
    signError: 'FAST_JWT_SIGN_ERROR'
    verifyError: 'FAST_JWT_VERIFY_ERROR'
    missingRequiredClaim: 'FAST_JWT_MISSING_REQUIRED_CLAIM'
    missingSignature: 'FAST_JWT_MISSING_SIGNATURE'
  }

  code: TokenValidationErrorCode;
  [key: string]: any
}

type SignerCallback = (e: Error | TokenError | null, token: string) => void
type VerifierCallback = (e: Error | TokenError | null, payload: any) => void

type DecodedJwt = {
  header: { [key: string]: any },
  payload: any,
  signature: string
}

type KeyFetcher =
  | ((DecodedJwt: DecodedJwt) => Promise<string | Buffer>)
  | ((DecodedJwt: DecodedJwt, cb: (err: Error | TokenError | null, key: string | Buffer) => void) => void)

declare function SignerSync(payload: string | Buffer | { [key: string]: any }): string
declare function SignerAsync(payload: string | Buffer | { [key: string]: any }): Promise<string>
declare function SignerAsync(payload: string | Buffer | { [key: string]: any }, cb: SignerCallback): void

declare function VerifierSync(token: string | Buffer): any
declare function VerifierAsync(token: string | Buffer): Promise<any>
declare function VerifierAsync(token: string | Buffer, cb: object): void

export interface JwtHeader {
  alg: string | Algorithm
  typ?: string | undefined
  cty?: string | undefined
  crit?: Array<string | Exclude<keyof JwtHeader, 'crit'>> | undefined
  kid?: string | undefined
  jku?: string | undefined
  x5u?: string | string[] | undefined
  'x5t#S256'?: string | undefined
  x5t?: string | undefined
  x5c?: string | string[] | undefined
}

export interface SignerOptions {
  algorithm?: Algorithm
  mutatePayload?: boolean
  expiresIn?: number | string
  notBefore?: number
  jti?: string
  aud?: string | string[]
  iss?: string
  sub?: string
  nonce?: string
  kid?: string
  header?: JwtHeader
  noTimestamp?: boolean
  clockTimestamp?: number
}

export interface DecoderOptions {
  complete?: boolean
  checkTyp?: string
}

export interface VerifierOptions {
  algorithms?: Algorithm[]
  complete?: boolean
  cache?: boolean | number
  cacheTTL?: number
  errorCacheTTL?: number | ((tokenError: TokenError) => number)
  allowedJti?: string | RegExp | Array<string | RegExp>
  allowedAud?: string | RegExp | Array<string | RegExp>
  allowedIss?: string | RegExp | Array<string | RegExp>
  allowedSub?: string | RegExp | Array<string | RegExp>
  allowedNonce?: string | RegExp | Array<string | RegExp>
  ignoreExpiration?: boolean
  ignoreNotBefore?: boolean
  maxAge?: number
  clockTimestamp?: number
  clockTolerance?: number
  requiredClaims?: Array<string>
  checkTyp?: string
}

export interface PrivateKey {
  key: string | Buffer
  passphrase: string | undefined
}

export function createSigner(
  options?: Partial<SignerOptions & { key: string | Buffer | PrivateKey }>
): typeof SignerSync
export function createSigner(options?: Partial<SignerOptions & { key: KeyFetcher }>): typeof SignerAsync
export function createDecoder(options?: Partial<DecoderOptions>): (token: string | Buffer) => any
export function createVerifier(options?: Partial<VerifierOptions & { key: string | Buffer }>): typeof VerifierSync
export function createVerifier(options?: Partial<VerifierOptions & { key: KeyFetcher }>): typeof VerifierAsync

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
  header: Record<string, any>
  payload: any
  signature: string
  input: string
}

type Bufferable = string | Buffer

type KeyFetcher =
  | ((DecodedJwt: DecodedJwt) => Promise<Bufferable>)
  | ((DecodedJwt: DecodedJwt, cb: (err: Error | TokenError | null, key: Bufferable) => void) => void)

type SignerPayload = Bufferable | Record<string, any>

declare function SignerSync<T = SignerPayload>(payload: T): string
declare function SignerAsync<T = SignerPayload>(payload: T): Promise<string>
declare function SignerAsync<T = SignerPayload>(payload: T, cb: SignerCallback): void

declare function VerifierSync<T = Bufferable>(token: T): any
declare function VerifierAsync<T = Bufferable>(token: T): Promise<any>
declare function VerifierAsync<T = Bufferable>(token: T, cb: VerifierCallback): void

export interface JwtHeader extends Record<string, any> {
  alg: string | Algorithm
  typ?: string
  cty?: string
  crit?: Array<string | Exclude<keyof JwtHeader, 'crit'>>
  kid?: string
  jku?: string
  x5u?: string | string[]
  'x5t#S256'?: string
  x5t?: string
  x5c?: string | string[]
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

type VerifierAllowedBase = string | RegExp
type VerifierAllowed = VerifierAllowedBase | Array<VerifierAllowedBase>

export interface VerifierOptions {
  algorithms?: Algorithm[]
  complete?: boolean
  cache?: boolean | number
  cacheTTL?: number
  errorCacheTTL?: number | ((tokenError: TokenError) => number)
  allowedJti?: VerifierAllowed
  allowedAud?: VerifierAllowed
  allowedIss?: VerifierAllowed
  allowedSub?: VerifierAllowed
  allowedNonce?: VerifierAllowed
  ignoreExpiration?: boolean
  ignoreNotBefore?: boolean
  maxAge?: number
  clockTimestamp?: number
  clockTolerance?: number
  requiredClaims?: Array<string>
  checkTyp?: string
}

export interface PrivateKey {
  key: Bufferable
  passphrase: string | undefined
}

export function createSigner<T = SignerPayload>(
  options?: Partial<SignerOptions & { key: Bufferable | PrivateKey }>
): typeof SignerSync<T>
export function createSigner<T = SignerPayload>(options?: Partial<SignerOptions & { key: KeyFetcher }>): typeof SignerAsync<T>
export function createDecoder(options?: Partial<DecoderOptions>): (token: Bufferable) => any
export function createVerifier<T = Bufferable>(options?: Partial<VerifierOptions & { key: Bufferable }>): typeof VerifierSync<T>
export function createVerifier<T = Bufferable>(options?: Partial<VerifierOptions & { key: KeyFetcher }>): typeof VerifierAsync<T>

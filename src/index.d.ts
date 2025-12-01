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

export type TokenValidationErrorCode = typeof TOKEN_ERROR_CODES[keyof typeof TOKEN_ERROR_CODES]

declare class TokenError extends Error {
  constructor(code: TokenValidationErrorCode, message?: string, additional?: { [key: string]: any });
  static wrap(originalError: Error, code: TokenValidationErrorCode, message: string): TokenError
  static codes: typeof TOKEN_ERROR_CODES

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
  cacheKeyBuilder?: (token: string) => string
}

export interface PrivateKey {
  key: Bufferable
  passphrase: string | undefined
}

export const TOKEN_ERROR_CODES: {
  readonly invalidType: 'FAST_JWT_INVALID_TYPE';
  readonly invalidOption: 'FAST_JWT_INVALID_OPTION';
  readonly invalidAlgorithm: 'FAST_JWT_INVALID_ALGORITHM';
  readonly invalidClaimType: 'FAST_JWT_INVALID_CLAIM_TYPE';
  readonly invalidClaimValue: 'FAST_JWT_INVALID_CLAIM_VALUE';
  readonly invalidKey: 'FAST_JWT_INVALID_KEY';
  readonly invalidSignature: 'FAST_JWT_INVALID_SIGNATURE';
  readonly invalidPayload: 'FAST_JWT_INVALID_PAYLOAD';
  readonly malformed: 'FAST_JWT_MALFORMED';
  readonly inactive: 'FAST_JWT_INACTIVE';
  readonly expired: 'FAST_JWT_EXPIRED';
  readonly missingKey: 'FAST_JWT_MISSING_KEY';
  readonly keyFetchingError: 'FAST_JWT_KEY_FETCHING_ERROR';
  readonly signError: 'FAST_JWT_SIGN_ERROR';
  readonly verifyError: 'FAST_JWT_VERIFY_ERROR';
  readonly missingRequiredClaim: 'FAST_JWT_MISSING_REQUIRED_CLAIM';
  readonly missingSignature: 'FAST_JWT_MISSING_SIGNATURE';
};

export function createSigner<T = SignerPayload>(
  options?: Partial<SignerOptions & { key: Bufferable | PrivateKey }>
): typeof SignerSync<T>
export function createSigner<T = SignerPayload>(options?: Partial<SignerOptions & { key: KeyFetcher }>): typeof SignerAsync<T>
export function createDecoder(options?: Partial<DecoderOptions>): (token: Bufferable) => any
export function createVerifier<T = Bufferable>(options?: Partial<VerifierOptions & { key: Bufferable }>): typeof VerifierSync<T>
export function createVerifier<T = Bufferable>(options?: Partial<VerifierOptions & { key: KeyFetcher }>): typeof VerifierAsync<T>

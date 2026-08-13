import jwt from 'jsonwebtoken'

export type SignOptions = jwt.SignOptions

export function signJwt(payload: string | object | Buffer, secret: string, options?: SignOptions) {
  return jwt.sign(payload, secret, options)
}

export function verifyJwt<T = any>(token: string, secret: string): T {
  return jwt.verify(token, secret) as T
}

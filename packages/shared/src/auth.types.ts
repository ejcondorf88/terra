export type TerraJwtPayload = {
  sub: string | number
  roles?: string[]
  iat?: number
  exp?: number
  username?: string
  tenantId?: number
  role?: string
  email?: string
  id?: string | number
}

export type JwtPayload = TerraJwtPayload

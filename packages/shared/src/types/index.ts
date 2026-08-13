/**
 * Payload JWT común del ecosistema TERRA.
 * Los campos opcionales cubren GO, LINK y X CHANGE.
 */
export type TerraJwtPayload = {
  sub: string | number
  role?: string
  /** Rol en español (TERRA GO) */
  rol?: string
  roles?: string[]
  tenantId?: number
  username?: string
  email?: string
  id?: string | number
  iat?: number
  exp?: number
}

/** @deprecated Usar TerraJwtPayload */
export type JwtPayload = TerraJwtPayload

/**
 * Extrae el token JWT del header Authorization (Bearer o token plano).
 */
export function extractBearerToken(authorizationHeader?: string): string | null {
  if (!authorizationHeader) {
    return null
  }

  const parts = authorizationHeader.trim().split(/\s+/)
  if (parts.length === 2 && parts[0] === 'Bearer' && parts[1]) {
    return parts[1]
  }

  if (parts.length === 1 && parts[0]) {
    return parts[0]
  }

  return null
}

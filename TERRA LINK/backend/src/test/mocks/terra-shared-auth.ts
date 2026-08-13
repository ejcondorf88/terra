export class JwtAuthGuard {
  canActivate() {
    return true;
  }
}

export class RbacGuard {
  canActivate() {
    return true;
  }
}

export const Roles = (...roles: string[]) => () => undefined;

export const TenantId = () => () => undefined;

export type TerraJwtPayload = {
  sub: string;
  roles?: string[];
  iat?: number;
  exp?: number;
};

export type JwtPayload = TerraJwtPayload;

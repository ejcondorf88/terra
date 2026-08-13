declare module 'express' {
  export interface Request {
    user?: unknown;
    tenantId?: string | number;
  }

  export interface Response {}
  export interface NextFunction {}
}

declare module 'express' {
  export interface Request {
    user?: unknown;
    tenantId?: string | number;
    headers: Record<string, string | undefined>;
  }

  export interface Response {}
  export interface NextFunction {}
}

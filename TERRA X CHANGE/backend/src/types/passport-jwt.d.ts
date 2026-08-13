declare module 'passport-jwt' {
  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken(): (request: any) => string | null;
  };

  export class Strategy {
    constructor(options: any, verify: (payload: any, done: (error: any, user?: any, info?: any) => void) => void);
  }
}

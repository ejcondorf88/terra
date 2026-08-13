declare module 'express' {
  import type { IncomingMessage, ServerResponse } from 'http'

  interface Request extends IncomingMessage {
    [key: string]: any
  }

  interface Response extends ServerResponse {
    [key: string]: any
  }

  type NextFunction = (err?: any) => void

  export { Request, Response, NextFunction }
}

declare module 'passport-jwt' {
  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken(): any
  }

  export class Strategy {
    constructor(options: any, verify: any)
  }
}

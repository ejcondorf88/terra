import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { verifyJwt } from '../jwt'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest()
    const auth = req.headers?.authorization
    if (!auth) return false
    const parts = auth.split(' ')
    const token = parts.length > 1 ? parts[1] : parts[0]
    try {
      const payload = verifyJwt(token, process.env.JWT_SECRET || 'dev')
      req.user = payload
      return true
    } catch (err) {
      return false
    }
  }
}

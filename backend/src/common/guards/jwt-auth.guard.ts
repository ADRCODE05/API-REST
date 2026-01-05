import { Injectable, type ExecutionContext, UnauthorizedException } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { Reflector } from "@nestjs/core"

export const IS_PUBLIC_KEY = "isPublic"

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    // I check if the route is marked as public using a custom decorator.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) {
      return true
    }
    // If not public, I use the default Passport JWT strategy.
    return super.canActivate(context)
  }

  handleRequest(err, user, info) {
    // I customize the error message to be more friendly for the frontend.
    if (err || !user) {
      throw err || new UnauthorizedException("Invalid or expired token")
    }
    return user
  }
}
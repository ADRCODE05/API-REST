import { Injectable, type CanActivate, type ExecutionContext, UnauthorizedException } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const apiKey = request.headers["x-api-key"]

    const validApiKey = this.configService.get<string>("API_KEY")

    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException("API Key inválida o no proporcionada")
    }

    return true
  }
}

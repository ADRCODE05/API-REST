import { Controller, Post, Body, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from "@nestjs/swagger"
import { AuthService } from "./auth.service"
import { RegisterDto } from "./dto/register.dto"
import { LoginDto } from "./dto/login.dto"
import { ApiKeyGuard } from "../common/guards/api-key.guard"
import { Public } from "../common/decorators/public.decorator"

@ApiTags("Autenticación")
@ApiSecurity("API_KEY")
@UseGuards(ApiKeyGuard)
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post("register")
  @ApiOperation({ summary: "Registrar un nuevo coder" })
  @ApiResponse({ status: 201, description: "Usuario registrado exitosamente" })
  @ApiResponse({ status: 409, description: "El email ya está registrado" })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto)
  }

  @Public()
  @Post("login")
  @ApiOperation({ summary: "Iniciar sesión" })
  @ApiResponse({ status: 200, description: "Login exitoso" })
  @ApiResponse({ status: 401, description: "Credenciales inválidas" })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }
}

import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common"
import type { JwtService } from "@nestjs/jwt"
import type { UsersService } from "../users/users.service"
import * as bcrypt from "bcrypt"
import type { RegisterDto } from "./dto/register.dto"
import type { LoginDto } from "./dto/login.dto"

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Verificar si el usuario ya existe
    const existingUser = await this.usersService.findByEmail(registerDto.email)
    if (existingUser) {
      throw new ConflictException("El email ya está registrado")
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(registerDto.password, 10)

    // Crear usuario
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    })

    // Generar token
    const token = this.generateToken(user)

    return {
      message: "Usuario registrado exitosamente",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email)

    if (!user) {
      throw new UnauthorizedException("Credenciales inválidas")
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException("Credenciales inválidas")
    }

    const token = this.generateToken(user)

    return {
      message: "Login exitoso",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    }
  }

  private generateToken(user: any): string {
    const payload = { sub: user.id, email: user.email, role: user.role }
    return this.jwtService.sign(payload)
  }
}

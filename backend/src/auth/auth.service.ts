import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { UsersService } from "../users/users.service"
import * as bcrypt from "bcrypt"
import { RegisterDto } from "./dto/register.dto"
import { LoginDto } from "./dto/login.dto"

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    // I check if the user already exists in my database.
    const existingUser = await this.usersService.findByEmail(registerDto.email)
    if (existingUser) {
      throw new ConflictException("Email is already registered")
    }

    // I use bcrypt to hash the password securely before saving it.
    const hashedPassword = await bcrypt.hash(registerDto.password, 10)

    // I create the new user record.
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    })

    // I immediately generate a JWT so the user is logged in after registration.
    const token = this.generateToken(user)

    return {
      message: "User registered successfully",
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
    // I find the user by their email.
    const user = await this.usersService.findByEmail(loginDto.email)

    if (!user) {
      throw new UnauthorizedException("Invalid credentials")
    }

    // I verify if the provided password matches the stored hash.
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials")
    }

    // I sign the JWT with the user's basic info.
    const token = this.generateToken(user)

    return {
      message: "Logged in successfully",
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
    // I define the payload with the essential data.
    const payload = { sub: user.id, email: user.email, role: user.role }
    return this.jwtService.sign(payload)
  }
}

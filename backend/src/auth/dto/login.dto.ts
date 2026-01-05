import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class LoginDto {
  @ApiProperty({ example: "juan@example.com", description: "Correo electrónico" })
  @IsNotEmpty({ message: "El email es requerido" })
  @IsEmail({}, { message: "Debe ser un email válido" })
  email: string

  @ApiProperty({ example: "password123", description: "Contraseña" })
  @IsNotEmpty({ message: "La contraseña es requerida" })
  @IsString()
  password: string
}

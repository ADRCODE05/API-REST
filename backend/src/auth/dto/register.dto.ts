import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator"

export class RegisterDto {
  @ApiProperty({ example: "Juan Pérez", description: "Nombre completo del usuario" })
  @IsNotEmpty({ message: "El nombre es requerido" })
  @IsString()
  name: string

  @ApiProperty({ example: "juan@example.com", description: "Correo electrónico" })
  @IsNotEmpty({ message: "El email es requerido" })
  @IsEmail({}, { message: "Debe ser un email válido" })
  email: string

  @ApiProperty({ example: "password123", description: "Contraseña (mínimo 6 caracteres)" })
  @IsNotEmpty({ message: "La contraseña es requerida" })
  @IsString()
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  password: string
}

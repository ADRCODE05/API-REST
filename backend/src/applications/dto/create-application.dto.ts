import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsUUID } from "class-validator"

export class CreateApplicationDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000", description: "ID de la vacante" })
  @IsNotEmpty({ message: "El ID de la vacante es requerido" })
  @IsUUID("4", { message: "El ID de la vacante debe ser un UUID válido" })
  vacancyId: string
}

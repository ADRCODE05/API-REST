import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsArray, IsEnum, IsInt, Min, IsOptional } from "class-validator"
import { Modality } from "../entities/vacancy.entity"

export class CreateVacancyDto {
  @ApiProperty({ example: "Desarrollador Full Stack", description: "Título de la vacante" })
  @IsNotEmpty({ message: "El título es requerido" })
  @IsString()
  title: string

  @ApiProperty({
    example: "Buscamos un desarrollador full stack con experiencia en React y Node.js",
    description: "Descripción detallada de la vacante",
  })
  @IsNotEmpty({ message: "La descripción es requerida" })
  @IsString()
  description: string

  @ApiProperty({ example: ["JavaScript", "React", "Node.js"], description: "Tecnologías requeridas" })
  @IsNotEmpty({ message: "Las tecnologías son requeridas" })
  @IsArray()
  @IsString({ each: true })
  technologies: string[]

  @ApiProperty({ example: "Semi-Senior", description: "Nivel de seniority requerido" })
  @IsNotEmpty({ message: "El seniority es requerido" })
  @IsString()
  seniority: string

  @ApiProperty({
    example: "Trabajo en equipo, comunicación efectiva",
    description: "Soft skills requeridas",
    required: false,
  })
  @IsOptional()
  @IsString()
  softSkills?: string

  @ApiProperty({ example: "Medellín", description: "Ubicación de la vacante" })
  @IsNotEmpty({ message: "La ubicación es requerida" })
  @IsString()
  location: string

  @ApiProperty({ example: "remoto", enum: Modality, description: "Modalidad de trabajo" })
  @IsNotEmpty({ message: "La modalidad es requerida" })
  @IsEnum(Modality, { message: "La modalidad debe ser: remoto, híbrido o presencial" })
  modality: Modality

  @ApiProperty({ example: "$3.000.000 - $5.000.000", description: "Rango salarial" })
  @IsNotEmpty({ message: "El rango salarial es requerido" })
  @IsString()
  salaryRange: string

  @ApiProperty({ example: "Riwi Tech", description: "Nombre de la empresa" })
  @IsNotEmpty({ message: "La empresa es requerida" })
  @IsString()
  company: string

  @ApiProperty({ example: 10, description: "Cupo máximo de aspirantes" })
  @IsNotEmpty({ message: "El cupo máximo es requerido" })
  @IsInt({ message: "El cupo máximo debe ser un número entero" })
  @Min(1, { message: "El cupo máximo debe ser al menos 1" })
  maxApplicants: number
}

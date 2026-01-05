import { Controller, Get, Post, Patch, Param, UseGuards, Query } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiBearerAuth } from "@nestjs/swagger"
import type { VacanciesService } from "./vacancies.service"
import type { CreateVacancyDto } from "./dto/create-vacancy.dto"
import type { UpdateVacancyDto } from "./dto/update-vacancy.dto"
import { Roles } from "../common/decorators/roles.decorator"
import { Role } from "../common/enums/role.enum"
import { RolesGuard } from "../common/guards/roles.guard"
import { ApiKeyGuard } from "../common/guards/api-key.guard"

@ApiTags("Vacantes")
@ApiSecurity("API_KEY")
@ApiBearerAuth("JWT")
@UseGuards(ApiKeyGuard, RolesGuard)
@Controller("vacancies")
export class VacanciesController {
  constructor(private readonly vacanciesService: VacanciesService) {}

  @Post()
  @Roles(Role.ADMINISTRADOR, Role.GESTOR)
  @ApiOperation({ summary: "Crear una nueva vacante (Solo Gestor y Administrador)" })
  @ApiResponse({ status: 201, description: "Vacante creada exitosamente" })
  @ApiResponse({ status: 403, description: "No tienes permisos para crear vacantes" })
  create(createVacancyDto: CreateVacancyDto) {
    return this.vacanciesService.create(createVacancyDto)
  }

  @Get()
  @ApiOperation({ summary: "Listar todas las vacantes activas" })
  @ApiResponse({ status: 200, description: "Lista de vacantes obtenida exitosamente" })
  findAll(@Query("includeInactive") includeInactive?: string) {
    return this.vacanciesService.findAll(includeInactive === "true")
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener detalle de una vacante" })
  @ApiResponse({ status: 200, description: "Vacante obtenida exitosamente" })
  @ApiResponse({ status: 404, description: "Vacante no encontrada" })
  findOne(@Param("id") id: string) {
    return this.vacanciesService.findOne(id)
  }

  @Patch(":id")
  @Roles(Role.ADMINISTRADOR, Role.GESTOR)
  @ApiOperation({ summary: "Actualizar una vacante (Solo Gestor y Administrador)" })
  @ApiResponse({ status: 200, description: "Vacante actualizada exitosamente" })
  @ApiResponse({ status: 403, description: "No tienes permisos" })
  @ApiResponse({ status: 404, description: "Vacante no encontrada" })
  update(@Param("id") id: string, updateVacancyDto: UpdateVacancyDto) {
    return this.vacanciesService.update(id, updateVacancyDto)
  }

  @Patch(":id/toggle-active")
  @Roles(Role.ADMINISTRADOR, Role.GESTOR)
  @ApiOperation({ summary: "Activar o desactivar una vacante (Solo Gestor y Administrador)" })
  @ApiResponse({ status: 200, description: "Estado de vacante actualizado" })
  @ApiResponse({ status: 403, description: "No tienes permisos" })
  toggleActive(@Param("id") id: string) {
    return this.vacanciesService.toggleActive(id)
  }
}

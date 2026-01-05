import { Controller, Get, Post, Delete, Param, UseGuards, Body } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiBearerAuth } from "@nestjs/swagger"
import { ApplicationsService } from "./applications.service"
import { CreateApplicationDto } from "./dto/create-application.dto"
import { Roles } from "../common/decorators/roles.decorator"
import { Role } from "../common/enums/role.enum"
import { RolesGuard } from "../common/guards/roles.guard"
import { ApiKeyGuard } from "../common/guards/api-key.guard"
import { CurrentUser } from "../common/decorators/current-user.decorator"
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard"

@ApiTags("Postulaciones")
@ApiSecurity("API_KEY")
@ApiBearerAuth("JWT")
@UseGuards(ApiKeyGuard, JwtAuthGuard, RolesGuard)
@Controller("applications")
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) { }

  @Post()
  @Roles(Role.CODER)
  @ApiOperation({ summary: "Postularse a una vacante (Solo Coders)" })
  @ApiResponse({ status: 201, description: "Postulación realizada exitosamente" })
  @ApiResponse({ status: 400, description: "Regla de negocio violada" })
  @ApiResponse({ status: 404, description: "Vacante no encontrada" })
  @ApiResponse({ status: 409, description: "Ya te has postulado a esta vacante" })
  create(@Body() createApplicationDto: CreateApplicationDto, @CurrentUser() user: any) {
    return this.applicationsService.create(user.id, createApplicationDto)
  }

  @Get()
  @Roles(Role.ADMINISTRADOR, Role.GESTOR)
  @ApiOperation({ summary: "Listar todas las postulaciones (Solo Gestor y Administrador)" })
  @ApiResponse({ status: 200, description: "Lista de postulaciones" })
  findAll() {
    return this.applicationsService.findAll()
  }

  @Get("my-applications")
  @Roles(Role.CODER)
  @ApiOperation({ summary: "Ver mis postulaciones (Solo Coders)" })
  @ApiResponse({ status: 200, description: "Lista de mis postulaciones" })
  findMyApplications(@CurrentUser() user: any) {
    return this.applicationsService.findByUser(user.id)
  }

  @Get("vacancy/:vacancyId")
  @Roles(Role.ADMINISTRADOR, Role.GESTOR)
  @ApiOperation({ summary: "Ver postulaciones de una vacante específica (Solo Gestor y Administrador)" })
  @ApiResponse({ status: 200, description: "Lista de postulaciones de la vacante" })
  findByVacancy(@Param("vacancyId") vacancyId: string) {
    return this.applicationsService.findByVacancy(vacancyId)
  }

  @Delete(":id")
  @Roles(Role.CODER)
  @ApiOperation({ summary: "Cancelar una postulación (Solo Coders)" })
  @ApiResponse({ status: 200, description: "Postulación cancelada exitosamente" })
  @ApiResponse({ status: 404, description: "Postulación no encontrada" })
  remove(@Param("id") id: string, @CurrentUser() user: any) {
    return this.applicationsService.remove(id, user.id)
  }
}

import { Injectable, BadRequestException, NotFoundException, ConflictException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Application } from "./entities/application.entity"
import type { VacanciesService } from "../vacancies/vacancies.service"
import type { CreateApplicationDto } from "./dto/create-application.dto"

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    private vacanciesService: VacanciesService,
  ) {}

  async create(userId: string, createApplicationDto: CreateApplicationDto) {
    const { vacancyId } = createApplicationDto

    // Validación 1: Verificar que la vacante existe
    const vacancy = await this.vacanciesService.findOne(vacancyId)

    if (!vacancy.data) {
      throw new NotFoundException("La vacante no existe")
    }

    // Validación 2: Verificar que la vacante esté activa
    if (!vacancy.data.isActive) {
      throw new BadRequestException("No puedes postularte a una vacante inactiva")
    }

    // Validación 3: Un coder no puede postularse dos veces a la misma vacante
    const existingApplication = await this.applicationsRepository.findOne({
      where: { userId, vacancyId },
    })

    if (existingApplication) {
      throw new ConflictException("Ya te has postulado a esta vacante anteriormente")
    }

    // Validación 4: No se permiten postulaciones cuando el cupo está completo
    const hasSlots = await this.vacanciesService.hasAvailableSlots(vacancyId)

    if (!hasSlots) {
      throw new BadRequestException("Esta vacante ya no tiene cupos disponibles")
    }

    // Validación 5: Un coder no puede postularse a más de 3 vacantes activas
    const activeApplicationsCount = await this.applicationsRepository.count({
      where: {
        userId,
        vacancy: { isActive: true },
      },
      relations: ["vacancy"],
    })

    if (activeApplicationsCount >= 3) {
      throw new BadRequestException(
        "No puedes postularte a más de 3 vacantes activas. Cancela alguna postulación anterior o espera a que se cierre una vacante.",
      )
    }

    // Crear la postulación
    const application = this.applicationsRepository.create({
      userId,
      vacancyId,
    })

    const savedApplication = await this.applicationsRepository.save(application)

    // Obtener la aplicación completa con relaciones
    const fullApplication = await this.applicationsRepository.findOne({
      where: { id: savedApplication.id },
      relations: ["user", "vacancy"],
    })

    return {
      message: "Postulación realizada exitosamente",
      data: fullApplication,
    }
  }

  async findAll() {
    const applications = await this.applicationsRepository.find({
      relations: ["user", "vacancy", "vacancy.technologies"],
      order: { appliedAt: "DESC" },
    })

    return {
      data: applications,
    }
  }

  async findByUser(userId: string) {
    const applications = await this.applicationsRepository.find({
      where: { userId },
      relations: ["vacancy", "vacancy.technologies"],
      order: { appliedAt: "DESC" },
    })

    return {
      data: applications,
    }
  }

  async findByVacancy(vacancyId: string) {
    const applications = await this.applicationsRepository.find({
      where: { vacancyId },
      relations: ["user"],
      order: { appliedAt: "DESC" },
    })

    return {
      data: applications,
    }
  }

  async remove(id: string, userId: string) {
    const application = await this.applicationsRepository.findOne({
      where: { id },
    })

    if (!application) {
      throw new NotFoundException("Postulación no encontrada")
    }

    // Solo el usuario que creó la postulación puede eliminarla
    if (application.userId !== userId) {
      throw new BadRequestException("No puedes eliminar una postulación que no te pertenece")
    }

    await this.applicationsRepository.remove(application)

    return {
      message: "Postulación eliminada exitosamente",
    }
  }
}

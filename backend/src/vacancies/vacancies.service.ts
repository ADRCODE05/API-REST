import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Vacancy } from "./entities/vacancy.entity"
import type { TechnologiesService } from "../technologies/technologies.service"
import type { CreateVacancyDto } from "./dto/create-vacancy.dto"
import type { UpdateVacancyDto } from "./dto/update-vacancy.dto"

@Injectable()
export class VacanciesService {
  constructor(
    @InjectRepository(Vacancy)
    private vacanciesRepository: Repository<Vacancy>,
    private technologiesService: TechnologiesService,
  ) {}

  async create(createVacancyDto: CreateVacancyDto) {
    // Validar que tenga cupo máximo
    if (!createVacancyDto.maxApplicants || createVacancyDto.maxApplicants < 1) {
      throw new BadRequestException("Debe especificar un cupo máximo válido")
    }

    // Buscar o crear las tecnologías
    const technologies = await this.technologiesService.findOrCreate(createVacancyDto.technologies)

    // Crear la vacante
    const vacancy = this.vacanciesRepository.create({
      ...createVacancyDto,
      technologies,
    })

    const savedVacancy = await this.vacanciesRepository.save(vacancy)

    return {
      message: "Vacante creada exitosamente",
      data: savedVacancy,
    }
  }

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true }

    const vacancies = await this.vacanciesRepository.find({
      where,
      relations: ["technologies", "applications"],
      order: { createdAt: "DESC" },
    })

    // Agregar información de cupos disponibles
    const vacanciesWithAvailability = vacancies.map((vacancy) => ({
      ...vacancy,
      currentApplicants: vacancy.applications?.length || 0,
      availableSlots: vacancy.maxApplicants - (vacancy.applications?.length || 0),
      hasAvailableSlots: vacancy.maxApplicants > (vacancy.applications?.length || 0),
    }))

    return {
      data: vacanciesWithAvailability,
    }
  }

  async findOne(id: string) {
    const vacancy = await this.vacanciesRepository.findOne({
      where: { id },
      relations: ["technologies", "applications", "applications.user"],
    })

    if (!vacancy) {
      throw new NotFoundException("Vacante no encontrada")
    }

    return {
      data: {
        ...vacancy,
        currentApplicants: vacancy.applications?.length || 0,
        availableSlots: vacancy.maxApplicants - (vacancy.applications?.length || 0),
        hasAvailableSlots: vacancy.maxApplicants > (vacancy.applications?.length || 0),
      },
    }
  }

  async update(id: string, updateVacancyDto: UpdateVacancyDto) {
    const vacancy = await this.vacanciesRepository.findOne({ where: { id } })

    if (!vacancy) {
      throw new NotFoundException("Vacante no encontrada")
    }

    // Si se actualizan las tecnologías, buscar o crear
    if (updateVacancyDto.technologies) {
      const technologies = await this.technologiesService.findOrCreate(updateVacancyDto.technologies)
      vacancy.technologies = technologies
    }

    // Actualizar los demás campos
    Object.assign(vacancy, updateVacancyDto)

    const updatedVacancy = await this.vacanciesRepository.save(vacancy)

    return {
      message: "Vacante actualizada exitosamente",
      data: updatedVacancy,
    }
  }

  async toggleActive(id: string) {
    const vacancy = await this.vacanciesRepository.findOne({ where: { id } })

    if (!vacancy) {
      throw new NotFoundException("Vacante no encontrada")
    }

    vacancy.isActive = !vacancy.isActive

    await this.vacanciesRepository.save(vacancy)

    return {
      message: `Vacante ${vacancy.isActive ? "activada" : "desactivada"} exitosamente`,
      data: vacancy,
    }
  }

  async getApplicationsCount(vacancyId: string): Promise<number> {
    const vacancy = await this.vacanciesRepository.findOne({
      where: { id: vacancyId },
      relations: ["applications"],
    })

    return vacancy?.applications?.length || 0
  }

  async hasAvailableSlots(vacancyId: string): Promise<boolean> {
    const vacancy = await this.vacanciesRepository.findOne({
      where: { id: vacancyId },
      relations: ["applications"],
    })

    if (!vacancy) {
      return false
    }

    const currentApplicants = vacancy.applications?.length || 0
    return currentApplicants < vacancy.maxApplicants
  }
}

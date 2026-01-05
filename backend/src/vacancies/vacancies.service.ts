import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Vacancy } from "./entities/vacancy.entity"
import { TechnologiesService } from "../technologies/technologies.service"
import { CreateVacancyDto } from "./dto/create-vacancy.dto"
import { UpdateVacancyDto } from "./dto/update-vacancy.dto"

@Injectable()
export class VacanciesService {
  constructor(
    @InjectRepository(Vacancy)
    private vacanciesRepository: Repository<Vacancy>,
    private technologiesService: TechnologiesService,
  ) { }

  async create(createVacancyDto: CreateVacancyDto) {
    // I validate that the vacancy has a valid maximum number of applicants.
    // This is important to ensure we don't have infinite slots.
    if (!createVacancyDto.maxApplicants || createVacancyDto.maxApplicants < 1) {
      throw new BadRequestException("You must specify a valid maximum number of applicants")
    }

    // I use the technologies service to handle the many-to-many relationship.
    // If a technology doesn't exist, I create it on the fly.
    const technologies = await this.technologiesService.findOrCreate(createVacancyDto.technologies)

    // I create the vacancy object using the repository's factory method.
    const vacancy = this.vacanciesRepository.create({
      ...createVacancyDto,
      technologies,
    })

    // I save it to the database.
    const savedVacancy = await this.vacanciesRepository.save(vacancy)

    return {
      message: "Vacancy created successfully",
      data: savedVacancy,
    }
  }

  async findAll(includeInactive = false) {
    // I determine if I should show only active vacancies or all of them.
    const where = includeInactive ? {} : { isActive: true }

    // I fetch the vacancies with their related technologies and applications.
    const vacancies = await this.vacanciesRepository.find({
      where,
      relations: ["technologies", "applications"],
      order: { createdAt: "DESC" },
    })

    // I manually calculate availability info to show it clearly in the frontend.
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
    // I look for a specific vacancy and include all necessary relations for the detail view.
    const vacancy = await this.vacanciesRepository.findOne({
      where: { id },
      relations: ["technologies", "applications", "applications.user"],
    })

    if (!vacancy) {
      throw new NotFoundException("Vacancy not found")
    }

    // I return the calculated availability metrics here as well.
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
      throw new NotFoundException("Vacancy not found")
    }

    // If I'm updating technologies, I use the helper service again.
    if (updateVacancyDto.technologies) {
      const technologies = await this.technologiesService.findOrCreate(updateVacancyDto.technologies)
      vacancy.technologies = technologies
    }

    // I merge the new values into the existing entity.
    Object.assign(vacancy, updateVacancyDto)

    const updatedVacancy = await this.vacanciesRepository.save(vacancy)

    return {
      message: "Vacancy updated successfully",
      data: updatedVacancy,
    }
  }

  async toggleActive(id: string) {
    const vacancy = await this.vacanciesRepository.findOne({ where: { id } })

    if (!vacancy) {
      throw new NotFoundException("Vacancy not found")
    }

    // I simply flip the boolean flag.
    vacancy.isActive = !vacancy.isActive

    await this.vacanciesRepository.save(vacancy)

    return {
      message: `Vacancy ${vacancy.isActive ? "activated" : "deactivated"} successfully`,
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

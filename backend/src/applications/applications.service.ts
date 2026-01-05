import { Injectable, BadRequestException, NotFoundException, ConflictException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Application } from "./entities/application.entity"
import { VacanciesService } from "../vacancies/vacancies.service"
import { CreateApplicationDto } from "./dto/create-application.dto"

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    private vacanciesService: VacanciesService,
  ) { }

  async create(userId: string, createApplicationDto: CreateApplicationDto) {
    const { vacancyId } = createApplicationDto

    // Validation 1: I verify that the vacancy exists.
    const vacancy = await this.vacanciesService.findOne(vacancyId)

    if (!vacancy.data) {
      throw new NotFoundException("The vacancy does not exist")
    }

    // Validation 2: I check that the vacancy is active.
    // We shouldn't allow applications to closed vacancies.
    if (!vacancy.data.isActive) {
      throw new BadRequestException("You cannot apply to an inactive vacancy")
    }

    // Validation 3: I ensure a coder cannot apply twice to the same vacancy.
    // This maintains database integrity.
    const existingApplication = await this.applicationsRepository.findOne({
      where: { userId, vacancyId },
    })

    if (existingApplication) {
      throw new ConflictException("You have already applied to this vacancy")
    }

    // Validation 4: I check if there are still available slots.
    const hasSlots = await this.vacanciesService.hasAvailableSlots(vacancyId)

    if (!hasSlots) {
      throw new BadRequestException("This vacancy is already full")
    }

    // Validation 5: I limit users to a maximum of 3 active applications.
    // This encourages users to be selective.
    const activeApplicationsCount = await this.applicationsRepository.count({
      where: {
        userId,
        vacancy: { isActive: true },
      },
      relations: ["vacancy"],
    })

    if (activeApplicationsCount >= 3) {
      throw new BadRequestException(
        "You cannot apply to more than 3 active vacancies. Please cancel a previous application or wait for one to close.",
      )
    }

    // I create the application record.
    const application = this.applicationsRepository.create({
      userId,
      vacancyId,
    })

    const savedApplication = await this.applicationsRepository.save(application)

    // I fetch the full object to return it with its relations (user and vacancy info).
    const fullApplication = await this.applicationsRepository.findOne({
      where: { id: savedApplication.id },
      relations: ["user", "vacancy"],
    })

    return {
      message: "Application submitted successfully",
      data: fullApplication,
    }
  }

  async findAll() {
    // I fetch all applications for the admin view.
    const applications = await this.applicationsRepository.find({
      relations: ["user", "vacancy", "vacancy.technologies"],
      order: { appliedAt: "DESC" },
    })

    return {
      data: applications,
    }
  }

  async findByUser(userId: string) {
    // I filter applications by user ID.
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
    // I filter applications by vacancy ID.
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
      throw new NotFoundException("Application not found")
    }

    // Security check: I ensure only the owner can delete their application.
    if (application.userId !== userId) {
      throw new BadRequestException("You cannot delete an application that doesn't belong to you")
    }

    await this.applicationsRepository.remove(application)

    return {
      message: "Application deleted successfully",
    }
  }
}

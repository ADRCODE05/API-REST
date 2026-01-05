import { describe, it, beforeEach, expect, jest } from "@jest/globals"
import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { VacanciesService } from "./vacancies.service"
import { Vacancy, Modality } from "./entities/vacancy.entity"
import { TechnologiesService } from "../technologies/technologies.service"
import { NotFoundException, BadRequestException } from "@nestjs/common"

describe("VacanciesService", () => {
  let service: VacanciesService
  let mockVacanciesRepository: any
  let mockTechnologiesService: any

  const mockVacancy = {
    id: "1",
    title: "Full Stack Developer",
    description: "Looking for a specialized developer",
    technologies: [{ id: "1", name: "javascript" }],
    seniority: "Semi-Senior",
    softSkills: "Teamwork",
    location: "Medellín",
    modality: Modality.REMOTE,
    salaryRange: "$3,000,000 - $5,000,000",
    company: "Riwi",
    maxApplicants: 10,
    isActive: true,
    applications: [],
    createdAt: new Date(),
  }

  beforeEach(async () => {
    mockVacanciesRepository = {
      create: (jest.fn() as any).mockReturnValue(mockVacancy),
      save: (jest.fn() as any).mockResolvedValue(mockVacancy),
      find: (jest.fn() as any).mockResolvedValue([mockVacancy]),
      findOne: (jest.fn() as any).mockResolvedValue(mockVacancy),
    }

    mockTechnologiesService = {
      findOrCreate: (jest.fn() as any).mockResolvedValue([{ id: "1", name: "javascript" }]),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VacanciesService,
        {
          provide: getRepositoryToken(Vacancy),
          useValue: mockVacanciesRepository,
        },
        {
          provide: TechnologiesService,
          useValue: mockTechnologiesService,
        },
      ],
    }).compile()

    service = module.get<VacanciesService>(VacanciesService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("create", () => {
    it("should create a vacancy successfully", async () => {
      const createVacancyDto = {
        title: "Full Stack Developer",
        description: "Looking for a specialized developer",
        technologies: ["JavaScript", "React"],
        seniority: "Semi-Senior",
        softSkills: "Teamwork",
        location: "Medellín",
        modality: Modality.REMOTE,
        salaryRange: "$3,000,000 - $5,000,000",
        company: "Riwi",
        maxApplicants: 10,
      }

      const result = await service.create(createVacancyDto)

      expect(result.message).toBe("Vacancy created successfully")
      expect(result.data).toBeDefined()
      expect(mockTechnologiesService.findOrCreate).toHaveBeenCalledWith(createVacancyDto.technologies)
      expect(mockVacanciesRepository.save).toHaveBeenCalled()
    })

    it("should throw BadRequestException if max applicants is invalid", async () => {
      const createVacancyDto: any = {
        title: "Full Stack Developer",
        description: "Looking for a specialized developer",
        technologies: ["JavaScript"],
        seniority: "Semi-Senior",
        location: "Medellín",
        modality: Modality.REMOTE,
        salaryRange: "$3,000,000",
        company: "Riwi",
        maxApplicants: 0,
      }

      await expect(service.create(createVacancyDto)).rejects.toThrow(BadRequestException)
    })
  })

  describe("findAll", () => {
    it("should return all active vacancies", async () => {
      const result = await service.findAll(false)

      expect(result).toBeDefined()
      expect(result.length).toBeGreaterThan(0)
      expect(mockVacanciesRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        relations: ["technologies", "applications"],
        order: { createdAt: "DESC" },
      })
    })

    it("should include available slots information", async () => {
      const result = await service.findAll(false)

      expect(result[0].currentApplicants).toBeDefined()
      expect(result[0].availableSlots).toBeDefined()
      expect(result[0].hasAvailableSlots).toBeDefined()
    })
  })

  describe("findOne", () => {
    it("should return a vacancy by ID", async () => {
      const result = await service.findOne("1")

      expect(result).toBeDefined()
      expect(result.id).toBe("1")
      expect(mockVacanciesRepository.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
        relations: ["technologies", "applications", "applications.user"],
      })
    })

    it("should throw NotFoundException if vacancy does not exist", async () => {
      mockVacanciesRepository.findOne.mockResolvedValueOnce(null)

      await expect(service.findOne("999")).rejects.toThrow(NotFoundException)
    })
  })

  describe("hasAvailableSlots", () => {
    it("should return true if slots are available", async () => {
      const result = await service.hasAvailableSlots("1")

      expect(result).toBe(true)
    })

    it("should return false if no slots are available", async () => {
      const fullVacancy = {
        ...mockVacancy,
        maxApplicants: 2,
        applications: [{ id: "1" }, { id: "2" }],
      }
      mockVacanciesRepository.findOne.mockResolvedValueOnce(fullVacancy)

      const result = await service.hasAvailableSlots("1")

      expect(result).toBe(false)
    })
  })
})

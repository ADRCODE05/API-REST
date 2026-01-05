import { describe, it, beforeEach, expect, jest } from "@jest/globals"
import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { ApplicationsService } from "./applications.service"
import { Application } from "./entities/application.entity"
import { VacanciesService } from "../vacancies/vacancies.service"
import { BadRequestException, NotFoundException, ConflictException } from "@nestjs/common"

describe("ApplicationsService", () => {
  let service: ApplicationsService
  let mockApplicationsRepository: any
  let mockVacanciesService: any

  const mockVacancy = {
    id: "vacancy-1",
    title: "Full Stack Developer",
    isActive: true,
    maxApplicants: 10,
    applications: [],
  }

  const mockApplication = {
    id: "app-1",
    userId: "user-1",
    vacancyId: "vacancy-1",
    appliedAt: new Date(),
  }

  beforeEach(async () => {
    mockApplicationsRepository = {
      create: (jest.fn() as any).mockReturnValue(mockApplication),
      save: (jest.fn() as any).mockResolvedValue(mockApplication),
      find: (jest.fn() as any).mockResolvedValue([mockApplication]),
      findOne: (jest.fn() as any).mockResolvedValue(null),
      count: (jest.fn() as any).mockResolvedValue(0),
      remove: (jest.fn() as any).mockResolvedValue(mockApplication),
    }

    mockVacanciesService = {
      findOne: (jest.fn() as any).mockResolvedValue(mockVacancy),
      hasAvailableSlots: (jest.fn() as any).mockResolvedValue(true),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockApplicationsRepository,
        },
        {
          provide: VacanciesService,
          useValue: mockVacanciesService,
        },
      ],
    }).compile()

    service = module.get<ApplicationsService>(ApplicationsService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("create", () => {
    it("should create an application successfully", async () => {
      const createApplicationDto = {
        vacancyId: "vacancy-1",
      }

      mockApplicationsRepository.findOne.mockResolvedValueOnce(null)

      const result = await service.create("user-1", createApplicationDto)

      expect(result.message).toBe("Application submitted successfully")
      expect(result.data).toBeDefined()
      expect(mockApplicationsRepository.save).toHaveBeenCalled()
    })

    it("should throw NotFoundException if vacancy does not exist", async () => {
      mockVacanciesService.findOne.mockResolvedValueOnce(null)

      const createApplicationDto = {
        vacancyId: "vacancy-999",
      }

      await expect(service.create("user-1", createApplicationDto)).rejects.toThrow(NotFoundException)
    })

    it("should throw BadRequestException if vacancy is inactive", async () => {
      mockVacanciesService.findOne.mockResolvedValueOnce({ ...mockVacancy, isActive: false })

      const createApplicationDto = {
        vacancyId: "vacancy-1",
      }

      await expect(service.create("user-1", createApplicationDto)).rejects.toThrow(BadRequestException)
    })

    it("should throw ConflictException if application already exists", async () => {
      mockApplicationsRepository.findOne.mockResolvedValueOnce(mockApplication)

      const createApplicationDto = {
        vacancyId: "vacancy-1",
      }

      await expect(service.create("user-1", createApplicationDto)).rejects.toThrow(ConflictException)
    })

    it("should throw BadRequestException if no slots are available", async () => {
      mockVacanciesService.hasAvailableSlots.mockResolvedValueOnce(false)

      const createApplicationDto = {
        vacancyId: "vacancy-1",
      }

      await expect(service.create("user-1", createApplicationDto)).rejects.toThrow(BadRequestException)
    })

    it("should throw BadRequestException if user has 3 active applications", async () => {
      mockApplicationsRepository.count.mockResolvedValueOnce(3)

      const createApplicationDto = {
        vacancyId: "vacancy-1",
      }

      await expect(service.create("user-1", createApplicationDto)).rejects.toThrow(BadRequestException)
    })
  })

  describe("findByUser", () => {
    it("should return a user's applications", async () => {
      const result = await service.findByUser("user-1")

      expect(result).toBeDefined()
      expect(mockApplicationsRepository.find).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        relations: ["vacancy", "vacancy.technologies"],
        order: { appliedAt: "DESC" },
      })
    })
  })

  describe("remove", () => {
    it("should delete an application successfully", async () => {
      mockApplicationsRepository.findOne.mockResolvedValueOnce(mockApplication)

      const result = await service.remove("app-1", "user-1")

      expect(result.message).toBe("Application deleted successfully")
      expect(mockApplicationsRepository.remove).toHaveBeenCalled()
    })

    it("should throw NotFoundException if application does not exist", async () => {
      mockApplicationsRepository.findOne.mockResolvedValueOnce(null)

      await expect(service.remove("app-999", "user-1")).rejects.toThrow(NotFoundException)
    })

    it("should throw BadRequestException if user is not the owner", async () => {
      mockApplicationsRepository.findOne.mockResolvedValueOnce(mockApplication)

      await expect(service.remove("app-1", "user-2")).rejects.toThrow(BadRequestException)
    })
  })
})

import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { ApplicationsService } from "./applications.service"
import { Application } from "./entities/application.entity"
import { VacanciesService } from "../vacancies/vacancies.service"
import { BadRequestException, NotFoundException, ConflictException } from "@nestjs/common"
import { jest } from "@jest/globals"

describe("ApplicationsService", () => {
  let service: ApplicationsService
  let mockApplicationsRepository: any
  let mockVacanciesService: any

  const mockVacancy = {
    id: "vacancy-1",
    title: "Desarrollador Full Stack",
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
      create: jest.fn().mockReturnValue(mockApplication),
      save: jest.fn().mockResolvedValue(mockApplication),
      find: jest.fn().mockResolvedValue([mockApplication]),
      findOne: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
      remove: jest.fn().mockResolvedValue(mockApplication),
    }

    mockVacanciesService = {
      findOne: jest.fn().mockResolvedValue({ data: mockVacancy }),
      hasAvailableSlots: jest.fn().mockResolvedValue(true),
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

  it("debe estar definido", () => {
    expect(service).toBeDefined()
  })

  describe("create", () => {
    it("debe crear una postulación exitosamente", async () => {
      const createApplicationDto = {
        vacancyId: "vacancy-1",
      }

      mockApplicationsRepository.findOne.mockResolvedValueOnce({ ...mockApplication, user: {}, vacancy: {} })

      const result = await service.create("user-1", createApplicationDto)

      expect(result.message).toBe("Postulación realizada exitosamente")
      expect(result.data).toBeDefined()
      expect(mockApplicationsRepository.save).toHaveBeenCalled()
    })

    it("debe lanzar NotFoundException si la vacante no existe", async () => {
      mockVacanciesService.findOne.mockResolvedValueOnce({ data: null })

      const createApplicationDto = {
        vacancyId: "vacancy-999",
      }

      await expect(service.create("user-1", createApplicationDto)).rejects.toThrow(NotFoundException)
    })

    it("debe lanzar BadRequestException si la vacante está inactiva", async () => {
      mockVacanciesService.findOne.mockResolvedValueOnce({
        data: { ...mockVacancy, isActive: false },
      })

      const createApplicationDto = {
        vacancyId: "vacancy-1",
      }

      await expect(service.create("user-1", createApplicationDto)).rejects.toThrow(BadRequestException)
    })

    it("debe lanzar ConflictException si ya existe una postulación", async () => {
      mockApplicationsRepository.findOne.mockResolvedValueOnce(mockApplication)

      const createApplicationDto = {
        vacancyId: "vacancy-1",
      }

      await expect(service.create("user-1", createApplicationDto)).rejects.toThrow(ConflictException)
    })

    it("debe lanzar BadRequestException si no hay cupos disponibles", async () => {
      mockVacanciesService.hasAvailableSlots.mockResolvedValueOnce(false)

      const createApplicationDto = {
        vacancyId: "vacancy-1",
      }

      await expect(service.create("user-1", createApplicationDto)).rejects.toThrow(BadRequestException)
    })

    it("debe lanzar BadRequestException si el usuario tiene 3 postulaciones activas", async () => {
      mockApplicationsRepository.count.mockResolvedValueOnce(3)

      const createApplicationDto = {
        vacancyId: "vacancy-1",
      }

      await expect(service.create("user-1", createApplicationDto)).rejects.toThrow(BadRequestException)
    })
  })

  describe("findByUser", () => {
    it("debe retornar las postulaciones de un usuario", async () => {
      const result = await service.findByUser("user-1")

      expect(result.data).toBeDefined()
      expect(mockApplicationsRepository.find).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        relations: ["vacancy", "vacancy.technologies"],
        order: { appliedAt: "DESC" },
      })
    })
  })

  describe("remove", () => {
    it("debe eliminar una postulación exitosamente", async () => {
      mockApplicationsRepository.findOne.mockResolvedValueOnce(mockApplication)

      const result = await service.remove("app-1", "user-1")

      expect(result.message).toBe("Postulación eliminada exitosamente")
      expect(mockApplicationsRepository.remove).toHaveBeenCalled()
    })

    it("debe lanzar NotFoundException si la postulación no existe", async () => {
      mockApplicationsRepository.findOne.mockResolvedValueOnce(null)

      await expect(service.remove("app-999", "user-1")).rejects.toThrow(NotFoundException)
    })

    it("debe lanzar BadRequestException si el usuario no es el dueño", async () => {
      mockApplicationsRepository.findOne.mockResolvedValueOnce(mockApplication)

      await expect(service.remove("app-1", "user-2")).rejects.toThrow(BadRequestException)
    })
  })
})

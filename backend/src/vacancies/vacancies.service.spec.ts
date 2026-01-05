import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { VacanciesService } from "./vacancies.service"
import { Vacancy, Modality } from "./entities/vacancy.entity"
import { TechnologiesService } from "../technologies/technologies.service"
import { NotFoundException, BadRequestException } from "@nestjs/common"
import { jest } from "@jest/globals"

describe("VacanciesService", () => {
  let service: VacanciesService
  let mockVacanciesRepository: any
  let mockTechnologiesService: any

  const mockVacancy = {
    id: "1",
    title: "Desarrollador Full Stack",
    description: "Buscamos desarrollador",
    technologies: [{ id: "1", name: "javascript" }],
    seniority: "Semi-Senior",
    softSkills: "Trabajo en equipo",
    location: "Medellín",
    modality: Modality.REMOTO,
    salaryRange: "$3.000.000 - $5.000.000",
    company: "Riwi",
    maxApplicants: 10,
    isActive: true,
    applications: [],
    createdAt: new Date(),
  }

  beforeEach(async () => {
    mockVacanciesRepository = {
      create: jest.fn().mockReturnValue(mockVacancy),
      save: jest.fn().mockResolvedValue(mockVacancy),
      find: jest.fn().mockResolvedValue([mockVacancy]),
      findOne: jest.fn().mockResolvedValue(mockVacancy),
    }

    mockTechnologiesService = {
      findOrCreate: jest.fn().mockResolvedValue([{ id: "1", name: "javascript" }]),
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

  it("debe estar definido", () => {
    expect(service).toBeDefined()
  })

  describe("create", () => {
    it("debe crear una vacante exitosamente", async () => {
      const createVacancyDto = {
        title: "Desarrollador Full Stack",
        description: "Buscamos desarrollador",
        technologies: ["JavaScript", "React"],
        seniority: "Semi-Senior",
        softSkills: "Trabajo en equipo",
        location: "Medellín",
        modality: Modality.REMOTO,
        salaryRange: "$3.000.000 - $5.000.000",
        company: "Riwi",
        maxApplicants: 10,
      }

      const result = await service.create(createVacancyDto)

      expect(result.message).toBe("Vacante creada exitosamente")
      expect(result.data).toBeDefined()
      expect(mockTechnologiesService.findOrCreate).toHaveBeenCalledWith(createVacancyDto.technologies)
      expect(mockVacanciesRepository.save).toHaveBeenCalled()
    })

    it("debe lanzar BadRequestException si no hay cupo máximo", async () => {
      const createVacancyDto: any = {
        title: "Desarrollador Full Stack",
        description: "Buscamos desarrollador",
        technologies: ["JavaScript"],
        seniority: "Semi-Senior",
        location: "Medellín",
        modality: Modality.REMOTO,
        salaryRange: "$3.000.000",
        company: "Riwi",
        maxApplicants: 0,
      }

      await expect(service.create(createVacancyDto)).rejects.toThrow(BadRequestException)
    })
  })

  describe("findAll", () => {
    it("debe retornar todas las vacantes activas", async () => {
      const result = await service.findAll(false)

      expect(result.data).toBeDefined()
      expect(result.data.length).toBeGreaterThan(0)
      expect(mockVacanciesRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        relations: ["technologies", "applications"],
        order: { createdAt: "DESC" },
      })
    })

    it("debe incluir información de cupos disponibles", async () => {
      const result = await service.findAll(false)

      expect(result.data[0].currentApplicants).toBeDefined()
      expect(result.data[0].availableSlots).toBeDefined()
      expect(result.data[0].hasAvailableSlots).toBeDefined()
    })
  })

  describe("findOne", () => {
    it("debe retornar una vacante por ID", async () => {
      const result = await service.findOne("1")

      expect(result.data).toBeDefined()
      expect(result.data.id).toBe("1")
      expect(mockVacanciesRepository.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
        relations: ["technologies", "applications", "applications.user"],
      })
    })

    it("debe lanzar NotFoundException si no existe la vacante", async () => {
      mockVacanciesRepository.findOne.mockResolvedValueOnce(null)

      await expect(service.findOne("999")).rejects.toThrow(NotFoundException)
    })
  })

  describe("hasAvailableSlots", () => {
    it("debe retornar true si hay cupos disponibles", async () => {
      const result = await service.hasAvailableSlots("1")

      expect(result).toBe(true)
    })

    it("debe retornar false si no hay cupos disponibles", async () => {
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

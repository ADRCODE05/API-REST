import { describe, it, beforeEach, expect, jest } from "@jest/globals"
import { Test, type TestingModule } from "@nestjs/testing"
import { VacanciesController } from "./vacancies.controller"
import { VacanciesService } from "./vacancies.service"
import { CreateVacancyDto } from "./dto/create-vacancy.dto"
import { UpdateVacancyDto } from "./dto/update-vacancy.dto"

describe("VacanciesController", () => {
    let controller: VacanciesController
    let mockVacanciesService: any

    const mockVacancy = {
        id: "1",
        title: "Full Stack Developer",
        description: "Test description",
        technologies: [],
        seniority: "Semi-Senior",
        location: "Medellín",
        modality: "remoto",
        salaryRange: "$3M - $5M",
        company: "Test Company",
        maxApplicants: 10,
        isActive: true,
        createdAt: new Date(),
    }

    beforeEach(async () => {
        mockVacanciesService = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            toggleActive: jest.fn(),
        }

        const module: TestingModule = await Test.createTestingModule({
            controllers: [VacanciesController],
            providers: [
                {
                    provide: VacanciesService,
                    useValue: mockVacanciesService,
                },
            ],
        }).compile()

        controller = module.get<VacanciesController>(VacanciesController)
    })

    it("should be defined", () => {
        expect(controller).toBeDefined()
    })

    describe("create", () => {
        it("should create a new vacancy", async () => {
            const createDto: CreateVacancyDto = {
                title: "Full Stack Developer",
                description: "Test description",
                technologies: ["JavaScript", "React"],
                seniority: "Semi-Senior",
                location: "Medellín",
                modality: "remoto" as any,
                salaryRange: "$3M - $5M",
                company: "Test Company",
                maxApplicants: 10,
            }

            mockVacanciesService.create.mockResolvedValue(mockVacancy)

            const result = await controller.create(createDto)

            expect(result).toEqual(mockVacancy)
            expect(mockVacanciesService.create).toHaveBeenCalledWith(createDto)
        })
    })

    describe("findAll", () => {
        it("should return all active vacancies", async () => {
            const vacancies = [mockVacancy]
            mockVacanciesService.findAll.mockResolvedValue(vacancies)

            const result = await controller.findAll()

            expect(result).toEqual(vacancies)
            expect(mockVacanciesService.findAll).toHaveBeenCalledWith(false)
        })

        it("should return all vacancies including inactive when requested", async () => {
            const vacancies = [mockVacancy]
            mockVacanciesService.findAll.mockResolvedValue(vacancies)

            const result = await controller.findAll("true")

            expect(result).toEqual(vacancies)
            expect(mockVacanciesService.findAll).toHaveBeenCalledWith(true)
        })
    })

    describe("findOne", () => {
        it("should return a vacancy by id", async () => {
            mockVacanciesService.findOne.mockResolvedValue(mockVacancy)

            const result = await controller.findOne("1")

            expect(result).toEqual(mockVacancy)
            expect(mockVacanciesService.findOne).toHaveBeenCalledWith("1")
        })
    })

    describe("update", () => {
        it("should update a vacancy", async () => {
            const updateDto: UpdateVacancyDto = {
                title: "Updated Title",
            }

            const updatedVacancy = { ...mockVacancy, title: "Updated Title" }
            mockVacanciesService.update.mockResolvedValue(updatedVacancy)

            const result = await controller.update("1", updateDto)

            expect(result).toEqual(updatedVacancy)
            expect(mockVacanciesService.update).toHaveBeenCalledWith("1", updateDto)
        })
    })

    describe("toggleActive", () => {
        it("should toggle vacancy active status", async () => {
            const toggledVacancy = { ...mockVacancy, isActive: false }
            mockVacanciesService.toggleActive.mockResolvedValue(toggledVacancy)

            const result = await controller.toggleActive("1")

            expect(result).toEqual(toggledVacancy)
            expect(mockVacanciesService.toggleActive).toHaveBeenCalledWith("1")
        })
    })
})

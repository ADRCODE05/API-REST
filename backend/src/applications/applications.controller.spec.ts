import { describe, it, beforeEach, expect, jest } from "@jest/globals"
import { Test, type TestingModule } from "@nestjs/testing"
import { ApplicationsController } from "./applications.controller"
import { ApplicationsService } from "./applications.service"
import { CreateApplicationDto } from "./dto/create-application.dto"

describe("ApplicationsController", () => {
    let controller: ApplicationsController
    let mockApplicationsService: any

    const mockUser = {
        id: "user-1",
        email: "test@example.com",
        role: "coder",
    }

    const mockApplication = {
        id: "app-1",
        userId: "user-1",
        vacancyId: "vacancy-1",
        appliedAt: new Date(),
    }

    beforeEach(async () => {
        mockApplicationsService = {
            create: jest.fn(),
            findAll: jest.fn(),
            findMyApplications: jest.fn(),
            findByUser: jest.fn(),
            findByVacancy: jest.fn(),
            remove: jest.fn(),
        }

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ApplicationsController],
            providers: [
                {
                    provide: ApplicationsService,
                    useValue: mockApplicationsService,
                },
            ],
        }).compile()

        controller = module.get<ApplicationsController>(ApplicationsController)
    })

    it("should be defined", () => {
        expect(controller).toBeDefined()
    })

    describe("create", () => {
        it("should create a new application", async () => {
            const createDto: CreateApplicationDto = {
                vacancyId: "vacancy-1",
            }

            const expectedResult = {
                message: "Application submitted successfully",
                data: mockApplication,
            }

            mockApplicationsService.create.mockResolvedValue(expectedResult)

            const result = await controller.create(createDto, mockUser)

            expect(result).toEqual(expectedResult)
            expect(mockApplicationsService.create).toHaveBeenCalledWith(mockUser.id, createDto)
        })
    })

    describe("findAll", () => {
        it("should return all applications", async () => {
            const applications = [mockApplication]
            mockApplicationsService.findAll.mockResolvedValue(applications)

            const result = await controller.findAll()

            expect(result).toEqual(applications)
            expect(mockApplicationsService.findAll).toHaveBeenCalled()
        })
    })

    describe("findMyApplications", () => {
        it("should return user's applications", async () => {
            const applications = [mockApplication]
            mockApplicationsService.findByUser.mockResolvedValue(applications)

            const result = await controller.findMyApplications(mockUser)

            expect(result).toEqual(applications)
            expect(mockApplicationsService.findByUser).toHaveBeenCalledWith(mockUser.id)
        })
    })

    describe("findByVacancy", () => {
        it("should return applications for a specific vacancy", async () => {
            const applications = [mockApplication]
            mockApplicationsService.findByVacancy.mockResolvedValue(applications)

            const result = await controller.findByVacancy("vacancy-1")

            expect(result).toEqual(applications)
            expect(mockApplicationsService.findByVacancy).toHaveBeenCalledWith("vacancy-1")
        })
    })

    describe("remove", () => {
        it("should remove an application", async () => {
            const expectedResult = {
                message: "Application deleted successfully",
            }

            mockApplicationsService.remove.mockResolvedValue(expectedResult)

            const result = await controller.remove("app-1", mockUser)

            expect(result).toEqual(expectedResult)
            expect(mockApplicationsService.remove).toHaveBeenCalledWith("app-1", mockUser.id)
        })
    })
})

import { describe, it, beforeEach, expect, jest } from "@jest/globals"
import { Test, type TestingModule } from "@nestjs/testing"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { RegisterDto } from "./dto/register.dto"
import { LoginDto } from "./dto/login.dto"

describe("AuthController", () => {
    let controller: AuthController
    let mockAuthService: any

    beforeEach(async () => {
        mockAuthService = {
            register: jest.fn(),
            login: jest.fn(),
        }

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile()

        controller = module.get<AuthController>(AuthController)
    })

    it("should be defined", () => {
        expect(controller).toBeDefined()
    })

    describe("register", () => {
        it("should register a new user", async () => {
            const registerDto: RegisterDto = {
                name: "Test User",
                email: "test@example.com",
                password: "password123",
            }

            const expectedResult = {
                message: "User registered successfully",
                data: {
                    user: {
                        id: "uuid",
                        name: "Test User",
                        email: "test@example.com",
                        role: "coder",
                    },
                    token: "jwt-token",
                },
            }

            mockAuthService.register.mockResolvedValue(expectedResult)

            const result = await controller.register(registerDto)

            expect(result).toEqual(expectedResult)
            expect(mockAuthService.register).toHaveBeenCalledWith(registerDto)
        })
    })

    describe("login", () => {
        it("should login a user", async () => {
            const loginDto: LoginDto = {
                email: "test@example.com",
                password: "password123",
            }

            const expectedResult = {
                message: "Logged in successfully",
                data: {
                    user: {
                        id: "uuid",
                        name: "Test User",
                        email: "test@example.com",
                        role: "coder",
                    },
                    token: "jwt-token",
                },
            }

            mockAuthService.login.mockResolvedValue(expectedResult)

            const result = await controller.login(loginDto)

            expect(result).toEqual(expectedResult)
            expect(mockAuthService.login).toHaveBeenCalledWith(loginDto)
        })
    })
})

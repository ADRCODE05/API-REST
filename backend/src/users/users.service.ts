import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { User } from "./entities/user.entity"
import { Role } from "../common/enums/role.enum"

@Injectable()
export class UsersService {
  constructor(private usersRepository: Repository<User>) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create({
      ...userData,
      role: Role.CODER, // Fixed typo from Role.CODE to Role.CODER
    })
    return await this.usersRepository.save(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } })
  }

  async findById(id: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } })
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find()
  }
}

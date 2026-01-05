import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import { User } from "./entities/user.entity"
import { Role } from "../common/enums/role.enum"

import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(userData: Partial<User>): Promise<User> {
    // I default the role to CODER unless specified otherwise.
    const user = this.usersRepository.create({
      ...userData,
      role: Role.CODER,
    })
    return await this.usersRepository.save(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    // I find users by email which is my unique identifier for login.
    return await this.usersRepository.findOne({ where: { email } })
  }

  async findById(id: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } })
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find()
  }
}

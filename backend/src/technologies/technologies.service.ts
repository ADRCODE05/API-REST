import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Technology } from "./entities/technology.entity"

@Injectable()
export class TechnologiesService {
  constructor(private technologiesRepository: Repository<Technology>) {}

  async findOrCreate(names: string[]): Promise<Technology[]> {
    const technologies: Technology[] = []

    for (const name of names) {
      let technology = await this.technologiesRepository.findOne({ where: { name: name.toLowerCase() } })

      if (!technology) {
        technology = this.technologiesRepository.create({ name: name.toLowerCase() })
        technology = await this.technologiesRepository.save(technology)
      }

      technologies.push(technology)
    }

    return technologies
  }

  async findAll(): Promise<Technology[]> {
    return await this.technologiesRepository.find()
  }
}

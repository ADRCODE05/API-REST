import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import { Technology } from "./entities/technology.entity"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class TechnologiesService {
  constructor(
    @InjectRepository(Technology)
    private technologiesRepository: Repository<Technology>,
  ) { }

  /**
   * I use this method to handle technology tags efficiently.
   * If they exist, I reuse them; otherwise, I create them.
   */
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

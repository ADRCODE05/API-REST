import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { VacanciesController } from "./vacancies.controller"
import { VacanciesService } from "./vacancies.service"
import { Vacancy } from "./entities/vacancy.entity"
import { TechnologiesModule } from "../technologies/technologies.module"

@Module({
  imports: [TypeOrmModule.forFeature([Vacancy]), TechnologiesModule],
  controllers: [VacanciesController],
  providers: [VacanciesService],
  exports: [VacanciesService],
})
export class VacanciesModule {}

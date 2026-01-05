import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ApplicationsController } from "./applications.controller"
import { ApplicationsService } from "./applications.service"
import { Application } from "./entities/application.entity"
import { VacanciesModule } from "../vacancies/vacancies.module"

@Module({
  imports: [TypeOrmModule.forFeature([Application]), VacanciesModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}

import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { VacanciesModule } from "./vacancies/vacancies.module"
import { ApplicationsModule } from "./applications/applications.module"
import { TechnologiesModule } from "./technologies/technologies.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: Number.parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "riwi_empleabilidad",
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
      synchronize: true, // Solo para desarrollo
      logging: false,
    }),
    AuthModule,
    UsersModule,
    VacanciesModule,
    ApplicationsModule,
    TechnologiesModule,
  ],
})
export class AppModule {}

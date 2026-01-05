import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AuthModule } from "./auth/auth.module"
import { UsersModule } from "./users/users.module"
import { VacanciesModule } from "./vacancies/vacancies.module"
import { ApplicationsModule } from "./applications/applications.module"
import { TechnologiesModule } from "./technologies/technologies.module"

@Module({
  imports: [
    // I load the environment variables globally as the first step.
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // I configure TypeORM asynchronously to support both PostgreSQL (production) and SQLite (testing).
    // This makes my application more portable.
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const type = configService.get<string>("DB_TYPE", "postgres")
        if (type === "sqlite") {
          return {
            type: "sqlite",
            database: configService.get<string>("DB_DATABASE", "database.sqlite"),
            entities: [__dirname + "/**/*.entity{.ts,.js}"],
            synchronize: true,
            logging: false,
          }
        }
        return {
          type: "postgres",
          host: configService.get<string>("DB_HOST", "localhost"),
          port: configService.get<number>("DB_PORT", 5432),
          username: configService.get<string>("DB_USERNAME", "postgres"),
          password: configService.get<string>("DB_PASSWORD", "postgres"),
          database: configService.get<string>("DB_NAME", "riwi_empleabilidad"),
          entities: [__dirname + "/**/*.entity{.ts,.js}"],
          synchronize: true,
          logging: false,
        }
      },
    }),
    // I organize my code into features using specialized modules.
    AuthModule,
    UsersModule,
    VacanciesModule,
    ApplicationsModule,
    TechnologiesModule,
  ],
})
export class AppModule { }

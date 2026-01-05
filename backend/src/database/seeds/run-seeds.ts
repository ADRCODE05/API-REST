import { DataSource } from "typeorm"
import { config } from "dotenv"
import { seedUsers } from "./user.seeder"
import { User } from "../../users/entities/user.entity"
import { Vacancy } from "../../vacancies/entities/vacancy.entity"
import { Technology } from "../../technologies/entities/technology.entity"
import { Application } from "../../applications/entities/application.entity"

// Cargar variables de entorno
config()

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "riwi_empleabilidad",
  entities: [User, Vacancy, Technology, Application],
  synchronize: true,
})

async function runSeeds() {
  try {
    console.log("\n🌱 Iniciando seeders...\n")

    await AppDataSource.initialize()
    console.log("✅ Conexión a la base de datos establecida\n")

    await seedUsers(AppDataSource)

    console.log("\n✅ Seeders ejecutados exitosamente!\n")
    await AppDataSource.destroy()
    process.exit(0)
  } catch (error) {
    console.error("❌ Error ejecutando seeders:", error)
    process.exit(1)
  }
}

runSeeds()

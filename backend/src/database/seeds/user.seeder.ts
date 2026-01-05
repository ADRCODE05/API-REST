import type { DataSource } from "typeorm"
import * as bcrypt from "bcrypt"
import { User } from "../../users/entities/user.entity"
import { Role } from "../../common/enums/role.enum"

export async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User)

  // Verificar si ya existen usuarios
  const existingUsers = await userRepository.count()

  if (existingUsers > 0) {
    console.log("✅ Los usuarios ya existen, saltando seeding...")
    return
  }

  const hashedPassword = await bcrypt.hash("password123", 10)

  const users = [
    {
      name: "Admin Principal",
      email: "admin@riwi.io",
      password: hashedPassword,
      role: Role.ADMINISTRADOR,
    },
    {
      name: "Gestor de Empleabilidad",
      email: "gestor@riwi.io",
      password: hashedPassword,
      role: Role.GESTOR,
    },
    {
      name: "María López - Gestor",
      email: "maria.gestor@riwi.io",
      password: hashedPassword,
      role: Role.GESTOR,
    },
    {
      name: "Carlos Coder",
      email: "carlos@example.com",
      password: hashedPassword,
      role: Role.CODER,
    },
    {
      name: "Ana Desarrolladora",
      email: "ana@example.com",
      password: hashedPassword,
      role: Role.CODER,
    },
  ]

  for (const userData of users) {
    const user = userRepository.create(userData)
    await userRepository.save(user)
    console.log(`✅ Usuario creado: ${user.email} - Rol: ${user.role}`)
  }

  console.log("\n📋 Credenciales de acceso:")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("Administrador:")
  console.log("  Email: admin@riwi.io")
  console.log("  Password: password123")
  console.log("\nGestor:")
  console.log("  Email: gestor@riwi.io")
  console.log("  Password: password123")
  console.log("\nCoder:")
  console.log("  Email: carlos@example.com")
  console.log("  Password: password123")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm"
import { Role } from "../../common/enums/role.enum"
import type { Application } from "../../applications/entities/application.entity"

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255 })
  name: string

  @Column({ type: "varchar", length: 255, unique: true })
  email: string

  @Column({ type: "varchar", length: 255 })
  password: string

  @Column({
    type: "enum",
    enum: Role,
    default: Role.CODER,
  })
  role: Role

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date

  @OneToMany("Application", "user")
  applications: Application[]
}

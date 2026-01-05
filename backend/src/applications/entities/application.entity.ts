import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm"
import type { User } from "../../users/entities/user.entity"
import type { Vacancy } from "../../vacancies/entities/vacancy.entity"

@Entity("applications")
export class Application {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  userId: string

  @Column({ type: "uuid" })
  vacancyId: string

  @ManyToOne("User", "applications", { eager: true })
  @JoinColumn({ name: "userId" })
  user: User

  @ManyToOne("Vacancy", "applications", { eager: true })
  @JoinColumn({ name: "vacancyId" })
  vacancy: Vacancy

  @CreateDateColumn()
  appliedAt: Date
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, JoinTable, OneToMany } from "typeorm"
import type { Technology } from "../../technologies/entities/technology.entity"
import type { Application } from "../../applications/entities/application.entity"

export enum Modality {
  REMOTE = "remoto",
  HYBRID = "híbrido",
  ON_SITE = "presencial",
}

@Entity("vacancies")
export class Vacancy {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255 })
  title: string

  @Column({ type: "text" })
  description: string

  @ManyToMany("Technology", "vacancies", { eager: true })
  @JoinTable({
    name: "vacancy_technologies",
    joinColumn: { name: "vacancy_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "technology_id", referencedColumnName: "id" },
  })
  technologies: Technology[]

  @Column({ type: "varchar", length: 100 })
  seniority: string

  @Column({ type: "text", nullable: true })
  softSkills: string

  @Column({ type: "varchar", length: 100 })
  location: string

  @Column({
    type: "simple-enum",
    enum: Modality,
    default: Modality.REMOTE,
  })
  modality: Modality

  @Column({ type: "varchar", length: 100 })
  salaryRange: string

  @Column({ type: "varchar", length: 255 })
  company: string

  @Column({ type: "int" })
  maxApplicants: number

  @Column({ type: "boolean", default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @OneToMany("Application", "vacancy")
  applications: Application[]
}

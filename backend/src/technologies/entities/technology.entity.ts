import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm"
import type { Vacancy } from "../../vacancies/entities/vacancy.entity"

@Entity("technologies")
export class Technology {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 100, unique: true })
  name: string

  @ManyToMany("Vacancy", "technologies")
  vacancies: Vacancy[]
}

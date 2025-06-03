// src/entities/Skill.ts
import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { UserSkill } from "./UserSkill";

@Entity()
export class Skill {
  @PrimaryColumn("uuid")
  skill_ID!: string;

  @Column()
  name!: string;

  @OneToMany(() => UserSkill, userSkill => userSkill.skill)
  userSkills!: UserSkill[];
}

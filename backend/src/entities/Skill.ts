import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { IsString, MaxLength } from "class-validator";
import { UserSkill } from "./UserSkill";

@Entity()
export class Skill {
  @PrimaryColumn("uuid")
  @IsString()
  skill_ID!: string;

  @Column()
  @IsString()
  @MaxLength(100, { message: "Skill name must be at most 100 characters" })
  name!: string;

  @OneToMany(() => UserSkill, (userSkill) => userSkill.skill)
  userSkills!: UserSkill[];
}

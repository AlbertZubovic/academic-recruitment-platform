import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { IsString } from "class-validator";
import { Skill } from "./Skill";
import { Application } from "./Application";

@Entity()
export class AppliedSkill {
  @PrimaryColumn("char", { length: 36 })
  @IsString()
  skill_ID!: string;

  @PrimaryColumn("char", { length: 36 })
  @IsString()
  application_ID!: string;

  @ManyToOne(() => Skill, (skill) => skill.userSkills, { eager: true })
  @JoinColumn({ name: "skill_ID" })
  skill!: Skill;

  @ManyToOne(() => Application, (application) => application.appliedSkills)
  @JoinColumn({ name: "application_ID" })
  application!: Application;
}

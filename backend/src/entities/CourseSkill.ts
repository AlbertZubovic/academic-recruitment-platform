import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { IsString } from "class-validator";
import { Skill } from "./Skill";
import { CourseRole } from "./CourseRole";

@Entity()
export class CourseSkill {
  @PrimaryColumn("char", { length: 36 })
  @IsString()
  skill_ID!: string;

  @PrimaryColumn("char", { length: 36 })
  @IsString()
  course_role_ID!: string;

  @ManyToOne(() => Skill, { onDelete: "CASCADE" })
  @JoinColumn({ name: "skill_ID" })
  skill!: Skill;

  @ManyToOne(() => CourseRole, (courseRole) => courseRole.courseSkills, { onDelete: "CASCADE" })
  @JoinColumn({ name: "course_role_ID" })
  courseRole!: CourseRole;
}
  
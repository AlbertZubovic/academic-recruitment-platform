import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { IsString } from "class-validator";
import { Skill } from "./Skill";
import { Course } from "./Course";

@Entity()
export class CourseSkill {
  @PrimaryColumn("char", { length: 36 })
  @IsString()
  skill_ID!: string;

  @PrimaryColumn("char", { length: 36 })
  @IsString()
  course_ID!: string;

  @ManyToOne(() => Skill, { onDelete: "CASCADE" })
  @JoinColumn({ name: "skill_ID" })
  skill!: Skill;

  @ManyToOne(() => Course, (course) => course.courseSkills, { onDelete: "CASCADE" })
  @JoinColumn({ name: "course_ID" })
  course!: Course;
}
  
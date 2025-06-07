import {
    Entity, PrimaryColumn, ManyToOne, JoinColumn
  } from "typeorm";
  import { Skill } from "./Skill";
  import { Course } from "./Course";
  
  @Entity()
  export class CourseSkill {
    @PrimaryColumn("char", { length: 36 })
    skill_ID!: string;
  
    @PrimaryColumn("char", { length: 36 })
    course_ID!: string;
  
    @ManyToOne(() => Skill)
    @JoinColumn({ name: "skill_ID" })
    skill!: Skill;
  
    @ManyToOne(() => Course)
    @JoinColumn({ name: "course_ID" })
    course!: Course;
  }
  
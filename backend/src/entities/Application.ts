import {
    Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable
  } from "typeorm";
  import { User } from "./User";
  import { Course } from "./Course";
  import { Skill } from "./Skill";
  
  @Entity()
  export class Application {
    @PrimaryColumn("char", { length: 36 })
    application_ID!: string;
  
    @ManyToOne(() => User)
    @JoinColumn({ name: "user_ID" })
    user!: User;
  
    @ManyToOne(() => Course)
    @JoinColumn({ name: "course_ID" })
    course!: Course;
  
    @Column({
      type: "enum",
      enum: ["Full-Time", "Part-Time"]
    })
    applied_availability!: "Full-Time" | "Part-Time";
  
    @Column()
    accepted!: boolean;
  
    @Column({ type: "int", nullable: true })
    ranking!: number | null;
  
    @Column({
      type: "enum",
      enum: ["Lab-Assistant", "Tutor"]
    })
    role!: "Lab-Assistant" | "Tutor";
  
    @Column("varchar", { length: 255, nullable: true })
    lecturer_comment!: string | null;


    @ManyToMany(() => Skill)
    @JoinTable({
      name: "applied_skill",
      joinColumn: { name: "application_ID", referencedColumnName: "application_ID" },
      inverseJoinColumn: { name: "skill_ID", referencedColumnName: "skill_ID" },
    })
    appliedSkills!: Skill[];
  }
  
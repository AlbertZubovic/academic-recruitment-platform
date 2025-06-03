import {
    Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany, ManyToMany, JoinTable
  } from "typeorm";
  import { User } from "./User";
  import { Course } from "./Course";
  import { Skill } from "./Skill";
  import { AppliedSkill } from "./AppliedSkill";
  
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


    @OneToMany(() => AppliedSkill, (appliedSkill) => appliedSkill.application, { cascade: true, eager: true })
    appliedSkills!: AppliedSkill[];
    }
  
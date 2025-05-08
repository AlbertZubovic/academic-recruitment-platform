import {
    Entity, PrimaryColumn, Column, ManyToOne, JoinColumn
  } from "typeorm";
  import { User } from "./User";
  import { Course } from "./Course";
  
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
    ranking!: number;
  
    @Column({
      type: "enum",
      enum: ["Lab-Assistant", "Tutor"]
    })
    role!: "Lab-Assistant" | "Tutor";
  
    @Column({ length: 255, nullable: true })
    lecturer_comment!: string;
  }
  
import {
    Entity, PrimaryColumn, Column, ManyToOne, JoinColumn
  } from "typeorm";
  import { User } from "./User";
  
  @Entity()
  export class Course {
    @PrimaryColumn("char", { length: 36 })
    course_ID!: string;
  
    @Column({ length: 8 })
    course_code!: string;
  
    @Column({ length: 255 })
    display_name!: string;
  
    @Column({ length: 255 })
    semester!: string;
  
    @ManyToOne(() => User)
    @JoinColumn({ name: "lecturer" })
    lecturer!: User;
  
    @Column({
      type: "enum",
      enum: ["Lab-Assistant", "Tutor"]
    })
    availability_required!: "Lab-Assistant" | "Tutor";
  
    @Column()
    is_disabled!: boolean;
  }
  
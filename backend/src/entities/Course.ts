import {
    Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable
  } from "typeorm";
  import { User } from "./User";
  import { Skill } from "./Skill";
  
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
    role_required!: "Lab-Assistant" | "Tutor";
  
    @Column()
    is_disabled!: boolean;

    @ManyToMany(() => Skill)
    @JoinTable({
      name: "course_skill",
      joinColumn: { name: "course_ID", referencedColumnName: "course_ID" },
      inverseJoinColumn: { name: "skill_ID", referencedColumnName: "skill_ID" },
    })
    skills!: Skill[];
  }
  
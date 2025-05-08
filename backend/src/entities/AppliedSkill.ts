import {
    Entity, PrimaryColumn, ManyToOne, JoinColumn
  } from "typeorm";
  import { Skill } from "./Skill";
  import { Application } from "./Application";
  
  @Entity()
  export class AppliedSkill {
    @PrimaryColumn("char", { length: 36 })
    skill_ID!: string;
  
    @PrimaryColumn("char", { length: 36 })
    application_ID!: string;
  
    @ManyToOne(() => Skill)
    @JoinColumn({ name: "skill_ID" })
    skill!: Skill;
  
    @ManyToOne(() => Application)
    @JoinColumn({ name: "application_ID" })
    application!: Application;
  }
  
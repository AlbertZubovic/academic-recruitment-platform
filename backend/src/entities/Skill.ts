import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Skill {
  @PrimaryColumn("char", { length: 36 })
  skill_ID!: string;

  @Column({ length: 255 })
  name!: string;
}

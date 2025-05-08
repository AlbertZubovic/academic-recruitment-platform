import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn
} from "typeorm";

@Entity()
export class User {
  @PrimaryColumn("char", { length: 36} )
  user_ID!: string;

  @Column({ length: 255, unique: true})
  email!: string;

  @Column({ length: 60 })
  password!: string;

  @Column("json", { nullable: true })
  default_skills!: string[];

  @Column({
    type: "enum",
    enum: ["Full-Time", "Part-Time"],
    nullable: true
  })
  default_availability!: "Full-Time" | "Part-Time";

  @Column({ nullable: true })
  academic_credentials!: string;

  @Column({ length: 100 })
  firstname!: string;

  @Column({ length: 100 })
  lastname!: string;

  @Column()
  is_lecturer!: boolean;

  @Column()
  is_tutor!: boolean;

  @Column()
  is_admin!: boolean;

  @CreateDateColumn()
  created!: Date;

  @Column({ default: false })
  is_blocked!: boolean;
}

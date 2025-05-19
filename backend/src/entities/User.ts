import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn
} from "typeorm";

// Define and export the enum for UserAvailability BEFORE the User class
export enum UserAvailability {
  FULL_TIME = "Full-Time",
  PART_TIME = "Part-Time",
  // Consider adding other relevant statuses like UNAVAILABLE if needed in the future
}

@Entity()
export class User {
  @PrimaryColumn("char", { length: 36 })
  user_ID!: string;

  @Column({ length: 255, unique: true })
  email!: string;

  @Column({ length: 60 })
  password!: string;

  @Column("json", { nullable: true })
  default_skills!: string[] | null;

  @Column({
    type: "enum",
    enum: UserAvailability, // Now UserAvailability is defined
    nullable: true
  })
  default_availability!: UserAvailability | null;

  @Column({ type: "text", nullable: true })
  academic_credentials!: string | null;

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

// UserAvailability enum is now defined above the User class

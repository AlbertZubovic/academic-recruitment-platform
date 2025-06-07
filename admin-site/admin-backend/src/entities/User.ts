import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { PastRole } from "./PastRole";
import { UserSkill } from "./UserSkill";

export enum UserAvailability {
  FULL_TIME = "Full-Time",
  PART_TIME = "Part-Time",
}

@Entity()
export class User {
  @PrimaryColumn("char", { length: 36 })
  @IsString()
  user_ID!: string;

  @Column({ length: 255, unique: true })
  @IsEmail(undefined, { message: "Invalid email format" })
  @MaxLength(255, { message: "Email must be at most 255 characters" })
  email!: string;

  @Column({ length: 60 })
  @IsString()
  @MaxLength(60, { message: "Password hash must be at most 60 characters" })
  password!: string;

  @OneToMany(() => UserSkill, (userSkill) => userSkill.user, {
    cascade: true,
  })
  userSkills!: UserSkill[];

  @Column({
    type: "enum",
    enum: UserAvailability,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  default_availability!: UserAvailability | null;

  @Column({ type: "text", nullable: true })
  @IsOptional()
  @IsString()
  academic_credentials!: string | null;

  @Column({ length: 100 })
  @IsString()
  @MaxLength(100, { message: "First name must be at most 100 characters" })
  firstname!: string;

  @Column({ length: 100 })
  @IsString()
  @MaxLength(100, { message: "Last name must be at most 100 characters" })
  lastname!: string;

  @Column()
  @IsBoolean()
  is_lecturer!: boolean;

  @Column()
  @IsBoolean()
  is_candidate!: boolean;

  @Column()
  @IsBoolean()
  is_admin!: boolean;

  @CreateDateColumn()
  created!: Date;

  @Column({ default: false })
  @IsBoolean()
  is_blocked!: boolean;

  @OneToMany(() => PastRole, (pr) => pr.user, {
    cascade: true,
  })
  pastRoles!: PastRole[];
} 
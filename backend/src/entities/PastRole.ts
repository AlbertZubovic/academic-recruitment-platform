// src/entities/PastRole.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";
import { User } from "./User";

export enum PastRoleType {
  TUTOR = "Tutor",
  LAB_ASSISTANT = "Lab Assistant",
}

@Entity({ name: "past_role" })
export class PastRole {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 7 })
  @Matches(/^[A-Z]{4}\d{3}$/, {
    message:
      "courseCode must be 4 uppercase letters followed by 3 digits, e.g. COSC120",
  })
  courseCode!: string;

  @Column({ length: 100 })
  @IsString()
  @MaxLength(100, { message: "courseName cannot exceed 100 characters" })
  courseName!: string;

  @Column({
    type: "enum",
    enum: PastRoleType,
  })
  @IsEnum(PastRoleType, {
    message: "role must be either 'Tutor' or 'Lab Assistant'",
  })
  role!: PastRoleType;

  @Column("varchar", { length: 50, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: "semester cannot exceed 50 characters" })
  semester?: string | null;

  @ManyToOne(() => User, (user) => user.pastRoles, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_ID" })
  user!: User;
}

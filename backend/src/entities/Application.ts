// ── src/entities/Application.ts ──

import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import {
  IsEnum,
  IsOptional,
  IsBoolean,
  IsInt,
  IsString,
  MaxLength
} from "class-validator";
import { User } from "./User";
import { Course } from "./Course";
import { AppliedSkill } from "./AppliedSkill";

export enum ApplicationAvailability {
  FULL_TIME = "Full-Time",
  PART_TIME = "Part-Time",
}

export enum ApplicationRole {
  TUTOR = "Tutor",
  LAB_ASSISTANT = "Lab-Assistant",
}

@Entity()
export class Application {
  @PrimaryColumn("char", { length: 36 })
  @IsString()
  application_ID!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_ID" })
  user!: User;

  @ManyToOne(() => Course)
  @JoinColumn({ name: "course_ID" })
  course!: Course;

  @Column({
    type: "enum",
    "enum": ApplicationAvailability,
  })
  @IsEnum(ApplicationAvailability, {
    message: "applied_availability must be 'Full-Time' or 'Part-Time'",
  })
  applied_availability!: ApplicationAvailability;

  @Column({ type: "boolean", nullable: true, default: null })
  @IsOptional()
  @IsBoolean({ message: "accepted must be boolean or null" })
  accepted!: boolean | null;

  @Column({ type: "int", nullable: true })
  @IsOptional()
  @IsInt({ message: "ranking must be an integer" })
  ranking!: number | null;

  @Column({
    type: "enum",
    "enum": ApplicationRole,
  })
  @IsEnum(ApplicationRole, {
    message: "role must be 'Tutor' or 'Lab-Assistant'",
  })
  role!: ApplicationRole;

  @Column("varchar", { length: 255, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255, {
    message: "lecturer_comment cannot exceed 255 characters",
  })
  lecturer_comment!: string | null;

  @OneToMany(() => AppliedSkill, (appliedSkill) => appliedSkill.application, {
    cascade: true,
    eager: true,
  })
  appliedSkills!: AppliedSkill[];

  @Column({ default: false })
  @IsBoolean()
  is_withdrawn!: boolean;

  @Column({ type: "datetime", nullable: true })
  withdrawn_at!: Date | null;
}

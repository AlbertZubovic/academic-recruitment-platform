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
  IsString,
  IsBoolean,
  IsOptional,
  MaxLength,
} from "class-validator";
import { Course } from "./Course";

export enum CourseRoleType {
  TUTOR = "Tutor",
  LAB_ASSISTANT = "Lab-Assistant",
}

@Entity()
export class CourseRole {
  @PrimaryColumn("char", { length: 36 })
  @IsString()
  course_role_ID!: string;

  @ManyToOne(() => Course, { onDelete: "CASCADE" })
  @JoinColumn({ name: "course_ID" })
  course!: Course;

  @Column({
    type: "enum",
    "enum": CourseRoleType,
  })
  @IsEnum(CourseRoleType, {
    message: "role must be 'Tutor' or 'Lab-Assistant'",
  })
  role!: CourseRoleType;

  @Column({ type: "text", nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: "description cannot exceed 500 characters" })
  description!: string | null;

  @Column({ default: true })
  @IsBoolean()
  is_active!: boolean;

  @Column({ type: "int", default: 1 })
  positions_available!: number;


} 
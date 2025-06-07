import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import {
  IsBoolean,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";
import { User } from "./User";
import { CourseRole } from "./CourseRole";

@Entity()
export class Course {
  @PrimaryColumn("char", { length: 36 })
  @IsString()
  course_ID!: string;

  @Column({ length: 7 })
  @Matches(/^[A-Z]{4}\d{3}$/, {
    message: "course_code must be 4 uppercase letters followed by 3 digits, e.g. COSC120",
  })
  course_code!: string;

  @Column({ length: 255 })
  @IsString()
  @MaxLength(255, { message: "display_name cannot exceed 255 characters" })
  display_name!: string;

  @Column({ length: 255 })
  @IsString()
  @MaxLength(255, { message: "semester cannot exceed 255 characters" })
  semester!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "lecturer" })
  lecturer!: User | null;

  @Column()
  @IsBoolean()
  is_disabled!: boolean;

  @OneToMany(() => CourseRole, (courseRole) => courseRole.course, {
    cascade: true,
  })
  courseRoles!: CourseRole[];
} 
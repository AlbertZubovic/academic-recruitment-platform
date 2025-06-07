import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";
import { User } from "./User";
import { Skill } from "./Skill";

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

  @Column("simple-array", { nullable: false })
  @IsArray({ message: "roles_available must be an array" })
  @ArrayNotEmpty({ message: "roles_available cannot be empty" })
  @IsIn(["Tutor", "Lab-Assistant"], {
    each: true,
    message: "roles_available may only contain 'Tutor' or 'Lab-Assistant'",
  })
  roles_available!: ("Lab-Assistant" | "Tutor")[];

  @Column()
  @IsBoolean()
  is_disabled!: boolean;

  @ManyToMany(() => Skill)
  @JoinTable({
    name: "course_skill",
    joinColumn: { name: "course_ID", referencedColumnName: "course_ID" },
    inverseJoinColumn: { name: "skill_ID", referencedColumnName: "skill_ID" },
  })
  skills!: Skill[];
} 
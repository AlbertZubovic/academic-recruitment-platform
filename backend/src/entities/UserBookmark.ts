// src/entities/UserBookmark.ts

import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Course } from "./Course";

@Entity("user_bookmark")
export class UserBookmark {
  @PrimaryColumn({ name: "user_ID", length: 36 })
  userID!: string;

  @PrimaryColumn({ name: "course_ID", length: 36 })
  courseID!: string;

  @CreateDateColumn({ name: "bookmarked_at" })
  bookmarkedAt!: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_ID" })
  user!: User;

  @ManyToOne(() => Course, { onDelete: "CASCADE" })
  @JoinColumn({ name: "course_ID" })
  course!: Course;
} 
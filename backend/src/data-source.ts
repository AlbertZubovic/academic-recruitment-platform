import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Course } from "./entities/Course";
import { Application } from "./entities/Application";
import { Skill } from "./entities/Skill";
import { CourseSkill } from "./entities/CourseSkill";
import { AppliedSkill } from "./entities/AppliedSkill";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "209.38.26.237",
  port: 3306,
  username: "S4007755",
  password: "S4007755",
  database: "S4007755",
  synchronize: false,
  logging: true,
  entities: [
    User,
    Course,
    Application,
    Skill,
    CourseSkill,
    AppliedSkill
  ],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: [],
});

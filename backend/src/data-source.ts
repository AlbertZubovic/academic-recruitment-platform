import { DataSource } from "typeorm";

import { User } from "./entities/User";
import { Skill } from "./entities/Skill";
import { UserSkill } from "./entities/UserSkill";
import { PastRole } from "./entities/PastRole";
import { Course } from "./entities/Course";
import { Application } from "./entities/Application";
import { AppliedSkill } from "./entities/AppliedSkill";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "209.38.26.237",
  port: 3306,
  username: "S4007755",
  password: "S4007755",
  database: "S4007755",
  synchronize: false,
  dropSchema: false,
  logging: true,
  entities: [
    User,
    Skill,
    UserSkill,
    PastRole,
    Course,
    Application,
    AppliedSkill,
  ],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: [],
});

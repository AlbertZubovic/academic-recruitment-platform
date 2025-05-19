import { DataSource } from "typeorm";
import { User } from "./entities/User"; // Re-enable direct import
// We will let TypeORM load entities via glob pattern, so direct imports here are not strictly necessary for the entities array
// import { Course } from "./entities/Course";
// import { Application } from "./entities/Application";
// import { Skill } from "./entities/Skill";
// import { CourseSkill } from "./entities/CourseSkill";
// import { AppliedSkill } from "./entities/AppliedSkill";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "209.38.26.237",
    port: 3306,
    username: "S4007755",
    password: "S4007755",
    database: "S4007755",
    synchronize: false, // Changed to false as migrations will be used
    logging: true, // Set to true or false or ['query', 'error'] as needed
    entities: [
        User, // Use direct class reference
        // Course,
        // Application,
        // Skill,
        // CourseSkill,
        // AppliedSkill
    ],
    // If your compiled JS files are in a different location (e.g., 'dist'),
    // you might need entities: ["dist/entities/**/*.js"] for runtime after tsc build.
    // For ts-node execution, "src/entities/**/*.ts" should be fine.
    migrations: ["src/migrations/**/*.ts"], // It's good practice to specify migrations path
    subscribers: [],
});
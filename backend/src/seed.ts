// backend/src/seed.ts

import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { User, UserAvailability } from "./entities/User";
import { Skill } from "./entities/Skill";
import { Course } from "./entities/Course";
import { Application } from "./entities/Application";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

async function seed() {
  await AppDataSource.initialize();
  console.log("Seeding database...");

  const userRepo = AppDataSource.getRepository(User);
  const skillRepo = AppDataSource.getRepository(Skill);
  const courseRepo = AppDataSource.getRepository(Course);
  const applicationRepo = AppDataSource.getRepository(Application);

await AppDataSource.manager.query(`SET FOREIGN_KEY_CHECKS = 0;`);

await AppDataSource.manager.query(`DELETE FROM applied_skill;`);
await AppDataSource.manager.query(`DELETE FROM application;`);
await AppDataSource.manager.query(`DELETE FROM course_skill;`);
await AppDataSource.manager.query(`DELETE FROM course;`);
await AppDataSource.manager.query(`DELETE FROM skill;`);
await AppDataSource.manager.query(`DELETE FROM user;`);

await AppDataSource.manager.query(`SET FOREIGN_KEY_CHECKS = 1;`);

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const users = [
    userRepo.create({
      user_ID: uuidv4(),
      email: "john@example.com",
      password: passwordHash,
      firstname: "John",
      lastname: "Doe",
      is_tutor: true,
      is_lecturer: false,
      is_admin: false,
      is_blocked: false,
      default_skills: ["React", "TypeScript"],
      default_availability: UserAvailability.FULL_TIME
    }),
    userRepo.create({
      user_ID: uuidv4(),
      email: "alice@example.com",
      password: passwordHash,
      firstname: "Alice",
      lastname: "Smith",
      is_tutor: false,
      is_lecturer: true,
      is_admin: false,
      is_blocked: false
    }),
    userRepo.create({
      user_ID: uuidv4(),
      email: "bob@example.com",
      password: passwordHash,
      firstname: "Bob",
      lastname: "Brown",
      is_tutor: true,
      is_lecturer: false,
      is_admin: false,
      is_blocked: false,
      default_skills: ["SQL"],
      default_availability: UserAvailability.PART_TIME
    }),
    userRepo.create({
      user_ID: uuidv4(),
      email: "admin@example.com",
      password: passwordHash,
      firstname: "Admin",
      lastname: "User",
      is_tutor: false,
      is_lecturer: false,
      is_admin: true,
      is_blocked: false
    })
  ];

  await userRepo.save(users);

  const [john, alice, bob, admin] = users;

  const skills = [
    skillRepo.create({ skill_ID: uuidv4(), name: "React" }),
    skillRepo.create({ skill_ID: uuidv4(), name: "TypeScript" }),
    skillRepo.create({ skill_ID: uuidv4(), name: "SQL" }),
    skillRepo.create({ skill_ID: uuidv4(), name: "Python" })
  ];
  await skillRepo.save(skills);

  const courses = [
    courseRepo.create({
      course_ID: uuidv4(),
      course_code: "COSC101",
      display_name: "Web Dev 1",
      semester: "2025S1",
      lecturer: alice,
      role_required: "Tutor",
      is_disabled: false
    }),
    courseRepo.create({
      course_ID: uuidv4(),
      course_code: "COSC102",
      display_name: "Web Dev 2",
      semester: "2025S1",
      lecturer: alice,
      role_required: "Lab-Assistant",
      is_disabled: false
    }),
    courseRepo.create({
      course_ID: uuidv4(),
      course_code: "COSC201",
      display_name: "Databases",
      semester: "2025S1",
      lecturer: alice,
      role_required: "Tutor",
      is_disabled: false
    })
  ];
  await courseRepo.save(courses);

  const [web1, web2, db] = courses;

  const applications = [
    applicationRepo.create({
      application_ID: uuidv4(),
      user: john,
      course: web1,
      applied_availability: "Full-Time",
      accepted: false,
      ranking: null,
      role: "Tutor",
      lecturer_comment: null
    }),
    applicationRepo.create({
      application_ID: uuidv4(),
      user: bob,
      course: web2,
      applied_availability: "Part-Time",
      accepted: false,
      ranking: null,
      role: "Lab-Assistant",
      lecturer_comment: null
    })
  ];
  await applicationRepo.save(applications);

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

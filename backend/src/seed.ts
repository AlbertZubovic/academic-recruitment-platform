// src/seed.ts

import "reflect-metadata";
import { DataSource } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { validateOrReject } from "class-validator";

import { AppDataSource } from "./data-source";
import { User, UserAvailability } from "./entities/User";
import { Skill } from "./entities/Skill";
import { UserSkill } from "./entities/UserSkill";
import { PastRole, PastRoleType } from "./entities/PastRole";
import { Course } from "./entities/Course";
import { CourseRole, CourseRoleType } from "./entities/CourseRole";
import { CourseSkill } from "./entities/CourseSkill";
import {
  Application,
  ApplicationAvailability,
  ApplicationRole,
} from "./entities/Application";

async function seed() {
  await AppDataSource.initialize();
  console.log("Seeding database...");

  // Repositories
  const userRepo = AppDataSource.getRepository(User);
  const skillRepo = AppDataSource.getRepository(Skill);
  const userSkillRepo = AppDataSource.getRepository(UserSkill);
  const pastRoleRepo = AppDataSource.getRepository(PastRole);
  const courseRepo = AppDataSource.getRepository(Course);
  const courseRoleRepo = AppDataSource.getRepository(CourseRole);
  const courseSkillRepo = AppDataSource.getRepository(CourseSkill);
  const appRepo = AppDataSource.getRepository(Application);

  // 1) Clear existing data
  console.log("Clearing existing data...");
  await AppDataSource.manager.query(`SET FOREIGN_KEY_CHECKS = 0;`);
  await AppDataSource.manager.query(`TRUNCATE TABLE applied_skill;`);
  await AppDataSource.manager.query(`TRUNCATE TABLE application;`);
  await AppDataSource.manager.query(`TRUNCATE TABLE course_skill;`);
  await AppDataSource.manager.query(`TRUNCATE TABLE course_role;`);
  await AppDataSource.manager.query(`TRUNCATE TABLE course;`);
  await AppDataSource.manager.query(`TRUNCATE TABLE past_role;`);
  await AppDataSource.manager.query(`TRUNCATE TABLE user_skill;`);
  await AppDataSource.manager.query(`TRUNCATE TABLE skill;`);
  await AppDataSource.manager.query(`TRUNCATE TABLE user;`);
  await AppDataSource.manager.query(`SET FOREIGN_KEY_CHECKS = 1;`);
  console.log("Data cleared.");

  // 2) Hash password for all users
  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);

  // 3) Create skills
  console.log("Creating skills...");
  const skillNames = [
    "Python", "Problem Solving", "Basic Algorithms", "Java", "Data Structures",
    "Spring Boot", "HTML", "CSS", "JavaScript", "React", "Node.js", "SQL",
    "Database Design", "PostgreSQL", "C", "Linux", "Algorithms", "Graph Theory",
    "UML", "Agile", "Git", "Machine Learning Concepts", "Search Algorithms",
    "TCP/IP", "Routing", "Switching", "OSI Model", "Swift", "Kotlin", "iOS",
    "Android", "UI/UX Principles", "Memory Management", "Complexity Analysis",
    "Normalization", "Operating Systems Concepts", "Network Fundamentals",
  ];
  const skillEntities = skillNames.map((name) =>
    skillRepo.create({ skill_ID: uuidv4(), name })
  );
  await skillRepo.save(skillEntities);
  const skillMap = Object.fromEntries(skillEntities.map((s) => [s.name, s]));
  console.log(`${skillEntities.length} skills created.`);

  // 4) Create users
  console.log("Creating users...");
  const userData = [
    // Lecturers
    { id: "L1", email: "alice.lecturer@example.com", firstname: "Alice", lastname: "Smith", isLecturer: true, isCandidate: false, defaultSkills: [], defaultAvailability: null },
    { id: "L2", email: "bob.lecturer@example.com", firstname: "Bob", lastname: "Johnson", isLecturer: true, isCandidate: false, defaultSkills: [], defaultAvailability: null },
    { id: "L3", email: "fiona.lecturer@example.com", firstname: "Fiona", lastname: "Davis", isLecturer: true, isCandidate: false, defaultSkills: [], defaultAvailability: null },
    // Candidates
    { id: "C1", email: "charlie.candidate@example.com", firstname: "Charlie", lastname: "Brown", isLecturer: false, isCandidate: true, defaultSkills: ["Python", "Problem Solving"], defaultAvailability: UserAvailability.FULL_TIME },
    { id: "C2", email: "diana.candidate@example.com", firstname: "Diana", lastname: "White", isLecturer: false, isCandidate: true, defaultSkills: ["Java", "Data Structures"], defaultAvailability: UserAvailability.PART_TIME },
    { id: "C3", email: "edward.candidate@example.com", firstname: "Edward", lastname: "Green", isLecturer: false, isCandidate: true, defaultSkills: ["HTML", "CSS", "JavaScript"], defaultAvailability: UserAvailability.FULL_TIME },
    { id: "C4", email: "grace.candidate@example.com", firstname: "Grace", lastname: "Hall", isLecturer: false, isCandidate: true, defaultSkills: ["SQL", "Database Design"], defaultAvailability: UserAvailability.PART_TIME },
    { id: "C5", email: "henry.candidate@example.com", firstname: "Henry", lastname: "Lopez", isLecturer: false, isCandidate: true, defaultSkills: ["C", "Linux"], defaultAvailability: UserAvailability.FULL_TIME },
  ];
  const userEntities = userData.map((u) =>
    userRepo.create({
      user_ID: u.id,
      email: u.email,
      password: defaultPasswordHash,
      firstname: u.firstname,
      lastname: u.lastname,
      is_lecturer: u.isLecturer,
      is_candidate: u.isCandidate,
      is_admin: false,
      is_blocked: false,
      default_availability: u.isCandidate ? u.defaultAvailability : null,
    })
  );
  await userRepo.save(userEntities);
  const userMap = Object.fromEntries(userEntities.map((u) => [u.user_ID, u]));
  console.log(`${userEntities.length} users created.`);

  // 5) Create UserSkill rows
  console.log("Assigning skills to users...");
  for (const u of userData.filter((u) => u.isCandidate)) {
    const user = userMap[u.id];
    for (const skillName of u.defaultSkills) {
      const skill = skillMap[skillName];
      const us = userSkillRepo.create({ user, skill });
      await userSkillRepo.save(us);
    }
  }
  console.log("User skills assigned.");

  // 6) Create PastRole entries
  console.log("Creating past roles...");
  const pastRolesData = [
    { userId: "L1", courseCode: "COSC100", courseName: "Intro to CS", role: PastRoleType.TUTOR, semester: "Spring 2024" },
    { userId: "C1", courseCode: "COSC150", courseName: "Web Fundamentals", role: PastRoleType.TUTOR, semester: "Fall 2023" },
  ];
  for (const pr of pastRolesData) {
    const prEntity = pastRoleRepo.create({
      courseCode: pr.courseCode,
      courseName: pr.courseName,
      role: pr.role,
      semester: pr.semester,
      user: { user_ID: pr.userId },
    });
    await pastRoleRepo.save(prEntity);
  }
  console.log(`${pastRolesData.length} past roles created.`);

  // 7) Create courses, roles, and skills
  console.log("Creating courses, roles, and course skills...");
  const courseData = [
    { id: "CO101", code: "COSC101", name: "Introduction To Programming", semester: "Fall 2025", skills: ["Python", "Problem Solving"], lecturerId: "L1" },
    { id: "CO202", code: "COSC202", name: "Data Structures And Algorithms", semester: "Spring 2026", skills: ["Java", "Data Structures", "Algorithms"], lecturerId: "L2" },
    { id: "CO303", code: "COSC303", name: "Web Development Fundamentals", semester: "Fall 2025", skills: ["HTML", "CSS", "JavaScript", "React"], lecturerId: "L1" },
    { id: "CO404", code: "COSC404", name: "Database Systems", semester: "Spring 2026", skills: ["SQL", "Database Design", "Normalization"], lecturerId: "L3" },
    { id: "CO505", code: "COSC505", name: "Operating Systems", semester: "Fall 2025", skills: ["C", "Linux", "Memory Management"], lecturerId: "L2" },
  ];

  const courseEntities: Course[] = [];
  for (const c of courseData) {
    // Create Course
    const courseEntity = courseRepo.create({
      course_ID: c.id,
      course_code: c.code,
      display_name: c.name,
      semester: c.semester,
      is_disabled: false,
      lecturer: userMap[c.lecturerId],
    });
    await courseRepo.save(courseEntity);
    courseEntities.push(courseEntity);

    // Create Course Roles (Tutor and Lab-Assistant for each)
    const rolesToCreate = [CourseRoleType.TUTOR, CourseRoleType.LAB_ASSISTANT];
    for(const role of rolesToCreate) {
        const courseRoleEntity = courseRoleRepo.create({
            course_role_ID: uuidv4(),
            course: courseEntity,
            role: role,
            positions_available: 1,
            is_active: true
        });
        await courseRoleRepo.save(courseRoleEntity);
    }
    
    // Create Course Skills
    for (const skillName of c.skills) {
      const skill = skillMap[skillName];
      const courseSkillEntity = courseSkillRepo.create({
        course_ID: courseEntity.course_ID,
        skill_ID: skill.skill_ID,
        course: courseEntity,
        skill: skill,
      });
      await courseSkillRepo.save(courseSkillEntity);
    }
  }
  const courseMap = Object.fromEntries(
    courseEntities.map((c) => [c.course_ID, c])
  );
  console.log(`${courseEntities.length} courses created with roles and skills.`);


  // 8) Create applications
  console.log("Creating applications...");
  const applicationData = [
    { userId: "C1", courseId: "CO101", availability: ApplicationAvailability.FULL_TIME, role: "Tutor", accepted: true, ranking: 1, comment: "Excellent Python background." },
    { userId: "C2", courseId: "CO202", availability: ApplicationAvailability.PART_TIME, role: "Lab-Assistant", accepted: false, ranking: 3, comment: "Needs more Java experience." },
    { userId: "C3", courseId: "CO303", availability: ApplicationAvailability.FULL_TIME, role: "Tutor", accepted: null, ranking: null, comment: null },
    { userId: "C4", courseId: "CO404", availability: ApplicationAvailability.PART_TIME, role: "Lab-Assistant", accepted: true, ranking: 2, comment: "Good SQL knowledge." },
    { userId: "C5", courseId: "CO505", availability: ApplicationAvailability.FULL_TIME, role: "Tutor", accepted: null, ranking: null, comment: null },
    { userId: "C1", courseId: "CO202", availability: ApplicationAvailability.FULL_TIME, role: "Tutor", accepted: false, ranking: 4, comment: "Good, but other candidates were a better fit." },
  ];

  for (const ad of applicationData) {
      const user = userMap[ad.userId];
      const course = courseMap[ad.courseId];
      if(!user || !course) continue;

      const appEntity = appRepo.create({
          application_ID: uuidv4(),
          user,
          course,
          applied_availability: ad.availability,
          role: ad.role as ApplicationRole,
          accepted: ad.accepted,
          ranking: ad.ranking,
          lecturer_comment: ad.comment
      });
      await appRepo.save(appEntity);
  }
  console.log(`${applicationData.length} applications created.`);

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

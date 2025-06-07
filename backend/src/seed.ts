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
import {
  Application,
  ApplicationAvailability,
  ApplicationRole,
} from "./entities/Application";
import { AppliedSkill } from "./entities/AppliedSkill";

async function seed() {
  await AppDataSource.initialize();
  console.log("Seeding database...");

  // Repositories
  const userRepo = AppDataSource.getRepository(User);
  const skillRepo = AppDataSource.getRepository(Skill);
  const userSkillRepo = AppDataSource.getRepository(UserSkill);
  const pastRoleRepo = AppDataSource.getRepository(PastRole);
  const courseRepo = AppDataSource.getRepository(Course);
  const appRepo = AppDataSource.getRepository(Application);
  const appliedSkillRepo = AppDataSource.getRepository(AppliedSkill);

  // 1) Clear existing data
  await AppDataSource.manager.query(`SET FOREIGN_KEY_CHECKS = 0;`);
  await AppDataSource.manager.query(`DELETE FROM applied_skill;`);
  await AppDataSource.manager.query(`DELETE FROM application;`);
  await AppDataSource.manager.query(`DELETE FROM course_skill;`);
  await AppDataSource.manager.query(`DELETE FROM course;`);
  await AppDataSource.manager.query(`DELETE FROM past_role;`);
  await AppDataSource.manager.query(`DELETE FROM user_skill;`);
  await AppDataSource.manager.query(`DELETE FROM skill;`);
  await AppDataSource.manager.query(`DELETE FROM user;`);
  await AppDataSource.manager.query(`SET FOREIGN_KEY_CHECKS = 1;`);

  // 2) Hash password for all users
  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);

  // 3) Create skills
  const skillNames = [
    "Python",
    "Problem Solving",
    "Basic Algorithms",
    "Java",
    "Data Structures",
    "Spring Boot",
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Node.js",
    "SQL",
    "Database Design",
    "PostgreSQL",
    "C",
    "Linux",
    "Algorithms",
    "Graph Theory",
    "UML",
    "Agile",
    "Git",
    "Machine Learning Concepts",
    "Search Algorithms",
    "TCP/IP",
    "Routing",
    "Switching",
    "OSI Model",
    "Swift",
    "Kotlin",
    "iOS",
    "Android",
    "UI/UX Principles",
    "Memory Management",
    "Complexity Analysis",
    "Normalization",
    "Operating Systems Concepts",
    "Network Fundamentals",
  ];
  const skillEntities = skillNames.map((name) =>
    skillRepo.create({ skill_ID: uuidv4(), name })
  );
  await skillRepo.save(skillEntities);
  const skillMap = Object.fromEntries(skillEntities.map((s) => [s.name, s]));

  // 4) Create users
  //    - 3 lecturers
  //    - 5 candidates
  const userData = [
    // Lecturers
    {
      id: "L1",
      email: "alice.lecturer@example.com",
      firstname: "Alice",
      lastname: "Smith",
      isLecturer: true,
      isCandidate: false,
      defaultSkills: [] as string[],
      defaultAvailability: null,
    },
    {
      id: "L2",
      email: "bob.lecturer@example.com",
      firstname: "Bob",
      lastname: "Johnson",
      isLecturer: true,
      isCandidate: false,
      defaultSkills: [] as string[],
      defaultAvailability: null,
    },
    {
      id: "L3",
      email: "fiona.lecturer@example.com",
      firstname: "Fiona",
      lastname: "Davis",
      isLecturer: true,
      isCandidate: false,
      defaultSkills: [] as string[],
      defaultAvailability: null,
    },

    // Candidates
    {
      id: "C1",
      email: "charlie.candidate@example.com",
      firstname: "Charlie",
      lastname: "Brown",
      isLecturer: false,
      isCandidate: true,
      defaultSkills: ["Python", "Problem Solving"],
      defaultAvailability: UserAvailability.FULL_TIME,
    },
    {
      id: "C2",
      email: "diana.candidate@example.com",
      firstname: "Diana",
      lastname: "White",
      isLecturer: false,
      isCandidate: true,
      defaultSkills: ["Java", "Data Structures"],
      defaultAvailability: UserAvailability.PART_TIME,
    },
    {
      id: "C3",
      email: "edward.candidate@example.com",
      firstname: "Edward",
      lastname: "Green",
      isLecturer: false,
      isCandidate: true,
      defaultSkills: ["HTML", "CSS", "JavaScript"],
      defaultAvailability: UserAvailability.FULL_TIME,
    },
    {
      id: "C4",
      email: "grace.candidate@example.com",
      firstname: "Grace",
      lastname: "Hall",
      isLecturer: false,
      isCandidate: true,
      defaultSkills: ["SQL", "Database Design"],
      defaultAvailability: UserAvailability.PART_TIME,
    },
    {
      id: "C5",
      email: "henry.candidate@example.com",
      firstname: "Henry",
      lastname: "Lopez",
      isLecturer: false,
      isCandidate: true,
      defaultSkills: ["C", "Linux"],
      defaultAvailability: UserAvailability.FULL_TIME,
    },
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
      academic_credentials: null,
    })
  );
  await userRepo.save(userEntities);
  const userMap = Object.fromEntries(userEntities.map((u) => [u.user_ID, u]));

  // 5) Create UserSkill rows for candidates
  for (const u of userData.filter((u) => u.isCandidate)) {
    const user = userMap[u.id];
    for (const skillName of u.defaultSkills) {
      const skill = skillMap[skillName];
      const us = userSkillRepo.create({ user, skill });
      await userSkillRepo.save(us);
    }
  }

  // 6) Create PastRole entries (for both lecturers and candidates)
  const pastRolesData = [
    // Lecturer Alice taught two courses previously
    {
      userId: "L1",
      courseCode: "COSC100",
      courseName: "Intro to CS",
      role: PastRoleType.TUTOR,
      semester: "Spring 2024",
    },
    {
      userId: "L1",
      courseCode: "COSC200",
      courseName: "Discrete Math",
      role: PastRoleType.LAB_ASSISTANT,
      semester: "Fall 2023",
    },
    // Lecturer Bob taught courses
    {
      userId: "L2",
      courseCode: "COSC300",
      courseName: "Algorithms",
      role: PastRoleType.LAB_ASSISTANT,
      semester: "Spring 2024",
    },
    {
      userId: "L2",
      courseCode: "COSC350",
      courseName: "Operating Systems",
      role: PastRoleType.TUTOR,
      semester: "Fall 2023",
    },
    // Lecturer Fiona taught one course
    {
      userId: "L3",
      courseCode: "COSC400",
      courseName: "Database Systems II",
      role: PastRoleType.TUTOR,
      semester: "Spring 2024",
    },
    // Candidate Charlie has one past tutoring role
    {
      userId: "C1",
      courseCode: "COSC150",
      courseName: "Web Fundamentals",
      role: PastRoleType.TUTOR,
      semester: "Fall 2023",
    },
    // Candidate Edward has one past lab assistant role
    {
      userId: "C3",
      courseCode: "COSC250",
      courseName: "Data Structures",
      role: PastRoleType.LAB_ASSISTANT,
      semester: "Spring 2023",
    },
    // Candidate Grace has one past role
    {
      userId: "C4",
      courseCode: "COSC180",
      courseName: "Network Fundamentals",
      role: PastRoleType.LAB_ASSISTANT,
      semester: "Fall 2023",
    },
    // Candidate Henry has one past role
    {
      userId: "C5",
      courseCode: "COSC500",
      courseName: "Operating Systems Concepts",
      role: PastRoleType.TUTOR,
      semester: "Spring 2023",
    },
  ];

  for (const pr of pastRolesData) {
    const prEntity = pastRoleRepo.create({
      courseCode: pr.courseCode,
      courseName: pr.courseName,
      role: pr.role,
      semester: pr.semester,
      user: { user_ID: pr.userId },
    });
    await validateOrReject(prEntity);
    await pastRoleRepo.save(prEntity);
  }

  // 7) Create courses (assign to lecturer L1, L2, or L3)
  //    All courses now have both Tutor and Lab-Assistant available
  const courseData = [
    {
      id: "CO101",
      code: "COSC101",
      name: "Introduction To Programming",
      semester: "Fall 2025",
      roles: [ApplicationRole.TUTOR, ApplicationRole.LAB_ASSISTANT],
      skills: ["Python", "Problem Solving"],
      lecturerId: "L1",
    },
    {
      id: "CO202",
      code: "COSC202",
      name: "Data Structures And Algorithms",
      semester: "Spring 2026",
      roles: [ApplicationRole.TUTOR, ApplicationRole.LAB_ASSISTANT],
      skills: ["Java", "Data Structures"],
      lecturerId: "L2",
    },
    {
      id: "CO303",
      code: "COSC303",
      name: "Web Development Fundamentals",
      semester: "Fall 2025",
      roles: [ApplicationRole.TUTOR, ApplicationRole.LAB_ASSISTANT],
      skills: ["HTML", "CSS", "JavaScript"],
      lecturerId: "L1",
    },
    {
      id: "CO404",
      code: "COSC404",
      name: "Database Systems",
      semester: "Spring 2026",
      roles: [ApplicationRole.TUTOR, ApplicationRole.LAB_ASSISTANT],
      skills: ["SQL", "Database Design", "Normalization"],
      lecturerId: "L3",
    },
    {
      id: "CO505",
      code: "COSC505",
      name: "Operating Systems Concepts",
      semester: "Fall 2025",
      roles: [ApplicationRole.TUTOR, ApplicationRole.LAB_ASSISTANT],
      skills: ["C", "Linux", "Memory Management"],
      lecturerId: "L2",
    },
    {
      id: "CO606",
      code: "COSC606",
      name: "Advanced Algorithms",
      semester: "Fall 2025",
      roles: [ApplicationRole.TUTOR, ApplicationRole.LAB_ASSISTANT],
      skills: ["Algorithms", "Graph Theory", "Complexity Analysis"],
      lecturerId: "L3",
    },
  ];

  const courseEntities = courseData.map((c) =>
    courseRepo.create({
      course_ID: c.id,
      course_code: c.code,
      display_name: c.name,
      semester: c.semester,
      roles_available: c.roles,
      is_disabled: false,
      skills: c.skills.map((sn) => skillMap[sn]),
      lecturer: { user_ID: c.lecturerId },
    })
  );
  await courseRepo.save(courseEntities);
  const courseMap = Object.fromEntries(
    courseEntities.map((c) => [c.course_code, c])
  );

  // 8) Create applications (candidates apply to courses)
  const applicationData = [
    // Charlie applies to COSC101 as Tutor, full-time (accepted)
    {
      applicationId: uuidv4(),
      userId: "C1",
      courseCode: "COSC101",
      appliedAvailability: ApplicationAvailability.FULL_TIME,
      role: ApplicationRole.TUTOR,
      accepted: true,
      ranking: 1,
      lecturerComment: "Excellent background",
      appliedSkills: ["Python", "Problem Solving"],
    },
    // Diana applies to COSC202 as Lab-Assistant, part-time (rejected)
    {
      applicationId: uuidv4(),
      userId: "C2",
      courseCode: "COSC202",
      appliedAvailability: ApplicationAvailability.PART_TIME,
      role: ApplicationRole.LAB_ASSISTANT,
      accepted: false,
      ranking: 3,
      lecturerComment: "Needs more experience",
      appliedSkills: ["Java", "Data Structures"],
    },
    // Edward applies to COSC303 as Tutor, full-time (pending)
    {
      applicationId: uuidv4(),
      userId: "C3",
      courseCode: "COSC303",
      appliedAvailability: ApplicationAvailability.FULL_TIME,
      role: ApplicationRole.TUTOR,
      accepted: null,
      ranking: null,
      lecturerComment: null,
      appliedSkills: ["HTML", "CSS", "JavaScript"],
    },
    // Grace applies to COSC404 as Lab-Assistant, part-time (accepted)
    {
      applicationId: uuidv4(),
      userId: "C4",
      courseCode: "COSC404",
      appliedAvailability: ApplicationAvailability.PART_TIME,
      role: ApplicationRole.LAB_ASSISTANT,
      accepted: true,
      ranking: 2,
      lecturerComment: "Good SQL knowledge",
      appliedSkills: ["SQL", "Database Design"],
    },
    // Henry applies to COSC505 as Tutor, full-time (pending)
    {
      applicationId: uuidv4(),
      userId: "C5",
      courseCode: "COSC505",
      appliedAvailability: ApplicationAvailability.FULL_TIME,
      role: ApplicationRole.TUTOR,
      accepted: null,
      ranking: null,
      lecturerComment: null,
      appliedSkills: ["C", "Linux"],
    },
    // Charlie applies to COSC606 as Lab-Assistant, full-time (rejected)
    {
      applicationId: uuidv4(),
      userId: "C1",
      courseCode: "COSC606",
      appliedAvailability: ApplicationAvailability.FULL_TIME,
      role: ApplicationRole.LAB_ASSISTANT,
      accepted: false,
      ranking: 5,
      lecturerComment: "Not enough algorithm experience",
      appliedSkills: ["Algorithms", "Graph Theory"],
    },
  ];

  for (const ad of applicationData) {
    const course = courseMap[ad.courseCode];
    if (!course) continue;

    const appEntity = appRepo.create({
      application_ID: ad.applicationId,
      user: { user_ID: ad.userId },
      course: { course_ID: course.course_ID },
      applied_availability: ad.appliedAvailability,
      role: ad.role,
      accepted: ad.accepted,
      ranking: ad.ranking,
      lecturer_comment: ad.lecturerComment,
    });
    await validateOrReject(appEntity);
    await appRepo.save(appEntity);

    // Create AppliedSkill rows for this application
    for (const skillName of ad.appliedSkills) {
      const skill = skillMap[skillName];
      if (!skill) continue;
      const asEntity = appliedSkillRepo.create({
        application_ID: ad.applicationId,
        skill_ID: skill.skill_ID,
        application: appEntity,
        skill,
      });
      await appliedSkillRepo.save(asEntity);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

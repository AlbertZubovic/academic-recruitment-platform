import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { User, UserAvailability } from "./entities/User";
import { Skill } from "./entities/Skill";
import { Course } from "./entities/Course";
import { UserSkill } from "./entities/UserSkill";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

async function seed() {
  await AppDataSource.initialize();
  console.log("Seeding database...");

  const userRepo = AppDataSource.getRepository(User);
  const skillRepo = AppDataSource.getRepository(Skill);
  const courseRepo = AppDataSource.getRepository(Course);
  const userSkillRepo = AppDataSource.getRepository(UserSkill);

  await AppDataSource.manager.query(`SET FOREIGN_KEY_CHECKS = 0;`);
  await AppDataSource.manager.query(`DELETE FROM user_skill;`);
  await AppDataSource.manager.query(`DELETE FROM course_skill;`);
  await AppDataSource.manager.query(`DELETE FROM course;`);
  await AppDataSource.manager.query(`DELETE FROM skill;`);
  await AppDataSource.manager.query(`DELETE FROM user;`);
  await AppDataSource.manager.query(`SET FOREIGN_KEY_CHECKS = 1;`);

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // Create skills
  const skillNames = [
    "Python", "Problem Solving", "Basic Algorithms", "Java", "Data Structures", "Spring Boot",
    "HTML", "CSS", "JavaScript", "React", "Node.js", "SQL", "Database Design", "PostgreSQL",
    "C", "Process Management", "Linux", "System Programming", "Algorithms", "Graph Theory",
    "UML", "Agile", "Requirements Engineering", "Git", "Machine Learning Concepts", "Search Algorithms",
    "TCP/IP", "Routing", "Switching", "OSI Model", "Swift", "Kotlin", "iOS", "Android", "UI/UX Principles"
  ];
  const skills = skillNames.map(name => skillRepo.create({ skill_ID: uuidv4(), name }));
  await skillRepo.save(skills);
  const skillMap = Object.fromEntries(skills.map(skill => [skill.name, skill]));

  // Create users
  const userData = [
    { id: "u3", email: "sara@example.com", firstname: "Sara", lastname: "Lee", skills: ["Python", "Problem Solving"] },
    { id: "u4", email: "mike@example.com", firstname: "Mike", lastname: "Jones", skills: ["Java", "Data Structures"] },
    { id: "u5", email: "emma@example.com", firstname: "Emma", lastname: "White", skills: ["HTML", "CSS", "JavaScript"] },
    { id: "u6", email: "lucas@example.com", firstname: "Lucas", lastname: "Brown", skills: ["SQL", "Database Design"] },
    { id: "u7", email: "ava@example.com", firstname: "Ava", lastname: "Taylor", skills: ["Swift", "UI/UX Principles"] },
  ];

  const users = userData.map(u =>
    userRepo.create({
      user_ID: u.id,
      email: u.email,
      password: passwordHash,
      firstname: u.firstname,
      lastname: u.lastname,
      is_tutor: true,
      is_lecturer: false,
      is_admin: false,
      is_blocked: false,
      default_availability: UserAvailability.PART_TIME,
    })
  );
  await userRepo.save(users);
  const userMap = Object.fromEntries(users.map(u => [u.email, u]));

  // Create user skills
  const userSkills = userData.flatMap(user =>
    user.skills.map(skill =>
      userSkillRepo.create({
        user: userMap[user.email],
        skill: skillMap[skill],
      })
    )
  );
  await userSkillRepo.save(userSkills);

  // Create courses
  const courses = [
    { id: "c1", code: "COSC101", name: "Introduction To Programming", semester: "Fall 2025", role: "Tutor", skills: ["Python", "Problem Solving", "Basic Algorithms"] },
    { id: "c2", code: "COSC202", name: "Data Structures And Algorithms", semester: "Spring 2026", role: "Lab-Assistant", skills: ["Java", "Data Structures", "Time Complexity", "Algorithms"] },
    { id: "c3", code: "COSC303", name: "Web Development Fundamentals", semester: "Fall 2025", role: "Tutor", skills: ["HTML", "CSS", "JavaScript"] },
    { id: "c4", code: "COSC404", name: "Database Systems", semester: "Spring 2026", role: "Lab-Assistant", skills: ["SQL", "Database Design", "Normalization"] },
    { id: "c5", code: "COSC505", name: "Operating Systems Concepts", semester: "Fall 2025", role: "Tutor", skills: ["C", "Process Management", "Memory Management", "Linux"] },
    { id: "c6", code: "COSC601", name: "Advanced Algorithms", semester: "Fall 2025", role: "Lab-Assistant", skills: ["Algorithms", "Complexity Analysis", "Graph Theory"] },
    { id: "c7", code: "COSC211", name: "Software Engineering Principles", semester: "Spring 2026", role: "Tutor", skills: ["UML", "Agile", "Requirements Engineering", "Git"] },
    { id: "c8", code: "COSC410", name: "Introduction to AI", semester: "Fall 2025", role: "Lab-Assistant", skills: ["Python", "Machine Learning Concepts", "Search Algorithms"] },
    { id: "c9", code: "COSC151", name: "Network Fundamentals", semester: "Spring 2026", role: "Tutor", skills: ["TCP/IP", "Routing", "Switching", "OSI Model"] },
    { id: "c10", code: "COSC351", name: "Mobile Application Development", semester: "Fall 2025", role: "Lab-Assistant", skills: ["Swift", "Kotlin", "iOS", "Android", "UI/UX Principles"] },
  ].map(c =>
    courseRepo.create({
      course_ID: c.id,
      course_code: c.code,
      display_name: c.name,
      semester: c.semester,
      role_required: c.role as any,
      is_disabled: false,
      skills: c.skills.map(name => skillMap[name]).filter(Boolean),
      lecturer: users[0],
    })
  );
  await courseRepo.save(courses);

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

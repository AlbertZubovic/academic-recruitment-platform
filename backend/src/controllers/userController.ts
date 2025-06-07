// src/controllers/userController.ts

import { Request, Response } from "express";
import { validateOrReject } from "class-validator";
import { In } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Skill } from "../entities/Skill";
import { UserSkill } from "../entities/UserSkill";

export const updateCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { firstname, lastname, email, academic_credentials, default_skills } = req.body;

    // 1) Ensure required fields are present
    if (!firstname || !lastname || !email) {
      res.status(400).json({ message: "firstname, lastname, and email are required." });
      return;
    }

    // 2) Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Invalid email format." });
      return;
    }

    const userRepo = AppDataSource.getRepository(User);
    const skillRepo = AppDataSource.getRepository(Skill);
    const userSkillRepo = AppDataSource.getRepository(UserSkill);

    // 3) Fetch user
    const user = await userRepo.findOne({
      where: { user_ID: userId },
      relations: ["userSkills", "userSkills.skill"],
    });
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // 4) If user wants to change email, check uniqueness
    if (user.email !== email) {
      const existing = await userRepo.findOne({ where: { email } });
      if (existing) {
        res.status(400).json({ message: "Email already in use." });
        return;
      }
    }

    // 5) Update basic fields
    user.firstname = firstname;
    user.lastname = lastname;
    user.email = email;
    user.academic_credentials = academic_credentials ?? null;

    // 6) Validate updated user entity
    try {
      await validateOrReject(user);
    } catch (validationErrors: any) {
      const messages = validationErrors
        .map((ve: any) => Object.values(ve.constraints || {}).join(", "))
        .join("; ");
      res.status(400).json({ message: messages });
      return;
    }

    // 7) Save user
    await userRepo.save(user);

    // 8) Handle default_skills array if provided
    if (Array.isArray(default_skills)) {
      // a) Validate that each skill is non‐empty string
      const invalid = (default_skills as any[]).some(
        (s) => typeof s !== "string" || s.trim().length === 0
      );
      if (invalid) {
        res.status(400).json({ message: "default_skills must be an array of non-empty strings." });
        return;
      }

      // b) Find or create Skill entities for each name
      const skillNames: string[] = default_skills.map((s) => (s as string).trim());
      const existingSkills = await skillRepo.find({
        where: { name: In(skillNames) },
      });
      const existingNames = new Set(existingSkills.map((sk) => sk.name));
      const newNames = skillNames.filter((n) => !existingNames.has(n));

      const newSkillEntities = newNames.map((n) =>
        skillRepo.create({ skill_ID: uuidv4(), name: n })
      );
      await skillRepo.save(newSkillEntities);

      const allSkillEntities = [...existingSkills, ...newSkillEntities];

      // c) Delete all old UserSkill rows for this user
      await userSkillRepo.delete({ user: { user_ID: userId } });

      // d) Create new UserSkill rows
      const userSkillRows = allSkillEntities.map((skill) =>
        userSkillRepo.create({ user, skill })
      );
      await userSkillRepo.save(userSkillRows);
    }

    // 9) Return the updated user summary in the same shape as /api/auth/me
    res.status(200).json({
      id: user.user_ID,
      email: user.email,
      firstName: user.firstname,
      lastName: user.lastname,
      isLecturer: user.is_lecturer,
      isCandidate: user.is_candidate,
      isAdmin: user.is_admin,
      defaultSkills: user.userSkills.map((us) => us.skill.name),
      defaultAvailability: user.default_availability,
      academicCredentials: user.academic_credentials,
      pastRoles: user.pastRoles.map((pr) => ({
        courseCode: pr.courseCode,
        courseName: pr.courseName,
        role: pr.role,
        semester: pr.semester,
      })),
      created: user.created,
      isBlocked: user.is_blocked,
    });
  } catch (err) {
    console.error("[USER] updateCurrentUser error:", err);
    res.status(500).json({ message: "Failed to update user." });
  }
};

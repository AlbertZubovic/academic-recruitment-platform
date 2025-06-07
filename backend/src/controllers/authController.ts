// src/controllers/authController.ts

import { Request, Response } from "express";
import { validateOrReject } from "class-validator";
import { In } from "typeorm";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { UserSkill } from "../entities/UserSkill";
import { Skill } from "../entities/Skill";
import { hashPassword, comparePassword } from "../utils/hash";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import validator from "validator";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

export const signUp = async (req: Request, res: Response): Promise<void> => {
  const {
    email,
    password,
    confirmPassword,
    firstname,
    lastname,
    isCandidate,
    isLecturer,
    availability,
    skills,
  } = req.body;

  // 1) Validate email format
  if (!email || !validator.isEmail(email)) {
    res.status(400).json({ message: "Invalid email format." });
    return;
  }

  // 2) Validate password strength
  if (
    !password ||
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    res.status(400).json({
      message:
        "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, and a number.",
    });
    return;
  }

  // 3) Confirm passwords match
  if (password !== confirmPassword) {
    res.status(400).json({ message: "Passwords do not match." });
    return;
  }

  // 4) Validate firstname/lastname presence and length
  if (
    !firstname ||
    typeof firstname !== "string" ||
    firstname.trim().length === 0 ||
    firstname.length > 100
  ) {
    res.status(400).json({
      message: "First name is required and must be at most 100 characters.",
    });
    return;
  }
  if (
    !lastname ||
    typeof lastname !== "string" ||
    lastname.trim().length === 0 ||
    lastname.length > 100
  ) {
    res.status(400).json({
      message: "Last name is required and must be at most 100 characters.",
    });
    return;
  }

  // 5) At least one role must be selected
  if (!isCandidate && !isLecturer) {
    res
      .status(400)
      .json({ message: "Please select at least one role: Candidate or Lecturer." });
    return;
  }

  // 6) If candidate, must supply at least one skill
  if (isCandidate && (!Array.isArray(skills) || skills.length === 0)) {
    res
      .status(400)
      .json({ message: "At least one skill is required for Candidate role." });
    return;
  }

  try {
    const userRepo = AppDataSource.getRepository(User);
    const skillRepo = AppDataSource.getRepository(Skill);
    const userSkillRepo = AppDataSource.getRepository(UserSkill);

    // 7) Check for existing user
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      res.status(400).json({ message: "Email already in use." });
      return;
    }

    // 8) Hash password
    const hashed = await hashPassword(password);

    // 9) Create the User entity
    const user = userRepo.create({
      user_ID: uuidv4(),
      email,
      password: hashed,
      firstname,
      lastname,
      is_candidate: !!isCandidate,
      is_lecturer: !!isLecturer,
      is_admin: false,
      is_blocked: false,
      default_availability: isCandidate ? availability : null,
    });

    // 10) Validate via class validator
    await validateOrReject(user);

    // 11) Save user
    await userRepo.save(user);

    // 12) If candidate, create UserSkill rows
    if (isCandidate && skills.length > 0) {
      // 12a) Find existing Skill entities by name
      const existingSkills = await skillRepo.find({
        where: { name: In(skills as string[]) },
      });
      const existingNames = new Set(existingSkills.map((s) => s.name));
      // 12b) Create any new Skill entities for names that didn't exist
      const newNames = (skills as string[]).filter((n) => !existingNames.has(n));
      const newSkillEntities = newNames.map((n) =>
        skillRepo.create({ skill_ID: uuidv4(), name: n })
      );
      await skillRepo.save(newSkillEntities);

      // 12c) Combine existing and newly created
      const allSkillEntities = [...existingSkills, ...newSkillEntities];
      // 12d) Link UserSkill rows
      const userSkills = allSkillEntities.map((skill) =>
        userSkillRepo.create({ user, skill })
      );
      await userSkillRepo.save(userSkills);
    }

    // 13) Create JWT 
    const token = jwt.sign(
      {
        userId: user.user_ID,
        isCandidate: user.is_candidate,
        isLecturer: user.is_lecturer,
        isAdmin: user.is_admin,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // 14) Set a 7-day cookie
    res.cookie("token", token, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    // 15) Respond
    res.status(201).json({
      message: `Welcome ${user.firstname}`,
      user: {
        id: user.user_ID,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        isCandidate: user.is_candidate,
        isLecturer: user.is_lecturer,
        defaultAvailability: user.default_availability,
        created: user.created,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    if (Array.isArray(err)) {
      const messages = err
        .map((e) => Object.values(e.constraints || {}).join(", "))
        .join("; ");
      res.status(400).json({ message: messages });
      return;
    }
    res.status(500).json({ message: "Signup failed." });
  }
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
  // 1) Destructure stayLoggedIn from the request body
  const { email, password, stayLoggedIn } = req.body as {
    email: string;
    password: string;
    stayLoggedIn?: boolean;
  };

  // 2) Check for email/password presence
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required." });
    return;
  }

  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { email },
      relations: ["userSkills", "userSkills.skill"],
    });

    // 3) Verify user exists and password matches
    if (!user || !(await comparePassword(password, user.password))) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    // 4) Create JWT with expiration based on stayLoggedIn
    //    - If stayLoggedIn === true, expires in 7 days
    //    - Otherwise expires in 15 minutes
    const token = jwt.sign(
      {
        userId: user.user_ID,
        isCandidate: user.is_candidate,
        isLecturer: user.is_lecturer,
        isAdmin: user.is_admin,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: stayLoggedIn ? "7d" : "15m" }
    );

    // 5) Set the cookie accordingly:
    if (stayLoggedIn) {
      res.cookie("token", token, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    } else {
      res.cookie("token", token, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,
      });
    }

    // 6) Respond
    res.status(200).json({ message: `Welcome ${user.firstname}` });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Signin failed." });
  }
};

export const signOut = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.status(200).json({ message: "Logged out successfully." });
};

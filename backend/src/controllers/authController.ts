import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User, UserAvailability } from "../entities/User";
import { Skill } from "../entities/Skill";
import { UserSkill } from "../entities/UserSkill";
import { hashPassword, comparePassword } from "../utils/hash";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import validator from "validator";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// --- SIGNUP ---
export const signUp = async (req: Request, res: Response): Promise<void> => {
  const {
    email,
    password,
    confirmPassword,
    firstname,
    lastname,
    isTutor,
    isLecturer,
    availability,
    skills,
  } = req.body;

  const userRepo = AppDataSource.getRepository(User);
  const skillRepo = AppDataSource.getRepository(Skill);
  const userSkillRepo = AppDataSource.getRepository(UserSkill);

  if (!email || !validator.isEmail(email)) {
    res.status(400).json({ message: "Invalid email format." });
    return;
  }

  if (
    !password ||
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    res.status(400).json({
      message: "Password must be at least 8 characters, include an uppercase letter, a lowercase letter, and a number.",
    });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ message: "Passwords do not match." });
    return;
  }

  if (!firstname || !lastname) {
    res.status(400).json({ message: "First name and last name are required." });
    return;
  }

  if (!isTutor && !isLecturer) {
    res.status(400).json({ message: "Please select at least one role: Tutor or Lecturer." });
    return;
  }

  if (isTutor && (!skills || skills.length === 0)) {
    res.status(400).json({ message: "At least one skill is required for Tutor role." });
    return;
  }

  try {
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      res.status(400).json({ message: "Email already in use." });
      return;
    }

    const hashed = await hashPassword(password);

    const user = userRepo.create({
      user_ID: uuidv4(),
      email,
      password: hashed,
      firstname,
      lastname,
      is_tutor: !!isTutor,
      is_lecturer: !!isLecturer,
      is_admin: false,
      is_blocked: false,
      default_availability: isTutor ? availability : null,
    });

    await userRepo.save(user);

    if (isTutor && skills.length > 0) {
      const skillEntities = await skillRepo.findByIds(skills);
      const userSkills = skillEntities.map(skill =>
        userSkillRepo.create({ user, skill })
      );
      await userSkillRepo.save(userSkills);
    }

    const token = jwt.sign(
      {
        userId: user.user_ID,
        isTutor: user.is_tutor,
        isLecturer: user.is_lecturer,
        isAdmin: user.is_admin,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, COOKIE_OPTIONS);

    res.status(201).json({
      message: `Welcome ${user.firstname}`,
      user: {
        id: user.user_ID,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        isTutor: user.is_tutor,
        isLecturer: user.is_lecturer,
        defaultAvailability: user.default_availability,
        created: user.created,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed." });
  }
};

// --- SIGNIN ---
export const signIn = async (req: Request, res: Response): Promise<void> => {
  const { email, password, rememberMe } = req.body;
  const userRepo = AppDataSource.getRepository(User);

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required." });
    return;
  }

  try {
    const user = await userRepo.findOne({
      where: { email },
      relations: ["userSkills", "userSkills.skill"],
    });

    if (!user || !(await comparePassword(password, user.password))) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    const token = jwt.sign(
      {
        userId: user.user_ID,
        isTutor: user.is_tutor,
        isLecturer: user.is_lecturer,
        isAdmin: user.is_admin,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: rememberMe ? "7d" : "1h" }
    );

    res.cookie("token", token, {
      ...COOKIE_OPTIONS,
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000,
    });

    res.status(200).json({ message: `Welcome ${user.firstname}` });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Signin failed." });
  }
};

// --- SIGNOUT ---
export const signOut = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.status(200).json({ message: "Logged out successfully." });
};

// --- PROFILE ---
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const { userId } = (req as any).user;
  const repo = AppDataSource.getRepository(User);

  try {
    const user = await repo.findOne({
      where: { user_ID: userId },
      relations: ["userSkills", "userSkills.skill"],
    });

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.json({
      id: user.user_ID,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      isTutor: user.is_tutor,
      isLecturer: user.is_lecturer,
      defaultSkills: user.userSkills?.map(us => us.skill.name),
      defaultAvailability: user.default_availability,
      created: user.created,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Failed to fetch profile." });
  }
};

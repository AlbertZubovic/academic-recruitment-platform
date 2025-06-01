// backend/src/controllers/authController.ts

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { hashPassword, comparePassword } from "../utils/hash";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 1000,
};

export const signUp = async (req: Request, res: Response): Promise<void> => {
  const repo = AppDataSource.getRepository(User);
  const {
    email,
    password,
    firstname,
    lastname,
    is_tutor,
    is_lecturer,
    default_availability,
    default_skills,
  } = req.body;

  try {
    const existing = await repo.findOne({ where: { email } });
    if (existing) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    const hashed = await hashPassword(password);

    const user = repo.create({
      user_ID: uuidv4(),
      email,
      password: hashed,
      firstname,
      lastname,
      is_tutor: is_tutor || false,
      is_lecturer: is_lecturer || false,
      is_admin: false,
      is_blocked: false,
      default_availability: is_tutor ? default_availability : null,
      default_skills: is_tutor ? default_skills : null,
    });

    await repo.save(user);

    const token = jwt.sign({ userId: user.user_ID }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
  const repo = AppDataSource.getRepository(User);
  const { email, password } = req.body;

  try {
    const user = await repo.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ userId: user.user_ID }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(200).json({ message: `Welcome ${user.firstname}` });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Signin failed" });
  }
};

export const signOut = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.status(200).json({ message: "Logged out successfully" });
};

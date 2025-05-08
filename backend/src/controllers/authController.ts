import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { hashPassword, comparePassword } from "../utils/hash";
import { v4 as uuidv4 } from "uuid";

export const signUp = async (req: Request, res: Response): Promise<Response> => {
  const repo = AppDataSource.getRepository(User);
  const { email, password, firstname, lastname } = req.body;

  try {
    const existing = await repo.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const hashed = await hashPassword(password);

    const user = repo.create({
      user_ID: uuidv4(),
      email,
      password: hashed,
      firstname,
      lastname,
      is_admin: false,
      is_lecturer: false,
      is_tutor: false,
      is_blocked: false
    });

    await repo.save(user);
    return res.status(201).json({ message: "User created" });
  } catch (err) {
    return res.status(500).json({ message: "Signup failed" });
  }
};

export const signIn = async (req: Request, res: Response): Promise<Response> => {
  const repo = AppDataSource.getRepository(User);
  const { email, password } = req.body;

  try {
    const user = await repo.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await comparePassword(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    return res.status(200).json({ message: `Welcome ${user.firstname}`, user });
  } catch (err) {
    return res.status(500).json({ message: "Signin failed" });
  }
};

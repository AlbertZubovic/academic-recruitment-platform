import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { hashPassword, comparePassword } from "../utils/hash";
import { v4 as uuidv4 } from "uuid";

import jwt from "jsonwebtoken";

export const signUp = async (req: Request, res: Response): Promise<Response> => {
  console.log(req)
  const repo = AppDataSource.getRepository(User);
  const { 
    email, 
    password, 
    firstname, 
    lastname,
    is_tutor,
    is_lecturer,
    default_availability,
    default_skills 
  } = req.body;

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
      is_tutor: is_tutor || false,
      is_lecturer: is_lecturer || false,
      is_admin: false,
      is_blocked: false,
      default_availability: is_tutor ? default_availability : null,
      default_skills: is_tutor ? default_skills : null
    });

    await repo.save(user);
    
    const token = jwt.sign(
      { userId: user.user_ID },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );
    
    return res.status(201).json({ message: "User created", token });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Signup failed" });
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
  
      const token = jwt.sign(
        { userId: user.user_ID },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
  
      res.status(200).json({ 
        message: `Welcome ${user.firstname}`, 
        token 
      });
    } catch (err) {
      res.status(500).json({ message: "Signin failed" });
    }
  };

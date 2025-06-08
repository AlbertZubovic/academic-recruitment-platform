// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) {
    console.log("[AUTH] No token found in cookies.");
    res.status(401).json({ message: "Missing token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    
    // Check if user still exists and is not blocked
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { user_ID: decoded.userId } });
    
    if (!user) {
      console.log("[AUTH] User not found in database.");
      res.status(401).json({ message: "User not found" });
      return;
    }
    
    if (user.is_blocked) {
      console.log("[AUTH] User is blocked.");
      res.status(403).json({ message: "Account has been blocked. Please contact support." });
      return;
    }
    
    (req as any).user = decoded;
    next();
  } catch (err) {
    console.error("[AUTH] Token verification failed:", err);
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};

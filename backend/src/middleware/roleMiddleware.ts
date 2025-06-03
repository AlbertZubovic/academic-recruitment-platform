import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

export const authorizeTutor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      console.warn("[AUTHZ] Missing userId in request");
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { user_ID: userId } });

    console.log("[AUTHZ] Fetched user from DB:", user);

    if (!user) {
      console.warn(`[AUTHZ] User not found in DB: ${userId}`);
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.is_tutor) {
      console.warn(`[AUTHZ] User is not a tutor: ${userId}`);
      res.status(403).json({ message: "Access restricted to tutors only" });
      return;
    }

    console.log(`[AUTHZ] User ${userId} authorized as tutor.`);
    next();
  } catch (err) {
    console.error("[AUTHZ] Internal server error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

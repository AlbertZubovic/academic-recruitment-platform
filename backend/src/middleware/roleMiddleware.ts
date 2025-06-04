// src/middleware/roleMiddleware.ts

import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Course } from "../entities/Course";

export const authorizeCandidate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      console.warn("[AUTHZ] Missing userId in request");
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { user_ID: userId } });
    if (!user) {
      console.warn(`[AUTHZ] User not found in DB: ${userId}`);
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.is_candidate) {
      console.warn(`[AUTHZ] User is not a candidate: ${userId}`);
      res.status(403).json({ message: "Access restricted to candidates only" });
      return;
    }

    console.log(`[AUTHZ] User ${userId} authorized as candidate.`);
    next();
  } catch (err) {
    console.error("[AUTHZ] Internal server error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const authorizeLecturer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      console.warn("[AUTHZ] Missing userId in request");
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { user_ID: userId } });
    if (!user) {
      console.warn(`[AUTHZ] User not found in DB: ${userId}`);
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.is_lecturer) {
      console.warn(`[AUTHZ] User is not a lecturer: ${userId}`);
      res.status(403).json({ message: "Access restricted to lecturers only" });
      return;
    }

    console.log(`[AUTHZ] User ${userId} authorized as lecturer.`);
    next();
  } catch (err) {
    console.error("[AUTHZ] Internal server error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const authorizeAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      console.warn("[AUTHZ] Missing userId in request");
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { user_ID: userId } });
    if (!user) {
      console.warn(`[AUTHZ] User not found in DB: ${userId}`);
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.is_admin) {
      console.warn(`[AUTHZ] User is not an admin: ${userId}`);
      res.status(403).json({ message: "Access restricted to admins only" });
      return;
    }

    console.log(`[AUTHZ] User ${userId} authorized as admin.`);
    next();
  } catch (err) {
    console.error("[AUTHZ] Internal server error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const authorizeLecturerOfCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lecturerId = (req as any).user?.userId;
    if (!lecturerId) {
      console.warn("[AUTHZ] Missing userId in request");
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const { courseId } = req.params;
    if (!courseId) {
      res.status(400).json({ message: "Missing courseId parameter" });
      return;
    }

    const courseRepo = AppDataSource.getRepository(Course);
    const course = await courseRepo.findOne({
      where: { course_ID: courseId },
      relations: ["lecturer"],
    });
    if (!course) {
      console.warn(`[AUTHZ] Course not found: ${courseId}`);
      res.status(404).json({ message: "Course not found" });
      return;
    }

    if (course.lecturer.user_ID !== lecturerId) {
      console.warn(
        `[AUTHZ] User ${lecturerId} is not the lecturer of course ${courseId}`
      );
      res.status(403).json({ message: "Not authorized for this course" });
      return;
    }

    console.log(`[AUTHZ] Lecturer ${lecturerId} owns course ${courseId}.`);
    next();
  } catch (err) {
    console.error("[AUTHZ] authorizeLecturerOfCourse error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

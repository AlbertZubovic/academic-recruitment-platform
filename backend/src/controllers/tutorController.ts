import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Course } from "../entities/Course";
import { Application } from "../entities/Application";
import { Skill } from "../entities/Skill";
import { In } from "typeorm";
import { v4 as uuidv4 } from "uuid";

export const getTutorCourses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    console.log("[COURSES] Fetching courses for tutor:", userId);

    const courseRepo = AppDataSource.getRepository(Course);
    const applicationRepo = AppDataSource.getRepository(Application);

    const courses = await courseRepo.find({ relations: ["skills", "lecturer"] });
    console.log("[COURSES] Retrieved courses:", courses.length);

    const applications = await applicationRepo.find({
      where: { user: { user_ID: userId } },
      relations: ["course", "appliedSkills"],
    });
    console.log("[COURSES] Retrieved applications:", applications.length);

    const transformed = courses.map((course) => {
      const app = applications.find((a) => a.course.course_ID === course.course_ID);

      return {
        id: course.course_ID,
        name: course.display_name,
        courseCode: course.course_code,
        semester: course.semester,
        roleRequired: course.role_required,
        skills: course.skills.map((s) => s.name),
        hasApplied: !!app,
        application: app
          ? {
              appliedAvailability: app.applied_availability,
              appliedSkills: app.appliedSkills.map((s) => s.name),
            }
          : null,
      };
    });

    console.log("[COURSES] Transformed data ready to send.");
    res.json(transformed);
  } catch (err) {
    console.error("[COURSES] Error:", err);
    res.status(500).json({ message: "Failed to load courses" });
  }
};

export const applyToCourse = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id: courseId } = req.params;
    const { appliedAvailability, appliedSkills } = req.body;

    if (!appliedAvailability || !Array.isArray(appliedSkills)) {
      res.status(400).json({ message: "Availability and skills are required." });
      return;
    }

    const courseRepo = AppDataSource.getRepository(Course);
    const appRepo = AppDataSource.getRepository(Application);
    const skillRepo = AppDataSource.getRepository(Skill);

    const course = await courseRepo.findOne({ where: { course_ID: courseId } });
    if (!course) {
      res.status(404).json({ message: "Course not found." });
      return;
    }

    const existingApp = await appRepo.findOne({
      where: { user: { user_ID: userId }, course: { course_ID: courseId } },
    });

    if (existingApp) {
      res.status(400).json({ message: "You have already applied to this course." });
      return;
    }

    const skillEntities = await skillRepo.findBy({ name: In(appliedSkills) });
    if (skillEntities.length !== appliedSkills.length) {
      res.status(400).json({ message: "One or more skills not found in database." });
      return;
    }

    const application = appRepo.create({
      application_ID: uuidv4(),
      user: { user_ID: userId },
      course: { course_ID: courseId },
      applied_availability: appliedAvailability,
      role: course.role_required,
      accepted: false,
      ranking: null,
      lecturer_comment: null,
      appliedSkills: skillEntities,
    });

    await appRepo.save(application);

    res.status(201).json({ message: "Application submitted successfully." });
  } catch (err) {
    console.error("Apply to course error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

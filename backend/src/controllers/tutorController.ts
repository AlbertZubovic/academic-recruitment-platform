// src/controllers/tutorController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Course } from "../entities/Course";
import { Application } from "../entities/Application";
import { AppliedSkill } from "../entities/AppliedSkill";
import { Skill } from "../entities/Skill";
import { v4 as uuidv4 } from "uuid";
import { In } from "typeorm";

export const getAllCoursesForTutors = async (req: Request, res: Response) => {
  try {
    const courseRepo = AppDataSource.getRepository(Course);
    const applicationRepo = AppDataSource.getRepository(Application);

    const userId = (req as any).user.id;

    const courses = await courseRepo.find({ relations: ["skills", "lecturer"] });
    const applications = await applicationRepo.find({
      where: { user: { user_ID: userId } },
      relations: ["course", "appliedSkills"],
    });

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

    res.json(transformed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load courses" });
  }
};

export const applyToCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { appliedSkills, appliedAvailability } = req.body;
    const userId = (req as any).user.id;

    const applicationRepo = AppDataSource.getRepository(Application);
    const skillRepo = AppDataSource.getRepository(Skill);

    const existingApp = await applicationRepo.findOne({
      where: { user: { user_ID: userId }, course: { course_ID: courseId } },
    });

    if (existingApp) {
      res.status(400).json({ message: "Already applied to this course" });
      return;
    }

    const application = applicationRepo.create({
      application_ID: uuidv4(),
      user: { user_ID: userId },
      course: { course_ID: courseId },
      applied_availability: appliedAvailability,
      accepted: false,
      ranking: null,
      role: "Tutor",
      lecturer_comment: null,
    });

    if (appliedSkills && appliedSkills.length) {
      const skillEntities = await skillRepo.findBy({ skill_ID: In(appliedSkills) });
      application.appliedSkills = skillEntities;
    }

    await applicationRepo.save(application);

    res.json({ message: "Application submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to apply" });
  }
};

export const updateApplication = async (req: Request, res: Response) => {
  try {
    const { courseId, userId } = req.params;
    const { appliedSkills, appliedAvailability } = req.body;

    const applicationRepo = AppDataSource.getRepository(Application);
    const skillRepo = AppDataSource.getRepository(Skill);

    const application = await applicationRepo.findOne({
      where: { user: { user_ID: userId }, course: { course_ID: courseId } },
      relations: ["appliedSkills"],
    });

    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    if (appliedAvailability) application.applied_availability = appliedAvailability;

    if (appliedSkills) {
      const skillEntities = await skillRepo.findBy({ skill_ID: In(appliedSkills) });
      application.appliedSkills = skillEntities;
    }

    await applicationRepo.save(application);
    res.json({ message: "Application updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update application" });
  }
};

export const deleteApplication = async (req: Request, res: Response) => {
  try {
    const { courseId, userId } = req.params;

    const applicationRepo = AppDataSource.getRepository(Application);
    const application = await applicationRepo.findOne({
      where: { user: { user_ID: userId }, course: { course_ID: courseId } },
    });

    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    await applicationRepo.remove(application);
    res.json({ message: "Application deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete application" });
  }
};

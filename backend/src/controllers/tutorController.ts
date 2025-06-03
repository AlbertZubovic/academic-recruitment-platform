import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Course } from "../entities/Course";
import { Application } from "../entities/Application";
import { Skill } from "../entities/Skill";
import { AppliedSkill } from "../entities/AppliedSkill";
import { v4 as uuidv4 } from "uuid";

export const getTutorCourses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    console.log("[COURSES] Fetching courses for tutor:", userId);

    const courseRepo = AppDataSource.getRepository(Course);
    const applicationRepo = AppDataSource.getRepository(Application);

    const courses = await courseRepo.find({
      relations: ["skills", "lecturer"],
    });
    console.log("[COURSES] Retrieved courses:", courses.length);

    const applications = await applicationRepo.find({
      where: { user: { user_ID: userId } },
      relations: ["course", "appliedSkills", "appliedSkills.skill"],
    });
    console.log("[COURSES] Retrieved applications:", applications.length);

    const transformed = courses.map((course) => {
      const app = applications.find(
        (a) => a.course.course_ID === course.course_ID
      );

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
              appliedSkills: app.appliedSkills.map((as) => as.skill?.name).filter(Boolean),
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
    const appliedSkillRepo = AppDataSource.getRepository(AppliedSkill);

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

    const skillEntities = await Promise.all(
      appliedSkills.map(async (name) => {
        let skill = await skillRepo.findOne({ where: { name } });
        if (!skill) {
          skill = skillRepo.create({ name });
          await skillRepo.save(skill);
        }
        return skill;
      })
    );

    const application = appRepo.create({
      application_ID: uuidv4(),
      user: { user_ID: userId },
      course: { course_ID: courseId },
      applied_availability: appliedAvailability,
      role: course.role_required,
      accepted: false,
      ranking: null,
      lecturer_comment: null,
    });

    await appRepo.save(application);

    const appliedSkillEntities = skillEntities.map((skill) =>
      appliedSkillRepo.create({
        application,
        skill,
        application_ID: application.application_ID,
        skill_ID: skill.skill_ID,
      })
    );

    await appliedSkillRepo.save(appliedSkillEntities);

    res.status(201).json({ message: "Application submitted successfully." });
  } catch (err) {
    console.error("Apply to course error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateApplicationDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id: courseId } = req.params;
    const { appliedAvailability, appliedSkills } = req.body;

    if (!appliedAvailability || !Array.isArray(appliedSkills)) {
      return res.status(400).json({ message: "Availability and skills are required." });
    }

    const appRepo = AppDataSource.getRepository(Application);
    const skillRepo = AppDataSource.getRepository(Skill);
    const appliedSkillRepo = AppDataSource.getRepository(AppliedSkill);

    const existingApp = await appRepo.findOne({
      where: { user: { user_ID: userId }, course: { course_ID: courseId } },
      relations: ["appliedSkills", "course", "user"],
    });

    if (!existingApp) {
      return res.status(404).json({ message: "Application not found." });
    }

    await appliedSkillRepo.delete({ application_ID: existingApp.application_ID });

    const skillEntities = await Promise.all(
      appliedSkills.map(async (name: string) => {
        let skill = await skillRepo.findOne({ where: { name } });
        if (!skill) {
          skill = skillRepo.create({ name });
          await skillRepo.save(skill);
        }
        return skill;
      })
    );

    const appliedSkillEntities = skillEntities.map((skill) =>
      appliedSkillRepo.create({
        application: existingApp,
        skill,
        application_ID: existingApp.application_ID,
        skill_ID: skill.skill_ID,
      })
    );

    existingApp.applied_availability = appliedAvailability;

    await appRepo.save(existingApp);
    await appliedSkillRepo.save(appliedSkillEntities);

    res.json({ message: "Application updated successfully." });
  } catch (err) {
    console.error("Update application error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

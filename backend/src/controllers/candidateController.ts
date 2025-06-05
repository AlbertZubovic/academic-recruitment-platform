// src/controllers/candidateController.ts

import { Request, Response } from "express";
import { validateOrReject } from "class-validator";
import { In } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { AppDataSource } from "../data-source";
import {
  Application,
  ApplicationAvailability,
  ApplicationRole,
} from "../entities/Application";
import { Course } from "../entities/Course";
import { Skill } from "../entities/Skill";
import { AppliedSkill } from "../entities/AppliedSkill";

/**
 * GET /api/candidates/courses
 * Returns all courses, indicating if the logged-in candidate has applied.
 */
export const getCandidateCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const candidateId = (req as any).user.userId;

    const courseRepo = AppDataSource.getRepository(Course);
    const applicationRepo = AppDataSource.getRepository(Application);

    // 1) Fetch all courses (with skills & lecturer)
    const courses = await courseRepo.find({
      relations: ["skills", "lecturer"],
    });

    // 2) Fetch this candidate’s applications
    const applications = await applicationRepo.find({
      where: { user: { user_ID: candidateId } },
      relations: ["course", "appliedSkills", "appliedSkills.skill"],
    });

    // 3) Build response
    const transformed = courses.map((course) => {
      const app = applications.find(
        (a) => a.course.course_ID === course.course_ID
      );

      return {
        id: course.course_ID,
        name: course.display_name,
        courseCode: course.course_code,
        semester: course.semester,
        rolesAvailable: course.roles_available, // simple-array column
        skills: course.skills.map((s) => s.name),
        hasApplied: !!app,
        application: app
          ? {
              appliedAvailability: app.applied_availability,
              appliedSkills: app.appliedSkills
                .map((as) => as.skill?.name)
                .filter(Boolean),
              status:
                app.accepted === null
                  ? "Pending"
                  : app.accepted
                  ? "Approved"
                  : "Rejected",
            }
          : null,
      };
    });

    res.json(transformed);
    return;
  } catch (err) {
    console.error("[CANDIDATE] getCandidateCourses error:", err);
    res.status(500).json({ message: "Failed to load courses" });
    return;
  }
};

/**
 * POST /api/candidates/courses/:id/apply
 * Body:
 *   - appliedAvailability: "Full-Time" | "Part-Time"
 *   - appliedSkills: string[]            (skill names)
 *   - role:       "Tutor" | "Lab-Assistant"
 */
export const applyToCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const candidateId = (req as any).user.userId;
    const { id: courseId } = req.params;
    const { appliedAvailability, appliedSkills, role } = req.body;

    // 1) Validate presence
    if (
      !appliedAvailability ||
      !Array.isArray(appliedSkills) ||
      typeof role !== "string"
    ) {
      res.status(400).json({
        message: "appliedAvailability, appliedSkills, and role are required.",
      });
      return;
    }

    // 2) Validate appliedAvailability
    if (!Object.values(ApplicationAvailability).includes(appliedAvailability)) {
      res.status(400).json({
        message: "Invalid availability—must be 'Full-Time' or 'Part-Time'.",
      });
      return;
    }

    // 3) Validate role
    if (!Object.values(ApplicationRole).includes(role as ApplicationRole)) {
      res.status(400).json({
        message: "Invalid role—must be 'Tutor' or 'Lab-Assistant'.",
      });
      return;
    }

    // 4) Validate appliedSkills array
    if (
      appliedSkills.some((s: any) => typeof s !== "string" || s.trim().length === 0)
    ) {
      res.status(400).json({
        message: "appliedSkills must be an array of non-empty strings.",
      });
      return;
    }

    const courseRepo = AppDataSource.getRepository(Course);
    const appRepo = AppDataSource.getRepository(Application);
    const skillRepo = AppDataSource.getRepository(Skill);
    const appliedSkillRepo = AppDataSource.getRepository(AppliedSkill);

    // 5) Fetch course + verify it exists
    //      ↓ No relations load for roles_available; it's a simple-array
    const course = await courseRepo.findOne({
      where: { course_ID: courseId },
    });
    if (!course) {
      res.status(404).json({ message: "Course not found." });
      return;
    }

    // 6) Ensure chosen role is offered by this course
    if (!course.roles_available.includes(role as ApplicationRole)) {
      res.status(400).json({
        message: `Role "${role}" not offered by this course.`,
      });
      return;
    }

    // 7) Prevent duplicate application
    const existingApp = await appRepo.findOne({
      where: { user: { user_ID: candidateId }, course: { course_ID: courseId } },
    });
    if (existingApp) {
      res.status(400).json({
        message: "You have already applied to this course.",
      });
      return;
    }

    // 8) Lookup or create skill entities in one pass
    const existingSkills = await skillRepo.find({
      where: { name: In(appliedSkills as string[]) },
    });
    const existingNames = new Set(existingSkills.map((s) => s.name));
    const newNames = (appliedSkills as string[]).filter(
      (n) => !existingNames.has(n)
    );

    const newSkillEntities = newNames.map((n) =>
      skillRepo.create({ skill_ID: uuidv4(), name: n })
    );
    await skillRepo.save(newSkillEntities);

    const allSkillEntities = [...existingSkills, ...newSkillEntities];

    // 9) Transactionally create Application + AppliedSkill rows
    await AppDataSource.manager.transaction(async (txMgr) => {
      const application = txMgr.create(Application, {
        application_ID: uuidv4(),
        user: { user_ID: candidateId },
        course: { course_ID: courseId },
        applied_availability: appliedAvailability as ApplicationAvailability,
        role: role as ApplicationRole,
        accepted: null, // Pending
        ranking: null,
        lecturer_comment: null,
      });

      // 10) Validate Application entity
      await validateOrReject(application);

      await txMgr.save(application);

      const appliedSkillEntities = allSkillEntities.map((skill) =>
        txMgr.create(AppliedSkill, {
          application_ID: application.application_ID,
          skill_ID: skill.skill_ID,
          application,
          skill,
        })
      );
      await txMgr.save(appliedSkillEntities);
    });

    res.status(201).json({
      message: "Application submitted successfully (pending).",
    });
    return;
  } catch (err) {
    console.error("[CANDIDATE] applyToCourse error:", err);
    if (Array.isArray(err)) {
      const messages = err
        .map((e) => Object.values(e.constraints || {}).join(", "))
        .join("; ");
      res.status(400).json({ message: messages });
      return;
    }
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

/**
 * PATCH /api/candidates/courses/:id/applications/me
 * Body may include:
 *   - appliedAvailability?: "Full-Time" | "Part-Time"
 *   - appliedSkills?: string[]
 */
export const updateApplicationDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const candidateId = (req as any).user.userId;
    const { id: courseId } = req.params;
    const { appliedAvailability, appliedSkills } = req.body;

    const appRepo = AppDataSource.getRepository(Application);
    const skillRepo = AppDataSource.getRepository(Skill);
    const appliedSkillRepo = AppDataSource.getRepository(AppliedSkill);

    // 1) Fetch existing application
    const application = await appRepo.findOne({
      where: {
        user: { user_ID: candidateId },
        course: { course_ID: courseId },
      },
      relations: ["appliedSkills", "course", "user"],
    });
    if (!application) {
      res.status(404).json({ message: "Application not found." });
      return;
    }

    // 2) Update availability if provided
    if (appliedAvailability !== undefined) {
      if (
        !Object.values(ApplicationAvailability).includes(
          appliedAvailability
        )
      ) {
        res.status(400).json({
          message: "Invalid availability—must be 'Full-Time' or 'Part-Time'.",
        });
        return;
      }
      application.applied_availability = appliedAvailability as ApplicationAvailability;
    }

    // 3) Update skills if provided
    if (Array.isArray(appliedSkills)) {
      if (
        appliedSkills.some(
          (s: any) => typeof s !== "string" || s.trim().length === 0
        )
      ) {
        res.status(400).json({
          message: "appliedSkills must be an array of non-empty strings.",
        });
        return;
      }

      // a) Find or create skill entities
      const existingSkills = await skillRepo.find({
        where: { name: In(appliedSkills as string[]) },
      });
      const existingNames = new Set(existingSkills.map((s) => s.name));
      const newNames = (appliedSkills as string[]).filter(
        (n) => !existingNames.has(n)
      );

      const newSkillEntities = newNames.map((n) =>
        skillRepo.create({ skill_ID: uuidv4(), name: n })
      );
      await skillRepo.save(newSkillEntities);

      const allSkillEntities = [...existingSkills, ...newSkillEntities];

      // b) Delete old AppliedSkill rows
      await appliedSkillRepo.delete({
        application_ID: application.application_ID,
      });

      // c) Create and save new AppliedSkill rows
      const newAppliedSkills = allSkillEntities.map((skill) =>
        appliedSkillRepo.create({
          application_ID: application.application_ID,
          skill_ID: skill.skill_ID,
          application,
          skill,
        })
      );
      await appliedSkillRepo.save(newAppliedSkills);
    }

    // 4) Validate updated application
    await validateOrReject(application);

    // 5) Save
    await appRepo.save(application);

    res.json({ message: "Application updated successfully." });
    return;
  } catch (err) {
    console.error("[CANDIDATE] updateApplicationDetails error:", err);
    if (Array.isArray(err)) {
      const messages = err
        .map((e) => Object.values(e.constraints || {}).join(", "))
        .join("; ");
      res.status(400).json({ message: messages });
      return;
    }
    res.status(500).json({ message: "Failed to update application" });
    return;
  }
};

/**
 * GET /api/candidates/applications
 * Returns all applications for the logged-in candidate.
 */
export const getMyApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const candidateId = (req as any).user.userId;
    const appRepo = AppDataSource.getRepository(Application);

    const applications = await appRepo.find({
      where: { user: { user_ID: candidateId } },
      relations: ["course", "appliedSkills", "appliedSkills.skill"],
    });

    const response = applications.map((app) => ({
      applicationId: app.application_ID,
      courseId: app.course.course_ID,
      courseCode: app.course.course_code,
      courseName: app.course.display_name,
      role: app.role,
      availability: app.applied_availability,
      skills: app.appliedSkills.map((as) => as.skill.name),
      status:
        app.accepted === null
          ? "Pending"
          : app.accepted
          ? "Approved"
          : "Rejected",
      lecturerComment: app.lecturer_comment,
    }));

    res.json(response);
    return;
  } catch (err) {
    console.error("[CANDIDATE] getMyApplications error:", err);
    res.status(500).json({ message: "Server error." });
    return;
  }
};

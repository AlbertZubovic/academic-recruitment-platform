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
 */
export const getCandidateCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const candidateId = (req as any).user.userId;
    console.log("[CANDIDATE] getCandidateCourses: candidateId =", candidateId);

    const courseRepo = AppDataSource.getRepository(Course);
    const applicationRepo = AppDataSource.getRepository(Application);

    const courses = await courseRepo.find({
      relations: ["skills", "lecturer"],
    });
    const applications = await applicationRepo.find({
      where: { user: { user_ID: candidateId } },
      relations: ["course", "appliedSkills", "appliedSkills.skill"],
    });

    const transformed = courses.map((course) => {
      const myApps = applications.filter(
        (a) => a.course.course_ID === course.course_ID
      );
      const appliedRoles = myApps.map((a) => a.role);
      const applicationDetails = myApps.map((a) => ({
        role: a.role,
        appliedAvailability: a.applied_availability,
        appliedSkills: a.appliedSkills.map((as) => as.skill.name),
        status:
          a.accepted === null
            ? "Pending"
            : a.accepted
            ? "Approved"
            : "Rejected",
        lecturerComment: a.lecturer_comment,
        ranking: a.ranking,
      }));
      return {
        id: course.course_ID,
        name: course.display_name,
        courseCode: course.course_code,
        semester: course.semester,
        rolesAvailable: course.roles_available,
        skills: course.skills.map((s) => s.name),
        appliedRoles,
        applicationDetails,
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
 */
export const applyToCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const candidateId = (req as any).user.userId;
    const { id: courseId } = req.params;
    const { appliedAvailability, appliedSkills, role } = req.body;

    console.log(
      "[CANDIDATE] applyToCourse: candidateId, courseId, role, ",
      candidateId,
      courseId,
      role
    );

    if (
      !appliedAvailability ||
      !Array.isArray(appliedSkills) ||
      typeof role !== "string"
    ) {
      console.log("[CANDIDATE] applyToCourse: validation failed - missing fields");
      res.status(400).json({
        message: "appliedAvailability, appliedSkills, and role are required.",
      });
      return;
    }

    if (!Object.values(ApplicationAvailability).includes(appliedAvailability)) {
      console.log("[CANDIDATE] applyToCourse: invalid availability:", appliedAvailability);
      res.status(400).json({
        message: "Invalid availability—must be 'Full-Time' or 'Part-Time'.",
      });
      return;
    }

    if (!Object.values(ApplicationRole).includes(role as ApplicationRole)) {
      console.log("[CANDIDATE] applyToCourse: invalid role:", role);
      res.status(400).json({
        message: "Invalid role—must be 'Tutor' or 'Lab-Assistant'.",
      });
      return;
    }

    if (
      appliedSkills.some((s: any) => typeof s !== "string" || s.trim().length === 0)
    ) {
      console.log("[CANDIDATE] applyToCourse: invalid skills array:", appliedSkills);
      res.status(400).json({
        message: "appliedSkills must be an array of non-empty strings.",
      });
      return;
    }

    const courseRepo = AppDataSource.getRepository(Course);
    const appRepo = AppDataSource.getRepository(Application);
    const skillRepo = AppDataSource.getRepository(Skill);

    const course = await courseRepo.findOne({
      where: { course_ID: courseId },
    });
    if (!course) {
      console.log("[CANDIDATE] applyToCourse: course not found:", courseId);
      res.status(404).json({ message: "Course not found." });
      return;
    }

    if (!course.roles_available.includes(role as ApplicationRole)) {
      console.log(
        "[CANDIDATE] applyToCourse: role not offered by course:",
        role
      );
      res.status(400).json({
        message: `Role "${role}" not offered by this course.`,
      });
      return;
    }

    const existingApp = await appRepo.findOne({
      where: {
        user: { user_ID: candidateId },
        course: { course_ID: courseId },
        role: role as ApplicationRole,
      },
    });
    if (existingApp) {
      console.log("[CANDIDATE] applyToCourse: duplicate application detected");
      res.status(400).json({
        message: `You have already applied as ${role} for this course.`,
      });
      return;
    }

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
    if (newSkillEntities.length > 0) {
      console.log("[CANDIDATE] applyToCourse: creating new skills:", newNames);
      await skillRepo.save(newSkillEntities);
    }

    const allSkillEntities = [...existingSkills, ...newSkillEntities];

    await AppDataSource.manager.transaction(async (txMgr) => {
      const application = txMgr.create(Application, {
        application_ID: uuidv4(),
        user: { user_ID: candidateId },
        course: { course_ID: courseId },
        applied_availability: appliedAvailability as ApplicationAvailability,
        role: role as ApplicationRole,
        accepted: null,
        ranking: null,
        lecturer_comment: null,
      });

      console.log("[CANDIDATE] applyToCourse: saving new application:", application);
      await validateOrReject(application);
      await txMgr.save(application);

      const appliedSkillRepo = txMgr.getRepository(AppliedSkill);
      const appliedSkillEntities = allSkillEntities.map((skill) =>
        appliedSkillRepo.create({
          application_ID: application.application_ID,
          skill_ID: skill.skill_ID,
          application,
          skill,
        })
      );
      console.log(
        "[CANDIDATE] applyToCourse: saving applied skills:",
        appliedSkillEntities
      );
      await appliedSkillRepo.save(appliedSkillEntities);
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
      console.log("[CANDIDATE] applyToCourse: validation array error:", messages);
      res.status(400).json({ message: messages });
      return;
    }
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

/**
 * PATCH /api/candidates/courses/:id/applications/me
 * Body must include:
 *   - role: ApplicationRole
 * May also include:
 *   - appliedAvailability?: ApplicationAvailability
 *   - appliedSkills?: string[]
 */
export const updateApplicationDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const candidateId = (req as any).user.userId;
    const { id: courseId } = req.params;
    const { role, appliedAvailability, appliedSkills } = req.body;

    console.log(
      "[CANDIDATE] updateApplicationDetails: candidateId, courseId, role, ",
      candidateId,
      courseId,
      role,
      "appliedAvailability:",
      appliedAvailability,
      "appliedSkills:",
      appliedSkills
    );

    if (!role || typeof role !== "string") {
      console.log("[CANDIDATE] updateApplicationDetails: missing role");
      res.status(400).json({ message: "Role is required to update." });
      return;
    }
    if (!Object.values(ApplicationRole).includes(role as ApplicationRole)) {
      console.log("[CANDIDATE] updateApplicationDetails: invalid role:", role);
      res.status(400).json({
        message: "Invalid role—must be 'Tutor' or 'Lab-Assistant'.",
      });
      return;
    }

    const appRepo = AppDataSource.getRepository(Application);
    const skillRepo = AppDataSource.getRepository(Skill);

    const application = await appRepo.findOne({
      where: {
        user: { user_ID: candidateId },
        course: { course_ID: courseId },
        role: role as ApplicationRole,
      },
      relations: ["appliedSkills", "course", "user"],
    });
    if (!application) {
      console.log(
        "[CANDIDATE] updateApplicationDetails: application not found"
      );
      res.status(404).json({ message: "Application not found." });
      return;
    }
    console.log("[CANDIDATE] updateApplicationDetails: found application:", application);

    if (application.accepted !== null) {
      console.log(
        "[CANDIDATE] updateApplicationDetails: application already decided"
      );
      res.status(403).json({
        message: "Only pending applications can be edited.",
      });
      return;
    }

    if (appliedAvailability !== undefined) {
      if (
        !Object.values(ApplicationAvailability).includes(
          appliedAvailability
        )
      ) {
        console.log(
          "[CANDIDATE] updateApplicationDetails: invalid availability:",
          appliedAvailability
        );
        res.status(400).json({
          message: "Invalid availability—must be 'Full-Time' or 'Part-Time'.",
        });
        return;
      }
      application.applied_availability = appliedAvailability as ApplicationAvailability;
      console.log(
        "[CANDIDATE] updateApplicationDetails: set applied_availability:",
        application.applied_availability
      );
    }

    if (Array.isArray(appliedSkills)) {
      if (
        appliedSkills.some(
          (s: any) => typeof s !== "string" || s.trim().length === 0
        )
      ) {
        console.log(
          "[CANDIDATE] updateApplicationDetails: invalid skills array:",
          appliedSkills
        );
        res.status(400).json({
          message: "appliedSkills must be an array of non-empty strings.",
        });
        return;
      }

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
      if (newSkillEntities.length > 0) {
        console.log(
          "[CANDIDATE] updateApplicationDetails: creating new skills:",
          newNames
        );
        await skillRepo.save(newSkillEntities);
      }
      const allSkillEntities = [...existingSkills, ...newSkillEntities];

      console.log(
        "[CANDIDATE] updateApplicationDetails: deleting old AppliedSkill rows"
      );
      await AppDataSource.createQueryBuilder()
        .delete()
        .from(AppliedSkill)
        .where("application_ID = :appId", { appId: application.application_ID })
        .execute();

      const appliedSkillRepo = AppDataSource.getRepository(AppliedSkill);
      const newAppliedSkills = allSkillEntities.map((skill) =>
        appliedSkillRepo.create({
          application_ID: application.application_ID,
          skill_ID: skill.skill_ID,
          application,
          skill,
        })
      );
      console.log(
        "[CANDIDATE] updateApplicationDetails: saving new AppliedSkill rows:",
        newAppliedSkills
      );
      await appliedSkillRepo.save(newAppliedSkills);
    }

    await validateOrReject(application);
    console.log("[CANDIDATE] updateApplicationDetails: saving application");
    await appRepo.save(application);

    res.json({ message: "Application updated successfully." });
    return;
  } catch (err) {
    console.error("[CANDIDATE] updateApplicationDetails error:", err);
    if (Array.isArray(err)) {
      const messages = err
        .map((e) => Object.values(e.constraints || {}).join(", "))
        .join("; ");
      console.log("[CANDIDATE] updateApplicationDetails: validation error:", messages);
      res.status(400).json({ message: messages });
      return;
    }
    res.status(500).json({ message: "Failed to update application" });
    return;
  }
};

/**
 * DELETE /api/candidates/courses/:id/applications/me
 */
export const withdrawApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const candidateId = (req as any).user.userId;
    const { id: courseId } = req.params;
    console.log("[CANDIDATE] withdrawApplication: candidateId, courseId =", candidateId, courseId);

    const deleteResult = await AppDataSource.createQueryBuilder()
      .delete()
      .from(Application)
      .where("user_ID = :uid AND course_ID = :cid", {
        uid: candidateId,
        cid: courseId,
      })
      .execute();

    console.log("[CANDIDATE] withdrawApplication: deleteResult =", deleteResult);
    res.status(200).json({ message: "Application(s) withdrawn successfully." });
    return;
  } catch (err) {
    console.error("[CANDIDATE] withdrawApplication error:", err);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

/**
 * GET /api/candidates/applications
 */
export const getMyApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const candidateId = (req as any).user.userId;
    console.log("[CANDIDATE] getMyApplications: candidateId =", candidateId);

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

    console.log("[CANDIDATE] getMyApplications: response =", response);
    res.json(response);
    return;
  } catch (err) {
    console.error("[CANDIDATE] getMyApplications error:", err);
    res.status(500).json({ message: "Server error." });
    return;
  }
};

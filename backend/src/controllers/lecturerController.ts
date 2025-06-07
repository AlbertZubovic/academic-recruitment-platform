// src/controllers/lecturerController.ts

import { Request, Response } from "express";
import { validateOrReject } from "class-validator";
import { AppDataSource } from "../data-source";
import { Course } from "../entities/Course";
import { Application } from "../entities/Application";

/**
 * GET /api/lecturer/courses/:courseId/applications
 * Query parameters (optional):
 *   - name:        partial match on candidate’s firstname or lastname
 *   - role:        "Tutor" or "Lab-Assistant"
 *   - availability:"Full-Time" or "Part-Time"
 *   - skills:      comma-separated (e.g. "React,SQL")
 */
export const getApplicationsForCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const lecturerId = (req as any).user.userId;
    const { courseId } = req.params;
    const { name, role, availability, skills } = req.query;

    const courseRepo = AppDataSource.getRepository(Course);
    const applicationRepo = AppDataSource.getRepository(Application);

    // 1) Verify course exists & belongs to lecturer
    const course = await courseRepo.findOne({
      where: { course_ID: courseId },
      relations: ["lecturer"],
    });
    if (!course) {
      res.status(404).json({ message: "Course not found." });
      return;
    }
    if (course.lecturer.user_ID !== lecturerId) {
      res
        .status(403)
        .json({ message: "Not authorized to view these applications." });
      return;
    }

    // 2) Build query builder
    let qb = applicationRepo
      .createQueryBuilder("application")
      .leftJoinAndSelect("application.user", "user")
      .leftJoinAndSelect("application.appliedSkills", "appliedSkill")
      .leftJoinAndSelect("appliedSkill.skill", "skill")
      .where("application.course = :courseId", { courseId });

    // 3) Filter by name if provided
    if (name && typeof name === "string") {
      qb = qb.andWhere(
        "(user.firstname LIKE :name OR user.lastname LIKE :name)",
        { name: `%${name}%` }
      );
    }

    // 4) Filter by role if provided
    if (role && typeof role === "string") {
      if (!["Tutor", "Lab-Assistant"].includes(role)) {
        res.status(400).json({ message: "Invalid role filter." });
        return;
      }
      qb = qb.andWhere("application.role = :role", { role });
    }

    // 5) Filter by availability if provided
    if (availability && typeof availability === "string") {
      if (!["Full-Time", "Part-Time"].includes(availability)) {
        res.status(400).json({ message: "Invalid availability filter." });
        return;
      }
      qb = qb.andWhere(
        "application.applied_availability = :availability",
        { availability }
      );
    }

    // 6) Filter by skills if provided
    if (skills && typeof skills === "string") {
      const skillList = (skills as string).split(",").map((s) => s.trim());
      if (skillList.some((s) => s.length === 0)) {
        res.status(400).json({ message: "Invalid skills filter format." });
        return;
      }
      qb = qb.andWhere("skill.name IN (:...skillList)", { skillList });
    }

    // 7) Execute
    const applications = await qb.getMany();

    // 8) Transform response
    const response = applications.map((app) => ({
      applicationId: app.application_ID,
      userId: app.user.user_ID,
      name: `${app.user.firstname} ${app.user.lastname}`,
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
      ranking: app.ranking,
    }));

    res.json(response);
    return;
  } catch (err) {
    console.error("[LECTURER] getApplicationsForCourse error:", err);
    res.status(500).json({ message: "Server error." });
    return;
  }
};

/**
 * PATCH /api/lecturer/courses/:courseId/applications/:applicationId
 * Body may include:
 *   - accepted?: boolean | null
 *   - lecturerComment?: string
 *   - ranking?: number
 */
export const updateApplicationStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const lecturerId = (req as any).user.userId;
    const { courseId, applicationId } = req.params;
    const { accepted, lecturerComment, ranking } = req.body;

    const appRepo = AppDataSource.getRepository(Application);

    // 1) Fetch application + its course + lecturer
    const application = await appRepo.findOne({
      where: { application_ID: applicationId },
      relations: ["course", "course.lecturer"],
    });
    if (!application) {
      res.status(404).json({ message: "Application not found." });
      return;
    }
    if (application.course.course_ID !== courseId) {
      res
        .status(400)
        .json({ message: "Application does not belong to that course." });
      return;
    }
    if (application.course.lecturer.user_ID !== lecturerId) {
      res
        .status(403)
        .json({ message: "Not authorized to update this application." });
      return;
    }

    // 2) Validate accepted if provided
    if (
      accepted !== undefined &&
      accepted !== true &&
      accepted !== false &&
      accepted !== null
    ) {
      res
        .status(400)
        .json({ message: "Accepted must be true, false, or null." });
      return;
    }

    // 3) Validate lecturerComment length if provided
    if (
      lecturerComment !== undefined &&
      (typeof lecturerComment !== "string" || lecturerComment.length > 255)
    ) {
      res.status(400).json({
        message: "lecturerComment must be a string of at most 255 characters.",
      });
      return;
    }

    // 4) Validate ranking if provided
    if (ranking !== undefined) {
      const numRank = Number(ranking);
      if (!Number.isInteger(numRank) || numRank < 1) {
        res
          .status(400)
          .json({ message: "ranking must be a positive integer." });
        return;
      }
      application.ranking = numRank;
    }

    // 5) Apply accepted / lecturerComment if provided
    if (accepted !== undefined) {
      application.accepted = accepted;
    }
    if (typeof lecturerComment === "string") {
      application.lecturer_comment = lecturerComment;
    }

    // 6) Validate updated application via class-validator
    await validateOrReject(application);

    // 7) Save
    await appRepo.save(application);

    res.json({ message: "Application updated." });
    return;
  } catch (err) {
    console.error("[LECTURER] updateApplicationStatus error:", err);
    if (Array.isArray(err)) {
      const messages = err
        .map((e) => Object.values(e.constraints || {}).join(", "))
        .join("; ");
      res.status(400).json({ message: messages });
      return;
    }
    res.status(500).json({ message: "Server error." });
    return;
  }
};

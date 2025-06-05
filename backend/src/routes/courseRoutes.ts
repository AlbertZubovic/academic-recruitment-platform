// src/routes/courseRoutes.ts

import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Course } from "../entities/Course";
import { Application } from "../entities/Application";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// GET /api/courses – list all courses with embedded application info
router.get("/", authenticate, async (req: Request, res: Response) => {
  const courseRepo = AppDataSource.getRepository(Course);
  const applicationRepo = AppDataSource.getRepository(Application);

  try {
    const currentUserId = (req as any).user.userId;

    // 1) Fetch all courses
    const courses = await courseRepo.find({
      relations: ["lecturer", "lecturer.userSkills", "lecturer.userSkills.skill"],
    });

    // 2) Fetch all applications, but ORDER BY ranking
    const applications = await applicationRepo
      .createQueryBuilder("application")
      .leftJoinAndSelect("application.user", "user")
      .leftJoinAndSelect("application.course", "course")
      .leftJoinAndSelect("application.appliedSkills", "appliedSkill")
      .leftJoinAndSelect("appliedSkill.skill", "skill")
      .orderBy("application.ranking", "ASC")
      .getMany();

    // 3) Transform for frontend
    const transformedCourses = courses.map((course) => {
      // 3a) Current user’s own application
      const userApp = applications.find(
        (app) =>
          app.course.course_ID === course.course_ID &&
          app.user.user_ID === currentUserId
      );

      // 3b) All applications for this course
      const allCourseApplicants = applications
        .filter((app) => app.course.course_ID === course.course_ID)
        .map((app) => ({
          applicationId: app.application_ID,
          userId: app.user.user_ID,
          name: `${app.user.firstname} ${app.user.lastname}`,
          role: app.role,
          appliedAvailability: app.applied_availability,
          appliedSkills:
            app.appliedSkills?.map((as) => as.skill.name).filter(Boolean) || [],
          status:
            app.accepted === null
              ? "Pending"
              : app.accepted
              ? "Approved"
              : "Rejected",
          lecturerComment: app.lecturer_comment,
          ranking: app.ranking,
        }));

      // 3c) Structure for current user’s application
      const currentUserApplication = userApp
        ? {
            applicationId: userApp.application_ID,
            appliedAvailability: userApp.applied_availability,
            appliedSkills:
              userApp.appliedSkills
                ?.map((as) => as.skill.name)
                .filter(Boolean) || [],
            status:
              userApp.accepted === null
                ? "Pending"
                : userApp.accepted
                ? "Approved"
                : "Rejected",
          }
        : null;

      return {
        id: course.course_ID,
        courseCode: course.course_code,
        name: course.display_name,
        semester: course.semester,
        rolesAvailable: course.roles_available,
        isDisabled: course.is_disabled,
        lecturer: course.lecturer
          ? {
              id: course.lecturer.user_ID,
              email: course.lecturer.email,
              firstName: course.lecturer.firstname,
              lastName: course.lecturer.lastname,
              isLecturer: course.lecturer.is_lecturer,
              isCandidate: course.lecturer.is_candidate,
              isAdmin: course.lecturer.is_admin,
              defaultSkills:
                course.lecturer.userSkills
                  ?.map((us) => us.skill.name)
                  .filter(Boolean) || [],
              defaultAvailability: course.lecturer.default_availability,
              academicCredentials: course.lecturer.academic_credentials,
              created: course.lecturer.created,
              isBlocked: course.lecturer.is_blocked,
            }
          : null,
        applicants: allCourseApplicants,
        application: currentUserApplication,
      };
    });

    res.json(transformedCourses);
    return;
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ message: "Server error" });
    return;
  }
});

export default router;

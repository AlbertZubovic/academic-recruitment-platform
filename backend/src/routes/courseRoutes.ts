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

    const courses = await courseRepo.find({
      relations: ["lecturer", "lecturer.userSkills", "lecturer.userSkills.skill"],
    });

    const applications = await applicationRepo.find({
      relations: ["user", "course", "appliedSkills", "appliedSkills.skill"],
    });

    const transformedCourses = courses.map((course) => {
      const userApp = applications.find(
        (app) =>
          app.course.course_ID === course.course_ID &&
          app.user.user_ID === currentUserId
      );

      const allCourseApplicants = applications
        .filter((app) => app.course.course_ID === course.course_ID)
        .map((app) => ({
          userId: app.user.user_ID,
          appliedAvailability: app.applied_availability,
          appliedSkills:
            app.appliedSkills?.map((as) => as.skill?.name).filter(Boolean) || [],
          status:
            app.accepted === null
              ? "Pending"
              : app.accepted
              ? "Approved"
              : "Rejected",
          role: app.role,
          lecturerComment: app.lecturer_comment,
        }));

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
                  ?.map((us) => us.skill?.name || "")
                  .filter(Boolean) || [],
              defaultAvailability: course.lecturer.default_availability,
              academicCredentials: course.lecturer.academic_credentials,
              created: course.lecturer.created,
              isBlocked: course.lecturer.is_blocked,
            }
          : null,
        applicants: allCourseApplicants,
        application: userApp
          ? {
              appliedAvailability: userApp.applied_availability,
              appliedSkills: userApp.appliedSkills
                ?.map((as) => as.skill?.name)
                .filter(Boolean),
              status:
                userApp.accepted === null
                  ? "Pending"
                  : userApp.accepted
                  ? "Approved"
                  : "Rejected",
            }
          : null,
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

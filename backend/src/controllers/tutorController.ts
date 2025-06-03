import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Course } from "../entities/Course";
import { Application } from "../entities/Application";

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

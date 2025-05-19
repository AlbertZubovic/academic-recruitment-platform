// backend/src/routes/courseRoutes.ts

import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Course } from "../entities/Course";
import { Application } from "../entities/Application";
import { AppliedSkill } from "../entities/AppliedSkill";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Get all courses
router.get("/", authenticate, async (req: Request, res: Response): Promise<void> => {
  const courseRepo = AppDataSource.getRepository(Course);
  const applicationRepo = AppDataSource.getRepository(Application);
  const appliedSkillRepo = AppDataSource.getRepository(AppliedSkill);
  
  try {
    // Get all courses with lecturer relation
    const courses = await courseRepo.find({
      relations: ["lecturer"]
    });

    // Get all applications with user relation
    const applications = await applicationRepo.find({
      relations: ["user", "course"]
    });

    // Get all applied skills with relations
    const appliedSkills = await appliedSkillRepo.find({
      relations: ["application", "skill"]
    });
    
    // Transform to match frontend format
    const transformedCourses = courses.map(course => ({
      id: course.course_ID,
      courseCode: course.course_code,
      name: course.display_name,
      semester: course.semester,
      lecturer: course.lecturer ? {
        id: course.lecturer.user_ID,
        email: course.lecturer.email,
        firstName: course.lecturer.firstname,
        lastName: course.lecturer.lastname,
        isLecturer: course.lecturer.is_lecturer,
        isTutor: course.lecturer.is_tutor,
        isAdmin: course.lecturer.is_admin,
        defaultSkills: course.lecturer.default_skills,
        defaultAvailability: course.lecturer.default_availability,
        academicCredentials: course.lecturer.academic_credentials,
        created: course.lecturer.created,
        isBlocked: course.lecturer.is_blocked
      } : null,
      roleRequired: course.role_required,
      isDisabled: course.is_disabled,
      // Filter applications for this course and include their skills
      applicants: applications
        .filter(app => app.course.course_ID === course.course_ID)
        .map(app => {
          // Get skills for this application
          const skills = appliedSkills
            .filter(as => as.application.application_ID === app.application_ID)
            .map(as => as.skill.name);

          return {
            userId: app.user.user_ID,
            appliedAvailability: app.applied_availability,
            appliedSkills: skills,
            accepted: app.accepted,
            ranking: app.ranking,
            role: app.role,
            lecturerComment: app.lecturer_comment
          };
        })
    }));
    
    res.json(transformedCourses);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
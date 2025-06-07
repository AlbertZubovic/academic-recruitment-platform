import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  authorizeLecturer,
  authorizeLecturerOfCourse,
} from "../middleware/roleMiddleware";
import {
  getApplicationsForCourse,
  updateApplicationStatus,
} from "../controllers/lecturerController";

const router = Router();

// GET /api/lecturer/courses/:courseId/applications – list applicants for a course
router.get(
  "/courses/:courseId/applications",
  authenticate,
  authorizeLecturer,
  authorizeLecturerOfCourse,
  getApplicationsForCourse
);

// PATCH /api/lecturer/courses/:courseId/applications/:applicationId – approve/reject
router.patch(
  "/courses/:courseId/applications/:applicationId",
  authenticate,
  authorizeLecturer,
  authorizeLecturerOfCourse,
  updateApplicationStatus
);

export default router;

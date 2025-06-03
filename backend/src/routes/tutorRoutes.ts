import { Router } from "express";
import { getAllCoursesForTutors, applyToCourse, updateApplication, deleteApplication } from "../controllers/tutorController";
import { authenticate } from "../middleware/authMiddleware";
import { authorizeTutor } from "../middleware/roleMiddleware";

const router = Router();

router.use('/', authenticate, authorizeTutor);

router.get("/courses", getAllCoursesForTutors);
router.post("/courses/:courseId/apply", applyToCourse);
router.patch("/courses/:courseId/applications/:userId", updateApplication);
router.delete("/courses/:courseId/applications/:userId", deleteApplication);

export default router;

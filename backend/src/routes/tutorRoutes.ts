import { Router } from "express";
import { getTutorCourses } from "../controllers/tutorController";
import { authenticate } from "../middleware/authMiddleware";
import { authorizeTutor } from "../middleware/roleMiddleware";

const router = Router();

router.get("/courses", authenticate, authorizeTutor, getTutorCourses);

export default router;

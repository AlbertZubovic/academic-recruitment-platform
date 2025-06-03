import { Router } from "express";
import { getTutorCourses, applyToCourse } from "../controllers/tutorController";
import { updateApplicationDetails } from "../controllers/updateApplicationDetailsController";
import { authenticate } from "../middleware/authMiddleware";
import { authorizeTutor } from "../middleware/roleMiddleware";

const router = Router();

router.get("/courses", authenticate, authorizeTutor, getTutorCourses);
router.post("/courses/:id/apply", authenticate, authorizeTutor, applyToCourse);
router.patch("/courses/:id/applications/me", authenticate, authorizeTutor, updateApplicationDetails);

export default router;

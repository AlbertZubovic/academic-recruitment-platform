// backend/src/routes/applicationRoutes.ts

import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Application } from "../entities/Application";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/selected", authenticate, async (req: Request, res: Response): Promise<void> => {
  const repo = AppDataSource.getRepository(Application);
  
  try {
    const applications = await repo.find({
      where: { accepted: true },
      relations: ["user", "course"]
    });
    
    // Transform to match frontend format
    const selectedApplicants = applications.map(app => ({
      courseId: app.course.course_code,
      userId: app.user.user_ID
    }));
    
    res.json(selectedApplicants);
  } catch (err) {
    console.error("Error fetching selected applicants:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Select (accept) an applicant for a course
router.post("/:courseId/select/:userId", authenticate, async (req: Request, res: Response): Promise<void> => {
  const repo = AppDataSource.getRepository(Application);
  
  try {
    const { courseId, userId } = req.params;
    
    const application = await repo.findOne({
      where: {
        course: { course_code: courseId },
        user: { user_ID: userId }
      },
      relations: ["course", "user"]
    });
    
    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }
    
    application.accepted = true;
    await repo.save(application);
    
    res.json({ message: "Applicant selected successfully" });
  } catch (err) {
    console.error("Error selecting applicant:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove selection (unaccept)
router.delete("/:courseId/select/:userId", authenticate, async (req: Request, res: Response): Promise<void> => {
  const repo = AppDataSource.getRepository(Application);
  
  try {
    const { courseId, userId } = req.params;
    
    const application = await repo.findOne({
      where: {
        course: { course_code: courseId },
        user: { user_ID: userId }
      },
      relations: ["course", "user"]
    });
    
    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }
    
    application.accepted = false;
    await repo.save(application);
    
    res.json({ message: "Applicant deselected successfully" });
  } catch (err) {
    console.error("Error deselecting applicant:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
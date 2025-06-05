// src/routes/userRoutes.ts

import { Router } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { authenticate } from "../middleware/authMiddleware";
import { updateCurrentUser } from "../controllers/userController";

const router = Router();

// GET /api/users/candidates – list all users flagged as candidates
router.get("/candidates", authenticate, async (req, res) => {
  const repo = AppDataSource.getRepository(User);
  try {
    const candidates = await repo.find({
      where: { is_candidate: true, is_lecturer: false },
      relations: [
        "userSkills",
        "userSkills.skill",
        "pastRoles",
      ],
      order: { lastname: "ASC", firstname: "ASC" },
    });

    const transformed = candidates.map((user) => ({
      id: user.user_ID,
      email: user.email,
      firstName: user.firstname,
      lastName: user.lastname,
      isLecturer: user.is_lecturer,
      isCandidate: user.is_candidate,
      isAdmin: user.is_admin,
      defaultSkills: user.userSkills?.map((us) => us.skill.name) || [],
      defaultAvailability: user.default_availability,
      academicCredentials: user.academic_credentials,
      created: user.created,
      isBlocked: user.is_blocked,
      pastRoles: user.pastRoles.map((pr) => ({
        id: pr.id,
        courseCode: pr.courseCode,
        courseName: pr.courseName,
        role: pr.role,
        semester: pr.semester,
      })),
    }));

    res.json(transformed);
    return;
  } catch (err) {
    console.error("Error fetching candidates:", err);
    res.status(500).json({ message: "Server error" });
    return;
  }
});

// ─── UPDATE current user ───
// PUT /api/users/me
router.put("/me", authenticate, updateCurrentUser);

export default router;

import { Router } from "express";
import { signUp, signIn, signOut } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

const router = Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/logout", signOut);

router.get("/me", authenticate, async (req, res) => {
  const repo = AppDataSource.getRepository(User);
  const { userId } = (req as any).user;

  try {
    const user = await repo.findOne({
      where: { user_ID: userId },
      relations: ["userSkills", "userSkills.skill"],
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const transformedUser = {
      id: user.user_ID,
      email: user.email,
      firstName: user.firstname,
      lastName: user.lastname,
      isLecturer: user.is_lecturer,
      isTutor: user.is_tutor,
      isAdmin: user.is_admin,
      defaultSkills: user.userSkills?.map(us => us.skill.name),
      defaultAvailability: user.default_availability,
      academicCredentials: user.academic_credentials,
      created: user.created,
      isBlocked: user.is_blocked,
    };

    res.json(transformedUser);
  } catch (err) {
    console.error("Error fetching /me:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

export default router;

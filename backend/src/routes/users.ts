// backend/routes/users.ts

import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

// Get all tutors (non-lecturer users)
router.get("/tutors", authenticate, async (req, res) => {
  const repo = AppDataSource.getRepository(User);
  try {
    const tutors = await repo.find({
      where: {
        is_tutor: true,
        is_lecturer: false,
      },
      order: {
        lastname: "ASC",
        firstname: "ASC",
      },
    });

    // Transform to camelCase for frontend
    const transformed = tutors.map((user) => ({
      id: user.user_ID,
      email: user.email,
      firstName: user.firstname,
      lastName: user.lastname,
      isLecturer: user.is_lecturer,
      isTutor: user.is_tutor,
      isAdmin: user.is_admin,
      defaultSkills: user.default_skills,
      defaultAvailability: user.default_availability,
      academicCredentials: user.academic_credentials,
      created: user.created,
      isBlocked: user.is_blocked,
    }));

    res.json(transformed);
  } catch (err) {
    console.error("Error fetching tutors:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/me", authenticate, async (req: Request, res: Response): Promise<void> => {
  const userRepository = AppDataSource.getRepository(User);
  const { userId } = (req as any).user;

  const {
    firstname,
    lastname,
    email,
    academic_credentials,
    default_skills,
    default_availability,
  } = req.body;

  try {
    const userToUpdate = await userRepository.findOne({ where: { user_ID: userId } });

    if (!userToUpdate) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (firstname !== undefined) userToUpdate.firstname = firstname;
    if (lastname !== undefined) userToUpdate.lastname = lastname;
    if (email !== undefined) userToUpdate.email = email;
    if (academic_credentials !== undefined) userToUpdate.academic_credentials = academic_credentials;
    if (default_skills !== undefined) userToUpdate.default_skills = default_skills;
    if (default_availability !== undefined) userToUpdate.default_availability = default_availability;

    await userRepository.save(userToUpdate);

    res.json({
      id: userToUpdate.user_ID,
      email: userToUpdate.email,
      firstName: userToUpdate.firstname,
      lastName: userToUpdate.lastname,
      isLecturer: userToUpdate.is_lecturer,
      isTutor: userToUpdate.is_tutor,
      isAdmin: userToUpdate.is_admin,
      defaultSkills: userToUpdate.default_skills,
      defaultAvailability: userToUpdate.default_availability,
      academicCredentials: userToUpdate.academic_credentials,
      created: userToUpdate.created,
      isBlocked: userToUpdate.is_blocked,
    });

  } catch (err: any) {
    console.error("Error updating user:", err);
    if (err.code === '23505') {
      res.status(409).json({ message: "Email already in use." });
      return;
    }
    res.status(500).json({ message: "Server error while updating user" });
  }
});


export default router;
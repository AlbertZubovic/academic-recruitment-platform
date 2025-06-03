import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Skill } from "../entities/Skill";
import { UserSkill } from "../entities/UserSkill";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/tutors", authenticate, async (req, res) => {
  const repo = AppDataSource.getRepository(User);
  try {
    const tutors = await repo.find({
      where: {
        is_tutor: true,
        is_lecturer: false,
      },
      relations: ["userSkills", "userSkills.skill"],
      order: {
        lastname: "ASC",
        firstname: "ASC",
      },
    });

    const transformed = tutors.map((user) => ({
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
    }));

    res.json(transformed);
  } catch (err) {
    console.error("Error fetching tutors:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/me", authenticate, async (req: Request, res: Response): Promise<void> => {
  const userRepository = AppDataSource.getRepository(User);
  const skillRepository = AppDataSource.getRepository(Skill);
  const userSkillRepository = AppDataSource.getRepository(UserSkill);
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
    const userToUpdate = await userRepository.findOne({
      where: { user_ID: userId },
      relations: ["userSkills", "userSkills.skill"],
    });

    if (!userToUpdate) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (firstname !== undefined) userToUpdate.firstname = firstname;
    if (lastname !== undefined) userToUpdate.lastname = lastname;
    if (email !== undefined) userToUpdate.email = email;
    if (academic_credentials !== undefined) userToUpdate.academic_credentials = academic_credentials;
    if (default_availability !== undefined) userToUpdate.default_availability = default_availability;

    if (Array.isArray(default_skills)) {
      await userSkillRepository.delete({ user: userToUpdate });

      const skills = await skillRepository.findByIds(default_skills);
      const newUserSkills = skills.map(skill =>
        userSkillRepository.create({ user: userToUpdate, skill })
      );
      await userSkillRepository.save(newUserSkills);
    }

    await userRepository.save(userToUpdate);

    const refreshedUser = await userRepository.findOne({
      where: { user_ID: userId },
      relations: ["userSkills", "userSkills.skill"],
    });

    res.json({
      id: refreshedUser!.user_ID,
      email: refreshedUser!.email,
      firstName: refreshedUser!.firstname,
      lastName: refreshedUser!.lastname,
      isLecturer: refreshedUser!.is_lecturer,
      isTutor: refreshedUser!.is_tutor,
      isAdmin: refreshedUser!.is_admin,
      defaultSkills: refreshedUser!.userSkills?.map(us => us.skill.name),
      defaultAvailability: refreshedUser!.default_availability,
      academicCredentials: refreshedUser!.academic_credentials,
      created: refreshedUser!.created,
      isBlocked: refreshedUser!.is_blocked,
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

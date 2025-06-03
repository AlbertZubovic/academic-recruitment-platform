import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Application } from "../entities/Application";
import { Skill } from "../entities/Skill";
import { AppliedSkill } from "../entities/AppliedSkill";

export const updateApplicationDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id: courseId } = req.params;
    const { appliedAvailability, appliedSkills } = req.body;

    const appRepo = AppDataSource.getRepository(Application);
    const skillRepo = AppDataSource.getRepository(Skill);
    const appliedSkillRepo = AppDataSource.getRepository(AppliedSkill);

    const application = await appRepo.findOne({
      where: {
        user: { user_ID: userId },
        course: { course_ID: courseId },
      },
      relations: ["appliedSkills"],
    });

    if (!application) {
      res.status(404).json({ message: "Application not found." });
      return;
    }

    if (appliedAvailability) {
      application.applied_availability = appliedAvailability;
    }

    if (Array.isArray(appliedSkills)) {
      const skillEntities = await Promise.all(
        appliedSkills.map(async (name: string) => {
          let skill = await skillRepo.findOne({ where: { name } });
          if (!skill) {
            skill = skillRepo.create({ name });
            await skillRepo.save(skill);
          }
          return skill;
        })
      );

      await appliedSkillRepo.delete({ application_ID: application.application_ID });

      const newAppliedSkills = skillEntities.map((skill) =>
        appliedSkillRepo.create({
          application_ID: application.application_ID,
          skill_ID: skill.skill_ID,
          application,
          skill,
        })
      );

      await appliedSkillRepo.save(newAppliedSkills);
    }

    await appRepo.save(application);

    res.json({ message: "Application updated successfully." });
  } catch (err) {
    console.error("Update application error:", err);
    res.status(500).json({ message: "Failed to update application" });
  }
};

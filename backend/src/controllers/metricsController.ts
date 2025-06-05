// src/controllers/metricsController.ts

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Application } from "../entities/Application";

/**
 * GET /api/metrics/availability
 * Returns counts of Full-Time vs Part-Time applications, with `count` as a number.
 */
export const getAvailabilityDistribution = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const appRepo = AppDataSource.getRepository(Application);

    // Step 1: Run the same grouping query
    const raw = await appRepo
      .createQueryBuilder("application")
      .select("application.applied_availability", "availability")
      .addSelect("COUNT(*)", "count")
      .groupBy("application.applied_availability")
      .getRawMany<{
        availability: string;
        count:       string;
      }>();

    // Step 2: Convert `count` from string → number
    const result = raw.map((row) => ({
      availability: row.availability,
      count:        parseInt(row.count, 10),
    }));

    // Step 3: Send the new array back
    res.json(result);
    return;
  } catch (err) {
    console.error("[METRICS] getAvailabilityDistribution error:", err);
    res.status(500).json({ message: "Server error." });
    return;
  }
};

/**
 * GET /api/metrics/selection-counts
 * Returns, for each user who’s been accepted, how many times they were selected,
 * with `selectedCount` as a number.
 */
export const getSelectionCounts = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const appRepo = AppDataSource.getRepository(Application);

    // Step 1: Run the same grouping query
    const raw = await appRepo
      .createQueryBuilder("application")
      .innerJoin("application.user", "user")
      .select("user.user_ID", "userId")
      .addSelect("user.firstname", "firstName")
      .addSelect("user.lastname", "lastName")
      .addSelect("COUNT(application.application_ID)", "selectedCount")
      .where("application.accepted = true")
      .groupBy("user.user_ID")
      .addGroupBy("user.firstname")
      .addGroupBy("user.lastname")
      .getRawMany<{
        userId:        string;
        firstName:     string;
        lastName:      string;
        selectedCount: string;
      }>();

    // Step 2: Convert `selectedCount` from string → number
    const result = raw.map((row) => ({
      userId:        row.userId,
      firstName:     row.firstName,
      lastName:      row.lastName,
      selectedCount: parseInt(row.selectedCount, 10),
    }));

    // Step 3: Send the new array back
    res.json(result);
    return;
  } catch (err) {
    console.error("[METRICS] getSelectionCounts error:", err);
    res.status(500).json({ message: "Server error." });
    return;
  }
};

/**
 * GET /api/metrics/common-skills
 * Returns counts of how often each skill appears among accepted applications,
 * with `count` as a number.
 */
export const getCommonSkillsAmongSelected = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // Step 1: Run the same grouping query
    const raw = await AppDataSource.createQueryBuilder()
      .select("skill.name", "skillName")
      .addSelect("COUNT(*)", "count")
      .from("applied_skill", "appliedSkill")
      .innerJoin(
        "application",
        "app",
        "appliedSkill.application_ID = app.application_ID"
      )
      .innerJoin("skill", "skill", "appliedSkill.skill_ID = skill.skill_ID")
      .where("app.accepted = true")
      .groupBy("skill.name")
      .orderBy("count", "DESC")
      .getRawMany<{
        skillName: string;
        count:     string;
      }>();

    // Step 2: Convert count from string → number
    const result = raw.map((row) => ({
      skillName: row.skillName,
      count:     parseInt(row.count, 10),
    }));

    // Step 3: Send the new array back
    res.json(result);
    return;
  } catch (err) {
    console.error(
      "[METRICS] getCommonSkillsAmongSelected error:",
      err
    );
    res.status(500).json({ message: "Server error." });
    return;
  }
};

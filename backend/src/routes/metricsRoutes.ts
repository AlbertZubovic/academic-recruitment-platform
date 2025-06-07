import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  getAvailabilityDistribution,
  getSelectionCounts,
  getCommonSkillsAmongSelected,
} from "../controllers/metricsController";

const router = Router();

// GET /api/metrics/availability – bar data for availability
router.get("/availability", authenticate, getAvailabilityDistribution);

// GET /api/metrics/selection-counts – how often each user was selected
router.get("/selection-counts", authenticate, getSelectionCounts);

// GET /api/metrics/common-skills – most common skills among selected
router.get("/common-skills", authenticate, getCommonSkillsAmongSelected);

export default router;

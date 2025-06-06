// src/routes/candidateRoutes.ts

import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { authorizeCandidate } from "../middleware/roleMiddleware";
import {
  getCandidateCourses,
  applyToCourse,
  updateApplicationDetails,
  getMyApplications,
  withdrawApplication,
  reapplyWithdrawnApplication,
} from "../controllers/candidateController";

const router = Router();

// GET /api/candidates/courses – list all courses for candidate
router.get(
  "/courses",
  authenticate,
  authorizeCandidate,
  getCandidateCourses
);

// POST /api/candidates/courses/:id/apply – candidate applies to course
router.post(
  "/courses/:id/apply",
  authenticate,
  authorizeCandidate,
  applyToCourse
);

// PATCH /api/candidates/courses/:id/applications/me – update own application
router.patch(
  "/courses/:id/applications/me",
  authenticate,
  authorizeCandidate,
  updateApplicationDetails
);

// ─── ADD THIS DELETE ROUTE ───
// DELETE /api/candidates/courses/:id/applications/me – withdraw the application
router.delete(
  "/courses/:id/applications/me",
  authenticate,
  authorizeCandidate,
  withdrawApplication
);

// Add this route after the existing DELETE route
router.patch(
  "/courses/:id/applications/me/reapply",
  authenticate,
  authorizeCandidate,
  reapplyWithdrawnApplication
);

// GET /api/candidates/applications – list candidate's applications
router.get(
  "/applications",
  authenticate,
  authorizeCandidate,
  getMyApplications
);

export default router;

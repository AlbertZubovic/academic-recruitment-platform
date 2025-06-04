// src/types/apiRequests.ts

import {
  ApplicationAvailability,
  ApplicationRole,
} from "./enums";

/**
 * Payload for sign‐in or sign‐up endpoints.
 */
export interface AuthCredentials {
  email: string;
  password: string;
  confirmPassword?: string;    // only for signup
  rememberMe?: boolean;         // only for signin
}

/**
 * Payload when a candidate applies to a course (POST /api/candidates/courses/:id/apply).
 */
export interface ApplyToCourseRequest {
  appliedAvailability: ApplicationAvailability;
  appliedSkills: string[];
  role: ApplicationRole;
}

/**
 * Payload when a candidate updates their application (PATCH /api/candidates/courses/:id/applications/me).
 */
export interface UpdateApplicationRequest {
  appliedAvailability?: ApplicationAvailability;
  appliedSkills?: string[];
}

/**
 * Payload when a lecturer updates an application’s status (PATCH /api/lecturer/courses/:courseId/applications/:applicationId).
 */
export interface UpdateApplicationStatusRequest {
  accepted: boolean;
  lecturerComment?: string;
}

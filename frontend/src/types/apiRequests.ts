// src/types/apiRequests.ts

import { ApplicationAvailability } from "./enums";

/**
 * Payload for sign‐in endpoint.
 */
export interface SignInPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
  stayLoggedIn?: boolean;
}

/**
 * Payload for sign‐up endpoint.
 */
export interface SignUpPayload {
  email: string;
  password: string;
  confirmPassword: string;
  firstname: string;
  lastname: string;
  isCandidate: boolean;
  isLecturer: boolean;
  availability: ApplicationAvailability;
  skills: string[];
}

/**
 * Payload when a candidate applies to a course.
 */
export interface ApplyToCourseRequest {
  appliedAvailability: ApplicationAvailability;
  appliedSkills: string[];
  role: string;
}

/**
 * Payload when a candidate updates their application.
 */
export interface UpdateApplicationRequest {
  appliedAvailability?: ApplicationAvailability;
  appliedSkills?: string[];
}

/**
 * Payload when a lecturer updates an application’s status.
 */
export interface UpdateApplicationStatusRequest {
  accepted?: boolean | null;
  lecturerComment?: string;
  ranking?: number;
}

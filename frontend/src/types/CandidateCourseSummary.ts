// src/types/CandidateCourseSummary.ts

import {
  ApplicationAvailability,
  ApplicationRole,
  ApplicationStatus,
} from "./enums";

/**
 * Response shape for GET /api/candidates/courses:
 * each course plus whether the current candidate has applied.
 */
export interface CandidateCourseSummary {
  id: string;                         // course_ID (UUID)
  name: string;                       // display_name
  courseCode: string;                 // e.g. "COSC101"
  semester: string;                   // e.g. "Fall 2025"
  rolesAvailable: ApplicationRole[];  // e.g. ["Tutor"]
  skills: string[];
  hasApplied: boolean;
  application:
    | {
        appliedAvailability: ApplicationAvailability;
        appliedSkills: string[];
        status: ApplicationStatus;
      }
    | null;
}

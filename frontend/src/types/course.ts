// src/types/course.ts

import { UserSummary } from "./user";
import {
  ApplicationRole,
  ApplicationAvailability,
  ApplicationStatus,
} from "./enums";

/**
 * A course object as returned by backend (from Course entity).
 * Note the new fields:
 *   - appliedRoles: string[]          // which roles the candidate has already applied for
 *   - applicationDetails?: { ... }[]   // (optional) detailed info per application
 */
export interface Course {
  id: string;                          // course_ID (UUID)
  courseCode: string;                  // e.g. "COSC101"
  name: string;                        // display_name
  semester: string;                    // e.g. "Fall 2025"
  rolesAvailable: ApplicationRole[];   // e.g. ["Tutor", "Lab-Assistant"]
  isDisabled: boolean;
  skills: string[];                    // array of skill names
  lecturer: UserSummary | null;        // summary of the lecturer

  // NEW FIELDS returned by GET /api/candidates/courses:
  appliedRoles: ApplicationRole[];
  applicationDetails?: {
    role: ApplicationRole;
    appliedAvailability: ApplicationAvailability;
    appliedSkills: string[];
    status: ApplicationStatus;
    lecturerComment?: string | null;
  }[];
}

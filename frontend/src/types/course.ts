// src/types/Course.ts

import { UserSummary } from "./user";
import { ApplicationRole, ApplicationAvailability, ApplicationStatus } from "./enums";
import { LecturerApplication, CandidateApplication } from "./Application";

/**
 * A course object as returned by backend (from Course entity).
 */
export interface Course {
  id: string;                          // course_ID (UUID)
  courseCode: string;                  // e.g. "COSC101"
  name: string;                        // display_name
  semester: string;                    // e.g. "Fall 2025"
  rolesAvailable: ApplicationRole[];   // e.g. ["Tutor", "Lab Assistant"]
  isDisabled: boolean;
  skills: string[];                    // array of skill names
  lecturer: UserSummary | null;        // summary of the lecturer
  // When a lecturer fetches /api/lecturer/courses/:courseId/applications,
  // the course object will also include all applicants:
  applicants?: LecturerApplication[];
  // When a candidate fetches /api/candidates/courses, this field appears if they've applied:
  application?: {
    appliedAvailability: ApplicationAvailability;
    appliedSkills: string[];
    status: ApplicationStatus;
  } | null;
}

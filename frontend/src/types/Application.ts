// src/types/Application.ts

import {
  ApplicationAvailability,
  ApplicationRole,
  ApplicationStatus,
} from "./enums";

/**
 * A candidate’s single application to a course (from backend).
 */
export interface CandidateApplication {
  applicationId?: string;         // application_ID (UUID)
  courseId?: string;              // course_ID (UUID)
  courseCode?: string;            // e.g. "COSC101"
  courseName?: string;            // e.g. "Intro To Programming"
  role: ApplicationRole;
  appliedAvailability: ApplicationAvailability;
  appliedSkills: string[];
  status: ApplicationStatus;
  lecturerComment?: string | null;
  ranking?: number | null;
}

/**
 * An applicant as seen by a lecturer, embedded under Course.applicants.
 */
export interface LecturerApplication {
  applicationId: string;          // application_ID (UUID)
  userId: string;                 // candidate’s user_ID
  name: string;                   // e.g. "Firstname Lastname"
  role: ApplicationRole;
  availability: ApplicationAvailability;
  skills: string[];
  status: ApplicationStatus;
  lecturerComment?: string | null;
  ranking?: number | null;
}

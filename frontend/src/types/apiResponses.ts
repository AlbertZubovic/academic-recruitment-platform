// src/types/apiResponses.ts

import { User } from "./user";
import { Course } from "./course";
import { CandidateCourseSummary } from "./CandidateCourseSummary";
import { CandidateApplication, LecturerApplication } from "./Application";
import {
  AvailabilityMetric,
  SelectionCount,
  CommonSkill,
} from "./Metrics";

/**
 * Response from POST /api/auth/signup
 */
export interface SignUpResponse {
  message: string;
  user: {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    isCandidate: boolean;
    isLecturer: boolean;
    defaultAvailability: string | null;
    created: string;
  };
}

/**
 * Response from POST /api/auth/signin
 */
export interface SignInResponse {
  message: string;
}

/**
 * Response from GET /api/auth/me
 */
export interface MeResponse extends User {}

/**
 * Response from GET /api/users/candidates
 */
export type CandidateListResponse = User[];

/**
 * Response from GET /api/courses
 */
export type CourseListResponse = Course[];

/**
 * Response from GET /api/candidates/courses
 */
export type CandidateCourseListResponse = CandidateCourseSummary[];

/**
 * Response from GET /api/candidates/applications
 */
export type MyApplicationsResponse = CandidateApplication[];

/**
 * Response from GET /api/lecturer/courses/:courseId/applications
 */
export type LecturerApplicationsResponse = LecturerApplication[];

/**
 * Response from GET /api/metrics/availability
 */
export type AvailabilityMetricResponse = AvailabilityMetric[];

/**
 * Response from GET /api/metrics/selection-counts
 */
export type SelectionCountResponse = SelectionCount[];

/**
 * Response from GET /api/metrics/common-skills
 */
export type CommonSkillResponse = CommonSkill[];

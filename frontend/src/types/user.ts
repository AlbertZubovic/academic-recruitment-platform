// src/types/User.ts

import { UserAvailability } from "./enums";
import { PastRole } from "./PastRole";

/**
 * A minimal user summary.
 */
export interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isLecturer: boolean;
  isCandidate: boolean;
  isAdmin: boolean;
  defaultSkills: string[];
  defaultAvailability: UserAvailability | null;
  academicCredentials: string | null;
  created: string;
  isBlocked: boolean;
}

/**
 * A full user object from the backend.
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isLecturer: boolean;
  isCandidate: boolean;
  isAdmin: boolean;
  defaultSkills: string[];
  defaultAvailability: UserAvailability | null;
  academicCredentials: string | null;
  pastRoles: PastRole[];
  created: string;
  isBlocked: boolean;
}

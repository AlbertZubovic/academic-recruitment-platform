// src/types/User.ts

import { UserAvailability } from "./enums";
import { PastRole } from "./PastRole";

/**
 * A minimal user summary (for embedding as lecturer inside Course).
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
  created: string;       // ISO timestamp
  isBlocked: boolean;
}

/**
 * A full user object from the backend.
 */
export interface User {
  id: string;                    // user_ID (UUID)
  email: string;
  firstname: string;
  lastname: string;
  isLecturer: boolean;
  isCandidate: boolean;
  isAdmin: boolean;
  defaultSkills: string[];
  defaultAvailability: UserAvailability | null;
  academicCredentials: string | null;
  pastRoles: PastRole[];
  created: string;               // ISO timestamp
  isBlocked: boolean;
}

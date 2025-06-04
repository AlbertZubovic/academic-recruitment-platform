// src/types/PastRole.ts

import { PastRoleType } from "./enums";

/**
 * A previously held academic role (from backend PastRole).
 */
export interface PastRole {
  id?: string;                  // UUID
  courseCode: string;          // e.g. "COSC120"
  courseName: string;          // e.g. "Web Development"
  role: PastRoleType;          // "Tutor" | "Lab Assistant"
  semester?: string | null;    // e.g. "Summer 2024" or null
}

// src/types/enums.ts

/**
 * User’s default availability (backend UserAvailability).
 */
export enum UserAvailability {
  FULL_TIME = "Full-Time",
  PART_TIME = "Part-Time",
}

/**
 * The role held in a PastRole (backend PastRoleType).
 */
export enum PastRoleType {
  TUTOR = "Tutor",
  LAB_ASSISTANT = "Lab Assistant",
}

/**
 * The availability a candidate applies with (backend ApplicationAvailability).
 */
export enum ApplicationAvailability {
  FULL_TIME = "Full-Time",
  PART_TIME = "Part-Time",
}

/**
 * The role a candidate can apply for (backend ApplicationRole).
 */
export enum ApplicationRole {
  TUTOR = "Tutor",
  LAB_ASSISTANT = "Lab Assistant",
}

/**
 * Status of an application (mapped from backend’s accepted: boolean | null).
 * - "Pending"  (accepted === null)
 * - "Approved" (accepted === true)
 * - "Rejected" (accepted === false)
 */
export type ApplicationStatus = "Pending" | "Approved" | "Rejected";

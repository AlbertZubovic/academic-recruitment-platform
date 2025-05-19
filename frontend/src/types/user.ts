/**
 * Represents a user within the system, such as a tutor or lecturer.
 * Includes identification, contact details, qualifications, role history, and availability.
 */

// Define the enum to match the backend UserAvailability enum
export enum UserAvailability {
  FULL_TIME = "Full-Time",
  PART_TIME = "Part-Time",
  // Ensure this matches any other statuses defined in the backend enum
}

export interface User {
  id: string;                // Unique identifier (UUID)
  email: string;             // Email address
  firstName: string;         // Non-nullable
  lastName: string;          // Non-nullable
  isLecturer: boolean;       // Lecturer role flag
  isTutor: boolean;          // Tutor role flag
  isAdmin: boolean;
  defaultSkills: string[] | null;
  defaultAvailability: UserAvailability | null; // Use the enum
  academicCredentials: string | null;
  created: string; // Dates are serialized as strings
  isBlocked: boolean;
}

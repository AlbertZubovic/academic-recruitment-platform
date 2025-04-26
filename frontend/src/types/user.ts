/**
 * Represents a user within the system, such as a tutor or lecturer.
 * Includes identification, contact details, qualifications, role history, and availability.
 */
import { PastRole } from "./pastRoles";

export interface User {
  id: string;                // Unique identifier
  email: string;             // Email address
  password: string;          // Password
  skills: string[];          // Technical skills
  credentials: string;       // Academic qualifications
  firstName: string;        
  lastName: string;        
  pastRoles: PastRole[];     // Previous teaching roles
  availability: "part-time" | "full-time"; // Work availability
  isLecturer: boolean;       // Lecturer role flag
  isTutor: boolean;          // Tutor role flag
}

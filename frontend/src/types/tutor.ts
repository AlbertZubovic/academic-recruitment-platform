// src/types/tutor.ts

import { PastRole } from "./pastRoles";

// Tutor model for application and review screens
export interface Tutor {
  id: string;                 // Unique identifier
  firstName: string;          // First name
  lastName: string;           // Last name 
  email: string;              // Contact email
  skills: string[];           // Technical skills
  credentials: string;        // Academic qualifications
  pastRoles: PastRole[];      // Previous teaching experience
}

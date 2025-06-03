// src/types/course.ts

import { Applicant } from "./applicant";

// Course interface used for tutor applications and lecturer filtering
export interface Course {
  id: string;
  name: string;
  courseCode: string;
  semester: string;
  applicants: Applicant[];
  skills: string[];
  roleRequired: "Lab-Assistant" | "Tutor";
  application?: Applicant;
}
  
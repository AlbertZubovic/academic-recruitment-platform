// Admin authentication types
export interface AdminLoginInput {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token?: string;
  message?: string;
}

// Course types (matching backend Course entity)
export interface Course {
  course_ID: string;
  course_code: string;
  display_name: string;
  semester: string;
  lecturer?: User;
  roles_available: ("Tutor" | "Lab-Assistant")[];
  is_disabled: boolean;
  skills: Skill[];
}

export interface CourseInput {
  course_code: string;
  display_name: string;
  semester: string;
  roles_available: ("Tutor" | "Lab-Assistant")[];
  is_disabled?: boolean;
  skillIds?: string[];
  lecturerId?: string;
}

export interface UpdateCourseInput extends Partial<CourseInput> {
  course_ID: string;
}

// Skill type (matching backend Skill entity)
export interface Skill {
  skill_ID: string;
  name: string;
}

// User types (matching backend User entity)
export interface User {
  user_ID: string;
  email: string;
  firstname: string;
  lastname: string;
  is_lecturer: boolean;
  is_candidate: boolean;
  is_admin: boolean;
  is_blocked: boolean;
  default_availability: string | null;
  academic_credentials: string | null;
  created: string;
  userSkills: UserSkill[];
  pastRoles: PastRole[];
}

export interface UserSkill {
  user: User;
  skill: Skill;
}

export interface PastRole {
  id: string;
  courseCode: string;
  courseName: string;
  role: string;
  semester: string | null;
}

export enum UserAvailability {
  FULL_TIME = "Full-Time",
  PART_TIME = "Part-Time",
}

// Application types (matching backend Application entity)
export interface Application {
  application_ID: string;
  user: User;
  course: Course;
  applied_availability: string;
  accepted: boolean | null;
  ranking: number | null;
  role: string;
  lecturer_comment: string | null;
  appliedSkills: AppliedSkill[];
  is_withdrawn: boolean;
  withdrawn_at: string | null;
}

export interface AppliedSkill {
  application_ID: string;
  skill_ID: string;
  skill: Skill;
}

// Assignment types
export interface LecturerAssignment {
  lecturerId: string;
  courseId: string;
}

// Report types
export interface CandidateReport {
  chosenCandidates: CandidateWithCourses[];
  multipleCoursesCandidates: CandidateWithCourseCount[];
  unassignedCandidates: User[];
}

export interface CandidateWithCourses {
  user_ID: string;
  firstname: string;
  lastname: string;
  email: string;
  courses: Course[];
}

export interface CandidateWithCourseCount {
  user_ID: string;
  firstname: string;
  lastname: string;
  email: string;
  courseCount: number;
}

// GraphQL operation result types
export interface MutationResult {
  success: boolean;
  message?: string;
}

export interface AssignLecturerResult extends MutationResult {
  course?: Course;
}

export interface BlockUserResult extends MutationResult {
  user?: User;
} 
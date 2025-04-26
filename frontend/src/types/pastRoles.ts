/**
 * Represents a previously held academic role within a course.
 * Includes details about the course, the type of role, and optionally the semester it was held.
 */
// Past teaching roles used to display experience on profiles
export interface PastRole {
  courseCode: string;               // Course code identifier
  courseName: string;               // Full course name
  role: 'Tutor' | 'Lab Assistant';  // Role in the course
  semester?: string;                // Optional semester
}

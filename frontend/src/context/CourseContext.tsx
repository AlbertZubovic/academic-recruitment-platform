// src/context/CourseContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback, // <-- Make sure useCallback is imported
} from "react";
import { Course } from "@/types/course";
import { Applicant } from "@/types/applicant"; // <-- Import Applicant type
import mockCourses from "../data/mockCourseList.json";

declare global {
  interface Window {
    refreshCourses?: () => void;
  }
}

// Centralize the localStorage key - Use "Courses" for consistency
const LS_COURSES_KEY = "Courses";

// Define context
interface CourseContextProps {
  courses: Course[];
  updateCourseData: (updatedCourses: Course[]) => void;
  refreshCourses: () => void;
  // --- Add New Functions ---
  updateApplicationDetails: (
    courseId: string,
    userId: string,
    updatedDetails: Partial<Pick<Applicant, 'appliedSkills' | 'appliedAvailability'>> // Allow partial updates
  ) => boolean; // Return success status
  deleteApplication: (courseId: string, userId: string) => boolean; // Return success status
}

// Create context
const CourseContext = createContext<CourseContextProps | undefined>(undefined);

// Custom hook to consume context
export const useCourse = (): CourseContextProps => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourse must be used within a CourseProvider");
  }
  return context;
};

interface CourseProviderProps {
  children: ReactNode;
}

// Context provider component
export const CourseProvider: React.FC<CourseProviderProps> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);

  // Load courses on mount (ensure it handles the Applicant object structure)
  useEffect(() => {
    try {
      const storedCourses = localStorage.getItem(LS_COURSES_KEY);
      let initialCourses: Course[] = [];

      if (storedCourses) {
        const parsedCourses: Course[] = JSON.parse(storedCourses);
        // Basic validation/mapping to ensure structure
        const validatedCourses = parsedCourses.map(course => ({
          ...course,
          applicants: Array.isArray(course.applicants)
            ? course.applicants.map((app: Applicant) => ({
                userId: String(app.userId ?? ''),
                appliedSkills: Array.isArray(app.appliedSkills) ? app.appliedSkills : [],
                appliedAvailability: String(app.appliedAvailability ?? '')
              })) as Applicant[]
            : []
        }));
        initialCourses = validatedCourses;
      } else {
        // Seed if empty
        initialCourses = mockCourses.map(course => ({
             ...course,
             requiredAvailability: course.requiredAvailability as Course['requiredAvailability'],
             applicants: Array.isArray(course.applicants) ? course.applicants as Applicant[] : []
          }));
        localStorage.setItem(LS_COURSES_KEY, JSON.stringify(initialCourses));
      }
      setCourses(initialCourses);
    } catch (err) {
      console.error("Failed to load/parse courses, resetting to mock data", err);
      const fallbackCourses = mockCourses.map(course => ({
             ...course,
             requiredAvailability: course.requiredAvailability as Course['requiredAvailability'],
             applicants: Array.isArray(course.applicants) ? course.applicants as Applicant[] : []
          }));
      localStorage.setItem(LS_COURSES_KEY, JSON.stringify(fallbackCourses));
      setCourses(fallbackCourses);
    }
  }, []);

  // Update ALL courses manually
  const updateCourseData = useCallback((updatedCourses: Course[]) => {
    // Add validation/ensure structure before saving if needed
     const validatedCourses = updatedCourses.map(course => ({
        ...course,
        applicants: Array.isArray(course.applicants) ? course.applicants : []
    }));
    setCourses(validatedCourses);
    localStorage.setItem(LS_COURSES_KEY, JSON.stringify(validatedCourses));
  }, []);

  // Refresh ALL courses from localStorage manually
  const refreshCourses = useCallback(() => {
    // ... (implementation as before) ...
     try {
        const stored = localStorage.getItem(LS_COURSES_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Add validation here too if needed
            if (Array.isArray(parsed)) {
                setCourses(parsed);
            }
        }
    } catch (err) {
        console.error("Failed to refresh courses", err);
    }
  }, []);

  // --- NEW: Update specific application details ---
  const updateApplicationDetails = useCallback((
    courseId: string,
    userId: string,
    updatedDetails: Partial<Pick<Applicant, 'appliedSkills' | 'appliedAvailability'>>
  ): boolean => {
    let success = false;
    setCourses(currentCourses => {
      const courseIndex = currentCourses.findIndex(c => c.id === courseId);
      if (courseIndex === -1) return currentCourses; // Course not found

      const targetCourse = currentCourses[courseIndex];
      const applicantIndex = targetCourse.applicants.findIndex(app => String(app.userId) === String(userId));
      if (applicantIndex === -1) return currentCourses; // Applicant not found in this course

      // Create updated applicant object immutably
      const updatedApplicant = {
        ...targetCourse.applicants[applicantIndex], // Keep existing details (like userId)
        ...updatedDetails, // Overwrite with new details
      };

      // Create updated applicants array immutably
      const updatedApplicants = [
        ...targetCourse.applicants.slice(0, applicantIndex),
        updatedApplicant,
        ...targetCourse.applicants.slice(applicantIndex + 1),
      ];

      // Create updated course object immutably
      const updatedCourse = { ...targetCourse, applicants: updatedApplicants };

      // Create updated courses array immutably
      const finalCourses = [
        ...currentCourses.slice(0, courseIndex),
        updatedCourse,
        ...currentCourses.slice(courseIndex + 1),
      ];

      // Persist and set flag
      localStorage.setItem(LS_COURSES_KEY, JSON.stringify(finalCourses));
      success = true;
      return finalCourses; // Return new state
    });
    return success;
  }, []);

  // --- NEW: Delete a specific application ---
  const deleteApplication = useCallback((courseId: string, userId: string): boolean => {
    let success = false;
    setCourses(currentCourses => {
      const courseIndex = currentCourses.findIndex(c => c.id === courseId);
      if (courseIndex === -1) return currentCourses; // Course not found

      const targetCourse = currentCourses[courseIndex];

      // Filter out the applicant immutably
      const updatedApplicants = targetCourse.applicants.filter(app => String(app.userId) !== String(userId));

      // Only proceed if the applicant was actually found and removed
      if (updatedApplicants.length === targetCourse.applicants.length) {
          console.warn(`Applicant ${userId} not found in course ${courseId} for deletion.`);
          return currentCourses; // No change needed
      }

      // Create updated course object immutably
      const updatedCourse = { ...targetCourse, applicants: updatedApplicants };

      // Create updated courses array immutably
      const finalCourses = [
        ...currentCourses.slice(0, courseIndex),
        updatedCourse,
        ...currentCourses.slice(courseIndex + 1),
      ];

      // Persist and set flag
      localStorage.setItem(LS_COURSES_KEY, JSON.stringify(finalCourses));
      success = true;
      return finalCourses; // Return new state
    });
     return success;
  }, []);


  // Make refresh available via window for debug/dev
  useEffect(() => {
    window.refreshCourses = refreshCourses;
    return () => { delete window.refreshCourses; }
  }, [refreshCourses]);

  const value: CourseContextProps = {
    courses,
    updateCourseData,
    refreshCourses,
    // --- Provide new functions ---
    updateApplicationDetails,
    deleteApplication,
  };

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
};
// src/context/CourseContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Course } from "@/types/course";
import { Applicant } from "@/types/applicant";
import { useAuth } from "./AuthContext"; // Add this to get auth token

declare global {
  interface Window {
    refreshCourses?: () => void;
  }
}


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
  ) => Promise<boolean>; // Return success status
  deleteApplication: (courseId: string, userId: string) => Promise<boolean>; // Return success status
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
  const [, setLoading] = useState(true);
  const { user } = useAuth(); // Get user for auth token

  // Load courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setCourses([]);
          return;
        }

        const response = await fetch("http://localhost:5000/api/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(data);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setCourses([]); // Set empty array instead of mock data
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]); // Re-fetch when user changes

  // Update ALL courses manually
  const updateCourseData = useCallback(async (updatedCourses: Course[]) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/courses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedCourses),
      });

      if (!response.ok) {
        throw new Error("Failed to update courses");
      }

      const data = await response.json();
      setCourses(data);
    } catch (err) {
      console.error("Failed to update courses:", err);
    }
  }, []);

  // Refresh courses from API
  const refreshCourses = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to refresh courses");
      }

      const data = await response.json();
      setCourses(data);
    } catch (err) {
      console.error("Failed to refresh courses:", err);
    }
  }, []);

  // Update application details
  const updateApplicationDetails = useCallback(async (
    courseId: string,
    userId: string,
    updatedDetails: Partial<Pick<Applicant, 'appliedSkills' | 'appliedAvailability'>>
  ): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;

      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/applications/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedDetails),
      });

      if (!response.ok) {
        throw new Error("Failed to update application");
      }

      // Refresh courses to get updated data
      await refreshCourses();
      return true;
    } catch (err) {
      console.error("Failed to update application:", err);
      return false;
    }
  }, [refreshCourses]);

  // Delete application
  const deleteApplication = useCallback(async (courseId: string, userId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return false;

      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/applications/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete application");
      }

      // Refresh courses to get updated data
      await refreshCourses();
      return true;
    } catch (err) {
      console.error("Failed to delete application:", err);
      return false;
    }
  }, [refreshCourses]);

  // Make refresh available via window for debug/dev
  useEffect(() => {
    window.refreshCourses = refreshCourses;
    return () => { delete window.refreshCourses; }
  }, [refreshCourses]);

  const value: CourseContextProps = {
    courses,
    updateCourseData,
    refreshCourses,
    updateApplicationDetails,
    deleteApplication,
  };

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
};
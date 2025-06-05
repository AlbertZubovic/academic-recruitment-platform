// src/context/CourseContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Course } from "@/types/course";
import { ApplicationRole } from "@/types/enums";
import { useAuth } from "./AuthContext";

// Point to your backend’s base URL
const API_BASE = "http://localhost:5000/api";

interface CourseContextValue {
  courses: Course[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;

  applyToCourse: (
    courseId: string,
    payload: {
      role: ApplicationRole;
      appliedAvailability: string;
      appliedSkills: string[];
    }
  ) => Promise<boolean>;

  updateApplicationDetails: (
    courseId: string,
    payload: {
      role?: ApplicationRole;
      appliedAvailability?: string;
      appliedSkills?: string[];
    }
  ) => Promise<boolean>;

  deleteApplication: (courseId: string) => Promise<void>;
}

const CourseContext = createContext<CourseContextValue | undefined>(
  undefined
);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all courses (including appliedRoles/applicationDetails)
  const fetchCourses = async () => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/candidates/courses`, {
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to fetch courses");
      }
      const data: Course[] = await res.json();
      setCourses(data);
    } catch (err: any) {
      setError(err.message);
      setCourses([]);
    }
  };

  useEffect(() => {
    //
    // Only a candidate should ever call /api/candidates/courses.
    // Lecturers/Admins must skip that endpoint to avoid a 403.
    //
    if (user && user.isCandidate) {
      fetchCourses().finally(() => setLoading(false));
    } else {
      // Not a candidate (or not logged in): clear out and stop loading
      setCourses([]);
      setLoading(false);
    }
  }, [user]);

  const refetch = async () => {
    setLoading(true);
    await fetchCourses();
    setLoading(false);
  };

  /**
   * POST a new application.
   * Body must be:
   *   {
   *     role: string,                   // "Tutor" or "Lab-Assistant"
   *     appliedAvailability: string,    // "Full-Time" or "Part-Time"
   *     appliedSkills: string[],
   *   }
   */
  const applyToCourse = async (
    courseId: string,
    payload: {
      role: ApplicationRole;
      appliedAvailability: string;
      appliedSkills: string[];
    }
  ) => {
    try {
      const body = {
        role: payload.role,
        appliedAvailability: payload.appliedAvailability,
        appliedSkills: payload.appliedSkills,
      };

      const res = await fetch(
        `${API_BASE}/candidates/courses/${courseId}/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        return false;
      }
      await fetchCourses();
      return true;
    } catch {
      return false;
    }
  };

  /**
   * PATCH an existing application (for a given role).
   * Body may include:
   *   {
   *     role?: string,
   *     appliedAvailability?: string,
   *     appliedSkills?: string[],
   *   }
   */
  const updateApplicationDetails = async (
    courseId: string,
    payload: {
      role?: ApplicationRole;
      appliedAvailability?: string;
      appliedSkills?: string[];
    }
  ) => {
    try {
      const body: any = {};
      if (payload.role) body.role = payload.role;
      if (payload.appliedAvailability)
        body.appliedAvailability = payload.appliedAvailability;
      if (payload.appliedSkills) body.appliedSkills = payload.appliedSkills;

      const res = await fetch(
        `${API_BASE}/candidates/courses/${courseId}/applications/me`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        return false;
      }
      await fetchCourses();
      return true;
    } catch {
      return false;
    }
  };

  // DELETE (withdraw) all applications for this user+course.
  const deleteApplication = async (courseId: string) => {
    try {
      const res = await fetch(
        `${API_BASE}/candidates/courses/${courseId}/applications/me`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) {
        console.error("Failed to delete application");
      }
      await fetchCourses();
    } catch (e) {
      console.error("Error deleting application:", e);
    }
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        loading,
        error,
        refetch,
        applyToCourse,
        updateApplicationDetails,
        deleteApplication,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = (): CourseContextValue => {
  const ctx = useContext(CourseContext);
  if (!ctx) {
    throw new Error("useCourses must be used within <CourseProvider>");
  }
  return ctx;
};

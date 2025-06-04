// src/context/CourseContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Course } from "@/types/course";
import { useAuth } from "./AuthContext";

interface CourseContextValue {
  courses: Course[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  applyToCourse: (
    courseId: string,
    payload: { role: string; appliedAvailability: string; appliedSkills: string[] }
  ) => Promise<boolean>;
  updateApplicationDetails: (
    courseId: string,
    payload: { appliedAvailability?: string; appliedSkills?: string[] }
  ) => Promise<boolean>;
  deleteApplication: (courseId: string) => Promise<void>;
}

const CourseContext = createContext<CourseContextValue | undefined>(undefined);

// Adjust this base URL if your API root differs
const COURSE_API_BASE = "http://localhost:5000/api/candidates";

export const CourseProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setError(null);
    try {
      const res = await fetch(`${COURSE_API_BASE}/courses`, {
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
    if (user) {
      fetchCourses().finally(() => setLoading(false));
    } else {
      setCourses([]);
      setLoading(false);
    }
  }, [user]);

  const refetch = async () => {
    setLoading(true);
    await fetchCourses();
    setLoading(false);
  };

  const applyToCourse = async (
    courseId: string,
    payload: { role: string; appliedAvailability: string; appliedSkills: string[] }
  ) => {
    try {
      const res = await fetch(`${COURSE_API_BASE}/courses/${courseId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        return false;
      }
      await fetchCourses();
      return true;
    } catch {
      return false;
    }
  };

  const updateApplicationDetails = async (
    courseId: string,
    payload: { appliedAvailability?: string; appliedSkills?: string[] }
  ) => {
    try {
      const res = await fetch(
        `${COURSE_API_BASE}/courses/${courseId}/applications/me`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
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

  const deleteApplication = async (courseId: string) => {
    try {
      const res = await fetch(
        `${COURSE_API_BASE}/courses/${courseId}/applications/me`,
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

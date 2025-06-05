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
    role: ApplicationRole,
    payload: {
      appliedAvailability?: string;
      appliedSkills?: string[];
    }
  ) => Promise<boolean>;

  /**
   * Now takes `currentStatus` as a second argument (but we ignore it internally).
   */
  deleteApplication: (
    courseId: string,
    currentStatus: "Pending" | "Approved" | "Rejected"
  ) => Promise<boolean>;
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

  // 1) Fetch all courses (including appliedRoles & applicationDetails)
  const fetchCourses = async () => {
    setError(null);
    console.log("[CourseContext] GET /candidates/courses");
    try {
      const res = await fetch(`${API_BASE}/candidates/courses`, {
        credentials: "include",
      });
      console.log("[CourseContext] Response status:", res.status);
      if (!res.ok) {
        const data = await res.json();
        console.error("[CourseContext] GET /candidates/courses failed:", data);
        throw new Error(data.message || "Failed to fetch courses");
      }
      const data: Course[] = await res.json();
      console.log("[CourseContext] Fetched courses:", data);
      setCourses(data);
    } catch (err: any) {
      console.error("[CourseContext] Error loading courses:", err);
      setError(err.message);
      setCourses([]);
    }
  };

  useEffect(() => {
    if (user && user.isCandidate) {
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

  // 2) POST a new application
  const applyToCourse = async (
    courseId: string,
    payload: {
      role: ApplicationRole;
      appliedAvailability: string;
      appliedSkills: string[];
    }
  ) => {
    console.log(
      `[CourseContext] POST /candidates/courses/${courseId}/apply payload:`,
      payload
    );
    try {
      const res = await fetch(
        `${API_BASE}/candidates/courses/${courseId}/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      console.log(
        `[CourseContext] POST apply response status: ${res.status}`
      );
      let data: any;
      try {
        data = await res.json();
      } catch {
        data = await res.text();
      }
      console.log("[CourseContext] POST apply response body:", data);

      if (!res.ok) {
        console.error("[CourseContext] POST apply failed:", data);
        return false;
      }

      await fetchCourses();
      return true;
    } catch (err: any) {
      console.error("[CourseContext] Error in applyToCourse:", err);
      return false;
    }
  };

  // 3) PATCH an existing application → always include `role` in the body
  const updateApplicationDetails = async (
    courseId: string,
    role: ApplicationRole,
    payload: {
      appliedAvailability?: string;
      appliedSkills?: string[];
    }
  ) => {
    const bodyPayload: any = { role };
    if (payload.appliedAvailability !== undefined) {
      bodyPayload.appliedAvailability = payload.appliedAvailability;
    }
    if (payload.appliedSkills !== undefined) {
      bodyPayload.appliedSkills = payload.appliedSkills;
    }

    console.log(
      `[CourseContext] PATCH /candidates/courses/${courseId}/applications/me payload:`,
      bodyPayload
    );
    try {
      const res = await fetch(
        `${API_BASE}/candidates/courses/${courseId}/applications/me`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(bodyPayload),
        }
      );
      console.log(
        `[CourseContext] PATCH response status: ${res.status}`
      );
      let data: any;
      try {
        data = await res.json();
      } catch {
        data = await res.text();
      }
      console.log("[CourseContext] PATCH response body:", data);

      if (!res.ok) {
        console.error("[CourseContext] PATCH failed:", data);
        return false;
      }

      await fetchCourses();
      return true;
    } catch (err: any) {
      console.error(
        "[CourseContext] Error in updateApplicationDetails:",
        err
      );
      return false;
    }
  };

  // 4) DELETE (withdraw) all applications for this user+course
  //    Now takes a second argument (`currentStatus`), which we ignore for now.
  const deleteApplication = async (
    courseId: string,
    currentStatus: "Pending" | "Approved" | "Rejected"
  ) => {
    console.log(
      `[CourseContext] DELETE /candidates/courses/${courseId}/applications/me (status=${currentStatus})`
    );
    try {
      const res = await fetch(
        `${API_BASE}/candidates/courses/${courseId}/applications/me`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      console.log(
        `[CourseContext] DELETE response status: ${res.status}`
      );
      let data: any;
      try {
        data = await res.json();
      } catch {
        data = await res.text();
      }
      console.log("[CourseContext] DELETE response body:", data);

      if (!res.ok) {
        console.error("[CourseContext] DELETE failed:", data);
        return false;
      }

      await fetchCourses();
      return true;
    } catch (err: any) {
      console.error("[CourseContext] Error in deleteApplication:", err);
      return false;
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

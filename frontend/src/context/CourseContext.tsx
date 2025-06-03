import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Course } from "@/types/course";
import { Applicant } from "@/types/applicant";
import { useAuth } from "./AuthContext";

interface CourseContextProps {
  courses: Course[];
  refreshCourses: () => Promise<void>;
  applyToCourse: (courseId: string, details: { appliedSkills: string[]; appliedAvailability: string }) => Promise<boolean>;
  updateApplicationDetails: (courseId: string, details: Partial<{ appliedSkills: string[]; appliedAvailability: string }>) => Promise<boolean>;
  deleteApplication: (courseId: string) => Promise<boolean>;
}

const CourseContext = createContext<CourseContextProps | undefined>(undefined);

export const useCourse = (): CourseContextProps => {
  const context = useContext(CourseContext);
  if (!context) throw new Error("useCourse must be used within a CourseProvider");
  return context;
};

export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const { isLoggedIn } = useAuth();

  const fetchCourses = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch("http://localhost:5000/api/tutors/courses", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourses([]);
    }
  }, [isLoggedIn]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const applyToCourse = async (courseId: string, details: { appliedSkills: string[]; appliedAvailability: string }) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tutors/courses/${courseId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(details),
      });
      if (!res.ok) throw new Error("Failed to apply");
      await fetchCourses();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const updateApplicationDetails = async (courseId: string, details: Partial<Pick<Applicant, "appliedSkills" | "appliedAvailability">>) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tutors/courses/${courseId}/applications/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(details),
      });
      if (!res.ok) throw new Error("Failed to update application");
      await fetchCourses();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const deleteApplication = async (courseId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tutors/courses/${courseId}/applications/me`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete application");
      await fetchCourses();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return (
    <CourseContext.Provider value={{ courses, refreshCourses: fetchCourses, applyToCourse, updateApplicationDetails, deleteApplication }}>
      {children}
    </CourseContext.Provider>
  );
};

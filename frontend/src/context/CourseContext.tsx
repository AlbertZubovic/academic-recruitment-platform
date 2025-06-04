// src/context/CourseContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Course } from "@/types/course";
import { LecturerApplication } from "@/types/Application";
import { CourseListResponse } from "@/types/apiResponses";
import { useAuth } from "./AuthContext";

interface CourseContextValue {
  courses: Course[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const CourseContext = createContext<CourseContextValue | undefined>(undefined);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setError(null);
    try {
      const res = await fetch("/api/courses", {
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to fetch courses");
      }
      const data: CourseListResponse = await res.json();
      setCourses(data);
    } catch (err: any) {
      setError(err.message);
      setCourses([]);
    }
  };

  useEffect(() => {
    // Only fetch if user is logged in
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

  return (
    <CourseContext.Provider value={{ courses, loading, error, refetch }}>
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

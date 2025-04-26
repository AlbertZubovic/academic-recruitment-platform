// src/hooks/useCourse.ts

/**
 * useCourse
 * A custom React hook for managing course data using localStorage.
 * Loads initial data from localStorage
 * Provides course state and a method to update it
 * Keeps localStorage in sync with updates
 */

import { useState, useEffect } from "react";
import { Course } from "@/types/course";

// Define the localStorage key
const LS_COURSES_KEY = "Courses";

export function useCourse() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const storedCourses = localStorage.getItem(LS_COURSES_KEY);

    if (storedCourses) {
      try {
        const parsed: Course[] = JSON.parse(storedCourses);
        setCourses(parsed);
      } catch (err) {
        console.warn("Failed to parse course data from localStorage.", err);
        setCourses([]); // Fallback to empty array if parsing fails
      }
    } else {
      // No stored data, default to empty array
      setCourses([]);
    }
  }, []);

  // Updates the internal state and syncs with localStorage
  const updateCourseData = (updatedCourses: Course[]) => {
    setCourses(updatedCourses);
    localStorage.setItem(LS_COURSES_KEY, JSON.stringify(updatedCourses));
  };

  return { courses, updateCourseData };
}

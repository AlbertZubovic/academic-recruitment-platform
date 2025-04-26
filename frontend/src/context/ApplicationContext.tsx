/**
 * ApplicationContext.tsx
 *
 * Context for managing application-level state for the course applications dashboard.
 * 
 * Provides:
 * Filtered applicant data per course
 * All non-lecturer users
 * Sorting and search handling
 * Drag and drop ranking support
 * Filter view awareness
 * Accordion open panel tracking
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useCourse } from "@/context/CourseContext";
import { Course } from "@/types/course";
import { User } from "@/types/user";
import type { DragEndEvent } from "@dnd-kit/core";
import { Applicant } from "@/types/applicant";

// Define the context value
interface ApplicationContextProps {
  filteredApplicants: Course[];
  allUsers: User[];
  searchTerm: string;
  availabilityFilter: "all" | "full-time" | "part-time";
  sortCriteria: string;
  setFilteredApplicants: (data: Course[]) => void;
  setSortCriteria: (criteria: string) => void;
  setSearchTerm: (term: string) => void;
  setAvailabilityFilter: (value: "all" | "full-time" | "part-time") => void;
  handleSearch: (term: string) => void;
  handleSort: (criteria: string) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  isFilteredView: boolean;
  openPanels: number[];
  setOpenPanels: React.Dispatch<React.SetStateAction<number[]>>;
}

// Create the context
const ApplicationContext = createContext<ApplicationContextProps | undefined>(undefined);

// Custom hook to use the context
export const useApplicationContext = (): ApplicationContextProps => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error("useApplicationContext must be used within ApplicationProvider");
  }
  return context;
};

// Provider component
export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { courses } = useCourse();

  // Core state for filtered courses/applicants
  const [filteredApplicants, setFilteredApplicants] = useState<Course[]>(courses);
  const [sortCriteria, setSortCriteria] = useState("course");
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "full-time" | "part-time">("all");
  const [openPanels, setOpenPanels] = useState<number[]>([]); // which accordions are expanded

  // Get all users from localStorage and filter to only tutors
  const allUsers = useMemo(() => {
    if (typeof window !== "undefined") {
      return (JSON.parse(localStorage.getItem("Users") || "[]") as User[]).filter(
        (u) => u.isTutor && !u.isLecturer
      );
    }
    return [];
  }, []);

  // Determine if the view is filtered, which disables dragging
  const isFilteredView = sortCriteria === "availability" || searchTerm.trim() !== "";

  // On first load, restore from saved Rankings if available
  useEffect(() => {
    const saved = localStorage.getItem("Rankings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFilteredApplicants(parsed);
        return;
      } catch (e) {
        console.error("Failed to parse saved rankings", e);
      }
    }
    setFilteredApplicants(courses);
  }, [courses]);

  // Filters applicants based on search term and availability.
  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);

      const filteredCourses = courses.map((course: Course) => {
        // Filter the Applicant detail objects
        const filteredApplicantDetails = course.applicants.filter((applicantDetail: Applicant) => {
          // Find the corresponding User profile
          const applicantUser = allUsers.find((u) => String(u.id) === String(applicantDetail.userId));
          if (!applicantUser) return false; // Skip if user profile not found

          const matchesSearch =
            applicantUser.firstName.toLowerCase().includes(term.toLowerCase()) ||
            applicantUser.lastName.toLowerCase().includes(term.toLowerCase()) ||
            `${applicantUser.firstName} ${applicantUser.lastName}`.toLowerCase().includes(term.toLowerCase()) ||
            course.name.toLowerCase().includes(term.toLowerCase()) ||
    
            applicantDetail.appliedAvailability?.toLowerCase().includes(term.toLowerCase()) || // Use applied availability
            applicantDetail.appliedSkills?.some((skill: string) => skill.toLowerCase().includes(term.toLowerCase())); // Use applied skills

          const matchesAvailability =
            availabilityFilter === "all" ||
            applicantDetail.appliedAvailability?.toLowerCase() === availabilityFilter;

          return matchesSearch && matchesAvailability;
        });

        // Return the course with the filtered list of Applicant details
        return { ...course, applicants: filteredApplicantDetails };
      });

      setFilteredApplicants(filteredCourses);
    },
    [courses, allUsers, availabilityFilter] // Dependencies
  );

  // Re filter when availability changes
  useEffect(() => {
      handleSearch(searchTerm);
    }, [searchTerm, availabilityFilter, handleSearch]);
    

  // Sorts courses or applicants based on selected criteria.
  const handleSort = (criteria: string) => {
    setSortCriteria(criteria);

    if (criteria === "course") {
      const sorted = [...filteredApplicants].sort((a, b) => a.name.localeCompare(b.name));
      setFilteredApplicants(sorted);
    } else if (criteria === "availability") {
      const sorted = filteredApplicants.map((course) => {
        const sortedApplicantDetails = [...course.applicants].sort((aDetail: Applicant, bDetail: Applicant) => {
          const getWeight = (availability: string) =>
            availability?.toLowerCase() === "full-time" 
              ? 0
              : availability?.toLowerCase() === "part-time"
              ? 1
              : 2; // Assign lower weight to full-time
          return getWeight(aDetail.appliedAvailability) - getWeight(bDetail.appliedAvailability);
        });


        return { ...course, applicants: sortedApplicantDetails };
      });

      setFilteredApplicants(sorted);
    } else {
      setFilteredApplicants([...filteredApplicants]);
    }
  };

  // Handles drag and drop ranking of applicants within a course.
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
  
    const [courseCode] = String(active.id).split("-");
    const course = filteredApplicants.find((c) => c.courseCode === courseCode);
    if (!course) return;
  
    const oldIndex = course.applicants.findIndex(
      (id) => `${courseCode}-${id}` === String(active.id)
    );
    const newIndex = course.applicants.findIndex(
      (id) => `${courseCode}-${id}` === String(over.id)
    );
  
    const reordered = [...course.applicants];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
  
    const updatedCourses = filteredApplicants.map((c) =>
      c.courseCode === courseCode ? { ...c, applicants: reordered } : c
    );
  
    setFilteredApplicants(updatedCourses);
    localStorage.setItem("Rankings", JSON.stringify(updatedCourses));
  };
  

  return (
    <ApplicationContext.Provider
      value={{
        filteredApplicants,
        allUsers,
        searchTerm,
        availabilityFilter,
        sortCriteria,
        openPanels,
        isFilteredView,
        setFilteredApplicants,
        setSortCriteria,
        setSearchTerm,
        setAvailabilityFilter,
        setOpenPanels,
        handleSearch,
        handleSort,
        handleDragEnd,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

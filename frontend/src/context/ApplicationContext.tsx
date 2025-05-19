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
import { useAuth } from "./AuthContext";
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
  loading: boolean;
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<Course[]>(courses);
  const [sortCriteria, setSortCriteria] = useState("course");
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "full-time" | "part-time">("all");
  const [openPanels, setOpenPanels] = useState<number[]>([]); // which accordions are expanded

  // Fetch all tutor users
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setAllUsers([]);
          return;
        }

        const response = await fetch("http://localhost:5000/api/users/tutors", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tutors");
        }

        const data = await response.json();
        setAllUsers(data);
      } catch (err) {
        console.error("Failed to fetch tutors:", err);
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, [user]);

  // Update filtered applicants when courses change
  useEffect(() => {
    setFilteredApplicants(courses);
  }, [courses]);

  // Determine if the view is filtered, which disables dragging
  const isFilteredView = sortCriteria === "availability" || searchTerm.trim() !== "";

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
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

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

      // Update ranking in backend
      const response = await fetch(`http://localhost:5000/api/courses/${course.id}/rankings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rankings: reordered }),
      });

      if (!response.ok) {
        throw new Error("Failed to update rankings");
      }

      const updatedCourses = filteredApplicants.map((c) =>
        c.courseCode === courseCode ? { ...c, applicants: reordered } : c
      );

      setFilteredApplicants(updatedCourses);
    } catch (err) {
      console.error("Failed to update rankings:", err);
    }
  };
  

  return (
    <ApplicationContext.Provider
      value={{
        filteredApplicants,
        allUsers,
        searchTerm,
        availabilityFilter,
        sortCriteria,
        loading,
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

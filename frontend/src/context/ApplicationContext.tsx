// src/context/ApplicationContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useToast } from "@chakra-ui/react";
import { arrayMove } from "@dnd-kit/sortable";

import { useAuth } from "./AuthContext";

import {
  CandidateApplication,
  LecturerApplication,
} from "@/types/Application";
import {
  MyApplicationsResponse,
  LecturerApplicationsResponse,
} from "@/types/apiResponses";
import {
  ApplyToCourseRequest,
  UpdateApplicationRequest,
  UpdateApplicationStatusRequest,
} from "@/types/apiRequests";
import { Course as CourseType } from "@/types/course";
import { User } from "@/types/user";

///////////////////////////////////////////////////////////////////////////////
// — Type Definitions for Context Value —
///////////////////////////////////////////////////////////////////////////////

/**
 * The backend’s GET /api/courses endpoint returns each Course record plus
 * an `applicants: LecturerApplication[]` array. We type‐alias that here.
 */
type CourseWithApplicants = CourseType & {
  applicants: LecturerApplication[];
};

interface ApplicationContextValue {
  //
  // 1) Candidate‐side state & methods
  //
  myApplications: CandidateApplication[];
  loadingMyApps: boolean;
  errorMy: string | null;

  applyToCourse: (
    courseId: string,
    payload: ApplyToCourseRequest
  ) => Promise<void>;
  updateMyApplication: (
    courseId: string,
    payload: UpdateApplicationRequest
  ) => Promise<void>;
  deleteMyApplication: (courseId: string) => Promise<void>;
  fetchMyApplications: () => Promise<void>;

  //
  // 2) Lecturer‐side state & methods
  //
  lecturerApplications: Record<string, LecturerApplication[]>;
  loadingLectApps: boolean;
  errorLect: string | null;

  fetchLecturerApplications: (courseId: string) => Promise<void>;
  updateApplicationStatus: (
    courseId: string,
    applicationId: string,
    payload: UpdateApplicationStatusRequest
  ) => Promise<void>;

  //
  // 3) “Search / filter / sort / drag” logic for *all* courses + applicants
  //
  courses: CourseWithApplicants[];
  allUsers: User[];

  filteredApplicants: CourseWithApplicants[]; // after applying search + availability + sort

  searchTerm: string;
  setSearchTerm: (t: string) => void;

  availabilityFilter: "all" | "full-time" | "part-time";
  setAvailabilityFilter: (f: "all" | "full-time" | "part-time") => void;

  sortCriteria: string; // e.g. "course", "availability", or "grouped"
  handleSort: (c: string) => void;

  isFilteredView: boolean; // true whenever search/filter/sort ≠ defaults
  openPanels: number[]; // legacy components expected a number[] here

  handleDragEnd: (event: any) => void; // dnd‐kit’s onDragEnd
}

const ApplicationContext = createContext<ApplicationContextValue | undefined>(
  undefined
);

export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const BASE_URL = "http://localhost:5000/api";

  ////////////////////////////////////////////////////////////////////////////
  // 1) Candidate‐side State + Methods
  ////////////////////////////////////////////////////////////////////////////

  const [myApplications, setMyApplications] =
    useState<CandidateApplication[]>([]);
  const [loadingMyApps, setLoadingMyApps] = useState(false);
  const [errorMy, setErrorMy] = useState<string | null>(null);

  const fetchMyApplications = async () => {
    setErrorMy(null);
    setLoadingMyApps(true);
    try {
      const res = await fetch(`${BASE_URL}/candidates/applications`, {
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to fetch your applications");
      }
      const data: MyApplicationsResponse = await res.json();
      setMyApplications(data);
    } catch (err: any) {
      setErrorMy(err.message);
      setMyApplications([]);
    } finally {
      setLoadingMyApps(false);
    }
  };

  const applyToCourse = async (
    courseId: string,
    payload: ApplyToCourseRequest
  ) => {
    setErrorMy(null);
    try {
      const res = await fetch(
        `${BASE_URL}/candidates/courses/${courseId}/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to apply");
      }
      await fetchMyApplications();
    } catch (err: any) {
      setErrorMy(err.message);
      throw err;
    }
  };

  const updateMyApplication = async (
    courseId: string,
    payload: UpdateApplicationRequest
  ) => {
    setErrorMy(null);
    try {
      const res = await fetch(
        `${BASE_URL}/candidates/courses/${courseId}/applications/me`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update application");
      }
      await fetchMyApplications();
    } catch (err: any) {
      setErrorMy(err.message);
      throw err;
    }
  };

  const deleteMyApplication = async (courseId: string) => {
    setErrorMy(null);
    try {
      const res = await fetch(
        `${BASE_URL}/candidates/courses/${courseId}/applications/me`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) {
        const data = await res.json();
        console.error("Failed to delete application:", data.message);
      }
      await fetchMyApplications();
    } catch (err) {
      console.error("Error deleting application:", err);
    }
  };

  ////////////////////////////////////////////////////////////////////////////
  // 2) Lecturer‐side State + Methods
  ////////////////////////////////////////////////////////////////////////////

  const [lecturerApplications, setLecturerApplications] = useState<
    Record<string, LecturerApplication[]>
  >({});
  const [loadingLectApps, setLoadingLectApps] = useState(false);
  const [errorLect, setErrorLect] = useState<string | null>(null);

  const fetchLecturerApplications = async (courseId: string) => {
    setErrorLect(null);
    setLoadingLectApps(true);
    try {
      const res = await fetch(
        `${BASE_URL}/lecturer/courses/${courseId}/applications`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          data.message || "Failed to fetch applications for this course"
        );
      }
      const data: LecturerApplicationsResponse = await res.json();
      setLecturerApplications((prev) => ({
        ...prev,
        [courseId]: data,
      }));
    } catch (err: any) {
      setErrorLect(err.message);
      setLecturerApplications((prev) => ({
        ...prev,
        [courseId]: [],
      }));
    } finally {
      setLoadingLectApps(false);
    }
  };

  const updateApplicationStatus = async (
    courseId: string,
    applicationId: string,
    payload: UpdateApplicationStatusRequest
  ) => {
    setErrorLect(null);
    try {
      const res = await fetch(
        `${BASE_URL}/lecturer/courses/${courseId}/applications/${applicationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update status");
      }
      await fetchLecturerApplications(courseId);
    } catch (err: any) {
      setErrorLect(err.message);
      throw err;
    }
  };

  ////////////////////////////////////////////////////////////////////////////
  // 3) “Search / filter / sort / drag” logic for all courses + applicants
  ////////////////////////////////////////////////////////////////////////////

  // 3a) Raw list of “all courses” (each includes `applicants: LecturerApplication[]`)
  const [courses, setCourses] = useState<CourseWithApplicants[]>([]);

  // 3b) Full list of all candidate user‐profiles (for ApplicantCard to look up by userId)
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // 3c) Search + filter + sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<
    "all" | "full-time" | "part-time"
  >("all");
  const [sortCriteria, setSortCriteria] = useState<string>("course");

  // Called when a lecturer logs in / page loads to grab both:
  const fetchCoursesWithApplicants = async () => {
    try {
      const res = await fetch(`${BASE_URL}/courses`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch courses");
      // `/api/courses` returns CourseWithApplicants[] (each course plus `applicants`)
      const data: CourseWithApplicants[] = await res.json();
      setCourses(data);
    } catch (err: any) {
      toast({
        title: "Error loading courses",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchAllCandidateUsers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/candidates`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch candidates");
      const data: User[] = await res.json();
      setAllUsers(data);
    } catch (err: any) {
      toast({
        title: "Error loading users",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    if (user && user.isLecturer) {
      fetchCoursesWithApplicants();
      fetchAllCandidateUsers();
    }
  }, [user]);

  // 3d) “isFilteredView” is true if any search/filter/sort is active
  const isFilteredView = Boolean(
    searchTerm || availabilityFilter !== "all" || sortCriteria !== "course"
  );

  // 3e) “openPanels” – legacy components supply this to `<Accordion defaultIndex={openPanels}>`.
  // We choose `[]` so all panels are closed by default.  (Change to `[0]` if you want first panel open initially.)
  const openPanels: number[] = [];

  // 3f) Build “filteredApplicants” by applying searchTerm, availabilityFilter, and sortCriteria to `courses`
  const filteredApplicants = courses
    .filter((course) => {
      // — Filter by searchTerm matching course name/code OR any applicant’s name/skills
      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        const courseMatch =
          course.name.toLowerCase().includes(lower) ||
          course.courseCode.toLowerCase().includes(lower);
        const applicantMatch = course.applicants.some((app) => {
          return (
            app.name.toLowerCase().includes(lower) ||
            app.skills.some((skill) => skill.toLowerCase().includes(lower))
          );
        });
        if (!courseMatch && !applicantMatch) return false;
      }

      // — Filter by availability (if ≠ “all”)
      if (availabilityFilter !== "all") {
        const filterValue =
          availabilityFilter === "full-time" ? "Full-Time" : "Part-Time";
        const has =
          course.applicants.findIndex(
            (app) => app.availability === filterValue
          ) !== -1;
        if (!has) return false;
      }

      return true;
    })
    .map((course) => {
      // — If sortCriteria === “availability”, reorder that course’s applicants accordingly
      if (sortCriteria === "availability") {
        const sortedApps = [...course.applicants].sort((a, b) =>
          a.availability === "Full-Time" && b.availability === "Part-Time"
            ? -1
            : 1
        );
        return { ...course, applicants: sortedApps };
      }
      return course;
    });

  const handleSort = (criteria: string) => {
    setSortCriteria(criteria);
  };

  // 3g) onDragEnd: when an item is dropped, swap two applicants within a course
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!active || !over) return;
    const activeId = active.id as string; // e.g. "COSC101-<userId>"
    const overId = over.id as string;

    // parse out courseCode
    const [courseCode] = activeId.split("-");
    const idx = courses.findIndex((c) => c.courseCode === courseCode);
    if (idx === -1) return;
    const course = courses[idx];

    // find indices in course.applicants
    const oldIndex = course.applicants.findIndex(
      (app) => `${course.courseCode}-${app.userId}` === activeId
    );
    const newIndex = course.applicants.findIndex(
      (app) => `${course.courseCode}-${app.userId}` === overId
    );
    if (oldIndex === -1 || newIndex === -1) return;

    const newList = arrayMove(course.applicants, oldIndex, newIndex);
    const updatedCourse = { ...course, applicants: newList };
    const newCourses = [...courses];
    newCourses[idx] = updatedCourse;
    setCourses(newCourses);

    // (Optional) persist ranking to server via PATCH here, if desired.
  };

  ////////////////////////////////////////////////////////////////////////////
  // 4) Context Provider Value
  ////////////////////////////////////////////////////////////////////////////
  return (
    <ApplicationContext.Provider
      value={{
        //
        // Candidate state & methods
        //
        myApplications,
        loadingMyApps,
        errorMy,
        applyToCourse,
        updateMyApplication,
        deleteMyApplication,
        fetchMyApplications,

        //
        // Lecturer state & methods
        //
        lecturerApplications,
        loadingLectApps,
        errorLect,
        fetchLecturerApplications,
        updateApplicationStatus,

        //
        // Search/filter/sort/drag state
        //
        courses,
        allUsers,
        filteredApplicants,
        searchTerm,
        setSearchTerm,
        availabilityFilter,
        setAvailabilityFilter,
        sortCriteria,
        handleSort,
        isFilteredView,
        openPanels,
        handleDragEnd,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplications = (): ApplicationContextValue => {
  const ctx = useContext(ApplicationContext);
  if (!ctx) {
    throw new Error(
      "useApplications must be used within an <ApplicationProvider>"
    );
  }
  return ctx;
};

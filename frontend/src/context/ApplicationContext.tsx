// src/context/ApplicationContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useToast } from "@chakra-ui/react";
import { Course as CourseType } from "@/types/course";
import { User } from "@/types/user";
import { useAuth } from "./AuthContext";
import { useBlockedCandidates } from "./BlockedCandidatesContext";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

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


type CourseWithApplicants = CourseType & {
  applicants: LecturerApplication[];
};

interface ApplicationContextValue {
  // 1) Candidate‐side
  myApplications: CandidateApplication[];
  loadingMyApps: boolean;
  errorMy: string | null;
  applyToCourse: (courseId: string, payload: ApplyToCourseRequest) => Promise<void>;
  updateMyApplication: (courseId: string, payload: UpdateApplicationRequest) => Promise<void>;
  deleteMyApplication: (courseId: string) => Promise<void>;
  fetchMyApplications: () => Promise<void>;

  // 2) Lecturer‐side
  lecturerApplications: Record<string, LecturerApplication[]>;
  loadingLectApps: boolean;
  errorLect: string | null;
  fetchLecturerApplications: (courseId: string) => Promise<void>;
  updateApplicationStatus: (
    courseId: string,
    applicationId: string,
    payload: UpdateApplicationStatusRequest
  ) => Promise<void>;

  // 3) "Search/filter/sort/drag"
  courses: CourseWithApplicants[];
  allUsers: User[];

  filteredApplicants: CourseWithApplicants[];

  searchTerm: string;
  setSearchTerm: (t: string) => void;

  availabilityFilter: "all" | "full-time" | "part-time";
  setAvailabilityFilter: (f: "all" | "full-time" | "part-time") => void;

  sortCriteria: string; // "course" | "availability" | "role" | "grouped"
  handleSort: (c: string) => void;

  isFilteredView: boolean;
  openPanels: number[];

  handleDragEnd: (event: DragEndEvent) => void;
}

const ApplicationContext = createContext<ApplicationContextValue | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { onCandidateBlocked, removeCandidateBlockedCallback } = useBlockedCandidates();
  const toast = useToast();
  const BASE_URL = "http://localhost:5000/api";

  const [myApplications, setMyApplications] = useState<CandidateApplication[]>([]);
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
    } catch (err: unknown) {
      setErrorMy(err instanceof Error ? err.message : "Unknown error");
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setErrorMy(errorMessage);
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setErrorMy(errorMessage);
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

  const [lecturerApplications, setLecturerApplications] =
    useState<Record<string, LecturerApplication[]>>({});
  const [loadingLectApps, setLoadingLectApps] = useState(false);
  const [errorLect, setErrorLect] = useState<string | null>(null);

  const [courses, setCourses] = useState<CourseWithApplicants[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // 2a) Fetch all courses that this lecturer teaches
  const fetchCoursesWithApplicants = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/courses`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data: CourseWithApplicants[] = await res.json();

      const myId = user?.id;
      const myCourses = data.filter((course) => course.lecturer?.id === myId);
      setCourses(myCourses);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load courses";
      toast({
        title: "Error loading courses",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [user, toast]);

  // 2b) Fetch full list of candidate users
  const fetchAllCandidateUsers = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/candidates`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch candidates");
      const data: User[] = await res.json();
      setAllUsers(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load users";
      toast({
        title: "Error loading users",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  // 2c) Fetch applications for a single course
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch applications";
      setErrorLect(errorMessage);
      setLecturerApplications((prev) => ({
        ...prev,
        [courseId]: [],
      }));
    } finally {
      setLoadingLectApps(false);
    }
  };

  // 2d) Update an application's status, then re-fetch
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

      // (1) Re-fetch that course's applicant list
      await fetchLecturerApplications(courseId);

      // (2) Re-fetch all courses
      await fetchCoursesWithApplicants();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update status";
      setErrorLect(errorMessage);
      throw err;
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<
    "all" | "full-time" | "part-time"
  >("all");
  const [sortCriteria, setSortCriteria] = useState<string>("course");

  // True if any search/filter/sort is active
  const isFilteredView = Boolean(
    searchTerm || availabilityFilter !== "all" || sortCriteria !== "course"
  );

  // By default, no panels are open
  const openPanels: number[] = [];

  // Build filteredApplicants from `courses` + `allUsers`
  const filteredApplicants = courses
    .map((course) => {
      // Filter each course's applicants according to search/availability
      const filteredApps = (course.applicants || []).filter((app) => {
        // a) searchTerm
        if (searchTerm) {
          const lower = searchTerm.toLowerCase();
          const userObj = allUsers.find((u) => u.id === app.userId);
          const userName = userObj
            ? `${userObj.firstName} ${userObj.lastName}`.toLowerCase()
            : "";

          const nameMatches = userName.includes(lower);
          const skillMatches = (app.appliedSkills || []).some((skill) =>
            skill.toLowerCase().includes(lower)
          );
          if (!(nameMatches || skillMatches)) {
            return false;
          }
        }
        // b) availabilityFilter
        if (availabilityFilter !== "all") {
          const filterValue =
            availabilityFilter === "full-time" ? "Full-Time" : "Part-Time";
          if (app.appliedAvailability !== filterValue) {
            return false;
          }
        }
        return true;
      });

      return { ...course, applicants: filteredApps };
    })
    // Drop courses with no matching applicants AND course name/code doesn't match searchTerm
    .filter((course) => {
      if (course.applicants.length > 0) return true;
      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        return (
          course.name.toLowerCase().includes(lower) ||
          course.courseCode.toLowerCase().includes(lower)
        );
      }
      return false;
    })
    .map((course) => {
      // a) Availability sort (Full-Time first → Part-Time)
      if (sortCriteria === "availability") {
        const sortedApps = [...course.applicants].sort((a, b) =>
          a.appliedAvailability === "Full-Time" && b.appliedAvailability === "Part-Time"
            ? -1
            : 1
        );
        return { ...course, applicants: sortedApps };
      }

      // b) Role sort (Tutor first → Lab-Assistant)
      if (sortCriteria === "role") {
        const sortedApps = [...course.applicants].sort((a, b) =>
          a.role === "Tutor" && b.role === "Lab-Assistant"
            ? -1
            : a.role === b.role
            ? 0
            : 1
        );
        return { ...course, applicants: sortedApps };
      }

      // c) Grouped or default
      return course;
    });

  const handleSort = (criteria: string) => {
    setSortCriteria(criteria);
  };

  // When dragging ends, reorder locally and persist new rankings (role-based)
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;

    const activeAppId = active.id as string;
    const overAppId = over.id as string;

    // 1) Find the course and the active application details
    let courseIndex = -1;
    let activeApp: LecturerApplication | undefined;
    let overApp: LecturerApplication | undefined;

    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const active = course.applicants.find((a) => a.applicationId === activeAppId);
      const over = course.applicants.find((a) => a.applicationId === overAppId);
      
      if (active && over) {
        courseIndex = i;
        activeApp = active;
        overApp = over;
        break;
      }
    }

    if (courseIndex === -1 || !activeApp || !overApp) return;

    // 2) Ensure both applications are for the same role
    if (activeApp.role !== overApp.role) {
      console.warn("Cannot drag between different roles");
      return;
    }

    const course = courses[courseIndex];
    const role = activeApp.role;

    // 3) Get all applicants for this role, in order
    const roleApplicants = course.applicants.filter((a) => a.role === role);
    
    // 4) Find old and new indices within the role-specific list
    const oldIndex = roleApplicants.findIndex((a) => a.applicationId === activeAppId);
    const newIndex = roleApplicants.findIndex((a) => a.applicationId === overAppId);
    
    if (oldIndex === -1 || newIndex === -1) return;

    // 5) Reorder within the role list
    const newRoleList = arrayMove(roleApplicants, oldIndex, newIndex);

    // 6) Rebuild the full applicants list, maintaining other roles' order
    const otherRoleApplicants = course.applicants.filter((a) => a.role !== role);
    const newFullList = [
      ...newRoleList,
      ...otherRoleApplicants
    ];

    // 7) Update local state
    const updatedCourse = { ...course, applicants: newFullList };
    const newCourses = [...courses];
    newCourses[courseIndex] = updatedCourse;
    setCourses(newCourses);

    // 8) Persist rankings only for the moved role
    for (let i = 0; i < newRoleList.length; i++) {
      const lectApp = newRoleList[i];
      const newRank = i + 1; // Rank within this role
      try {
        await updateApplicationStatus(course.id, lectApp.applicationId, {
          ranking: newRank,
        });
      } catch (err) {
        console.warn(
          `Failed to update ranking=${newRank} for ${lectApp.applicationId} (${role})`,
          err
        );
      }
    }
  };


  useEffect(() => {
    if (user && user.isLecturer) {
      fetchCoursesWithApplicants();
      fetchAllCandidateUsers();
    } else {
      setCourses([]);
      setAllUsers([]);
    }
  }, [user, fetchCoursesWithApplicants, fetchAllCandidateUsers]);

  // Separate useEffect for registering blocked candidate callbacks
  useEffect(() => {
    if (user?.isLecturer) {
      // Register callback to refetch data when a candidate is blocked
      const handleCandidateBlocked = () => {
        console.log('[APPLICATION_CONTEXT] Candidate blocked - refetching data...');
        fetchCoursesWithApplicants();
        fetchAllCandidateUsers();
      };

      onCandidateBlocked(handleCandidateBlocked);

      // Cleanup callback on unmount or user change
      return () => {
        removeCandidateBlockedCallback(handleCandidateBlocked);
      };
    }
  }, [user?.isLecturer, onCandidateBlocked, removeCandidateBlockedCallback, fetchCoursesWithApplicants, fetchAllCandidateUsers]);

  return (
    <ApplicationContext.Provider
      value={{
        myApplications,
        loadingMyApps,
        errorMy,
        applyToCourse,
        updateMyApplication,
        deleteMyApplication,
        fetchMyApplications,

        lecturerApplications,
        loadingLectApps,
        errorLect,
        fetchLecturerApplications,
        updateApplicationStatus,

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
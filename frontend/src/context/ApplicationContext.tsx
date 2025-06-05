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

  // 3) “Search/filter/sort/drag”
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

  handleDragEnd: (event: any) => void;
}

const ApplicationContext = createContext<ApplicationContextValue | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
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

  const [lecturerApplications, setLecturerApplications] =
    useState<Record<string, LecturerApplication[]>>({});
  const [loadingLectApps, setLoadingLectApps] = useState(false);
  const [errorLect, setErrorLect] = useState<string | null>(null);

  const [courses, setCourses] = useState<CourseWithApplicants[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // 2a) Fetch all courses that this lecturer teaches
  const fetchCoursesWithApplicants = async () => {
    try {
      const res = await fetch(`${BASE_URL}/courses`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data: CourseWithApplicants[] = await res.json();

      const myId = user?.id;
      const myCourses = data.filter((course) => course.lecturer?.id === myId);
      setCourses(myCourses);
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

  // 2b) Fetch full list of candidate users
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

  // 2d) Update an application’s status, then re-fetch
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

      // (1) Re-fetch that course’s applicant list
      await fetchLecturerApplications(courseId);

      // (2) Re-fetch all courses
      await fetchCoursesWithApplicants();
    } catch (err: any) {
      setErrorLect(err.message);
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
      // Filter each course’s applicants according to search/availability
      let filteredApps = (course.applicants || []).filter((app) => {
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
    // Drop courses with no matching applicants AND course name/code doesn’t match searchTerm
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

  // When dragging ends, reorder locally and persist new rankings
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!active || !over) return;

    const activeAppId = active.id as string;
    const overAppId = over.id as string;

    // 1) Figure out which course contains that applicationId
    let courseIndex = -1;
    let oldIndex = -1;
    for (let i = 0; i < courses.length; i++) {
      const idxInCourse = courses[i].applicants.findIndex(
        (a) => a.applicationId === activeAppId
      );
      if (idxInCourse > -1) {
        courseIndex = i;
        oldIndex = idxInCourse;
        break;
      }
    }
    if (courseIndex === -1) return;
    const course = courses[courseIndex];

    // 2) Find newIndex within that same course by matching applicationId
    const newIndex = course.applicants.findIndex(
      (a) => a.applicationId === overAppId
    );
    if (newIndex === -1) return;

    // 3) Reorder locally
    const newList = arrayMove(course.applicants, oldIndex, newIndex);
    const updatedCourse = { ...course, applicants: newList };
    const newCourses = [...courses];
    newCourses[courseIndex] = updatedCourse;
    setCourses(newCourses);

    // 4) Persist each applicant’s updated ranking
    for (let i = 0; i < newList.length; i++) {
      const lectApp = newList[i];
      const newRank = i + 1;
      try {
        await updateApplicationStatus(course.id, lectApp.applicationId, {
          ranking: newRank,
        });
      } catch (err) {
        console.warn(
          `Failed to update ranking=${newRank} for ${lectApp.applicationId}`,
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
  }, [user]);

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
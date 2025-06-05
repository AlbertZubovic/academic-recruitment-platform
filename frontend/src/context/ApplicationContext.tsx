// src/context/ApplicationContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
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
import { useAuth } from "./AuthContext";

interface ApplicationContextValue {
  myApplications: CandidateApplication[];
  lecturerApplications: Record<string, LecturerApplication[]>;
  loadingMyApps: boolean;
  loadingLecturerApps: boolean;
  error: string | null;

  // Candidate methods
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

  // Lecturer methods
  fetchLecturerApplications: (courseId: string) => Promise<void>;
  updateApplicationStatus: (
    courseId: string,
    applicationId: string,
    payload: UpdateApplicationStatusRequest
  ) => Promise<void>;
}

const ApplicationContext = createContext<ApplicationContextValue | undefined>(
  undefined
);

export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [myApplications, setMyApplications] = useState<CandidateApplication[]>(
    []
  );
  const [lecturerApplications, setLecturerApplications] = useState<
    Record<string, LecturerApplication[]>
  >({});
  const [loadingMyApps, setLoadingMyApps] = useState(false);
  const [loadingLecturerApps, setLoadingLecturerApps] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = "http://localhost:5000/api";

  const fetchMyApplications = async () => {
    setError(null);
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
      setError(err.message);
      setMyApplications([]);
    } finally {
      setLoadingMyApps(false);
    }
  };

  const fetchLecturerApplications = async (courseId: string) => {
    setError(null);
    setLoadingLecturerApps(true);
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
      setError(err.message);
      setLecturerApplications((prev) => ({
        ...prev,
        [courseId]: [],
      }));
    } finally {
      setLoadingLecturerApps(false);
    }
  };

  const applyToCourse = async (
    courseId: string,
    payload: ApplyToCourseRequest
  ) => {
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/candidates/courses/${courseId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to apply");
      }
      await fetchMyApplications();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateMyApplication = async (
    courseId: string,
    payload: UpdateApplicationRequest
  ) => {
    setError(null);
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
      setError(err.message);
      throw err;
    }
  };

  const deleteMyApplication = async (courseId: string) => {
    setError(null);
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

  const updateApplicationStatus = async (
    courseId: string,
    applicationId: string,
    payload: UpdateApplicationStatusRequest
  ) => {
    setError(null);
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
      setError(err.message);
      throw err;
    }
  };


  useEffect(() => {
    if (user && user.isCandidate) {
      fetchMyApplications();
    } else {
      setMyApplications([]);
    }
    if (!user || !user.isLecturer) {
      setLecturerApplications({});
    }

  }, [user]);

  return (
    <ApplicationContext.Provider
      value={{
        myApplications,
        lecturerApplications,
        loadingMyApps,
        loadingLecturerApps,
        error,
        applyToCourse,
        updateMyApplication,
        deleteMyApplication,
        fetchMyApplications,
        fetchLecturerApplications,
        updateApplicationStatus,
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

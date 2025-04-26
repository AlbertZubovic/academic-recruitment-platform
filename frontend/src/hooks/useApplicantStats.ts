// src/hooks/useApplicantStats.ts

// Hook for statistical analysis of tutor applicant selections
// Calculates most/least selected applicants and unselected applicants

import { useEffect, useMemo, useState } from "react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  skills: string[];
  credentials: string;
  isTutor?: boolean;
}

export const useApplicantStats = (selectedApplicantIds: number[]) => {
  const [applicants, setApplicants] = useState<User[]>([]);

  // Load tutors from localStorage on component mount
  useEffect(() => {
    const rawUsers = localStorage.getItem("Users");

    if (rawUsers) {
      try {
        const parsed: User[] = JSON.parse(rawUsers);
        const tutorApplicants = parsed.filter((u: User) => u.isTutor);
        setApplicants(tutorApplicants);
      } catch (err) {
        console.error("Failed to parse tutor data from localStorage", err);
        setApplicants([]);
      }
    }
  }, []);

  // Add selection count to each applicant
  const withCounts = useMemo(() => {
    return applicants.map((applicant) => ({
      ...applicant,
      count: selectedApplicantIds.filter((id) => id === applicant.id).length,
    }));
  }, [applicants, selectedApplicantIds]);

  // Find most selected applicant
  const mostChosen = withCounts.length
    ? withCounts.reduce((a, b) => (a.count > b.count ? a : b))
    : null;

  // Find least selected applicant (with non-zero count)
  const validApplicants = withCounts.filter((a) => a.count > 0);
  const leastChosen = validApplicants.length
    ? validApplicants.reduce((a, b) => (a.count < b.count ? a : b))
    : null;

  // Find unselected applicants
  const notSelected = withCounts.filter((a) => a.count === 0);

  return {
    mostChosen,
    leastChosen,
    notSelected,
    all: withCounts,
  };
};

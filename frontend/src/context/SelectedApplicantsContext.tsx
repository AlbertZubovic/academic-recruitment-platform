// src/context/SelectedApplicantsContext.tsx

/**
 * SelectedApplicantsContext
 * Manages which tutor applicants are selected for each course.
 * Provides:
 * Access to currently selected applicants per course
 * Function to toggle applicant selection
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

// Define localStorage key
const LS_KEY = "selectedApplicants";

// Define the context value
interface SelectedApplicantsContextType {
  selectedApplicants: Record<string, string[]>;
  toggleApplicantSelection: (
    applicantId: string,
    courseId: string,
    toast?: (status: "selected" | "deselected") => void
  ) => void;
  loading: boolean;
}

// Create context
const SelectedApplicantsContext = createContext<SelectedApplicantsContextType | undefined>(
  undefined
);

// Custom hook to access context
export const useSelectedApplicants = (): SelectedApplicantsContextType => {
  const context = useContext(SelectedApplicantsContext);
  if (!context) {
    throw new Error("useSelectedApplicants must be used within a SelectedApplicantsProvider");
  }
  return context;
};

interface SelectedApplicantsProviderProps {
  children: ReactNode;
}

// Provider component
export const SelectedApplicantsProvider: React.FC<SelectedApplicantsProviderProps> = ({
  children,
}) => {
  const [selectedApplicants, setSelectedApplicants] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch selected applicants from API
  useEffect(() => {
    const fetchSelectedApplicants = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setSelectedApplicants({});
          return;
        }

        const response = await fetch("http://localhost:5000/api/applications/selected", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch selected applicants");
        }

        const data = await response.json();
        // Transform API response to our format if needed
        const transformedData = data.reduce((acc: Record<string, string[]>, curr: any) => {
          if (!acc[curr.courseId]) {
            acc[curr.courseId] = [];
          }
          acc[curr.courseId].push(curr.userId);
          return acc;
        }, {});
        
        setSelectedApplicants(transformedData);
      } catch (err) {
        console.error("Failed to fetch selected applicants:", err);
        setSelectedApplicants({});
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedApplicants();
  }, [user]); // Re-fetch when user changes

  /**
   * Toggles an applicant selection for a given course.
   * Adds if not selected
   * Removes if already selected
   * Optional toast callback returns the action for UI feedback
   */
  const toggleApplicantSelection = async (
    applicantId: string,
    courseId: string,
    toast?: (status: "selected" | "deselected") => void
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const currentSelections = selectedApplicants[courseId] || [];
      const isSelected = currentSelections.includes(applicantId);

      const response = await fetch(`http://localhost:5000/api/applications/${courseId}/select/${applicantId}`, {
        method: isSelected ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isSelected ? "deselect" : "select"} applicant`);
      }

      // Update local state
      const updatedSelections = isSelected
        ? currentSelections.filter((id) => id !== applicantId)
        : [...currentSelections, applicantId];

      setSelectedApplicants({
        ...selectedApplicants,
        [courseId]: updatedSelections,
      });

      if (toast) toast(isSelected ? "deselected" : "selected");
    } catch (err) {
      console.error("Failed to toggle applicant selection:", err);
    }
  };

  return (
    <SelectedApplicantsContext.Provider
      value={{ selectedApplicants, toggleApplicantSelection, loading }}
    >
      {children}
    </SelectedApplicantsContext.Provider>
  );
};

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

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (typeof parsed === "object") {
          setSelectedApplicants(parsed);
        }
      } catch {
        console.warn("Failed to parse selected applicants from localStorage");
      }
    }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(selectedApplicants));
  }, [selectedApplicants]);

  /**
   * Toggles an applicant selection for a given course.
   * Adds if not selected
   * Removes if already selected
   * Optional toast callback returns the action for UI feedback
   */
  const toggleApplicantSelection = (
    applicantId: string,
    courseId: string,
    toast?: (status: "selected" | "deselected") => void
  ) => {
    const currentSelections = selectedApplicants[courseId] || [];
    const isSelected = currentSelections.includes(applicantId);

    const updatedSelections = isSelected
      ? currentSelections.filter((id) => id !== applicantId)
      : [...currentSelections, applicantId];

    const action: "selected" | "deselected" = isSelected ? "deselected" : "selected";

    setSelectedApplicants({
      ...selectedApplicants,
      [courseId]: updatedSelections,
    });

    if (toast) toast(action);
  };

  return (
    <SelectedApplicantsContext.Provider
      value={{ selectedApplicants, toggleApplicantSelection }}
    >
      {children}
    </SelectedApplicantsContext.Provider>
  );
};

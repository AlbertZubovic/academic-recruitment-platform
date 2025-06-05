// src/context/SelectedApplicantsContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

//
// Keeps track of which applicants (by userId) have been “selected” for each course.
//

interface SelectedApplicantsContextValue {
  selectedApplicants: Record<string, string[]>;

  /**
   * Toggles selection of a given userId under a given courseId.
   * Calls callback if newly added, or if removed.
   */
  toggleApplicantSelection: (
    userId: string,
    courseId: string,
    callback: (action: "selected" | "deselected") => void
  ) => void;
}

const SelectedApplicantsContext = createContext<
  SelectedApplicantsContextValue | undefined
>(undefined);

export const SelectedApplicantsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedApplicants, setSelectedApplicants] = useState<
    Record<string, string[]>
  >({});

  const toggleApplicantSelection = (
    userId: string,
    courseId: string,
    callback: (action: "selected" | "deselected") => void
  ) => {
    setSelectedApplicants((prev) => {
      const currentList = prev[courseId] ?? [];
      const isAlready = currentList.includes(userId);

      let newList: string[];
      if (isAlready) {
        newList = currentList.filter((id) => id !== userId);
        callback("deselected");
      } else {
        newList = [...currentList, userId];
        callback("selected");
      }

      return {
        ...prev,
        [courseId]: newList,
      };
    });
  };

  return (
    <SelectedApplicantsContext.Provider
      value={{
        selectedApplicants,
        toggleApplicantSelection,
      }}
    >
      {children}
    </SelectedApplicantsContext.Provider>
  );
};

export const useSelectedApplicants = (): SelectedApplicantsContextValue => {
  const ctx = useContext(SelectedApplicantsContext);
  if (!ctx) {
    throw new Error(
      "useSelectedApplicants must be used within <SelectedApplicantsProvider>"
    );
  }
  return ctx;
};

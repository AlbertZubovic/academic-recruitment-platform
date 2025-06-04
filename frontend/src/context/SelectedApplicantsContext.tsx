// src/context/SelectedApplicantsContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

//
// This context keeps track of which applicants (by userId) have been
// “selected” or “deselected” for each course. Internally we store a map:
//    { [courseId: string]: string[] }
// where the array is the list of userIds selected for that course.
//

interface SelectedApplicantsContextValue {
  /** 
   * For each courseId, an array of userIds that are currently “checked.”
   */
  selectedApplicants: Record<string, string[]>;

  /**
   * Toggles selection of a given userId under a given courseId.
   * Invokes the callback with "selected" if that userId was just added,
   * or "deselected" if it was just removed.
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
        // remove it
        newList = currentList.filter((id) => id !== userId);
        callback("deselected");
      } else {
        // add it
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

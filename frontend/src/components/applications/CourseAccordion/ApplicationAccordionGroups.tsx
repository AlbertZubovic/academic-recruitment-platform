// src/components/applications/ApplicationAccordionGroups.tsx

/**
 * ApplicationAccordionGroups.tsx
 *
 * Renders grouped or flat accordions of courses + their applicants,
 * based on the current sort/filter settings in ApplicationContext.
 */

import React from "react";
import { Box, Accordion, Heading } from "@chakra-ui/react";
import { useApplications } from "@/context/ApplicationContext";
import ApplicationAccordionItem from "./ApplicationAccordionItem";

/**
 * We know each course in `filteredApplicants` has this shape:
 *   {
 *     id: string;
 *     courseCode: string;
 *     name: string;
 *     semester: string;
 *     rolesAvailable: string[];
 *     isDisabled: boolean;
 *     skills: string[];
 *     lecturer: UserSummary | null;
 *     applicants: LecturerApplication[];
 *     // ...plus any other Course fields…
 *   }
 *
 * For conciseness, we’ll rely on TS inference rather than re‐declaring a new interface here.
 */

const ApplicationAccordionGroups: React.FC = () => {
  // Pull everything we need from the new context hook:
  const {
    filteredApplicants,
    openPanels,
    sortCriteria,
  } = useApplications();

  // Helper to render a single “group” section (High/Medium/Low demand):
  const renderGroup = (
    label: string,
    color: string,
    filterFn: (c: typeof filteredApplicants[number]) => boolean
  ) => {
    const group = filteredApplicants.filter(filterFn);
    if (group.length === 0) return null;

    return (
      <Box key={label} mt={8}>
        <Heading size="md" mb={3} color={color}>
          {label}
        </Heading>
        <Accordion allowMultiple defaultIndex={openPanels}>
          {group.map((course) => (
            <ApplicationAccordionItem key={course.id} course={course} />
          ))}
        </Accordion>
      </Box>
    );
  };

  // If “grouped” sort is active, break into demand buckets:
  if (sortCriteria === "grouped") {
    return (
      <>
        {renderGroup(
          "High Demand Courses",
          "purple.600",
          (c) => c.applicants.length >= 5
        )}
        {renderGroup(
          "Medium Demand Courses",
          "orange.500",
          (c) => c.applicants.length >= 2 && c.applicants.length < 5
        )}
        {renderGroup(
          "Low Demand Courses",
          "gray.600",
          (c) => c.applicants.length < 2
        )}
      </>
    );
  }

  // Otherwise, show one flat Accordion of all filtered courses:
  return (
    <Accordion allowMultiple defaultIndex={openPanels}>
      {filteredApplicants.map((course) => (
        <ApplicationAccordionItem key={course.id} course={course} />
      ))}
    </Accordion>
  );
};

export default ApplicationAccordionGroups;

/**
 * ApplicationAccordionGroups.tsx
 *
 * Responsible for rendering grouped or ungrouped accordions of courses.
 * Uses sorting/filtering logic from ApplicationContext to determine layout:
 * Grouped view: Courses are bucketed into High, Medium, Low demand groups
 * Default view: Courses are listed in one flat accordion list
 *
 * Renders an ApplicationAccordionItem for each course, which contains its applicants.
 */

import React from "react";
import { Box, Accordion, Heading } from "@chakra-ui/react";
import { useApplicationContext } from "@/context/ApplicationContext";
import ApplicationAccordionItem from "./ApplicationAccordionItem";
import { Course } from "@/types/course";

const ApplicationAccordionGroups = () => {
  // Access state and sorting preference from context
  const {
    filteredApplicants,
    openPanels,
    sortCriteria,
  } = useApplicationContext();

  // Renders a heading + accordion section for a grouped category.
  const renderGroup = (label: string, color: string, filter: (c: Course) => boolean) => {
    const group = filteredApplicants.filter(filter);
    if (group.length === 0) return null; // If no matching courses, skip the section

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

  // When sort is set to grouped, display demand buckets
  if (sortCriteria === "grouped") {
    return (
      <>
        {renderGroup("High Demand Courses", "purple.600", (c) => c.applicants.length >= 5)}
        {renderGroup("Medium Demand Courses", "orange.500", (c) =>
          c.applicants.length >= 2 && c.applicants.length < 5
        )}
        {renderGroup("Low Demand Courses", "gray.600", (c) => c.applicants.length < 2)}
      </>
    );
  }

  // Default view: flat list of all filtered courses
  return (
    <Accordion allowMultiple defaultIndex={openPanels}>
      {filteredApplicants.map((course) => (
        <ApplicationAccordionItem key={course.id} course={course} />
      ))}
    </Accordion>
  );
};

export default ApplicationAccordionGroups;

// src/components/applications/ApplicationAccordionGroups.tsx

import React from "react";
import { Box, Accordion, Heading, useColorModeValue } from "@chakra-ui/react";
import { useApplications } from "@/context/ApplicationContext";
import ApplicationAccordionItem from "./ApplicationAccordionItem";

interface ApplicationAccordionGroupsProps {
  expandedIndices: number[];
  setExpandedIndices: (vals: number[]) => void;
  allExpanded: boolean;
}

const ApplicationAccordionGroups: React.FC<ApplicationAccordionGroupsProps> = ({
  expandedIndices,
  setExpandedIndices,
  allExpanded,
}) => {
  const { filteredApplicants, sortCriteria } = useApplications();

  const highColor = useColorModeValue("purple.600", "purple.300");
  const medColor = useColorModeValue("orange.500", "orange.300");
  const lowColor = useColorModeValue("gray.600", "gray.400");

  // Render a group (High/Medium/Low demand)
  const renderGroup = (
    label: string,
    color: string,
    filterFn: (c: typeof filteredApplicants[number]) => boolean
  ) => {
    const group = filteredApplicants.filter(filterFn);
    if (group.length === 0) return null;

    // Compute default indices [0,1,2,...] if allExpanded; otherwise []
    const defaultIdx = allExpanded ? group.map((_, i) => i) : [];

    return (
      <Box key={label} mt={8}>
        <Heading size="md" mb={3} color={color}>
          {label}
        </Heading>

        {/* Use `key` to force remount when allExpanded toggles */}
        <Accordion
          allowMultiple
          defaultIndex={defaultIdx}
          key={allExpanded ? "all" : "none"}
        >
          {group.map((course) => (
            <ApplicationAccordionItem key={course.id} course={course} />
          ))}
        </Accordion>
      </Box>
    );
  };

  // If “grouped” sort is active, show by demand buckets:
  if (sortCriteria === "grouped") {
    return (
      <>
        {renderGroup(
          "High Demand Courses",
          highColor,
          (c) => c.applicants.length >= 5
        )}
        {renderGroup(
          "Medium Demand Courses",
          medColor,
          (c) => c.applicants.length >= 2 && c.applicants.length < 5
        )}
        {renderGroup(
          "Low Demand Courses",
          lowColor,
          (c) => c.applicants.length < 2
        )}
      </>
    );
  }

  // Otherwise, flat list, fully controlled by expandedIndices:
  return (
    <Accordion
      allowMultiple
      index={expandedIndices}
      onChange={(newIndices) =>
        setExpandedIndices(newIndices as number[])
      }
    >
      {filteredApplicants.map((course) => (
        <ApplicationAccordionItem key={course.id} course={course} />
      ))}
    </Accordion>
  );
};

export default ApplicationAccordionGroups;

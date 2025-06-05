// src/components/applications/CourseAccordion/ApplicationAccordionItem.tsx

/**
 * ApplicationAccordionItem.tsx
 *
 * Renders one course’s AccordionItem:
 * - Header with course name + applicant count
 * - AccordionPanel listing that course’s applicants
 *   (wrapped in a SortableContext if not filtered)
 */

import React from "react";
import {
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
  VStack,
  Badge,
  Flex,
  Tooltip,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { useApplications } from "@/context/ApplicationContext";
import SortableItem from "../Controls/SortableItem";
import ApplicantCard from "../Applicant/ApplicantCard";

import { LecturerApplication } from "@/types/Application";
import { Course as CourseType } from "@/types/course";

/**
 * We expect each `course` prop to have:
 *   {
 *     id: string;
 *     courseCode: string;
 *     name: string;
 *     applicants: LecturerApplication[];
 *     // plus other Course fields (semester, rolesAvailable, skills, lecturer, etc.)
 *   }
 */
interface ApplicationAccordionItemProps {
  course: CourseType & { applicants: LecturerApplication[] };
}

const ApplicationAccordionItem: React.FC<ApplicationAccordionItemProps> = ({
  course,
}) => {
  const { isFilteredView } = useApplications();

  return (
    <AccordionItem
      mb={4}
      borderWidth={1}
      borderColor="gray.200"
      borderRadius="md"
      overflow="hidden"
    >
      {/* Accordion Header */}
      <AccordionButton _expanded={{ bg: "blue.100" }}>
        <Box flex="1" textAlign="left">
          <Text fontWeight="bold" fontSize="lg" color="blue.600">
            {course.name} ({course.courseCode}){" "}
            <Badge
              ml={2}
              colorScheme="gray"
              variant="solid"
              borderRadius="full"
              px={2}
            >
              {course.applicants.length} applicant
              {course.applicants.length !== 1 ? "s" : ""}
            </Badge>
          </Text>
        </Box>
        <AccordionIcon />
      </AccordionButton>

      {/* Accordion Content */}
      <AccordionPanel bg="gray.50" p={4}>
        {course.applicants.length === 0 ? (
          <Text color="gray.500" fontStyle="italic">
            No applicants for this course.
          </Text>
        ) : (
          <SortableContext
            // Each “item” ID must be a unique string.
            // We use applicationId (UUID) to guarantee uniqueness.
            items={course.applicants.map(
              (app: LecturerApplication) => app.applicationId
            )}
            strategy={verticalListSortingStrategy}
          >
            <VStack spacing={4} align="stretch">
              {course.applicants.map((applicantDetail, index) => {
                // applicationId is guaranteed to be unique for each row
                const uniqueItemId = applicantDetail.applicationId;

                return (
                  <SortableItem
                    key={uniqueItemId}      // <-- This is the React “key”
                    id={uniqueItemId}       // <-- And dnd-kit’s “id”
                    isDragDisabled={isFilteredView}
                  >
                    {(dragHandleProps) => (
                      <Box
                        bg="white"
                        borderRadius="md"
                        boxShadow="sm"
                        w="100%"
                        border="1px solid"
                        borderColor="gray.200"
                      >
                        <Flex align="center" p={2}>
                          <Tooltip
                            label={
                              isFilteredView
                                ? "Ranking disabled while filtering"
                                : "Drag to Rank"
                            }
                            placement="left"
                            hasArrow
                          >
                            <Box
                              cursor={isFilteredView ? "not-allowed" : "grab"}
                              pr={3}
                              py={2}
                              opacity={isFilteredView ? 0.4 : 1}
                              // Only spread listeners when drag is allowed
                              {...(isFilteredView
                                ? {}
                                : { ...dragHandleProps })}
                              aria-label="Drag to reorder applicant"
                            >
                              <HamburgerIcon color="gray.500" />
                            </Box>
                          </Tooltip>

                          <Box flex="1">
                            <ApplicantCard
                              applicationDetails={applicantDetail}
                              courseId={course.id}
                            />
                          </Box>

                          {!isFilteredView && (
                            <Tooltip
                              label={`Current Rank: ${index + 1}`}
                              placement="right"
                              hasArrow
                            >
                              <Badge
                                colorScheme="purple"
                                variant="solid"
                                fontSize="md"
                                px={3}
                                py={1}
                                borderRadius="full"
                                ml={2}
                              >
                                #{index + 1}
                              </Badge>
                            </Tooltip>
                          )}
                        </Flex>
                      </Box>
                    )}
                  </SortableItem>
                );
              })}
            </VStack>
          </SortableContext>
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};

export default ApplicationAccordionItem;

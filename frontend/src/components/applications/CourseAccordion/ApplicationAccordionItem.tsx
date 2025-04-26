// src/components/applications/CourseAccordion/ApplicationAccordionItem.tsx

/**
 * ApplicationAccordionItem.tsx
 *
 * This component renders a single accordion item for a course.
 * It includes:
 * A header with course name and number of applicants
 * A collapsible panel showing all applicant cards for the course
 * Drag and drop support via SortableItem (disabled in filtered view)
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

import { useApplicationContext } from "@/context/ApplicationContext";
import SortableItem from "../Controls/SortableItem"; // Assuming this component exists and works with dnd-kit
import ApplicantCard from "../Applicant/ApplicantCard"; // The component displaying applicant info

import { Course } from "@/types/course";

import { Applicant } from "@/types/applicant"; // The type for application details

// Define props for the component
interface ApplicationAccordionItemProps {
  course: Course;
}

const ApplicationAccordionItem: React.FC<ApplicationAccordionItemProps> = ({ course }) => {
  // Get necessary data and state from the ApplicationContext
  // NOTE: We don't actually need allUsers directly here anymore,
  // as ApplicantCard fetches the profile itself.
  const { isFilteredView } = useApplicationContext();

  return (
    <AccordionItem mb={4} borderWidth={1} borderColor="gray.200" borderRadius="md" overflow="hidden">
      {/* Header Button for Accordion */}
      <AccordionButton _expanded={{ bg: "blue.100" }}>
        <Box flex="1" textAlign="left">
          <Text fontWeight="bold" fontSize="lg" color="blue.600">
            {course.name} ({course.courseCode}){" "}
            <Badge ml={2} colorScheme="gray" variant="solid" borderRadius="full" px={2}>
              {course.applicants.length} applicant{course.applicants.length !== 1 ? 's' : ''}
            </Badge>
          </Text>
        </Box>
        <AccordionIcon />
      </AccordionButton>

      {/* Accordion Content Panel */}
      <AccordionPanel bg="gray.50" p={4}>
        {/* Display message if no applicants */}
        {course.applicants.length === 0 ? (
          <Text color="gray.500" fontStyle="italic">
            No applicants for this course.
          </Text>
        ) : (
          // If there are applicants, set up the sortable context
          <SortableContext
            // Provide unique string IDs for each applicant in this course context
            items={course.applicants.map((applicantDetail: Applicant) => `${course.courseCode}-${applicantDetail.userId}`)}
            strategy={verticalListSortingStrategy} // How items rearrange visually
          >
            <VStack spacing={4} align="stretch">
              {/* Map through the applicants for this course */}
              {course.applicants.map((applicantDetail: Applicant, index: number) => {
                // We don't need to find the userProfile here anymore

                // Generate the unique ID for dnd-kit for this specific item
                const uniqueItemId = `${course.courseCode}-${applicantDetail.userId}`;

                return (
                  // Wrap each applicant card in a SortableItem for drag functionality
                  <SortableItem
                    key={uniqueItemId} // React key must be unique
                    id={uniqueItemId} // ID used by dnd-kit
                    isDragDisabled={isFilteredView} // Disable dragging if filters/sorting are active
                  >
                    {/* Render prop provides drag handle props */}
                    {(dragHandleProps) => (
                      // Styling wrapper for the draggable item
                      <Box
                        bg="white"
                        borderRadius="md"
                        boxShadow="sm"
                        w="100%"
                        border="1px solid"
                        borderColor="gray.200"
                      >
                        <Flex align="center" p={2}>
                          {/* Drag Handle - only visually active when not filtered */}
                          <Tooltip label={isFilteredView ? "Ranking disabled while filtering" : "Drag to Rank"} placement="left" hasArrow>
                            <Box
                              cursor={isFilteredView ? "not-allowed" : "grab"}
                              pr={3} // Increased padding for easier grabbing
                              py={2} // Vertical padding for handle area
                              opacity={isFilteredView ? 0.4 : 1}
                              {...dragHandleProps} // Apply drag listeners and attributes here
                              aria-label="Drag to reorder applicant"
                            >
                              <HamburgerIcon color="gray.500" />
                            </Box>
                          </Tooltip>

                          {/* Main applicant content */}
                          <Box flex="1">
                            {/* --- FIX: Remove userProfile prop --- */}
                            <ApplicantCard
                              // userProfile={userProfile} // REMOVED
                              applicationDetails={applicantDetail}
                              courseId={course.id} // Pass the course ID
                            />
                          </Box>

                          {/* Preference badge (only show when not filtered/sorted by availability) */}
                          {!isFilteredView && (
                            <Tooltip label={`Current Rank: ${index + 1}`} placement="right" hasArrow>
                              <Badge
                                colorScheme="purple"
                                variant="solid"
                                fontSize="md" // Slightly larger font
                                px={3}
                                py={1}
                                borderRadius="full" // Fully rounded badge
                                ml={2} // Margin to separate from card content
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
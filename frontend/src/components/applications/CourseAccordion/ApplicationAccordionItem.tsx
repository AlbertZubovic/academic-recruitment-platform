// src/components/applications/CourseAccordion/ApplicationAccordionItem.tsx

import React, { useState, useEffect } from "react";
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
  IconButton,
  Textarea,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { HamburgerIcon, CopyIcon } from "@chakra-ui/icons";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { useApplications } from "@/context/ApplicationContext";
import SortableItem from "../Controls/SortableItem";
import ApplicantCard from "../Applicant/ApplicantCard";

import { LecturerApplication } from "@/types/Application";
import { Course as CourseType } from "@/types/course";

interface ApplicationAccordionItemProps {
  course: CourseType & { applicants: LecturerApplication[] };
}

const ApplicationAccordionItem: React.FC<ApplicationAccordionItemProps> = ({
  course,
}) => {
  const { isFilteredView } = useApplications();
  const toast = useToast();

  // Color mode values
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headerBgExpanded = useColorModeValue("blue.100", "blue.900");
  const panelBg = useColorModeValue("gray.50", "gray.700");
  const cardBg = useColorModeValue("white", "gray.600");
  const cardBorderColor = useColorModeValue("gray.200", "gray.600");
  const noApplicantsTextColor = useColorModeValue("gray.500", "gray.400");

  // 1) Count statuses
  const pendingCount = course.applicants.filter((a) => a.status === "Pending")
    .length;
  const approvedCount = course.applicants.filter((a) => a.status === "Approved")
    .length;
  const rejectedCount = course.applicants.filter((a) => a.status === "Rejected")
    .length;

  const copyCourseName = () => {
    navigator.clipboard.writeText(course.name).then(() => {
      toast({
        title: "Course name copied!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    });
  };

  return (
    <AccordionItem
      mb={4}
      borderWidth={1}
      borderColor={borderColor}
      borderRadius="md"
      overflow="hidden"
    >
      {/* Accordion Header */}
      <AccordionButton _expanded={{ bg: headerBgExpanded }}>
        <Box flex="1" textAlign="left">
          <Text fontWeight="bold" fontSize="lg" color={useColorModeValue("blue.600", "blue.300")}>
            {course.name} ({course.courseCode}){" "}
            <Badge ml={2} colorScheme="gray" variant="solid" borderRadius="full" px={2}>
              {course.applicants.length} applicant
              {course.applicants.length !== 1 ? "s" : ""}
            </Badge>

            {/* Status badges */}
            {pendingCount > 0 && (
              <Badge ml={2} colorScheme="yellow" borderRadius="full">
                {pendingCount} Pending
              </Badge>
            )}
            {approvedCount > 0 && (
              <Badge ml={2} colorScheme="green" borderRadius="full">
                {approvedCount} Approved
              </Badge>
            )}
            {rejectedCount > 0 && (
              <Badge ml={2} colorScheme="red" borderRadius="full">
                {rejectedCount} Rejected
              </Badge>
            )}
          </Text>
        </Box>

        {/* Copy Course Name button */}
        <Tooltip label="Copy course name to clipboard" placement="left" hasArrow>
          <IconButton
            aria-label="Copy course name"
            icon={<CopyIcon />}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              copyCourseName();
            }}
            mr={2}
          />
        </Tooltip>

        <AccordionIcon />
      </AccordionButton>

      {/* Accordion Content */}
      <AccordionPanel bg={panelBg} p={4}>
        {course.applicants.length === 0 ? (
          <Text color={noApplicantsTextColor} fontStyle="italic">
            No applicants for this course.
          </Text>
        ) : (
          <SortableContext
            items={course.applicants.map(
              (app: LecturerApplication) => app.applicationId
            )}
            strategy={verticalListSortingStrategy}
          >
            <VStack spacing={4} align="stretch">
              {course.applicants.map((applicantDetail, index) => {
                const uniqueItemId = applicantDetail.applicationId;

                // Store the private note in localStorage under:
                //   private_note__<courseId>__<applicationId>
                const storageKey = `private_note__${course.id}__${uniqueItemId}`;

                // 2) Local state for the textarea’s value
                const [note, setNote] = useState<string>("");

                // On mount, load from localStorage
                useEffect(() => {
                  const saved = localStorage.getItem(storageKey);
                  if (saved !== null) {
                    setNote(saved);
                  } else {
                    setNote("");
                  }
                }, [storageKey]);

                // Save to localStorage on blur
                const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
                  const newVal = e.target.value;
                  setNote(newVal);
                  localStorage.setItem(storageKey, newVal);
                  toast({
                    title: "Note saved locally",
                    status: "success",
                    duration: 1500,
                    isClosable: true,
                  });
                };

                return (
                  <SortableItem
                    key={uniqueItemId}
                    id={uniqueItemId}
                    isDragDisabled={isFilteredView}
                  >
                    {(dragHandleProps) => (
                      <Box
                        bg={cardBg}
                        borderRadius="md"
                        boxShadow="sm"
                        w="100%"
                        border="1px solid"
                        borderColor={cardBorderColor}
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
                              {...(isFilteredView
                                ? {}
                                : { ...dragHandleProps })}
                              aria-label="Drag to reorder applicant"
                            >
                              <HamburgerIcon color={useColorModeValue("gray.500", "gray.300")} />
                            </Box>
                          </Tooltip>

                          <Box flex="1">
                            <ApplicantCard
                              applicationDetails={applicantDetail}
                              courseId={course.id}
                            />
                          </Box>

                          {!isFilteredView && (
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
                          )}
                        </Flex>

                        {/* Inline “Private Note” Textarea (client‐only, localStorage) */}
                        <Box p={2} pt={0}>
                          <Textarea
                            placeholder="Add a private note…"
                            size="sm"
                            bg={useColorModeValue("gray.50", "gray.600")}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            onBlur={handleBlur}
                          />
                        </Box>
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

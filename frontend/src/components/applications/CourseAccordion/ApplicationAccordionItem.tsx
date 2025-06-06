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

// New component for handling individual applicant notes
interface ApplicantNoteProps {
  courseId: string;
  applicationId: string;
  applicantDetail: LecturerApplication;
  index: number;
  isFilteredView: boolean;
}

const ApplicantNote: React.FC<ApplicantNoteProps> = ({
  courseId,
  applicationId,
  applicantDetail,
  index,
  isFilteredView,
}) => {
  const toast = useToast();
  const { updateApplicationStatus } = useApplications();
  
  // Color theme hooks at component level
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorderColor = useColorModeValue("gray.200", "gray.600");
  const dragIconColor = useColorModeValue("gray.500", "gray.300");
  const textareaColor = useColorModeValue("gray.50", "gray.600");

  // Local state for the textarea's value - initialize from database
  const [note, setNote] = useState<string>("");

  // On mount, load from applicantDetail (database)
  useEffect(() => {
    setNote(applicantDetail.lecturerComment || "");
  }, [applicantDetail.lecturerComment]);

  // Save to database on blur
  const handleBlur = async (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setNote(newVal);
    
    try {
      await updateApplicationStatus(courseId, applicationId, {
        lecturerComment: newVal,
      });
      toast({
        title: "Comment saved",
        status: "success",
        duration: 1500,
        isClosable: true,
      });
    } catch {
      toast({
        title: "Failed to save comment",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <SortableItem
      id={applicationId}
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
                <HamburgerIcon color={dragIconColor} />
              </Box>
            </Tooltip>

            <Box flex="1">
              <ApplicantCard
                applicationDetails={applicantDetail}
                courseId={courseId}
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

          {/* Lecturer Comment Textarea (saved to database) */}
          <Box p={2} pt={0}>
            <Textarea
              placeholder="Add a comment…"
              size="sm"
              bg={textareaColor}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={handleBlur}
            />
          </Box>
        </Box>
      )}
    </SortableItem>
  );
};

const ApplicationAccordionItem: React.FC<ApplicationAccordionItemProps> = ({
  course,
}) => {
  const toast = useToast();
  
  // Color theme hooks - moved to top level to avoid calling inside callbacks
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headerBgExpanded = useColorModeValue("blue.50", "blue.900");
  const panelBg = useColorModeValue("gray.50", "gray.700");
  const noApplicantsTextColor = useColorModeValue("gray.500", "gray.400");

  const { isFilteredView } = useApplications();

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
              {course.applicants.map((applicantDetail, index) => (
                <ApplicantNote
                  key={applicantDetail.applicationId}
                  courseId={course.id}
                  applicationId={applicantDetail.applicationId}
                  applicantDetail={applicantDetail}
                  index={index}
                  isFilteredView={isFilteredView}
                />
              ))}
            </VStack>
          </SortableContext>
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};

export default ApplicationAccordionItem;

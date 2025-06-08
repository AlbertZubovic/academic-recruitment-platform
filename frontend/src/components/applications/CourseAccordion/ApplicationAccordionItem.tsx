// src/components/applications/CourseAccordion/ApplicationAccordionItem.tsx

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
  IconButton,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { HamburgerIcon, CopyIcon } from "@chakra-ui/icons";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { useApplications } from "@/context/ApplicationContext";
import { useBlockedCandidates } from "@/context/BlockedCandidatesContext";
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
  // Check if this candidate is blocked
  const { isUserBlocked, getBlockedCandidateInfo } = useBlockedCandidates();
  const isBlocked = isUserBlocked(applicantDetail.userId);
  const blockedInfo = getBlockedCandidateInfo(applicantDetail.userId);
  
  // Color theme hooks at component level
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorderColor = useColorModeValue("gray.200", "gray.600");
  const dragIconColor = useColorModeValue("gray.500", "gray.300");
  
  // Blocked candidate styling
  const blockedCardBg = useColorModeValue("gray.100", "gray.700");
  const blockedBorderColor = useColorModeValue("red.300", "red.500");

  return (
    <SortableItem
      id={applicationId}
      isDragDisabled={isFilteredView}
    >
      {(dragHandleProps) => (
        <Box
          bg={isBlocked ? blockedCardBg : cardBg}
          borderRadius="md"
          boxShadow="sm"
          w="100%"
          border="2px solid"
          borderColor={isBlocked ? blockedBorderColor : cardBorderColor}
          opacity={isBlocked ? 0.7 : 1}
          position="relative"
        >
          {/* Blocked warning banner */}
          {isBlocked && (
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bg="red.500"
              color="white"
              px={2}
              py={1}
              fontSize="xs"
              fontWeight="bold"
              textAlign="center"
              zIndex={1}
            >
              ⚠️ CANDIDATE BLOCKED - Not available for hiring
              {blockedInfo && ` (${new Date(blockedInfo.blockedAt).toLocaleDateString()})`}
            </Box>
          )}
          
          <Flex align="center" p={2} mt={isBlocked ? 6 : 0}>
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
  const roleHeaderColor = useColorModeValue("purple.600", "purple.300");
  const courseNameColor = useColorModeValue("blue.600", "blue.300");

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
          <Text fontWeight="bold" fontSize="lg" color={courseNameColor}>
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
          <VStack spacing={6} align="stretch">
            {/* Group applications by role */}
            {["Tutor", "Lab-Assistant"].map((roleType) => {
              const roleApplications = course.applicants.filter(
                (app) => app.role === roleType
              );

              if (roleApplications.length === 0) return null;

              return (
                <Box key={roleType}>
                                     {/* Role Header */}
                   <Text
                     fontSize="lg"
                     fontWeight="bold"
                     mb={3}
                     color={roleHeaderColor}
                   >
                    {roleType} Applications
                    <Badge ml={2} colorScheme="gray" variant="solid" borderRadius="full" px={2}>
                      {roleApplications.length}
                    </Badge>
                  </Text>

                  {/* Sortable list for this role */}
                  <SortableContext
                    items={roleApplications.map((app) => app.applicationId)}
                    strategy={verticalListSortingStrategy}
                  >
                    <VStack spacing={4} align="stretch">
                      {roleApplications.map((applicantDetail, index) => (
                        <ApplicantNote
                          key={applicantDetail.applicationId}
                          courseId={course.id}
                          applicationId={applicantDetail.applicationId}
                          applicantDetail={applicantDetail}
                          index={index} // This will be the rank within this role
                          isFilteredView={isFilteredView}
                        />
                      ))}
                    </VStack>
                  </SortableContext>
                </Box>
              );
            })}
          </VStack>
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};

export default ApplicationAccordionItem;

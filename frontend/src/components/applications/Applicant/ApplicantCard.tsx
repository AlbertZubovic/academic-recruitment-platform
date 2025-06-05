// src/components/applications/Applicant/ApplicantCard.tsx

/**
 * ApplicantCard Component
 * Displays a single applicant’s summary inside a course’s list.
 * Clicking the card opens a modal with details.
 * The “approve/reject” UI appears on the right.
 */

import React from "react";
import {
  Box,
  HStack,
  useDisclosure,
  Text,
} from "@chakra-ui/react";

import ApplicantCardHeader from "./ApplicantCardHeader";
import ApproveRejectCheckbox from "./ApproveRejectCheckbox";
import ApplicantDetailsModal from "./ApplicantDetailsModal";

import { LecturerApplication } from "@/types/Application";
import { useApplications } from "@/context/ApplicationContext";

// Props for ApplicantCard
interface ApplicantCardProps {
  applicationDetails: LecturerApplication;
  courseId: string;
}

const ApplicantCard: React.FC<ApplicantCardProps> = ({
  applicationDetails,
  courseId,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { allUsers } = useApplications();

  // Look up full user profile by ID
  const userProfile = allUsers.find(
    (u) => String(u.id) === String(applicationDetails.userId)
  );

  if (!userProfile) {
    console.warn(
      `User profile not found for applicant ID: ${applicationDetails.userId}`
    );
    return (
      <Box
        p={4}
        borderWidth={1}
        borderRadius="md"
        bg="red.50"
        boxShadow="sm"
        w="100%"
      >
        <Text color="red.700">
          Error: Applicant data missing for ID {applicationDetails.userId}
        </Text>
      </Box>
    );
  }

  return (
    <>
      {/* Clicking the card opens the modal */}
      <Box
        p={4}
        borderWidth={1}
        borderRadius="md"
        bg="white"
        boxShadow="sm"
        w="100%"
        cursor="pointer"
        _hover={{ bg: "gray.50" }}
        onClick={onOpen}
      >
        <HStack justify="space-between" align="start">
          {/* Left side: applicant header */}
          <ApplicantCardHeader
            userProfile={userProfile}
            applicationDetails={applicationDetails}
          />

          {/* Right side: approve/reject checkboxes */}
          <Box onClick={(e) => e.stopPropagation()}>
            <ApproveRejectCheckbox
              applicationDetails={applicationDetails}
              courseId={courseId}
            />
          </Box>
        </HStack>
      </Box>

      {/* Details modal */}
      <ApplicantDetailsModal
        isOpen={isOpen}
        onClose={onClose}
        userProfile={userProfile}
        applicationDetails={applicationDetails}
        courseId={courseId}
      />
    </>
  );
};

export default ApplicantCard;

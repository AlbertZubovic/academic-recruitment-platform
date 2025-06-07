// src/components/applications/Applicant/ApplicantCard.tsx

import React from "react";
import {
  Box,
  HStack,
  useDisclosure,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

import ApplicantCardHeader from "./ApplicantCardHeader";
import ApproveRejectCheckbox from "./ApproveRejectCheckbox";
import ApplicantDetailsModal from "./ApplicantDetailsModal";

import { LecturerApplication } from "@/types/Application";
import { useApplications } from "@/context/ApplicationContext";

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

  // Color tokens for light/dark
  const cardBg = useColorModeValue("white", "gray.700");
  const cardHoverBg = useColorModeValue("gray.50", "gray.600");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const errorBg = useColorModeValue("red.50", "red.900");
  const errorText = useColorModeValue("red.700", "red.300");

  if (!userProfile) {
    console.warn(
      `User profile not found for applicant ID: ${applicationDetails.userId}`
    );
    return (
      <Box
        p={4}
        borderWidth={1}
        borderRadius="md"
        bg={errorBg}
        boxShadow="sm"
        w="100%"
      >
        <Text color={errorText}>
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
        borderColor={borderColor}
        borderRadius="md"
        bg={cardBg}
        boxShadow="sm"
        w="100%"
        cursor="pointer"
        _hover={{ bg: cardHoverBg }}
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

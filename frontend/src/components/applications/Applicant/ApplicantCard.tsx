// src/components/applications/Applicant/ApplicantCard.tsx

/**
 * ApplicantCard Component
 * Displays an interactive view of a single applicant within a course's applicant list.
 * Shows name, credentials, skills, and availability relevant to the application.
 * Allows selection via checkbox.
 * Opens a modal on click for detailed applicant information and notes.
 */

import React from "react";
import {
  Box,
  HStack,
  useDisclosure,
  Text,
} from "@chakra-ui/react";

import ApplicantCardHeader from "./ApplicantCardHeader";
import ApplicantSelectCheckbox from "./ApplicantSelectCheckbox";
import ApplicantDetailsModal from "./ApplicantDetailsModal";

import { LecturerApplication } from "@/types/Application";
import { useApplications } from "@/context/ApplicationContext";

// Props accepted by the component
interface ApplicantCardProps {
  applicationDetails: LecturerApplication; // LecturerApplication has fields like userId, availability, skills
  courseId: string;
}

const ApplicantCard: React.FC<ApplicantCardProps> = ({
  applicationDetails,
  courseId,
}) => {
  // Manage modal open/close state
  const { isOpen, onOpen, onClose } = useDisclosure();
  // Grab `allUsers` from our new context so we can look up full User profile
  const { allUsers } = useApplications();

  // Find the full user profile using applicationDetails.userId
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
      {/* Clickable card that opens the modal on click */}
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
          {/* Show applicant’s header (name, credentials, availability, skills) */}
          <ApplicantCardHeader
            userProfile={userProfile}
            applicationDetails={applicationDetails}
          />

          {/* Checkbox for selecting/deselecting this applicant */}
          <Box onClick={(e) => e.stopPropagation()}>
            <ApplicantSelectCheckbox
              userProfile={userProfile}
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

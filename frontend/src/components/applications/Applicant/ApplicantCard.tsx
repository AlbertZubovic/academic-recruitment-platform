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
  Text, // Import Text for fallback
} from "@chakra-ui/react";

import ApplicantCardHeader from "./ApplicantCardHeader";
import ApplicantSelectCheckbox from "./ApplicantSelectCheckbox";
import ApplicantDetailsModal from "./ApplicantDetailsModal";
import { Applicant } from "@/types/applicant"; // Application details type
import { useApplicationContext } from "@/context/ApplicationContext"; // <-- Import context hook

// Props accepted by the component
interface ApplicantCardProps {
  // Rename applicant prop to be specific about what it contains
  applicationDetails: Applicant; // The details submitted with the application
  courseId: string;             // The course this applicant is being shown under
}

const ApplicantCard: React.FC<ApplicantCardProps> = ({ applicationDetails, courseId }) => {
  // Manages modal open/close state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { allUsers } = useApplicationContext(); // <-- Get all users from context

  // Find the full user profile using the userId from applicationDetails
  const userProfile = allUsers.find(u => String(u.id) === String(applicationDetails.userId));

  // Handle case where user profile might not be found (data inconsistency)
  if (!userProfile) {
    console.warn(`User profile not found for applicant ID: ${applicationDetails.userId}`);
    return (
        <Box p={4} borderWidth={1} borderRadius="md" bg="red.50" boxShadow="sm" w="100%">
            <Text color="red.700">Error: Applicant data missing for ID {applicationDetails.userId}</Text>
        </Box>
    );
  }

  return (
    <>
      {/* Clickable card that opens modal on click */}
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
          {/* Pass both user profile and application details */}
          <ApplicantCardHeader
            userProfile={userProfile}
            applicationDetails={applicationDetails}
          />

          {/* Checkbox needs the userProfile for display in toast, and courseId */}
          {/* It also needs the userId from applicationDetails for toggling */}
          <Box onClick={(e) => e.stopPropagation()}>
            <ApplicantSelectCheckbox
              userProfile={userProfile} // Pass user profile for name in toast
              applicationDetails={applicationDetails} // Pass details for userId
              courseId={courseId}
            />
          </Box>
        </HStack>
      </Box>

      {/* Modal needs the full user profile for display */}
      <ApplicantDetailsModal
        isOpen={isOpen}
        onClose={onClose}
        userProfile={userProfile} // Pass the full user profile
        applicationDetails={applicationDetails} // Pass application details if needed inside modal
        courseId={courseId}
      />
    </>
  );
};

export default ApplicantCard;

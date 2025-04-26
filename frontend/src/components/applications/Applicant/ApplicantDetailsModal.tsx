// src/components/applications/Applicant/ApplicantDetailsModal.tsx

/**
 * ApplicantDetailsModal.tsx
 *
 * This modal component displays detailed information about a specific applicant.
 * Shown when an applicant card is clicked
 * Displays personal details, availability, skills, past roles
 * Allows lecturers to leave a comment (persisted in localStorage)
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  VStack,
  Divider,
  Badge,
  Input,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { Applicant } from "@/types/applicant";
import { User } from "@/types/user";




interface Props {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  userProfile: User; // <-- Receive the full user profile
  applicationDetails: Applicant; // <-- Receive application details
}

const ApplicantDetailsModal: React.FC<Props> = ({ isOpen, onClose, userProfile, applicationDetails, courseId }) => {
  const [comment, setComment] = useState("");
  // Use userProfile.id for the comment key
  const commentKey = `comment-${courseId}-${userProfile.id}`;

  // Load saved comment from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(commentKey);
      if (saved) setComment(saved);
      else setComment(""); // Reset comment if none saved
    }
  }, [isOpen, commentKey]);

  // Save comment to localStorage
  const saveComment = () => localStorage.setItem(commentKey, comment);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {/* Use name from userProfile */}
          {userProfile.firstName} {userProfile.lastName}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <VStack align="start" spacing={4}>
            {/* Display details from userProfile */}
            <Text><strong>Email:</strong> {userProfile.email}</Text>
            <Text><strong>Credentials:</strong> {userProfile.credentials || "N/A"}</Text>

            <Divider />
            <Text fontWeight="medium">Application Details for this Course:</Text>
             {/* Availability submitted with application */}
            <Text>
              <strong>Applied Availability:</strong>{" "}
              {applicationDetails.appliedAvailability
                ? applicationDetails.appliedAvailability
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")
                : "N/A"}
            </Text>

            {/* Skills submitted with application */}
            <Text><strong>Applied Skills:</strong></Text>
            <Wrap>
              {applicationDetails.appliedSkills?.length > 0 ? (
                 applicationDetails.appliedSkills.map((skill, i) => (
                    <WrapItem key={i}>
                      <Badge colorScheme="green">{skill}</Badge>
                    </WrapItem>
                 ))
              ) : (
                 <Text fontSize="sm" color="gray.500">No specific skills listed for this application.</Text>
              )}
            </Wrap>

            {/* Past roles from userProfile */}
            {userProfile.pastRoles?.length > 0 && (
              <>
                <Divider />
                <Text fontWeight="medium">Past Roles (General Profile):</Text>
                {userProfile.pastRoles.map((role, i) => (
                  <Box key={i} p={2} bg="gray.100" borderRadius="md" w="100%">
                    <Text>
                      <strong>{role.role}</strong> – {role.courseName} ({role.courseCode})
                    </Text>
                    <Text fontSize="sm" color="gray.600">{role.semester}</Text>
                  </Box>
                ))}
              </>
            )}

            {/* Comment section */}
            <Divider />
            <Text fontWeight="medium">Comments:</Text>
            <Input
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button colorScheme="teal" onClick={saveComment}>
              Save Comment
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ApplicantDetailsModal;
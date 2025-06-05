// src/components/applications/Applicant/ApplicantDetailsModal.tsx

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
  useToast,
} from "@chakra-ui/react";
import { LecturerApplication } from "@/types/Application";
import { User } from "@/types/user";
import { useApplications } from "@/context/ApplicationContext"; // ← import context

interface Props {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  userProfile: User;                    // Must include `pastRoles: PastRole[]`
  applicationDetails: LecturerApplication;
}

const ApplicantDetailsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userProfile,
  applicationDetails,
  courseId,
}) => {
  const { updateApplicationStatus } = useApplications();
  const toast = useToast();

  // Initialize from backend’s lecturerComment
  const [comment, setComment] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setComment(applicationDetails.lecturerComment || "");
    }
  }, [isOpen, applicationDetails.lecturerComment]);

  // When “Save Comment” is clicked, send to backend
  const saveComment = async () => {
    try {
      await updateApplicationStatus(courseId, applicationDetails.applicationId, {
        lecturerComment: comment,
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
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {userProfile.firstName} {userProfile.lastName}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <VStack align="start" spacing={4}>
            {/* 1) Basic user info */}
            <Text>
              <strong>Email:</strong> {userProfile.email}
            </Text>
            <Text>
              <strong>Credentials:</strong>{" "}
              {userProfile.academicCredentials || "N/A"}
            </Text>

            <Divider />
            <Text fontWeight="medium">Application Details for this Course:</Text>

            {/* 2) Role they applied for */}
            <Text>
              <strong>Role Applied:</strong> {applicationDetails.role}
            </Text>

            {/* 3) Availability */}
            <Text>
              <strong>Applied Availability:</strong>{" "}
              {applicationDetails.appliedAvailability}
            </Text>

            {/* 4) Skills */}
            <Text>
              <strong>Applied Skills:</strong>
            </Text>
            <Wrap>
              {applicationDetails.appliedSkills &&
              applicationDetails.appliedSkills.length > 0 ? (
                applicationDetails.appliedSkills.map((skillName, i) => (
                  <WrapItem key={i}>
                    <Badge colorScheme="green">{skillName}</Badge>
                  </WrapItem>
                ))
              ) : (
                <Text fontSize="sm" color="gray.500">
                  No specific skills listed.
                </Text>
              )}
            </Wrap>

            {/* 5) Past roles from userProfile */}
            {userProfile.pastRoles && userProfile.pastRoles.length > 0 && (
              <>
                <Divider />
                <Text fontWeight="medium">Past Roles:</Text>
                {userProfile.pastRoles.map((pr, i) => (
                  <Box
                    key={i}
                    p={2}
                    bg="gray.100"
                    borderRadius="md"
                    w="100%"
                  >
                    <Text>
                      <strong>{pr.role}</strong> – {pr.courseName} (
                      {pr.courseCode})
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {pr.semester || "N/A"}
                    </Text>
                  </Box>
                ))}
              </>
            )}

            {/* 6) Comment section (from DB) */}
            <Divider />
            <Text fontWeight="medium">Lecturer Comment:</Text>
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

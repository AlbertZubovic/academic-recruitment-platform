// src/components/applications/Applicant/ApplicantCard.tsx

import React, { useState, useEffect } from "react";
import {
  Box,
  HStack,
  useDisclosure,
  Text,
  useColorModeValue,
  Textarea,
  useToast,
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
  const { allUsers, updateApplicationStatus } = useApplications();
  const toast = useToast();

  // Local state for the comment textarea
  const [note, setNote] = useState<string>("");

  // On mount, load from applicationDetails (database)
  useEffect(() => {
    setNote(applicationDetails.lecturerComment || "");
  }, [applicationDetails.lecturerComment]);

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
  const textareaColor = useColorModeValue("gray.50", "gray.600");

  // Save comment to database on blur
  const handleBlur = async (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setNote(newVal);
    
    try {
      await updateApplicationStatus(courseId, applicationDetails.applicationId, {
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
        <HStack justify="space-between" align="stretch" spacing={4}>
          {/* Left side: applicant header */}
          <Box flex="1">
            <ApplicantCardHeader
              userProfile={userProfile}
              applicationDetails={applicationDetails}
            />
          </Box>

          {/* Middle: comment field */}
          <Box onClick={(e) => e.stopPropagation()} flex="1"  display="flex">
            <Textarea
              placeholder="Add a comment…"
              size="sm"
              bg={textareaColor}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={handleBlur}
              resize="none"
              height="100%"
              width="100%"
              flex="1"
            />
          </Box>

          {/* Right side: approve/reject buttons */}
          <Box onClick={(e) => e.stopPropagation()} minW="90px">
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

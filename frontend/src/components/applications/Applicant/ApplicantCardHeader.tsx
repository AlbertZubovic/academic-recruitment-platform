// src/components/applications/Applicant/ApplicantCardHeader.tsx

import { HStack, VStack, Text, Badge, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import { LecturerApplication } from "@/types/Application";
import { User } from "@/types/user";

interface Props {
  userProfile: User;
  applicationDetails: LecturerApplication;
}

const ApplicantCardHeader: React.FC<Props> = ({
  userProfile,
  applicationDetails,
}) => {
  // Color tokens for light/dark
  const nameColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const credColor = useColorModeValue("gray.600", "gray.400");
  const badgeBg = useColorModeValue("green.100", "green.800");
  const badgeText = useColorModeValue("green.800", "green.200");
  const skillBadgeBg = useColorModeValue("blue.100", "blue.800");
  const skillBadgeText = useColorModeValue("blue.800", "blue.200");
  const noSkillsTextColor = useColorModeValue("gray.500", "gray.400");

  return (
    <VStack align="start" spacing={1}>
      {/* 1) Show the “role” they applied for */}
      <Badge colorScheme="teal" variant="subtle" fontSize="xs">
        {applicationDetails.role}
      </Badge>

      {/* 2) Full name from userProfile */}
      <Text fontWeight="bold" fontSize="lg" color={nameColor}>
        {userProfile.firstName} {userProfile.lastName}
      </Text>

      {/* 3) academicCredentials (instead of non‐existent “credentials”) */}
      <Text fontSize="sm" color={credColor}>
        {userProfile.academicCredentials || "No academic credentials"}
      </Text>

      {/* 4) Applied availability + skill badges */}
      <HStack spacing={2} wrap="wrap">
        <Badge bg={badgeBg} color={badgeText}>
          {applicationDetails.appliedAvailability
            ? applicationDetails.appliedAvailability
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")
            : "N/A"}
        </Badge>

        {applicationDetails.appliedSkills?.map((skillName, i) => (
          <Badge
            key={i}
            bg={skillBadgeBg}
            color={skillBadgeText}
          >
            {skillName}
          </Badge>
        ))}

        {(!applicationDetails.appliedAvailability ||
          applicationDetails.appliedSkills.length === 0) && (
          <Text fontSize="xs" color={noSkillsTextColor}>
            No specific skills
          </Text>
        )}
      </HStack>
    </VStack>
  );
};

export default ApplicantCardHeader;

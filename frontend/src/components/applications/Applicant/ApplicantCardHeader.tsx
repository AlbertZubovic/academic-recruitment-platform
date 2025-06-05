// src/components/applications/Applicant/ApplicantCardHeader.tsx

import { HStack, VStack, Text, Badge } from "@chakra-ui/react";
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
}) => (
  <VStack align="start" spacing={1}>
    {/* 1) Show the “role” they applied for */}
    <Badge colorScheme="teal" variant="subtle" fontSize="xs">
      {applicationDetails.role}
    </Badge>

    {/* 2) Full name from userProfile */}
    <Text fontWeight="bold" fontSize="lg">
      {userProfile.firstName} {userProfile.lastName}
    </Text>

    {/* 3) academicCredentials (instead of non‐existent “credentials”) */}
    <Text fontSize="sm" color="gray.600">
      {userProfile.academicCredentials || "No academic credentials"}
    </Text>

    {/* 4) Applied availability + skill badges */}
    <HStack spacing={2} wrap="wrap">
      <Badge colorScheme="purple">
        {applicationDetails.appliedAvailability
          ? applicationDetails.appliedAvailability
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
          : "N/A"}
      </Badge>

      {applicationDetails.appliedSkills?.map((skillName, i) => (
        <Badge key={i} colorScheme="blue">
          {skillName}
        </Badge>
      ))}

      {(!applicationDetails.appliedAvailability ||
        applicationDetails.appliedSkills.length === 0) && (
        <Text fontSize="xs" color="gray.500">
          No specific skills
        </Text>
      )}
    </HStack>
  </VStack>
);

export default ApplicantCardHeader;

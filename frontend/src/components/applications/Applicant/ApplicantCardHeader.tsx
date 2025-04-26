// src/components/applications/Applicant/ApplicantCardHeader.tsx

/**
 * ApplicantCardHeader Component
 * Displays the applicant’s profile name/credentials and application-specific availability/skills.
 */

import { HStack, VStack, Text, Badge } from "@chakra-ui/react";
import React from "react";
import { Applicant } from "@/types/applicant"; // Application details type
import { User } from "@/types/user"; // User profile type

interface Props {
  userProfile: User; // Contains general user info (name, credentials, etc.)
  applicationDetails: Applicant; // Contains application-specific info (appliedSkills, appliedAvailability)
}

const ApplicantCardHeader: React.FC<Props> = ({ userProfile, applicationDetails }) => (
  <VStack align="start" spacing={1}>
    {/* Full name from userProfile */}
    <Text fontWeight="bold" fontSize="lg">
      {userProfile.firstName} {userProfile.lastName}
    </Text>

    {/* Credentials from userProfile */}
    <Text fontSize="sm" color="gray.600">
      {userProfile.credentials || "No credentials"} {/* Add fallback */}
    </Text>

    {/* Availability + skill badges */}
    <HStack spacing={2} wrap="wrap">
      {/* Use appliedAvailability from applicationDetails */}
      <Badge colorScheme="purple">
        {applicationDetails.appliedAvailability
          ? applicationDetails.appliedAvailability
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")
          : "N/A"} {/* Add fallback */}
      </Badge>

      {/* Use appliedSkills from applicationDetails */}
      {applicationDetails.appliedSkills?.map((skill, i) => ( // Add optional chaining
        <Badge key={i} colorScheme="blue">
          {skill}
        </Badge>
      ))}
      {/* Optional: Show message if no skills applied */}
      {(!applicationDetails.appliedSkills || applicationDetails.appliedSkills.length === 0) && (
          <Text fontSize="xs" color="gray.500">No specific skills listed for this application.</Text>
      )}
    </HStack>
  </VStack>
);

export default ApplicantCardHeader;

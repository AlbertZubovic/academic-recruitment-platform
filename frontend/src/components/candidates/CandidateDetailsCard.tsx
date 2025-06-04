// src/components/candidates/CandidateDetailsCard.tsx

/**
 * CandidateDetailsCard
 * A presentational component that displays candidate information:
 * Full name
 * Email address
 * Skills list
 * Academic credentials
 * Previous academic roles
 */

import React from "react";
import {
  Box,
  Heading,
  Text,
  Stack,
  Divider,
  Tag,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { Candidate } from "@/types/candidate";

interface CandidateDetailsCardProps {
  user: Candidate;
}

const CandidateDetailsCard: React.FC<CandidateDetailsCardProps> = ({
  user,
}) => {
  if (!user) {
    return (
      <Box borderWidth={1} borderRadius="md" p={4} boxShadow="sm">
        <Text color="red.500">No candidate data available.</Text>
      </Box>
    );
  }

  return (
    <Box borderWidth={1} borderRadius="md" p={4} boxShadow="sm">
      {/* Name Heading */}
      <Heading size="md" mb={2}>
        {user.firstName || "N/A"} {user.lastName || ""}
      </Heading>

      <Stack spacing={4}>
        {/* Email Section */}
        <Box>
          <Text fontWeight="medium">Email</Text>
          <Text>{user.email || "No email provided"}</Text>
        </Box>

        <Divider />

        {/* Skills Section */}
        <Box>
          <Text fontWeight="medium">Skills</Text>
          {user.skills && user.skills.length > 0 ? (
            <Wrap mt={2}>
              {user.skills.map((skill, index) => (
                <WrapItem key={index}>
                  <Tag>{skill}</Tag>
                </WrapItem>
              ))}
            </Wrap>
          ) : (
            <Text color="gray.500">No skills listed</Text>
          )}
        </Box>

        <Divider />

        {/* Credentials Section */}
        <Box>
          <Text fontWeight="medium">Credentials</Text>
          <Text>{user.credentials || "No credentials provided"}</Text>
        </Box>

        <Divider />

        {/* Previous Roles Section */}
        <Box>
          <Text fontWeight="medium">Previous Roles</Text>
          {Array.isArray(user.pastRoles) && user.pastRoles.length > 0 ? (
            <Stack spacing={1} mt={2}>
              {user.pastRoles.map((role, index) => (
                <Box key={index}>
                  <Text>
                    <strong>{role.role}</strong> – {role.courseName} (
                    {role.courseCode})
                    {role.semester && ` – ${role.semester}`}
                  </Text>
                </Box>
              ))}
            </Stack>
          ) : (
            <Text color="gray.500">No previous roles listed</Text>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default CandidateDetailsCard;

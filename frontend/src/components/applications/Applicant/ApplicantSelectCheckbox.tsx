// src/components/applications/Applicant/ApplicantSelectCheckbox.tsx

/**
 * ApplicantSelectCheckbox.tsx
 * Renders a checkbox to select/deselect an applicant for a course.
 */

import React from "react";
import { Checkbox, useToast } from "@chakra-ui/react";
import { useSelectedApplicants } from "@/context/SelectedApplicantsContext";
import { LecturerApplication } from "@/types/Application";
import { User } from "@/types/user";

interface Props {
  userProfile: User;                   // User profile for toast
  applicationDetails: LecturerApplication; // applicationDetails.userId, etc.
  courseId: string;
}

const ApplicantSelectCheckbox: React.FC<Props> = ({
  userProfile,
  applicationDetails,
  courseId,
}) => {
  const { selectedApplicants, toggleApplicantSelection } =
    useSelectedApplicants();
  const toast = useToast();

  // Determine if this userId is currently selected for the given courseId
  const applicantUserId = String(applicationDetails.userId);
  const isChecked = (selectedApplicants[courseId] || []).includes(
    applicantUserId
  );

  return (
    <Checkbox
      isChecked={isChecked}
      onChange={() => {
        toggleApplicantSelection(applicantUserId, courseId, (action) => {
          toast({
            title: `Applicant ${
              action === "selected" ? "Selected" : "Deselected"
            }`,
            description: `${userProfile.firstName} ${userProfile.lastName} has been ${action}.`,
            status: action === "selected" ? "success" : "info",
            duration: 2000,
            isClosable: true,
          });
        });
      }}
      colorScheme="teal"
      size="lg"
    >
      Select
    </Checkbox>
  );
};

export default ApplicantSelectCheckbox;

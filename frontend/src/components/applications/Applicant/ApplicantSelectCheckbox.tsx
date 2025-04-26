// src/components/applications/Applicant/ApplicantSelectCheckbox.tsx

/**
 * ApplicantSelectCheckbox.tsx
 * Renders a checkbox to select/deselect an applicant for a course.
 */

import React from "react";
import { Checkbox, useToast } from "@chakra-ui/react";
import { useSelectedApplicants } from "@/context/SelectedApplicantsContext";
import { Applicant } from "@/types/applicant"; // Application details type
import { User } from "@/types/user"; // User profile type

interface Props {
  userProfile: User; // For displaying name in toast
  applicationDetails: Applicant; // For getting the userId
  courseId: string;
}

const ApplicantSelectCheckbox: React.FC<Props> = ({ userProfile, applicationDetails, courseId }) => {
  const { selectedApplicants, toggleApplicantSelection } = useSelectedApplicants();
  const toast = useToast();

  // Use userId from applicationDetails for checking selection state
  const applicantUserId = String(applicationDetails.userId);
  const isChecked = (selectedApplicants[courseId] || []).includes(applicantUserId);

  return (
    <Checkbox
      isChecked={isChecked}
      onChange={() => {
        // Pass the userId to the toggle function
        toggleApplicantSelection(applicantUserId, courseId, (action) => {
          toast({
            title: `Applicant ${action === "selected" ? "Selected" : "Deselected"}`,
            // Use name from userProfile for the toast message
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

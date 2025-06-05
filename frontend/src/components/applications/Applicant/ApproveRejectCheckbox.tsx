// src/components/applications/Applicant/ApproveRejectCheckbox.tsx

import React, { useState, useEffect } from "react";
import { HStack, Checkbox, useToast, Spinner, useColorModeValue } from "@chakra-ui/react";
import { useApplications } from "@/context/ApplicationContext";
import { LecturerApplication } from "@/types/Application";

interface Props {
  applicationDetails: LecturerApplication;
  courseId: string;
}

const ApproveRejectCheckbox: React.FC<Props> = ({
  applicationDetails,
  courseId,
}) => {
  const toast = useToast();
  const { updateApplicationStatus } = useApplications();

  // Local state to reflect “Approved” / “Rejected” / “Pending”
  const [approvedChecked, setApprovedChecked] = useState(false);
  const [rejectedChecked, setRejectedChecked] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync checkboxes when `status` changes on applicationDetails
  useEffect(() => {
    const status = applicationDetails.status; // "Pending" | "Approved" | "Rejected"
    setApprovedChecked(status === "Approved");
    setRejectedChecked(status === "Rejected");
  }, [applicationDetails.status]);

  // Handler for “Approve” checkbox
  const handleApproveChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;

    if (!checked) {
      // Unchecking “Approve” → revert to Pending
      setIsUpdating(true);
      try {
        // Step 1: set accepted = true
        await updateApplicationStatus(courseId, applicationDetails.applicationId, {
          accepted: true,
        });
        // Step 2: revert back to null
        await updateApplicationStatus(courseId, applicationDetails.applicationId, {
          accepted: null as any,
        });
        toast({
          title: "Reverted to Pending",
          description: `Removed approval for ${applicationDetails.name}`,
          status: "info",
          duration: 2000,
          isClosable: true,
        });
        setApprovedChecked(false);
        setRejectedChecked(false);
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to revert status",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsUpdating(false);
      }
      return;
    }

    // Checking “Approve”
    setIsUpdating(true);
    try {
      await updateApplicationStatus(courseId, applicationDetails.applicationId, {
        accepted: true,
      });
      setApprovedChecked(true);
      setRejectedChecked(false);
      toast({
        title: "Application Approved",
        description: `${applicationDetails.name} has been approved.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to approve",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handler for “Reject” checkbox
  const handleRejectChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;

    if (!checked) {
      // Unchecking “Reject” → revert to Pending
      setIsUpdating(true);
      try {
        // Step 1: set accepted = false
        await updateApplicationStatus(courseId, applicationDetails.applicationId, {
          accepted: false,
        });
        // Step 2: revert to null
        await updateApplicationStatus(courseId, applicationDetails.applicationId, {
          accepted: null as any,
        });
        toast({
          title: "Reverted to Pending",
          description: `Removed rejection for ${applicationDetails.name}`,
          status: "info",
          duration: 2000,
          isClosable: true,
        });
        setApprovedChecked(false);
        setRejectedChecked(false);
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to revert status",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsUpdating(false);
      }
      return;
    }

    // Checking “Reject”
    setIsUpdating(true);
    try {
      await updateApplicationStatus(courseId, applicationDetails.applicationId, {
        accepted: false,
      });
      setRejectedChecked(true);
      setApprovedChecked(false);
      toast({
        title: "Application Rejected",
        description: `${applicationDetails.name} has been rejected.`,
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to reject",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      {isUpdating ? (
        <Spinner size="sm" />
      ) : (
        <HStack spacing={4}>
          <Checkbox
            isChecked={approvedChecked}
            onChange={handleApproveChange}
            colorScheme="green"
          >
            Approve
          </Checkbox>
          <Checkbox
            isChecked={rejectedChecked}
            onChange={handleRejectChange}
            colorScheme="red"
          >
            Reject
          </Checkbox>
        </HStack>
      )}
    </>
  );
};

export default ApproveRejectCheckbox;

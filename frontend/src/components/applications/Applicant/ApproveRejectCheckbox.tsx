// src/components/applications/Applicant/ApproveRejectCheckbox.tsx

import React, { useState, useEffect } from "react";
import { VStack, Button, useToast, Spinner } from "@chakra-ui/react";
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

  // Local state to reflect "Approved" / "Rejected" / "Pending"
  const [approvedChecked, setApprovedChecked] = useState(false);
  const [rejectedChecked, setRejectedChecked] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync state when `status` changes on applicationDetails
  useEffect(() => {
    const status = applicationDetails.status; // "Pending" | "Approved" | "Rejected"
    setApprovedChecked(status === "Approved");
    setRejectedChecked(status === "Rejected");
  }, [applicationDetails.status]);

  // Handler for "Approve" button
  const handleApprove = async () => {
    if (approvedChecked) {
      // Already approved → revert to Pending
      setIsUpdating(true);
      try {
        // Step 1: set accepted = true
        await updateApplicationStatus(courseId, applicationDetails.applicationId, {
          accepted: true,
        });
        // Step 2: revert back to null
        await updateApplicationStatus(courseId, applicationDetails.applicationId, {
          accepted: null,
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
      } catch (err: unknown) {
        toast({
          title: "Error",
          description: (err instanceof Error) ? err.message : "Failed to revert status",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsUpdating(false);
      }
      return;
    }

    // Not approved → Approve
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
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: (err instanceof Error) ? err.message : "Failed to approve",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handler for "Reject" button
  const handleReject = async () => {
    if (rejectedChecked) {
      // Already rejected → revert to Pending
      setIsUpdating(true);
      try {
        // Step 1: set accepted = false
        await updateApplicationStatus(courseId, applicationDetails.applicationId, {
          accepted: false,
        });
        // Step 2: revert to null
        await updateApplicationStatus(courseId, applicationDetails.applicationId, {
          accepted: null,
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
      } catch (err: unknown) {
        toast({
          title: "Error",
          description: (err instanceof Error) ? err.message : "Failed to revert status",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsUpdating(false);
      }
      return;
    }

    // Not rejected → Reject
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
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: (err instanceof Error) ? err.message : "Failed to reject",
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
        <VStack spacing={2}>
          <Button
            onClick={handleApprove}
            colorScheme={approvedChecked ? "green" : "gray"}
            variant={approvedChecked ? "solid" : "outline"}
            size="sm"
            width="80px"
          >
            Approved
          </Button>
          <Button
            onClick={handleReject}
            colorScheme={rejectedChecked ? "red" : "gray"}
            variant={rejectedChecked ? "solid" : "outline"}
            size="sm"
            width="80px"
          >
            Rejected 
          </Button>
        </VStack>
      )}
    </>
  );
};

export default ApproveRejectCheckbox;

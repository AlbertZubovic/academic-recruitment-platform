// src/components/applications/Applicant/ApproveRejectCheckbox.tsx

import React, { useState, useEffect } from "react";
import { VStack, Button, useToast, Spinner, Tooltip } from "@chakra-ui/react";
import { useApplications } from "@/context/ApplicationContext";
import { useBlockedCandidates } from "@/context/BlockedCandidatesContext";
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
  const { isUserBlocked, getBlockedCandidateInfo } = useBlockedCandidates();

  // Check if this candidate is blocked
  const isBlocked = isUserBlocked(applicationDetails.userId);
  const blockedInfo = getBlockedCandidateInfo(applicationDetails.userId);

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
    // Prevent approval if candidate is blocked
    if (isBlocked) {
      toast({
        title: "Cannot Approve Blocked Candidate",
        description: `${applicationDetails.name} has been blocked${blockedInfo ? ` on ${new Date(blockedInfo.blockedAt).toLocaleDateString()}` : ''} and cannot be approved for hiring.`,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

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

  // Create tooltip content for blocked candidates
  const approveTooltipContent = isBlocked
    ? `This candidate has been blocked${blockedInfo ? ` on ${new Date(blockedInfo.blockedAt).toLocaleDateString()}` : ''} and cannot be approved for hiring.`
    : approvedChecked
    ? "Click to revert to pending"
    : "Click to approve application";

  return (
    <>
      {isUpdating ? (
        <Spinner size="sm" />
      ) : (
        <VStack spacing={2}>
          <Tooltip label={approveTooltipContent} placement="left" hasArrow>
            <Button
              onClick={handleApprove}
              colorScheme={isBlocked ? "gray" : (approvedChecked ? "green" : "gray")}
              variant={approvedChecked ? "solid" : "outline"}
              size="sm"
              width="80px"
              isDisabled={isBlocked && !approvedChecked}
              opacity={isBlocked ? 0.6 : 1}
              cursor={isBlocked && !approvedChecked ? "not-allowed" : "pointer"}
            >
              {isBlocked ? "Blocked" : "Approved"}
            </Button>
          </Tooltip>
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

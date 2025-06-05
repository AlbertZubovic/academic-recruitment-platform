import React from "react";
import {
  VStack,
  Text,
  Wrap,
  Tag,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

interface ApplicationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    name: string;
    courseCode: string;
  };
  appDetail: {
    role: string;
    status: string;
    lecturerComment?: string | null;
    appliedAvailability?: string;
    appliedSkills?: string[];
    name?: string;
    applicationId?: string;
  };
}

const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  isOpen,
  onClose,
  course,
  appDetail,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Application Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="start" spacing={3}>
            <Text>
              <strong>Course:</strong> {course.name} ({course.courseCode})
            </Text>
            {appDetail.name && (
              <Text>
                <strong>Applicant:</strong> {appDetail.name}
              </Text>
            )}
            <Text>
              <strong>Role:</strong> {appDetail.role}
            </Text>
            {appDetail.appliedAvailability && (
              <Text>
                <strong>Availability:</strong> {appDetail.appliedAvailability}
              </Text>
            )}
            <Text>
              <strong>Applied Skills:</strong>
            </Text>
            {appDetail.appliedSkills && appDetail.appliedSkills.length > 0 ? (
              <Wrap>
                {appDetail.appliedSkills.map((skill, idx) => (
                  <Tag key={idx} colorScheme="blue">
                    {skill}
                  </Tag>
                ))}
              </Wrap>
            ) : (
              <Text color="gray.500">No applied skills listed</Text>
            )}
            <Text>
              <strong>Status:</strong> {appDetail.status}
            </Text>
            {appDetail.lecturerComment && (
              <Text>
                <strong>Lecturer Comment:</strong> {appDetail.lecturerComment}
              </Text>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ApplicationDetailsModal;

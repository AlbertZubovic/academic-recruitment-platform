import React from "react";
import {
  VStack,
  Text,
  List,
  ListItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { User } from "@/types/user";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Profile Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="start" spacing={3}>
            <Text>
              <strong>Name:</strong> {user.firstName} {user.lastName}
            </Text>
            <Text>
              <strong>Email:</strong> {user.email}
            </Text>
            <Text>
              <strong>Role:</strong> {user.isLecturer ? "Lecturer" : "Candidate"}
            </Text>
            {user.isCandidate && (
              <>
                <Text>
                  <strong>Availability:</strong> {user.defaultAvailability || "Not set"}
                </Text>
                <Text>
                  <strong>Skills:</strong>
                </Text>
                {user.defaultSkills && user.defaultSkills.length > 0 ? (
                  <List pl={4}>
                    {user.defaultSkills.map((skill, idx) => (
                      <ListItem key={idx}>• {skill}</ListItem>
                    ))}
                  </List>
                ) : (
                  <Text ml={4} color="gray.500">
                    No skills listed
                  </Text>
                )}
              </>
            )}
            <Text fontSize="sm" color="gray.500">
              Joined: {new Date(user.created).toLocaleDateString()}
            </Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProfileModal;

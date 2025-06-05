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
  useColorModeValue,
} from "@chakra-ui/react";
import { User } from "@/types/user";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user }) => {
  const bg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const mutedText = useColorModeValue("gray.600", "gray.400");

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent bg={bg} color={textColor}>
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
                      <ListItem key={idx} color={textColor}>
                        • {skill}
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Text ml={4} color={mutedText}>
                    No skills listed
                  </Text>
                )}
              </>
            )}

            <Text fontSize="sm" color={mutedText}>
              Joined: {new Date(user.created).toLocaleDateString()}
            </Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProfileModal;

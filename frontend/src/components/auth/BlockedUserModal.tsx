import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  Icon,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaLock } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

interface BlockedUserModalProps {
  isOpen: boolean;
}

const BlockedUserModal: React.FC<BlockedUserModalProps> = ({ isOpen }) => {
  const { signOut } = useAuth();
  
  const bgColor = useColorModeValue("white", "gray.800");
  const iconColor = useColorModeValue("red.500", "red.300");
  const textColor = useColorModeValue("gray.600", "gray.300");

  const handleSignOut = async () => {
    try {
      await signOut();
      // The modal will close automatically when user state changes
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => {}} // Prevent closing
      closeOnOverlayClick={false}
      closeOnEsc={false}
      isCentered
    >
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent bg={bgColor} mx={4}>
        <ModalHeader textAlign="center" pb={2}>
          <VStack spacing={4}>
            <Box
              p={4}
              borderRadius="full"
              bg={useColorModeValue("red.50", "red.900")}
            >
              <Icon as={FaLock} boxSize={8} color={iconColor} />
            </Box>
            <Text fontSize="xl" fontWeight="bold" color={iconColor}>
              Account Blocked
            </Text>
          </VStack>
        </ModalHeader>
        
        <ModalBody textAlign="center" py={4}>
          <VStack spacing={4}>
            <Text color={textColor} fontSize="md">
              Your account has been temporarily blocked by an administrator.
            </Text>
            <Text color={textColor} fontSize="sm">
              If you believe this is an error, please contact support for assistance.
            </Text>
          </VStack>
        </ModalBody>

        <ModalFooter justifyContent="center">
          <Button
            colorScheme="red"
            onClick={handleSignOut}
            size="lg"
            width="200px"
          >
            Sign Out
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BlockedUserModal; 
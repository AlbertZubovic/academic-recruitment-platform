// src/components/LandingPage.tsx
import React, { useState } from "react";
import {
  Box,
  Image,
  Text,
  Heading,
  VStack,
  HStack,
  Avatar,
  Divider,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  List,
  ListItem,
} from "@chakra-ui/react";
import styles from "@/styles/modules/pageContent.module.css";
import { useAuth } from "@/context/AuthContext";

const LandingPage: React.FC = () => {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <main className={styles.pageContent}>
      {/* Hero section */}
      <Box className={styles.heroContainer}>
        <Image
          src="https://plus.unsplash.com/premium_photo-1671070290640-25f7935a813e?q=80&w=1973&auto=format&fit=crop&ixlib=rb-4.0.3"
          alt="Students collaborating on a project"
          className={styles.landingImage}
        />
        <Text className={styles.description}>
          TeachTeam helps lecturers hire skilled tutors and lab assistants through a streamlined application and review system.
        </Text>
      </Box>

      {/* Welcome section */}
      <VStack className={styles.welcomeSection} align="start" spacing={6}>
        <Box>
          <Heading className={styles.heading}>Welcome to TeachTeam</Heading>
          <Text className={styles.subheading}>A place by teachers, for teachers.</Text>
        </Box>

        {authLoading && <Spinner size="lg" />}

        {!authLoading && isLoggedIn && user && (
          <>
            <Box
              className={styles.userInfoBox}
              w="100%"
              p={4}
              bg="gray.50"
              borderRadius="lg"
              boxShadow="md"
              cursor="pointer"
              _hover={{ bg: "gray.100" }}
              onClick={onOpen}
            >
              <HStack spacing={4}>
                <Avatar name={`${user.firstName} ${user.lastName}`} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {user.email}
                  </Text>
                  <Text fontSize="sm" color="blue.500" fontWeight="medium">
                    Role: {user.isLecturer ? "Lecturer" : "Tutor"}
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Profile Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="md">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Profile Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <VStack align="start" spacing={3}>
                    <Text><strong>Name:</strong> {user.firstName} {user.lastName}</Text>
                    <Text><strong>Email:</strong> {user.email}</Text>
                    <Text><strong>Role:</strong> {user.isLecturer ? "Lecturer" : "Tutor"}</Text>
                    {user.isTutor && (
                      <>
                        <Text><strong>Availability:</strong> {user.defaultAvailability || "Not set"}</Text>
                        <Text><strong>Skills:</strong></Text>
                        {user.defaultSkills && user.defaultSkills.length > 0 ? (
                          <List pl={4}>
                            {user.defaultSkills.map((skill, idx) => (
                              <ListItem key={idx}>• {skill}</ListItem>
                            ))}
                          </List>
                        ) : (
                          <Text ml={4} color="gray.500">No skills listed</Text>
                        )}
                      </>
                    )}
                    <Text fontSize="sm" color="gray.500">Joined: {new Date(user.created).toLocaleDateString()}</Text>
                  </VStack>
                </ModalBody>
              </ModalContent>
            </Modal>
          </>
        )}

        {!authLoading && !isLoggedIn && (
          <Text color="gray.600">Log in to view your dashboard and manage applications.</Text>
        )}
      </VStack>
    </main>
  );
};

export default LandingPage;

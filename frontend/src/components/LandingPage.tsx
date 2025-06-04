// src/pages/LandingPage.tsx

import React, { useState } from "react";
import {
  Box,
  Image,
  Text,
  Heading,
  VStack,
  HStack,
  Avatar,
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
  Button,
  Tag,
  Wrap,
} from "@chakra-ui/react";
import styles from "@/styles/modules/pageContent.module.css";
import { useAuth } from "@/context/AuthContext";
import { useCourses } from "@/context/CourseContext";

const LandingPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { courses } = useCourses();
  const isLoggedIn = !!user;

  const {
    isOpen: isProfileOpen,
    onOpen: onProfileOpen,
    onClose: onProfileClose,
  } = useDisclosure();

  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  const handleApplicationClick = (course: any) => {
    setSelectedApp(course);
  };

  return (
    <main className={styles.pageContent}>
      {/* Hero Section */}
      <Box className={styles.heroContainer}>
        <Image
          src="https://plus.unsplash.com/premium_photo-1671070290640-25f7935a813e?q=80&w=1973&auto=format&fit=crop&ixlib=rb-4.0.3"
          alt="Students collaborating on a project"
          className={styles.landingImage}
        />
        <Text className={styles.description}>
          TeachTeam helps lecturers hire skilled tutors and lab assistants
          through a streamlined application and review system.
        </Text>
      </Box>

      {/* Welcome Section */}
      <VStack className={styles.welcomeSection} align="start" spacing={6}>
        <Box>
          <Heading className={styles.heading}>Welcome to TeachTeam</Heading>
          <Text className={styles.subheading}>
            A place by teachers, for teachers.
          </Text>
        </Box>

        {authLoading && <Spinner size="lg" />}

        {!authLoading && isLoggedIn && user && (
          <>
            {/* Profile Card */}
            <Box
              className={styles.userInfoBox}
              w="100%"
              p={4}
              bg="gray.50"
              borderRadius="lg"
              boxShadow="md"
              cursor="pointer"
              _hover={{ bg: "gray.100" }}
              onClick={onProfileOpen}
            >
              <HStack spacing={4}>
                <Avatar
                  name={`${user.firstname} ${user.lastname}`}
                />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">
                    {user.firstname} {user.lastname}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {user.email}
                  </Text>
                  <Text fontSize="sm" color="blue.500" fontWeight="medium">
                    Role: {user.isLecturer ? "Lecturer" : "Candidate"}
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Applications List */}
            <Box mt={4}>
              <Heading size="sm" mb={2}>
                My Applications
              </Heading>
              {courses.filter((c) => (c as any).application).length === 0 ? (
                <Text color="gray.500" fontSize="sm">
                  No applications yet.
                </Text>
              ) : (
                <VStack align="start" spacing={2}>
                  {courses
                    .filter((c) => (c as any).application)
                    .map((course) => (
                      <Button
                        key={course.id}
                        size="sm"
                        variant="outline"
                        colorScheme="blue"
                        onClick={() => handleApplicationClick(course)}
                      >
                        {course.name} ({course.courseCode})
                      </Button>
                    ))}
                </VStack>
              )}
            </Box>

            {/* Profile Modal */}
            <Modal isOpen={isProfileOpen} onClose={onProfileClose} size="md">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Profile Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <VStack align="start" spacing={3}>
                    <Text>
                      <strong>Name:</strong> {user.firstname} {user.lastname}
                    </Text>
                    <Text>
                      <strong>Email:</strong> {user.email}
                    </Text>
                    <Text>
                      <strong>Role:</strong>{" "}
                      {user.isLecturer ? "Lecturer" : "Candidate"}
                    </Text>
                    {user.isCandidate && (
                      <>
                        <Text>
                          <strong>Availability:</strong>{" "}
                          {user.defaultAvailability || "Not set"}
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

            {/* Application Details Modal */}
            <Modal
              isOpen={!!selectedApp}
              onClose={() => setSelectedApp(null)}
              size="md"
            >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Application Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  {selectedApp ? (
                    <VStack align="start" spacing={3}>
                      <Text>
                        <strong>Course:</strong> {selectedApp.name} (
                        {selectedApp.courseCode})
                      </Text>
                      <Text>
                        <strong>Availability:</strong>{" "}
                        {(selectedApp as any).application
                          ?.appliedAvailability || "N/A"}
                      </Text>
                      <Text>
                        <strong>Applied Skills:</strong>
                      </Text>
                      {(selectedApp as any).application?.appliedSkills
                        ?.length > 0 ? (
                        <Wrap>
                          {(selectedApp as any).application.appliedSkills.map(
                            (skill: string, idx: number) => (
                              <Tag key={idx} colorScheme="blue">
                                {skill}
                              </Tag>
                            )
                          )}
                        </Wrap>
                      ) : (
                        <Text color="gray.500">No applied skills listed</Text>
                      )}
                      {(selectedApp as any).application?.status && (
                        <Text>
                          <strong>Status:</strong>{" "}
                          {(selectedApp as any).application.status}
                        </Text>
                      )}
                      {(selectedApp as any).application?.ranking !== undefined && (
                        <Text>
                          <strong>Ranking:</strong>{" "}
                          {(selectedApp as any).application.ranking ?? "N/A"}
                        </Text>
                      )}
                      {(selectedApp as any).application?.lecturerComment && (
                        <Text>
                          <strong>Lecturer Comment:</strong>{" "}
                          {(selectedApp as any).application.lecturerComment}
                        </Text>
                      )}
                    </VStack>
                  ) : (
                    <Text>No application data available.</Text>
                  )}
                </ModalBody>
              </ModalContent>
            </Modal>
          </>
        )}

        {!authLoading && !isLoggedIn && (
          <Text color="gray.600">
            Log in to view your dashboard and manage applications.
          </Text>
        )}
      </VStack>
    </main>
  );
};

export default LandingPage;

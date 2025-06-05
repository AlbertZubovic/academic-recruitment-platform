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
import { useApplications } from "@/context/ApplicationContext";
import ProfileModal from "@/components/modals/ProfileModal";
import ApplicationDetailsModal from "@/components/modals/ApplicationDetailsModal";

const LandingPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { courses: candidateCourses } = useCourses();
  const { courses: lecturerCourses } = useApplications();
  const isLoggedIn = !!user;

  const {
    isOpen: isProfileOpen,
    onOpen: onProfileOpen,
    onClose: onProfileClose,
  } = useDisclosure();

  const {
    isOpen: isAppDetailsOpen,
    onOpen: onAppDetailsOpen,
    onClose: onAppDetailsClose,
  } = useDisclosure();

  const [selectedApp, setSelectedApp] = useState<{
    course: any;
    appDetail: any;
  } | null>(null);

  const handleApplicationClick = (course: any, appDetail: any) => {
    const detailForModal = {
      ...appDetail,
      appliedAvailability: appDetail.appliedAvailability ?? appDetail.availability,
      appliedSkills: appDetail.appliedSkills ?? appDetail.skills ?? [],
    };
    setSelectedApp({ course, appDetail: detailForModal });
    onAppDetailsOpen();
  };

  // For lecturers: which courses they teach
  const myTaughtCourses = React.useMemo(() => {
    if (!user || !user.isLecturer) return [];
    return lecturerCourses.filter((c) => c.lecturer?.id === user.id);
  }, [lecturerCourses, user]);

  // For lecturers: all pending applications across their courses
  const pendingApplications = React.useMemo(() => {
    if (!user || !user.isLecturer) return [];
    const pendings: Array<{ course: any; appDetail: any }> = [];
    myTaughtCourses.forEach((course) => {
      course.applicants
        .filter((app: any) => app.status === "Pending")
        .forEach((app: any) => {
          pendings.push({ course, appDetail: app });
        });
    });
    return pendings;
  }, [myTaughtCourses]);

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
                <Avatar name={`${user.firstName} ${user.lastName}`} />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">
                    {user.firstName} {user.lastName}
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

            {/* Candidate View */}
            {user.isCandidate && (
              <Box mt={4}>
                <Heading size="sm" mb={2}>
                  My Applications
                </Heading>

                {candidateCourses.filter((c) => c.appliedRoles.length > 0)
                  .length === 0 ? (
                  <Text color="gray.500" fontSize="sm">
                    No applications yet.
                  </Text>
                ) : (
                  <VStack align="start" spacing={2} w="100%">
                    {candidateCourses
                      .filter((c) => c.appliedRoles.length > 0)
                      .map((course) =>
                        course.applicationDetails?.map((appDetail, idx) => {
                          const statusColor =
                            appDetail.status === "Approved"
                              ? "green"
                              : appDetail.status === "Pending"
                              ? "yellow"
                              : "red";

                          return (
                            <HStack
                              key={`${course.id}-${appDetail.role}-${idx}`}
                              w="100%"
                            >
                              <Button
                                flex="1"
                                justifyContent="flex-start"
                                size="sm"
                                variant="outline"
                                colorScheme="blue"
                                onClick={() =>
                                  handleApplicationClick(course, appDetail)
                                }
                              >
                                {course.name} ({course.courseCode}) –{" "}
                                {appDetail.role}
                              </Button>
                              <Tag size="sm" colorScheme={statusColor}>
                                {appDetail.status}
                              </Tag>
                            </HStack>
                          );
                        })
                      )}
                  </VStack>
                )}
              </Box>
            )}

            {/* Lecturer View */}
            {user.isLecturer && (
              <>
                {/* Pending Applications Section */}
                <Box mt={4}>
                  <Heading size="sm" mb={2}>
                    Pending Applications
                  </Heading>

                  {pendingApplications.length === 0 ? (
                    <Text color="gray.500" fontSize="sm">
                      No pending applications.
                    </Text>
                  ) : (
                    <VStack align="start" spacing={2} w="100%">
                      {pendingApplications.map(({ course, appDetail }, idx) => (
                        <HStack
                          key={`${course.id}-pending-${appDetail.applicationId}-${idx}`}
                          w="100%"
                        >
                          <Button
                            flex="1"
                            justifyContent="flex-start"
                            size="sm"
                            variant="outline"
                            colorScheme="teal"
                            onClick={() =>
                              handleApplicationClick(course, appDetail)
                            }
                          >
                            {appDetail.name} – {appDetail.role} on{" "}
                            {course.courseCode}
                          </Button>
                          <Tag size="sm" colorScheme="yellow">
                            Pending
                          </Tag>
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </Box>

                {/* My Courses Section */}
                <Box mt={6}>
                  <Heading size="sm" mb={2}>
                    My Courses
                  </Heading>

                  {myTaughtCourses.length === 0 ? (
                    <Text color="gray.500" fontSize="sm">
                      You are not assigned to any courses.
                    </Text>
                  ) : (
                    <VStack align="start" spacing={2} w="100%">
                      {myTaughtCourses.map((course) => (
                        <HStack key={course.id} w="100%">
                          <Button
                            flex="1"
                            justifyContent="flex-start"
                            size="sm"
                            variant="outline"
                            colorScheme="purple"
                          >
                            {course.name} ({course.courseCode})
                          </Button>
                          <Tag size="sm" colorScheme="gray">
                            {course.semester}
                          </Tag>
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </Box>
              </>
            )}

            {/* Profile Modal */}
            <ProfileModal
              isOpen={isProfileOpen}
              onClose={onProfileClose}
              user={user}
            />

            {/* Application Details Modal */}
            {selectedApp && (
              <ApplicationDetailsModal
                isOpen={isAppDetailsOpen}
                onClose={() => setSelectedApp(null)}
                course={selectedApp.course}
                appDetail={selectedApp.appDetail}
              />
            )}
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

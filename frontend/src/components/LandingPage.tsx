// src/pages/LandingPage.tsx

import React, { useState, useEffect, useMemo } from "react";
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
  Button,
  Tag,
  IconButton,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon, StarIcon } from "@chakra-ui/icons";
import { FaRegStar } from "react-icons/fa";
import styles from "@/styles/modules/pageContent.module.css";
import { useAuth } from "@/context/AuthContext";
import { useCourses } from "@/context/CourseContext";
import { useApplications } from "@/context/ApplicationContext";
import ProfileModal from "@/components/modals/ProfileModal";
import ApplicationDetailsModal from "@/components/modals/ApplicationDetailsModal";
import { Course as CourseType } from "@/types/course";

interface SelectedApp {
  course: any;
  appDetail: any;
}

const LandingPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { courses: candidateCourses } = useCourses();        // courses from /api/candidates/courses
  const { courses: lecturerCourses } = useApplications();    // full course list for lecturers
  const isLoggedIn = !!user;

  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onClose: onProfileClose } =
    useDisclosure();
  const { isOpen: isAppDetailsOpen, onOpen: onAppDetailsOpen, onClose: onAppDetailsClose } =
    useDisclosure();

  const [selectedApp, setSelectedApp] = useState<SelectedApp | null>(null);
  const { colorMode, toggleColorMode } = useColorMode();

  // ─────────────── Favorite/Bookmark Logic ───────────────
  const [availableCourses, setAvailableCourses] = useState<CourseType[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // On mount, read the same "bookmarkedCourses" object that CandidatePage writes
  useEffect(() => {
    const stored = localStorage.getItem("bookmarkedCourses");
    if (stored) {
      try {
        const bookmarkMap: Record<string, boolean> = JSON.parse(stored);
        const ids = Object.entries(bookmarkMap)
          .filter(([_, isBookmarked]) => isBookmarked)
          .map(([courseId]) => courseId);
        setFavoriteIds(new Set(ids));
      } catch {
        setFavoriteIds(new Set());
      }
    }
  }, []);

  // Fetch “all courses” for candidates whenever a candidate logs in
  useEffect(() => {
    if (user && user.isCandidate) {
      fetch("http://localhost:5000/api/courses", {
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch courses");
          return res.json();
        })
        .then((data: CourseType[]) => {
          setAvailableCourses(data);
        })
        .catch(() => {
          setAvailableCourses([]);
        });
    } else {
      setAvailableCourses([]);
    }
  }, [user]);

  // Filter “bookmarked” courses out of availableCourses
  const bookmarkedCourses = useMemo(() => {
    return availableCourses.filter((c) => favoriteIds.has(c.id));
  }, [availableCourses, favoriteIds]);

  // ─────────────── Candidate/Application Modal Logic ───────────────
  const handleApplicationClick = (course: any, appDetail: any) => {
    const detailForModal = {
      ...appDetail,
      appliedAvailability: appDetail.appliedAvailability ?? appDetail.availability,
      appliedSkills: appDetail.appliedSkills ?? appDetail.skills ?? [],
    };
    setSelectedApp({ course, appDetail: detailForModal });
    onAppDetailsOpen();
  };

  // ─────────────── Lecturer Helpers ───────────────
  const myTaughtCourses = useMemo(() => {
    if (!user || !user.isLecturer) return [];
    return lecturerCourses.filter((c) => c.lecturer?.id === user.id);
  }, [lecturerCourses, user]);

  const pendingApplications = useMemo(() => {
    if (!user || !user.isLecturer) return [];
    const pendings: Array<{ course: any; appDetail: any }> = [];
    myTaughtCourses.forEach((course) => {
      (course.applicants || [])
        .filter((app: any) => app.status === "Pending")
        .forEach((app: any) => pendings.push({ course, appDetail: app }));
    });
    return pendings;
  }, [myTaughtCourses, user]);

  return (
    <main className={styles.pageContent}>
      {/* ─────────────── Hero Section ─────────────── */}
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

      {/* ─────────────── Welcome + Toggles ─────────────── */}
      <VStack className={styles.welcomeSection} align="start" spacing={6}>
        <HStack w="100%" justify="space-between">
          <Box>
            <Heading className={styles.heading}>Welcome to TeachTeam</Heading>
            <Text className={styles.subheading}>
              A place by teachers, for teachers.
            </Text>
          </Box>

          {/* Dark Mode Toggle */}
          <Tooltip
            label={colorMode === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            <IconButton
              aria-label="Toggle dark mode"
              icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              size="md"
            />
          </Tooltip>
        </HStack>

        {authLoading && <Spinner size="lg" />}

        {!authLoading && isLoggedIn && user && (
          <>
            {/* ─────────────── Profile Card ─────────────── */}
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

            {/* ─────────────── Candidate View ─────────────── */}
            {user.isCandidate && (
              <>
                {/* ——— Bookmarked Courses ——— */}
                <Box mt={4} w="100%">
                  <Heading size="sm" mb={2}>
                    Bookmarked Courses
                  </Heading>

                  {bookmarkedCourses.length === 0 ? (
                    <Text color="gray.500" fontSize="sm">
                      You have no bookmarked courses.
                    </Text>
                  ) : (
                    <VStack align="start" spacing={2} w="100%">
                      {bookmarkedCourses.map((course) => (
                        <HStack key={course.id} w="100%">
                          <Button
                            flex="1"
                            justifyContent="flex-start"
                            size="sm"
                            variant="outline"
                            colorScheme="blue"
                            onClick={() => {
                              /* (Optionally scroll to that course in the UI) */
                            }}
                          >
                            {course.name} ({course.courseCode})
                          </Button>
                          <Tooltip
                            label={
                              favoriteIds.has(course.id)
                                ? "Bookmarked"
                                : "Bookmark this course"
                            }
                          >
                            <IconButton
                              aria-label={
                                favoriteIds.has(course.id) ? "Bookmarked" : "Bookmark"
                              }
                              icon={
                                favoriteIds.has(course.id) ? (
                                  <StarIcon color="yellow.400" />
                                ) : (
                                  <FaRegStar />
                                )
                              }
                              size="sm"
                              variant="ghost"
                              // If we also want LandingPage to toggle, uncomment below:
                              // onClick={() => toggleFavorite(course.id)}
                            />
                          </Tooltip>
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </Box>

                {/* ——— My Applications ——— */}
                <Box mt={6} w="100%">
                  <Heading size="sm" mb={2}>
                    My Applications
                  </Heading>

                  {candidateCourses.filter((c) => c.appliedRoles.length > 0).length === 0 ? (
                    <Text color="gray.500" fontSize="sm">
                      No applications yet.
                    </Text>
                  ) : (
                    <VStack align="start" spacing={2} w="100%">
                      {candidateCourses
                        .filter((c) => c.appliedRoles.length > 0)
                        .map((course) =>
                          (course.applicationDetails || []).map((appDetail, idx) => {
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
                                  onClick={() => handleApplicationClick(course, appDetail)}
                                >
                                  {course.name} ({course.courseCode}) – {appDetail.role}
                                </Button>
                                <Tag size="sm" colorScheme={statusColor}>
                                  {appDetail.status}
                                </Tag>
                                <Tooltip
                                  label={
                                    favoriteIds.has(course.id)
                                      ? "Bookmarked"
                                      : "Bookmark this course"
                                  }
                                >
                                  <IconButton
                                    aria-label={
                                      favoriteIds.has(course.id) ? "Bookmarked" : "Bookmark"
                                    }
                                    icon={
                                      favoriteIds.has(course.id) ? (
                                        <StarIcon color="yellow.400" />
                                      ) : (
                                        <FaRegStar />
                                      )
                                    }
                                    size="sm"
                                    variant="ghost"
                                    // Likewise, you could call toggleFavorite(course.id) here
                                  />
                                </Tooltip>
                              </HStack>
                            );
                          })
                        )}
                    </VStack>
                  )}
                </Box>
              </>
            )}

            {/* ─────────────── Lecturer View ─────────────── */}
            {user.isLecturer && (
              <>
                {/* ——— Pending Applications ——— */}
                <Box mt={4} w="100%">
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
                            onClick={() => handleApplicationClick(course, appDetail)}
                          >
                            {appDetail.name} – {appDetail.role} on {course.courseCode}
                          </Button>
                          <Tag size="sm" colorScheme="yellow">
                            Pending
                          </Tag>
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </Box>

                {/* ——— My Courses ——— */}
                <Box mt={6} w="100%">
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

            {/* ───────────── Modals ───────────── */}
            <ProfileModal
              isOpen={isProfileOpen}
              onClose={onProfileClose}
              user={user!}
            />
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

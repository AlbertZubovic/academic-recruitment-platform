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
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
import { FaRegStar } from "react-icons/fa";
import styles from "@/styles/modules/pageContent.module.css";
import { useAuth } from "@/context/AuthContext";
import { useCourses } from "@/context/CourseContext";
import { useApplications } from "@/context/ApplicationContext";
import ProfileModal from "@/components/modals/ProfileModal";
import ApplicationDetailsModal from "@/components/modals/ApplicationDetailsModal";
import { Course as CourseType } from "@/types/course";
import { LecturerApplication } from "@/types/Application";
import { ApplicationRole, ApplicationAvailability, ApplicationStatus } from "@/types/enums";
import { bookmarkService } from "@/services/bookmarkService";

type ApplicationDetail = {
  role: ApplicationRole;
  appliedAvailability: ApplicationAvailability;
  appliedSkills: string[];
  status: ApplicationStatus;
  lecturerComment?: string | null;
  isWithdrawn?: boolean;
  withdrawnAt?: Date | null;
};

interface SelectedApp {
  course: CourseType;
  appDetail: LecturerApplication | ApplicationDetail;
}

const LandingPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { courses: candidateCourses } = useCourses();        // courses from /api/candidates/courses
  const { courses: lecturerCourses } = useApplications();    // full course list for lecturers
  const isLoggedIn = !!user;

  const { isOpen: isProfileOpen, onOpen: onProfileOpen, onClose: onProfileClose } =
    useDisclosure();
  const { isOpen: isAppDetailsOpen, onOpen: onAppDetailsOpen } =
    useDisclosure();

  const [selectedApp, setSelectedApp] = useState<SelectedApp | null>(null);

  // ─────────────── Color values for light/dark ───────────────
  const pageBg = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("gray.50", "gray.700");
  const cardHoverBg = useColorModeValue("gray.100", "gray.600");
  const sectionHeadingColor = useColorModeValue("gray.900", "gray.300");
  const subheadingColor = useColorModeValue("gray.600", "gray.300");
  const mutedText = useColorModeValue("gray.600", "gray.400");
  const buttonBorder = useColorModeValue("gray.200", "gray.600");

  // ─────────────── Favorite/Bookmark Logic ───────────────
  const [availableCourses, setAvailableCourses] = useState<CourseType[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const toast = useToast();

  // Load bookmarks from database API on mount
  useEffect(() => {
    const loadBookmarks = async () => {
      if (!user || !user.isCandidate) return;
      
      try {
        const bookmarkedCourseIds = await bookmarkService.getBookmarks();
        setFavoriteIds(new Set(bookmarkedCourseIds));
      } catch (error) {
        console.error("Failed to load bookmarks:", error);
        // Fallback to localStorage for backward compatibility
        const stored = localStorage.getItem("bookmarkedCourses");
        if (stored) {
          try {
            const bookmarkMap: Record<string, boolean> = JSON.parse(stored);
            const ids = Object.entries(bookmarkMap)
              .filter(([, isBookmarked]) => isBookmarked)
              .map(([courseId]) => courseId);
            setFavoriteIds(new Set(ids));
          } catch {
            setFavoriteIds(new Set());
          }
        }
      }
    };

    loadBookmarks();
  }, [user]);

  // Toggle bookmark function
  const toggleBookmark = async (courseId: string) => {
    const isCurrentlyBookmarked = favoriteIds.has(courseId);
    
    // Optimistic update
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyBookmarked) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });

    try {
      await bookmarkService.toggleBookmark(courseId, isCurrentlyBookmarked);
      
      toast({
        title: isCurrentlyBookmarked ? "Bookmark Removed" : "Bookmark Added",
        description: `Course ${isCurrentlyBookmarked ? "removed from" : "added to"} your bookmarks.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      // Revert optimistic update on error
      setFavoriteIds(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyBookmarked) {
          newSet.add(courseId);
        } else {
          newSet.delete(courseId);
        }
        return newSet;
      });
      
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Failed to toggle bookmark:", error);
    }
  };

  // Fetch "all courses" for candidates whenever a candidate logs in
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

  const bookmarkedCourses = useMemo(() => {
    return availableCourses.filter((c) => favoriteIds.has(c.id));
  }, [availableCourses, favoriteIds]);

  // ─────────────── Candidate/Application Modal Logic ───────────────
  const handleApplicationClick = (course: CourseType, appDetail: LecturerApplication | ApplicationDetail) => {
    const detailForModal = {
      ...appDetail,
      appliedAvailability: appDetail.appliedAvailability,
      appliedSkills: appDetail.appliedSkills ?? [],
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
    const pendings: Array<{ course: CourseType; appDetail: LecturerApplication }> = [];
    myTaughtCourses.forEach((course) => {
      (course.applicants || [])
        .filter((app) => app.status === "Pending")
        .forEach((app) => pendings.push({ course, appDetail: app }));
    });
    return pendings;
  }, [myTaughtCourses, user]);

  return (
    <Box bg={pageBg} minH="100vh">
      <main className={styles.pageContent}>
        {/* ─────────────── Hero Section ─────────────── */}
        <Box className={styles.heroContainer}>
          <Image
            src="https://plus.unsplash.com/premium_photo-1671070290640-25f7935a813e?q=80&w=1973&auto=format&fit=crop&ixlib=rb-4.0.3"
            alt="Students collaborating on a project"
            className={styles.landingImage}
          />
          <Text color={subheadingColor}>
            TeachTeam helps lecturers hire skilled tutors and lab assistants
            through a streamlined application and review system.
          </Text>
        </Box>

        {/* ─────────────── Welcome + Toggles ─────────────── */}
        <VStack
          className={styles.welcomeSection}
          align="start"
          spacing={6}
          px={{ base: 4, md: 8 }}
          py={6}
        >
          <HStack w="100%" justify="space-between">
            <Box>
              <Heading
                color={sectionHeadingColor}
                //lassName={styles.heading}
                whiteSpace="nowrap"
              >
                Welcome to TeachTeam
              </Heading>
              <Text color={subheadingColor} >
                A place by teachers, for teachers.
              </Text>
            </Box>
          </HStack>

          {authLoading && <Spinner size="lg" />}

          {!authLoading && isLoggedIn && user && (
            <>
              {/* ─────────────── Profile Card ─────────────── */}
              <Box
                w="100%"
                p={4}
                bg={cardBg}
                borderRadius="lg"
                boxShadow="md"
                border="1px"
                borderColor={buttonBorder}
                cursor="pointer"
                _hover={{ bg: cardHoverBg }}
                onClick={onProfileOpen}
              >
                <HStack spacing={4}>
                  <Avatar name={`${user.firstName} ${user.lastName}`} />
                  <VStack align="start" spacing={0}>
                    <Text color={sectionHeadingColor} fontWeight="bold">
                      {user.firstName} {user.lastName}
                    </Text>
                    <Text color={subheadingColor} fontSize="sm">
                      {user.email}
                    </Text>
                    <Text color={subheadingColor} fontSize="sm" fontWeight="medium">
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
                    <Heading color={sectionHeadingColor} size="sm" mb={2}>
                      Bookmarked Courses
                    </Heading>

                    {bookmarkedCourses.length === 0 ? (
                      <Text color={mutedText} fontSize="sm">
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
                              borderColor={buttonBorder}
                              onClick={() => {
                              }}
                            >
                              <Text color={sectionHeadingColor}>
                                {course.name} ({course.courseCode})
                              </Text>
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
                                    <FaRegStar color={subheadingColor} />
                                  )
                                }
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleBookmark(course.id)}
                              />
                            </Tooltip>
                          </HStack>
                        ))}
                      </VStack>
                    )}
                  </Box>

                  {/* ——— My Applications ——— */}
                  <Box mt={6} w="100%">
                    <Heading color={sectionHeadingColor} size="sm" mb={2}>
                      My Applications
                    </Heading>

                    {candidateCourses.filter((c) => c.appliedRoles.length > 0).length === 0 ? (
                      <Text color={mutedText} fontSize="sm">
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
                                    borderColor={buttonBorder}
                                    onClick={() => handleApplicationClick(course, appDetail)}
                                  >
                                    <Text color={sectionHeadingColor}>
                                      {course.name} ({course.courseCode}) – {appDetail.role}
                                    </Text>
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
                                        favoriteIds.has(course.id)
                                          ? "Bookmarked"
                                          : "Bookmark"
                                      }
                                      icon={
                                        favoriteIds.has(course.id) ? (
                                          <StarIcon color="yellow.400" />
                                        ) : (
                                          <FaRegStar color={subheadingColor} />
                                        )
                                      }
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => toggleBookmark(course.id)}
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
                    <Heading color={sectionHeadingColor} size="sm" mb={2}>
                      Pending Applications
                    </Heading>

                    {pendingApplications.length === 0 ? (
                      <Text color={mutedText} fontSize="sm">
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
                              borderColor={buttonBorder}
                              onClick={() => handleApplicationClick(course, appDetail)}
                            >
                              <Text color={sectionHeadingColor}>
                                {appDetail.name} – {appDetail.role} on {course.courseCode}
                              </Text>
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
                    <Heading color={sectionHeadingColor} size="sm" mb={2}>
                      My Courses
                    </Heading>

                    {myTaughtCourses.length === 0 ? (
                      <Text color={mutedText} fontSize="sm">
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
                              borderColor={buttonBorder}
                            >
                              <Text color={sectionHeadingColor}>
                                {course.name} ({course.courseCode})
                              </Text>
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
            <Text color={mutedText}>
              Log in to view your dashboard and manage applications.
            </Text>
          )}
        </VStack>
      </main>
    </Box>
  );
};

export default LandingPage;

// src/components/LandingPage.tsx

// Landing page showing different content based on user role
// Lecturers see courses needing review

//import React, { useState } from "react";
import {
  Box,
  Image,
  Text,
  Heading,
  VStack,
  HStack,
  Avatar,
  Divider,
  // List,
  // ListItem,
  // ListIcon,
  // Tag,
  Spinner,
  // useDisclosure,
  // LinkBox,
  // LinkOverlay,
  // Badge,
} from "@chakra-ui/react";
// import { MdCheckCircle, MdHourglassTop, MdErrorOutline } from 'react-icons/md';
import styles from "@/styles/modules/pageContent.module.css";

import { useAuth } from "@/context/AuthContext";
// import { useCourse } from "@/context/CourseContext";
// import { useSelectedApplicants } from "@/context/SelectedApplicantsContext";
// import { Course } from "@/types/course";
// import { Applicant } from "@/types/applicant";

//import ApplicationStatusModal, { ApplicationModalData } from './modals/ApplicationStatusModal';
// import CourseReviewModal from './modals/CourseReviewModal';

const LandingPage: React.FC = () => {
  // Context data
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  // const { courses } = useCourse();
  // const { selectedApplicants } = useSelectedApplicants();

  // Modal state
  // const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  // const [statusModalData, setStatusModalData] = useState<ApplicationModalData | null>(null);
  // const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  // const [courseToReview, setCourseToReview] = useState<Course | null>(null);
  
  // Define lists for UI rendering
  // let appliedCoursesList: Course[] = [];
  // let selectedCoursesList: Course[] = [];
  // let coursesNeedingAttention: Course[] = []; // Courses lecturers need to review

  //if (isLoggedIn && user && courses && selectedApplicants) 
  if (isLoggedIn && user) 
  {
    // For tutors - find applied and selected courses
    if (user.isTutor && !user.isLecturer) {
      // selectedCoursesList = courses.filter(course =>
      //   Array.isArray(selectedApplicants[course.id]) &&
      //   selectedApplicants[course.id].includes(String(user.id))
      // );
      // appliedCoursesList = courses.filter(course => {
      //   const didApply = Array.isArray(course.applicants) &&
      //                    course.applicants.some(applicantDetail => String(applicantDetail.userId) === String(user.id));
      //   const wasSelected = Array.isArray(selectedApplicants[course.id]) &&
      //                     selectedApplicants[course.id].includes(String(user.id));
      //   return didApply && !wasSelected;
      // });
    }
    // For lecturers - find courses with applicants but no selections
    else if (user.isLecturer) {
      // coursesNeedingAttention = courses.filter(course => {
      //   const hasApplicants = Array.isArray(course.applicants) && course.applicants.length > 0;
      //   const hasSelections = Array.isArray(selectedApplicants[course.id]) && selectedApplicants[course.id].length > 0;
      //   return hasApplicants && !hasSelections;
      // });
    }
  }

  // Modal handlers
  // const handleOpenStatusModal = (course: Course, status: 'Pending' | 'Selected') => {
  //   const applicationDetails = course.applicants.find(
  //     (app: Applicant) => String(app.userId) === String(user?.id)
  //   ) || null;
  //   setStatusModalData({ course, application: applicationDetails, status });
  //   setIsStatusModalOpen(true);
  // };
  
  // const handleCloseStatusModal = () => {
  //   setIsStatusModalOpen(false);
  //   setStatusModalData(null);
  // };

  // const handleOpenReviewModal = (course: Course) => {
  //   setCourseToReview(course);
  //   setIsReviewModalOpen(true);
  // };
  
  // const handleCloseReviewModal = () => {
  //   setIsReviewModalOpen(false);
  //   setCourseToReview(null);
  // };

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

        {authLoading && (
           <Spinner size="lg" />
        )}

        {!authLoading && isLoggedIn && user && (
          <Box className={styles.userInfoBox} w="100%">
            <Divider mb={4} />

            {/* User info */}
            <HStack spacing={4} mb={6}>
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

            {/* Tutor view */}
            {user.isTutor && !user.isLecturer && (
              <VStack align="stretch" spacing={6}>
                {/* Pending applications */}
                <Box>
                  <Heading size="sm" mb={3} color="gray.700">My Pending Applications</Heading>
                  {/* {appliedCoursesList.length > 0 ? (
                    <List spacing={1}>
                      {appliedCoursesList.map(course => (
                        <LinkBox key={course.id} as={ListItem} p={1.5} _hover={{ bg: 'gray.100', borderRadius: 'md' }}>
                          <LinkOverlay href="#" onClick={(e) => { e.preventDefault(); handleOpenStatusModal(course, 'Pending'); }}>
                            <HStack>
                              <ListIcon as={MdHourglassTop} color="orange.500" />
                              <Text fontSize="sm" flex="1">{course.name}</Text>
                              <Tag size="sm" variant="subtle">{course.courseCode}</Tag>
                            </HStack>
                          </LinkOverlay>
                        </LinkBox>
                      ))}
                    </List>
                  ) : (
                    <Text color="gray.500" fontSize="sm">You have no pending applications.</Text>
                  )} */}
                </Box>

                <Divider />

                {/* Selected courses */}
                <Box>
                  <Heading size="sm" mb={3} color="gray.700">My Selections</Heading>
                  {/* {selectedCoursesList.length > 0 ? (
                    <List spacing={1}>
                      {selectedCoursesList.map(course => (
                         <LinkBox key={course.id} as={ListItem} p={1.5} _hover={{ bg: 'gray.100', borderRadius: 'md' }}>
                           <LinkOverlay href="#" onClick={(e) => { e.preventDefault(); handleOpenStatusModal(course, 'Selected'); }}>
                             <HStack>
                               <ListIcon as={MdCheckCircle} color="green.500" />
                               <Text fontSize="sm" flex="1">{course.name}</Text>
                               <Tag size="sm" variant="subtle">{course.courseCode}</Tag>
                             </HStack>
                           </LinkOverlay>
                         </LinkBox>
                      ))}
                    </List>
                  ) : (
                    <Text color="gray.500" fontSize="sm">You have not been selected for any courses yet.</Text>
                  )} */}
                </Box>
              </VStack>
            )}

            {/* Lecturer view */}
            {user.isLecturer && (
              <VStack align="stretch" spacing={6}>
                 <Text color="gray.600">
                    Manage full applications via the Applications page.
                 </Text>
                 <Divider />
                 <Box>
                    <Heading size="sm" mb={3} color="orange.600">Courses Needing Attention</Heading>
                    <Text fontSize="xs" color="gray.500" mb={3}>Courses with new applicants but no selections made yet.</Text>
                    {/* {coursesNeedingAttention.length > 0 ? (
                        <List spacing={1}>
                            {coursesNeedingAttention.map(course => (
                                <LinkBox key={course.id} as={ListItem} p={1.5} _hover={{ bg: 'gray.100', borderRadius: 'md' }}>
                                    <LinkOverlay href="#" onClick={(e) => { e.preventDefault(); handleOpenReviewModal(course); }}>
                                        <HStack justify="space-between">
                                            <HStack>
                                                <ListIcon as={MdErrorOutline} color="orange.500" />
                                                <Text fontSize="sm">{course.name}</Text>
                                                <Tag size="sm" variant="subtle">{course.courseCode}</Tag>
                                            </HStack>
                                            <Badge colorScheme="orange" variant="outline" fontSize="xs">
                                                {course.applicants.length} Pending
                                            </Badge>
                                        </HStack>
                                    </LinkOverlay>
                                </LinkBox>
                            ))}
                        </List>
                    ) : (
                        <Text color="gray.500" fontSize="sm">No courses currently need immediate attention.</Text>
                    )} */}
                 </Box>
              </VStack>
            )}

          </Box>
        )}

        {!authLoading && !isLoggedIn && (
            <Text color="gray.600">Log in to view your dashboard and manage applications.</Text>
        )}

      </VStack>

      {/* Modals */}
      {/*<ApplicationStatusModal
        isOpen={isStatusModalOpen}
        onClose={handleCloseStatusModal}
        modalData={statusModalData}
      />
      <CourseReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        course={courseToReview}
      />*/}

    </main>
  );
};

export default LandingPage;
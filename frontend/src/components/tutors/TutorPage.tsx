// src/components/tutors/TutorPage.tsx

/**
 * TutorPage
 * Dashboard for tutors to view available courses and initiate the application process.
 * Displays course name, semester, and required skills.
 * Tracks and disables courses already applied for.
 * Opens a modal for submitting application-specific details.
 * Links to editable profile.
 */

import React, { useState } from 'react'; // <-- Import useState
import { useRouter } from 'next/router';
import { useCourse } from '@/context/CourseContext';
import { useAuth } from '@/context/AuthContext';
import { Course } from '@/types/course'; // <-- Import Course type

import {
  Container,
  Heading,
  VStack,
  Text,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Tag,
  Wrap,
  Icon,
} from '@chakra-ui/react';
import { FaPencilAlt } from 'react-icons/fa';

import ApplyModal from './tutorFormSections/ApplicationDetailsForm';

const TutorPage: React.FC = () => {
  const router = useRouter();
  const { courses } = useCourse(); 
  const { user } = useAuth();


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);


  // Prevent rendering if user or course data hasn't loaded yet
  if (!user || !courses) return <div>Loading...</div>;

  // Check if the current user has already applied to a given course
  // This function remains correct as it checks the userId within the Applicant object
  const checkIfApplied = (courseId: string): boolean => {
    const targetCourse = courses.find((course) => course.id === courseId);
    // Ensure applicants array exists and check if user.id is present
    return targetCourse?.applicants.some(applicant => String(applicant.userId) === String(user.id)) ?? false;
  };

  // --- Function to open the modal ---
  const handleOpenApplyModal = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  // --- Function to close the modal ---
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null); // Clear selected course when closing
  };


  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Tutor Dashboard
        </Heading>

        <Text fontSize="lg" textAlign="center" color="gray.600">
          Welcome {user.firstName} {user.lastName}
        </Text>

        {/* Navigate to profile edit page */}
        <Button onClick={() => router.push('/mydetails')}>
          <Icon as={FaPencilAlt} mr={2} /> Edit Details
        </Button>

        {/* List of available courses with application functionality */}
        <Accordion allowToggle>
          {courses.map((course) => {
            const hasApplied = checkIfApplied(course.id);

            return (
              <AccordionItem key={course.id}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold" fontSize="lg">
                      {course.name} ({course.courseCode})
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>

                <AccordionPanel pb={4}>
                  <VStack align="start" spacing={3}>
                    <Text>
                      <strong>Semester:</strong> {course.semester}
                    </Text>

                    <Text>
                      <strong>Skills Required:</strong>
                    </Text>

                    <Wrap>
                      {course.skills.map((skill, i) => (
                        <Tag key={i} size="md" colorScheme="blue">
                          {skill}
                        </Tag>
                      ))}
                    </Wrap>


                    <Button
                      colorScheme={hasApplied ? 'blue' : 'green'}
                      size="sm"
                      // Open the modal instead of calling handleApply directly
                      onClick={() => handleOpenApplyModal(course)}
                      disabled={hasApplied}
                    >
                      {hasApplied ? 'Applied' : 'Apply'}
                    </Button>


                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
      </VStack>

      {selectedCourse && (
        <ApplyModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          course={selectedCourse} // Pass the selected course object
        />
      )}


    </Container>
  );
};

export default TutorPage;

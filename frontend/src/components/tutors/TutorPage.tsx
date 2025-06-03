import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useCourse } from '@/context/CourseContext';
import { useAuth } from '@/context/AuthContext';
import { Course } from '@/types/course';

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

  if (!user || !courses) return <div>Loading...</div>;

const checkIfApplied = (courseId: string): boolean => {
  const targetCourse = courses.find((course) => course.id === courseId);
  return (targetCourse?.applicants ?? []).some(applicant => String(applicant.userId) === String(user.id));
};

  const handleOpenApplyModal = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Candidate Dashboard
        </Heading>

        <Text fontSize="lg" textAlign="center" color="gray.600">
          Welcome {user.firstName} {user.lastName}
        </Text>

        <Button onClick={() => router.push('/mydetails')}>
          <Icon as={FaPencilAlt} mr={2} /> Edit Details
        </Button>

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
          course={selectedCourse}
        />
      )}
    </Container>
  );
};

export default TutorPage;

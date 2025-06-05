// src/components/candidates/CandidatePage.tsx

import React, { useState } from "react";
import { useRouter } from "next/router";
import { useCourses } from "@/context/CourseContext";
import { useAuth } from "@/context/AuthContext";
import { Course } from "@/types/course";

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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  HStack,
} from "@chakra-ui/react";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import ApplyModal from "./candidateFormSections/ApplicationDetailsForm";

const CandidatePage: React.FC = () => {
  const router = useRouter();
  const { courses, deleteApplication } = useCourses();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editing, setEditing] = useState(false);

  const {
    isOpen: isAppDetailOpen,
    onOpen: onAppDetailOpen,
    onClose: onAppDetailClose,
  } = useDisclosure();

  const handleOpenApplyModal = (course: Course, edit = false) => {
    setSelectedCourse(course);
    setEditing(edit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    setEditing(false);
  };

  const checkIfApplied = (courseId: string): boolean => {
    const targetCourse = courses.find((course) => course.id === courseId);
    return (targetCourse?.application ?? null) !== null;
  };

  const myApplications = courses.filter((c) => (c as any).application);

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Candidate Dashboard
        </Heading>

        <Text fontSize="lg" textAlign="center" color="gray.600">
          Welcome {user?.firstName} {user?.lastName}
        </Text>

        <Button onClick={() => router.push("/mydetails")}>
          <Icon as={FaPencilAlt} mr={2} /> Edit Details
        </Button>

        <Heading size="md">Available Courses</Heading>
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

                    {/* ← NEW: Roles Available */}
                    <Text>
                      <strong>Roles Available:</strong>{" "}
                      {course.rolesAvailable.join(", ")}
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
                      colorScheme={hasApplied ? "gray" : "green"}
                      size="sm"
                      onClick={() => handleOpenApplyModal(course)}
                      disabled={hasApplied}
                    >
                      {hasApplied ? "Already Applied" : "Apply"}
                    </Button>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>

        <Heading size="md" mt={10}>
          My Applications
        </Heading>
        {myApplications.length === 0 ? (
          <Text>No applications yet.</Text>
        ) : (
          <Accordion allowToggle>
            {myApplications.map((course) => (
              <AccordionItem key={course.id}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold">{course.name}</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <VStack align="start">
                    <Text>
                      <strong>Availability:</strong>{" "}
                      {(course as any).application?.appliedAvailability}
                    </Text>
                    <Text>
                      <strong>Skills:</strong>
                    </Text>
                    <Wrap>
                      {(course as any).application?.appliedSkills?.map(
                        (s: string, idx: number) => (
                          <Tag key={idx} colorScheme="blue">
                            {s}
                          </Tag>
                        )
                      )}
                    </Wrap>
                    <HStack>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => handleOpenApplyModal(course, true)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        leftIcon={<FaTrashAlt />}
                        onClick={() => deleteApplication(course.id)}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </VStack>

      {selectedCourse && (
        <ApplyModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          course={selectedCourse}
          isEdit={editing}
        />
      )}
    </Container>
  );
};

export default CandidatePage;

// src/components/candidates/CandidatePage.tsx

import React, { useState } from "react";
import { useRouter } from "next/router";
import { useCourses } from "@/context/CourseContext";
import { useAuth } from "@/context/AuthContext";
import { Course } from "@/types/course";
import { ApplicationRole } from "@/types/enums";

import {
  Container,
  Heading,
  VStack,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  Wrap,
  Tag,
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
  const [selectedRole, setSelectedRole] = useState<string>("");

  // Open the modal for a given course + role
  const handleOpenApplyModal = (course: Course, role: string) => {
    setSelectedCourse(course);
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  // Close the modal and reset selections
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    setSelectedRole("");
  };

  // Only those courses where the user has at least one application:
  const myCourses = courses.filter((c) => c.appliedRoles.length > 0);

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
          <FaPencilAlt style={{ marginRight: "0.5rem" }} />
          Edit Details
        </Button>

        {/* ── Available Courses ── */}
        <Heading size="md">Available Courses</Heading>
        <Accordion allowToggle>
          {courses.map((course) => (
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
                    {course.skills.map((skill, idx) => (
                      <Tag key={idx} size="md" colorScheme="blue">
                        {skill}
                      </Tag>
                    ))}
                  </Wrap>

                  {/* ── One “Apply as …” button per allowed role ── */}
                  <HStack spacing={4} mt={3}>
                    {course.rolesAvailable.map((role) => {
                      const alreadyApplied = course.appliedRoles.includes(role);

                      return (
                        <Button
                          key={role}
                          colorScheme={alreadyApplied ? "gray" : "green"}
                          size="sm"
                          onClick={() => handleOpenApplyModal(course, role)}
                          disabled={alreadyApplied}
                        >
                          {alreadyApplied
                            ? `Already Applied as ${role}`
                            : `Apply as ${role}`}
                        </Button>
                      );
                    })}
                  </HStack>
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>

        {/* ── My Applications ── */}
        <Heading size="md" mt={10}>
          My Applications
        </Heading>
        {myCourses.length === 0 ? (
          <Text>No applications yet.</Text>
        ) : (
          <Accordion allowToggle>
            {myCourses.map((course) => (
              <AccordionItem key={course.id}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold">{course.name}</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <VStack align="start" spacing={3}>
                    {course.applicationDetails?.map((app, idx) => (
                      <Box
                        key={idx}
                        p={2}
                        borderWidth="1px"
                        borderRadius="md"
                        w="100%"
                      >
                        <Text>
                          <strong>Role:</strong> {app.role}
                        </Text>
                        <Text>
                          <strong>Availability:</strong> {app.appliedAvailability}
                        </Text>
                        <Text>
                          <strong>Skills:</strong> {app.appliedSkills.join(", ")}
                        </Text>
                        <Text>
                          <strong>Status:</strong> {app.status}
                        </Text>
                        {app.lecturerComment && (
                          <Text>
                            <strong>Comment:</strong> {app.lecturerComment}
                          </Text>
                        )}
                        <HStack mt={2} spacing={2}>
                          <Button
                            size="xs"
                            colorScheme="blue"
                            onClick={() =>
                              handleOpenApplyModal(course, app.role)
                            }
                          >
                            Edit {app.role}
                          </Button>
                          <Button
                            size="xs"
                            colorScheme="red"
                            leftIcon={<FaTrashAlt />}
                            onClick={() => deleteApplication(course.id)}
                          >
                            Withdraw {app.role}
                          </Button>
                        </HStack>
                      </Box>
                    ))}
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
          defaultRole={selectedRole as ApplicationRole}
        />
      )}
    </Container>
  );
};

export default CandidatePage;

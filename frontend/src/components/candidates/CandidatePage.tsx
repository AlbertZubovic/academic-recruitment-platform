// src/components/candidates/CandidatePage.tsx

import React, { useState, useMemo } from "react";
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
  Tooltip,
  Progress,
  Badge,
} from "@chakra-ui/react";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import ApplicationDetailsForm from "./candidateFormSections/ApplicationDetailsForm";

const CandidatePage: React.FC = () => {
  const router = useRouter();
  const { courses, deleteApplication } = useCourses();
  const { user } = useAuth();

  // Candidate's own skills for matching
  const userSkills = useMemo(() => user?.defaultSkills || [], [user?.defaultSkills]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedRole, setSelectedRole] = useState<ApplicationRole | "">("");

  const openApplyModal = (course: Course, role: ApplicationRole) => {
    setSelectedCourse(course);
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    setSelectedRole("");
  };

  // Only show courses where the candidate has at least one application
  const myCourses = courses.filter((c) => c.appliedRoles.length > 0);

  // Calculate “skill match” percentage for display
  const computeMatchPercent = (required: string[], owned: string[]) => {
    if (required.length === 0) return 0;
    const lowerOwned = new Set(owned.map((s) => s.toLowerCase()));
    const matched = required.filter((r) => lowerOwned.has(r.toLowerCase()));
    return Math.round((matched.length / required.length) * 100);
  };

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
          {courses.map((course) => {
            const matchPct = useMemo(
              () => computeMatchPercent(course.skills, userSkills),
              [course.skills.join("|"), userSkills.join("|")]
            );
            const colorScheme =
              matchPct >= 70 ? "green" : matchPct >= 40 ? "yellow" : "red";

            return (
              <AccordionItem key={course.id}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold" fontSize="lg">
                      {course.name} ({course.courseCode})
                      {matchPct === 100 && (
                        <Badge ml={2} colorScheme="green">
                          Perfect Match
                        </Badge>
                      )}
                    </Text>
                    <Box mt={1} w="50%">
                      <Progress value={matchPct} size="xs" colorScheme={colorScheme} />
                      <Text fontSize="xs" color="gray.500">
                        {matchPct}% skills matched
                      </Text>
                    </Box>
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

                    {/* One “Apply as …” button per allowed role */}
                    <HStack spacing={4} mt={3}>
                      {course.rolesAvailable.map((role) => {
                        const alreadyApplied = course.appliedRoles.includes(role);
                        return (
                          <Button
                            key={role}
                            colorScheme={alreadyApplied ? "gray" : "green"}
                            size="sm"
                            onClick={() => openApplyModal(course, role)}
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
            );
          })}
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
                {/* --- Here is the header, with status badges next to each role --- */}
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold" display="flex" alignItems="center">
                      {course.name}
                      {(course.applicationDetails || []).map((app) => {
                        // Decide badge color based on app.status
                        const badgeColor =
                          app.status === "Approved"
                            ? "green"
                            : app.status === "Rejected"
                            ? "red"
                            : "yellow";
                        return (
                          <Badge
                            key={app.role}
                            ml={2}
                            colorScheme={badgeColor}
                          >
                            {app.role}: {app.status}
                          </Badge>
                        );
                      })}
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>

                {/* --- Expanded panel shows the full details as before --- */}
                <AccordionPanel>
                  <VStack align="start" spacing={3}>
                    {(course.applicationDetails || []).map((app, idx) => (
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
                          {app.status === "Pending" ? (
                            <Button
                              size="xs"
                              colorScheme="blue"
                              onClick={() => openApplyModal(course, app.role)}
                            >
                              Edit {app.role}
                            </Button>
                          ) : (
                            <Tooltip label="You can only edit pending applications">
                              <Button size="xs" colorScheme="gray" disabled>
                                Edit {app.role}
                              </Button>
                            </Tooltip>
                          )}

                          <Button
                            size="xs"
                            colorScheme="red"
                            leftIcon={<FaTrashAlt />}
                            onClick={() =>
                              deleteApplication(course.id, app.status)
                            }
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
        <ApplicationDetailsForm
          isOpen={isModalOpen}
          onClose={closeModal}
          course={selectedCourse}
          defaultRole={selectedRole as ApplicationRole}
        />
      )}
    </Container>
  );
};

export default CandidatePage;

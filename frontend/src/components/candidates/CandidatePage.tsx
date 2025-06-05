// src/components/candidates/CandidatePage.tsx

import React, { useState, useMemo, useEffect } from "react";
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
  IconButton,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Divider,
} from "@chakra-ui/react";
import { FaPencilAlt, FaTrashAlt, FaStar, FaRegStar, FaFileCsv } from "react-icons/fa";
import ApplicationDetailsForm from "./candidateFormSections/ApplicationDetailsForm";

interface BookmarkMap {
  [courseId: string]: boolean;
}

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

  // #######################
  // Compute “Available” vs. “My” courses
  // #######################
  const availableCourses = useMemo(
    () => courses.filter((c) => c.appliedRoles.length === 0),
    [courses]
  );
  const myCourses = useMemo(
    () => courses.filter((c) => c.appliedRoles.length > 0),
    [courses]
  );

  // #######################
  // FEATURE #3: Application Stats
  // #######################
  const myApps = useMemo(
    () =>
      myCourses.flatMap((c) =>
        (c.applicationDetails || []).map((app) => ({ course: c, application: app }))
      ),
    [myCourses]
  );
  const totalApplied = myApps.length;
  const approvedCount = myApps.filter(({ application }) => application.status === "Approved")
    .length;
  const rejectedCount = myApps.filter(({ application }) => application.status === "Rejected")
    .length;
  const pendingCount = myApps.filter(({ application }) => application.status === "Pending")
    .length;

  // #######################
  // FEATURE #2: Save‐for‐Later (Bookmarks)
  // #######################
  const localKey = "bookmarkedCourses";
  const [bookmarks, setBookmarks] = useState<BookmarkMap>({});

  useEffect(() => {
    const saved = localStorage.getItem(localKey);
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch {
        setBookmarks({});
      }
    }
  }, []);

  const toggleBookmark = (courseId: string) => {
    setBookmarks((prev) => {
      const updated = { ...prev, [courseId]: !prev[courseId] };
      localStorage.setItem(localKey, JSON.stringify(updated));
      return updated;
    });
  };

  // #######################
  // FEATURE #1: Compute “Matching %” & “Missing Skills”
  // #######################
  const computeMatchPercent = (required: string[], owned: string[]) => {
    if (required.length === 0) return 100;
    const lowerOwned = new Set(owned.map((s) => s.toLowerCase()));
    const matched = required.filter((r) => lowerOwned.has(r.toLowerCase()));
    return Math.round((matched.length / required.length) * 100);
  };

  const getMissingSkills = (required: string[], owned: string[]) => {
    const lowerOwned = new Set(owned.map((s) => s.toLowerCase()));
    return required.filter((r) => !lowerOwned.has(r.toLowerCase()));
  };

  // #######################
  // FEATURE #4: Recommended for You (≥70% match)
  // #######################
  const recommendedCourses: Course[] = useMemo(() => {
    return courses
      .map((c) => {
        const pct = computeMatchPercent(c.skills, userSkills);
        return { course: c, pct };
      })
      .filter(({ pct }) => pct >= 70)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 3)
      .map(({ course }) => course);
  }, [courses, userSkills]);

  // #######################
  // FEATURE #5: Withdraw All Pending
  // #######################
  const handleWithdrawAll = async () => {
    for (const { course, application } of myApps.filter(
      ({ application }) => application.status === "Pending"
    )) {
      await deleteApplication(course.id, "Pending");
    }
  };

  // #######################
  // FEATURE #6: Export My Applications to CSV
  // #######################
  const downloadCSV = () => {
    const header = ["CourseCode", "Role", "Availability", "Status", "Comment"];
    const rows = myApps.map(({ course, application }) => [
      course.courseCode,
      application.role,
      application.appliedAvailability,
      application.status,
      application.lecturerComment || "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_applications.csv");
    document.body.appendChild(link); // required for Firefox
    link.click();
    document.body.removeChild(link);
  };

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

  // Only candidates can access this page
  if (!user || !user.isCandidate) {
    return (
      <Text textAlign="center" mt={10}>
        You are not authorized to view this page.
      </Text>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Candidate Dashboard
        </Heading>

        <Text fontSize="lg" textAlign="center" color="gray.600">
          Welcome, {user.firstName} {user.lastName}!
        </Text>

        <Button onClick={() => router.push("/mydetails")} leftIcon={<FaPencilAlt />}>
          Edit Details
        </Button>

        {/* ######################## */}
        {/* FEATURE #4: Recommended */}
        {/* ######################## */}
        {recommendedCourses.length > 0 && (
          <>
            <Heading size="md">Recommended for You</Heading>
            <Accordion allowToggle>
              {recommendedCourses.map((course) => {
                const matchPct = computeMatchPercent(course.skills, userSkills);
                const missing = getMissingSkills(course.skills, userSkills);
                const saved = Boolean(bookmarks[course.id]);

                return (
                  <AccordionItem key={course.id}>
                    <AccordionButton>
                      <Flex flex="1" align="center">
                        <Box textAlign="left">
                          <Text fontWeight="bold" fontSize="lg">
                            {course.name} ({course.courseCode})
                            <Badge ml={2} colorScheme="purple">
                              {matchPct}% match
                            </Badge>
                          </Text>
                          <HStack spacing={1} mt={1}>
                            {course.skills.map((skill) => {
                              const isMissing = missing.includes(skill);
                              return (
                                <Tooltip
                                  key={skill}
                                  label={isMissing ? `Missing: ${skill}` : skill}
                                  hasArrow
                                >
                                  <Tag
                                    size="sm"
                                    colorScheme={isMissing ? "red" : "green"}
                                  >
                                    {skill}
                                  </Tag>
                                </Tooltip>
                              );
                            })}
                          </HStack>
                        </Box>
                        <IconButton
                          aria-label="Save for Later"
                          ml="auto"
                          icon={saved ? <FaStar /> : <FaRegStar />}
                          colorScheme={saved ? "yellow" : "gray"}
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(course.id);
                          }}
                        />
                      </Flex>
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
                        <HStack spacing={2}>
                          {course.skills.map((skill) => (
                            <Tag key={skill} colorScheme="blue">
                              {skill}
                            </Tag>
                          ))}
                        </HStack>
                        <HStack spacing={4} mt={3}>
                          {course.rolesAvailable.map((role) => {
                            const alreadyApplied = course.appliedRoles.includes(role);
                            return (
                              <Button
                                key={role}
                                size="sm"
                                colorScheme={alreadyApplied ? "gray" : "green"}
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
            <Divider mt={6} />
          </>
        )}

        {/* ######################## */}
        {/* FEATURE #2: Saved Courses */}
        {/* ######################## */}
        {Object.keys(bookmarks).some((id) => bookmarks[id]) && (
          <>
            <Heading size="md">My Saved Courses</Heading>
            <Accordion allowToggle>
              {courses
                .filter((c) => bookmarks[c.id])
                .map((course) => {
                  const matchPct = computeMatchPercent(course.skills, userSkills);
                  const missing = getMissingSkills(course.skills, userSkills);
                  return (
                    <AccordionItem key={course.id}>
                      <AccordionButton>
                        <Flex flex="1" align="center">
                          <Box textAlign="left">
                            <Text fontWeight="bold" fontSize="lg">
                              {course.name} ({course.courseCode})
                              <Badge ml={2} colorScheme="purple">
                                {matchPct}% match
                              </Badge>
                            </Text>
                            <HStack spacing={1} mt={1}>
                              {course.skills.map((skill) => {
                                const isMissing = missing.includes(skill);
                                return (
                                  <Tooltip
                                    key={skill}
                                    label={isMissing ? `Missing: ${skill}` : skill}
                                    hasArrow
                                  >
                                    <Tag
                                      size="sm"
                                      colorScheme={isMissing ? "red" : "green"}
                                    >
                                      {skill}
                                    </Tag>
                                  </Tooltip>
                                );
                              })}
                            </HStack>
                          </Box>
                          <IconButton
                            aria-label="Unsave"
                            ml="auto"
                            icon={<FaStar />}
                            colorScheme="yellow"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(course.id);
                            }}
                          />
                        </Flex>
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
                          <HStack spacing={2}>
                            {course.skills.map((skill) => (
                              <Tag key={skill} colorScheme="blue">
                                {skill}
                              </Tag>
                            ))}
                          </HStack>
                          <HStack spacing={4} mt={3}>
                            {course.rolesAvailable.map((role) => {
                              const alreadyApplied = course.appliedRoles.includes(
                                role
                              );
                              return (
                                <Button
                                  key={role}
                                  size="sm"
                                  colorScheme={alreadyApplied ? "gray" : "green"}
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
            <Divider mt={6} />
          </>
        )}

        {/* ######################## */}
        {/* Available Courses (where you haven’t applied yet) */}
        {/* ######################## */}
        <Heading size="md">Available Courses</Heading>
        {availableCourses.length === 0 ? (
          <Text>No available courses left to apply.</Text>
        ) : (
          <Accordion allowToggle>
            {availableCourses.map((course) => {
              const matchPct = computeMatchPercent(course.skills, userSkills);
              const missing = getMissingSkills(course.skills, userSkills);
              const saved = Boolean(bookmarks[course.id]);

              return (
                <AccordionItem key={course.id}>
                  <AccordionButton>
                    <Flex flex="1" align="center">
                      <Box textAlign="left">
                        <Text fontWeight="bold" fontSize="lg">
                          {course.name} ({course.courseCode})
                          <Badge ml={2} colorScheme="purple">
                            {matchPct}% match
                          </Badge>
                        </Text>
                        <HStack spacing={1} mt={1}>
                          {course.skills.map((skill) => {
                            const isMissing = missing.includes(skill);
                            return (
                              <Tooltip
                                key={skill}
                                label={isMissing ? `Missing: ${skill}` : skill}
                                hasArrow
                              >
                                <Tag
                                  size="sm"
                                  colorScheme={isMissing ? "red" : "green"}
                                >
                                  {skill}
                                </Tag>
                              </Tooltip>
                            );
                          })}
                        </HStack>
                      </Box>
                      <IconButton
                        aria-label="Save for Later"
                        ml="auto"
                        icon={saved ? <FaStar /> : <FaRegStar />}
                        colorScheme={saved ? "yellow" : "gray"}
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(course.id);
                        }}
                      />
                    </Flex>
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
                      <HStack spacing={2}>
                        {course.skills.map((skill) => (
                          <Tag key={skill} colorScheme="blue">
                            {skill}
                          </Tag>
                        ))}
                      </HStack>
                      <HStack spacing={4} mt={3}>
                        {course.rolesAvailable.map((role) => {
                          const alreadyApplied = course.appliedRoles.includes(role);
                          return (
                            <Button
                              key={role}
                              size="sm"
                              colorScheme={alreadyApplied ? "gray" : "green"}
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
        )}

        <Divider />

        {/* ######################## */}
        {/* FEATURE #3: Application Statistics & Buttons */}
        {/* ######################## */}
        <StatGroup>
          <Stat>
            <StatLabel>Total Applied</StatLabel>
            <StatNumber>{totalApplied}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Approved</StatLabel>
            <StatNumber color="green.500">{approvedCount}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Rejected</StatLabel>
            <StatNumber color="red.500">{rejectedCount}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Pending</StatLabel>
            <StatNumber color="orange.500">{pendingCount}</StatNumber>
          </Stat>
        </StatGroup>

        <HStack spacing={4} mt={4}>
          {pendingCount > 0 && (
            <Button colorScheme="red" onClick={handleWithdrawAll}>
              Withdraw All Pending
            </Button>
          )}
          {totalApplied > 0 && (
            <Button
              leftIcon={<FaFileCsv />}
              colorScheme="blue"
              onClick={downloadCSV}
            >
              Download My Applications (CSV)
            </Button>
          )}
        </HStack>

        <Divider />

        {/* ######################## */}
        {/* My Applications List */}
        {/* ######################## */}
        <Heading size="md">My Applications</Heading>
        {myCourses.length === 0 ? (
          <Text>No applications yet.</Text>
        ) : (
          <Accordion allowToggle>
            {myCourses.map((course) => (
              <AccordionItem key={course.id}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold" display="flex" alignItems="center">
                      {course.name}
                      {(course.applicationDetails || []).map((app, idx) => {
                        const badgeColor =
                          app.status === "Approved"
                            ? "green"
                            : app.status === "Rejected"
                            ? "red"
                            : "yellow";
                        return (
                          <Badge key={idx} ml={2} colorScheme={badgeColor}>
                            {app.role}: {app.status}
                          </Badge>
                        );
                      })}
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>

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
                              onClick={() =>
                                openApplyModal(course, app.role)
                              }
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

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
  Tag,
  HStack,
  Tooltip,
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
  const { courses, deleteApplication, reapplyApplication } = useCourses();
  const { user } = useAuth();

  // Candidate's own skills for matching
  const userSkills = useMemo(() => user?.defaultSkills || [], [user?.defaultSkills]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedRole, setSelectedRole] = useState<ApplicationRole | "">("");

  // Update the available courses calculation to only consider active applications
  const availableCourses = useMemo(
    () => courses.filter((c) => {
      // Only consider active applications when determining availability
      const activeRoles = c.applicationDetails
        ?.filter(app => app.status === "Pending" || app.status === "Approved")
        ?.map(app => app.role) || [];
      return activeRoles.length === 0;
    }),
    [courses]
  );

  // Get ALL applications from ALL courses (including withdrawn/rejected)
  const myApps = useMemo(
    () =>
      courses.flatMap((c) =>
        (c.applicationDetails || []).map((app) => ({ course: c, application: app }))
      ),
    [courses]
  );

  // Categorize applications into Active vs Past
  const { activeApplications, pastApplications } = useMemo(() => {
    const active: typeof myApps = [];
    const past: typeof myApps = [];
    
    myApps.forEach(({ course, application }) => {
      // Check withdrawn first
      if (application.isWithdrawn) {
        past.push({ course, application });
      } else if (application.status === "Pending" || application.status === "Approved") {
        active.push({ course, application });
      } else if (application.status === "Rejected") {
        past.push({ course, application });
      }
    });
    
    return { activeApplications: active, pastApplications: past };
  }, [myApps]);

  // Calculate statistics
  const totalApplied = myApps.length;
  const activeCount = activeApplications.length;
  const pastCount = pastApplications.length;
  const approvedCount = activeApplications.filter(({ application }) => application.status === "Approved").length;
  const pendingCount = activeApplications.filter(({ application }) => application.status === "Pending").length;
  const rejectedCount = pastApplications.filter(({ application }) => application.status === "Rejected").length;
  const withdrawnCount = pastApplications.filter(({ application }) => application.isWithdrawn === true).length;

  // FEATURE #2: Save-for-Later (Bookmarks)
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

  // FEATURE #1: Compute "Matching %" & "Missing Skills"
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

  // FEATURE #4: Recommended for You (≥70% match)
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

  // FEATURE #5: Withdraw All Pending
  const handleWithdrawAll = async () => {
    for (const { course } of activeApplications.filter(
      ({ application }) => application.status === "Pending"
    )) {
      await deleteApplication(course.id, "Pending");
    }
  };

  // FEATURE #6: Export My Applications to CSV
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
    document.body.appendChild(link);
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

        {/* FEATURE #4: Recommended */}
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

        {/* FEATURE #2: Saved Courses */}
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

        {/* Available Courses (where you haven't applied yet) */}
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

        {/* Updated Application Statistics */}
        <StatGroup>
          <Stat>
            <StatLabel>Active Applications</StatLabel>
            <StatNumber color="blue.500">{activeCount}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Approved</StatLabel>
            <StatNumber color="green.500">{approvedCount}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Pending</StatLabel>
            <StatNumber color="orange.500">{pendingCount}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Past Applications</StatLabel>
            <StatNumber color="gray.500">{pastCount}</StatNumber>
          </Stat>
        </StatGroup>

        <StatGroup mt={2}>
          <Stat>
            <StatLabel>Rejected</StatLabel>
            <StatNumber color="red.500">{rejectedCount}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Withdrawn</StatLabel>
            <StatNumber color="purple.500">{withdrawnCount}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total Applied</StatLabel>
            <StatNumber>{totalApplied}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel></StatLabel>
            <StatNumber></StatNumber>
          </Stat>
        </StatGroup>

        <HStack spacing={4} mt={4}>
          {pendingCount > 0 && (
            <Button colorScheme="red" onClick={handleWithdrawAll}>
              Withdraw All Pending ({pendingCount})
            </Button>
          )}
          {totalApplied > 0 && (
            <Button
              leftIcon={<FaFileCsv />}
              colorScheme="blue"
              onClick={downloadCSV}
            >
              Download All Applications (CSV)
            </Button>
          )}
        </HStack>

        <Divider />

        {/* MY ACTIVE APPLICATIONS SECTION */}
        <Heading size="md" color="blue.600">My Active Applications</Heading>
        {activeApplications.length === 0 ? (
          <Text color="gray.500">No active applications.</Text>
        ) : (
          <Accordion allowToggle>
            {activeApplications.map(({ course, application }, index) => (
              <AccordionItem key={`active-${course.id}-${application.role}-${index}`}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold" display="flex" alignItems="center">
                      {course.name}
                      <Badge 
                        ml={2} 
                        colorScheme={application.status === "Approved" ? "green" : "yellow"}
                      >
                        {application.role}: {application.status}
                      </Badge>
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>

                <AccordionPanel>
                  <Box p={2} borderWidth="1px" borderRadius="md" borderColor="blue.200" bg="blue.50">
                    <VStack align="start" spacing={2}>
                      <Text><strong>Course:</strong> {course.courseCode}</Text>
                      <Text><strong>Role:</strong> {application.role}</Text>
                      <Text><strong>Availability:</strong> {application.appliedAvailability}</Text>
                      <Text><strong>Skills:</strong> {application.appliedSkills.join(", ")}</Text>
                      <Text><strong>Status:</strong> 
                        <Badge ml={1} colorScheme={application.status === "Approved" ? "green" : "yellow"}>
                          {application.status}
                        </Badge>
                      </Text>
                      {application.lecturerComment && (
                        <Text><strong>Comment:</strong> {application.lecturerComment}</Text>
                      )}
                      
                      <HStack mt={2} spacing={2}>
                        {application.status === "Pending" ? (
                          <Button
                            size="xs"
                            colorScheme="blue"
                            onClick={() => openApplyModal(course, application.role)}
                          >
                            Edit {application.role}
                          </Button>
                        ) : (
                          <Tooltip label="You can only edit pending applications">
                            <Button size="xs" colorScheme="gray" disabled>
                              Edit {application.role}
                            </Button>
                          </Tooltip>
                        )}

                        {application.status === "Pending" && (
                          <Button
                            size="xs"
                            colorScheme="red"
                            leftIcon={<FaTrashAlt />}
                            onClick={() => deleteApplication(course.id, application.status)}
                          >
                            Withdraw {application.role}
                          </Button>
                        )}
                      </HStack>
                    </VStack>
                  </Box>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        <Divider mt={6} />

        {/* MY PAST APPLICATIONS SECTION */}
        <Heading size="md" color="gray.600">My Past Applications</Heading>
        <Text fontSize="sm" color="gray.500" mb={3}>
          Includes withdrawn and rejected applications
        </Text>
        {pastApplications.length === 0 ? (
          <Text color="gray.500">No past applications.</Text>
        ) : (
          <Accordion allowToggle>
            {pastApplications.map(({ course, application }, index) => (
              <AccordionItem key={`past-${course.id}-${application.role}-${index}`}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold" display="flex" alignItems="center">
                      {course.name}
                      <Badge 
                        ml={2} 
                        colorScheme={application.isWithdrawn ? "purple" : (application.status === "Rejected" ? "red" : "gray")}
                        variant="subtle"
                      >
                        {application.role}: {application.isWithdrawn ? `${application.status} (Withdrawn)` : application.status}
                      </Badge>
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>

                <AccordionPanel>
                  <Box p={2} borderWidth="1px" borderRadius="md" borderColor="gray.200" bg="gray.50">
                    <VStack align="start" spacing={2}>
                      <Text><strong>Course:</strong> {course.courseCode}</Text>
                      <Text><strong>Role:</strong> {application.role}</Text>
                      <Text><strong>Availability:</strong> {application.appliedAvailability}</Text>
                      <Text><strong>Skills:</strong> {application.appliedSkills.join(", ")}</Text>
                      <Text><strong>Status:</strong> 
                        <Badge 
                          ml={1} 
                          colorScheme={application.isWithdrawn ? "purple" : (application.status === "Rejected" ? "red" : "gray")}
                          variant="subtle"
                        >
                          {application.isWithdrawn ? `${application.status} (Withdrawn)` : application.status}
                        </Badge>
                      </Text>
                      {application.lecturerComment && (
                        <Text><strong>Comment:</strong> {application.lecturerComment}</Text>
                      )}
                      
                      <HStack mt={2} spacing={2}>
                        {application.isWithdrawn ? (
                          <Button
                            size="xs"
                            colorScheme="green"
                            onClick={async () => {
                              const success = await reapplyApplication(course.id);
                              if (success) {
                                // Optional: Show success toast
                                console.log("Application reactivated successfully");
                              }
                            }}
                          >
                            Reapply
                          </Button>
                        ) : (
                          <Text fontSize="xs" color="gray.500" fontStyle="italic">
                            This application was rejected and cannot be reactivated.
                          </Text>
                        )}
                        
                        <Text fontSize="xs" color="gray.500" fontStyle="italic">
                          {application.isWithdrawn 
                            ? "This application was withdrawn but can be reactivated." 
                            : "This application is no longer active and cannot be modified."}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
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

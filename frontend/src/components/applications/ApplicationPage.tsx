// src/components/applications/ApplicationPage.tsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  Input,
  IconButton,
  ButtonGroup,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaSortAmountDownAlt } from "react-icons/fa";

import { useAuth } from "@/context/AuthContext";
import { useApplications } from "@/context/ApplicationContext";

import { DndContext, closestCenter } from "@dnd-kit/core";

import ApplicationAccordionGroups from "./CourseAccordion/ApplicationAccordionGroups";
import SortDropdown from "./Controls/SortDropdown";
import VisualRepresentation from "./Visuals/VisualRepresentation";

const ApplicationPage: React.FC = () => {
  const { user } = useAuth();
  const {
    courses,
    filteredApplicants,
    searchTerm,
    setSearchTerm,
    availabilityFilter,
    setAvailabilityFilter,
    sortCriteria,
    handleSort,
    isFilteredView,
    handleDragEnd,
  } = useApplications();

  // Track “flat mode” expanded indices so individual toggles work:
  const [expandedIndices, setExpandedIndices] = useState<number[]>([]);

  // Track whether “Expand All” has been clicked:
  const [allExpanded, setAllExpanded] = useState(false);

  // Only re‐compute expandedIndices when allExpanded changes:
  useEffect(() => {
    if (allExpanded) {
      setExpandedIndices(filteredApplicants.map((_, i) => i));
    }
    // Note: We no longer clear expandedIndices on filteredApplicants update.
  }, [allExpanded]);

  // Compute total number of approved applications across all this lecturer’s courses:
  const totalApproved = courses.reduce((sum, course) => {
    return (
      sum +
      (course.applicants || []).filter((app) => app.status === "Approved")
        .length
    );
  }, 0);

  // Color mode values - must be called before any early returns
  const unauthorizedTextColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const containerBg = useColorModeValue("gray.50", "gray.800");
  const headingColor = useColorModeValue("blue.600", "blue.300");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const inputBg = useColorModeValue("white", "gray.700");
  const placeholderColor = useColorModeValue("gray.500", "gray.400");
  const warningBg = useColorModeValue("yellow.100", "yellow.900");
  const warningBorder = useColorModeValue("yellow.300", "yellow.700");
  const warningText = useColorModeValue("yellow.800", "yellow.200");

  // Only lecturers can access this page
  if (!user || !user.isLecturer) {
    return (
      <Text
        textAlign="center"
        color={unauthorizedTextColor}
      >
        You are not authorized to view this page.
      </Text>
    );
  }

  const handleExpandAll = () => {
    setAllExpanded(true);
  };
  const handleCollapseAll = () => {
    setAllExpanded(false);
    setExpandedIndices([]);
  };

  return (
    <Container
      maxW="container.lg"
      py={8}
      bg={containerBg}
      borderRadius="lg"
      shadow="lg"
    >
      {/* Page heading */}
      <Heading
        as="h2"
        size="xl"
        mb={6}
        textAlign="center"
        color={headingColor}
      >
        Applications
      </Heading>

      {/* Instructional text */}
      <Text textAlign="center" mb={4} color={textColor} fontSize="md">
        Drag applicants to rank them by <strong>preference</strong> for each
        course.
      </Text>

      {/* Search + Sort controls */}
      <Flex mb={4} justify="center" align="center" gap={2} wrap="wrap">
        <Input
          placeholder="Search by name, skills, or course"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          width="60%"
          bg={inputBg}
          _placeholder={{ color: placeholderColor }}
        />
        <SortDropdown onSort={handleSort} />
        <IconButton
          aria-label="Sort"
          icon={<FaSortAmountDownAlt />}
          onClick={() => handleSort(sortCriteria)}
          colorScheme="teal"
          size="lg"
        />
      </Flex>

      {/* Availability toggle buttons + Expand/Collapse All */}
      <Flex justify="center" mb={6} wrap="wrap" gap={2}>
        <ButtonGroup isAttached variant="outline">
          {["all", "full-time", "part-time"].map((option) => (
            <Button
              key={option}
              onClick={() =>
                setAvailabilityFilter(
                  option as "all" | "full-time" | "part-time"
                )
              }
              colorScheme={availabilityFilter === option ? "blue" : "gray"}
            >
              {option.replace("-", " ").toUpperCase()}
            </Button>
          ))}
        </ButtonGroup>

        <ButtonGroup ml={4} isAttached variant="outline">
          <Button
            onClick={handleExpandAll}
            colorScheme={allExpanded ? "blue" : "gray"}
          >
            Expand All
          </Button>
          <Button
            onClick={handleCollapseAll}
            colorScheme={!allExpanded ? "blue" : "gray"}
          >
            Collapse All
          </Button>
        </ButtonGroup>
      </Flex>

      {/* Total approved applications */}
      <Text textAlign="center" mb={4} color={textColor}>
        Total Approved: <strong>{totalApproved}</strong>
      </Text>

      {/* Download CSV of current rankings + chart data */}
      <Button
        mb={6}
        colorScheme="teal"
        onClick={() => {
          // 1) BUILD ROWS FOR EACH COURSE’S APPLICANTS
          // Columns: Course Code, Applicant Name, Role, Availability, Status, Skills, Rank
          let csv =
            "Course Code,Applicant Name,Role,Availability,Status,Skills,Rank\n";
          courses.forEach((course) => {
            course.applicants.forEach((app, idx) => {
              const safeName = app.name.replace(/,/g, ""); // strip commas
              const role = app.role;
              const avail = app.appliedAvailability;
              const status = app.status;
              // Join multiple skills with “|” (so inner commas don’t break CSV)
              const skillList = (app.appliedSkills || []).join("|");
              const rank = idx + 1;
              csv += `${course.courseCode},${safeName},${role},${avail},${status},${skillList},${rank}\n`;
            });
          });

          // 2) APPEND A BLANK LINE, THEN “TOP SKILLS” DATA
          csv += `\nSkill,Count\n`;
          // Build skillMap across all *approved* applications:
          const skillMap: Record<string, number> = {};
          courses.forEach((course) => {
            (course.applicants || [])
              .filter((a) => a.status === "Approved")
              .forEach((a) => {
                (a.appliedSkills || []).forEach((skill) => {
                  skillMap[skill] = (skillMap[skill] || 0) + 1;
                });
              });
          });
          Object.entries(skillMap).forEach(([skillName, count]) => {
            const safeSkill = skillName.replace(/,/g, "");
            csv += `${safeSkill},${count}\n`;
          });

          // 3) APPEND A BLANK LINE, THEN “AVAILABILITY” DATA
          csv += `\nAvailability,Count\n`;
          // Build availabilityMap across all *approved* applications:
          const availabilityMap: Record<string, number> = {};
          courses.forEach((course) => {
            (course.applicants || [])
              .filter((a) => a.status === "Approved")
              .forEach((a) => {
                const av = a.appliedAvailability; // “Full-Time” or “Part-Time”
                availabilityMap[av] = (availabilityMap[av] || 0) + 1;
              });
          });
          Object.entries(availabilityMap).forEach(([av, count]) => {
            csv += `${av},${count}\n`;
          });

          // 4) TRIGGER DOWNLOAD
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "rankings_and_charts_data.csv";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
      >
        Download Rankings & Chart Data CSV
      </Button>

      {/* Warning banner when in a filtered state */}
      {isFilteredView && (
        <Box
          mb={6}
          p={3}
          bg={warningBg}
          border="1px solid"
          borderColor={warningBorder}
          borderRadius="md"
        >
          <Text textAlign="center" color={warningText} fontWeight="medium">
            You are in a filtered view. Drag-and-drop ranking is temporarily
            disabled.
          </Text>
        </Box>
      )}

      {/* Course accordions with optional drag context */}
      {!isFilteredView ? (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <ApplicationAccordionGroups
            expandedIndices={expandedIndices}
            setExpandedIndices={setExpandedIndices}
            allExpanded={allExpanded}
          />
        </DndContext>
      ) : (
        <ApplicationAccordionGroups
          expandedIndices={expandedIndices}
          setExpandedIndices={setExpandedIndices}
          allExpanded={allExpanded}
        />
      )}

      {/* Visual summary */}
      <Box mt={12}>
        <VisualRepresentation />
      </Box>
    </Container>
  );
};

export default ApplicationPage;

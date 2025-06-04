// src/components/applications/ApplicationPage.tsx

import React from "react";
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
} from "@chakra-ui/react";
import { FaSortAmountDownAlt } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { useSelectedApplicants } from "@/context/SelectedApplicantsContext";
import { useApplicationContext } from "@/context/ApplicationContext";
import { DndContext, closestCenter } from "@dnd-kit/core";

import ApplicationAccordionGroups from "./CourseAccordion/ApplicationAccordionGroups";
import SortDropdown from "./Controls/SortDropdown";
import VisualRepresentation from "./Visuals/VisualRepresentation";

const ApplicationPage: React.FC = () => {
  const { user } = useAuth();
  const { selectedApplicants } = useSelectedApplicants();

  // Application state from context
  const {
    searchTerm,
    setSearchTerm,
    availabilityFilter,
    setAvailabilityFilter,
    sortCriteria,
    handleSort,
    isFilteredView,
    handleDragEnd,
  } = useApplicationContext();

  // Only lecturers can access this page
  if (!user || !user.isLecturer) {
    return <Text textAlign="center">You are not authorized to view this page.</Text>;
  }

  return (
    <Container maxW="container.lg" py={8} bg="gray.50" borderRadius="lg" shadow="lg">
      {/* Page heading */}
      <Heading as="h2" size="xl" mb={6} textAlign="center" color="blue.600">
        Applications
      </Heading>

      {/* Instructional text */}
      <Text textAlign="center" mb={4} color="gray.600" fontSize="md">
        Drag applicants to rank them by <strong>preference</strong> for each course.
      </Text>

      {/* Search + Sort controls */}
      <Flex mb={4} justify="center" align="center" gap={2} wrap="wrap">
        <Input
          placeholder="Search by name, course, or skills"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          width="60%"
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

      {/* Availability toggle buttons */}
      <Flex justify="center" mb={6}>
        <ButtonGroup isAttached variant="outline">
          {["all", "full-time", "part-time"].map((option) => (
            <Button
              key={option}
              onClick={() => setAvailabilityFilter(option as "all" | "full-time" | "part-time")}
              colorScheme={availabilityFilter === option ? "blue" : "gray"}
            >
              {option.replace("-", " ").toUpperCase()}
            </Button>
          ))}
        </ButtonGroup>
      </Flex>

      {/* Selected applicants total */}
      <Text textAlign="center" mb={4} color="gray.600">
        Total Selected: <strong>{Object.values(selectedApplicants).flat().length}</strong>
      </Text>

      {/* Warning banner when in a filtered state */}
      {isFilteredView && (
        <Box
          mb={6}
          p={3}
          bg="yellow.100"
          border="1px solid"
          borderColor="yellow.300"
          borderRadius="md"
        >
          <Text textAlign="center" color="yellow.800" fontWeight="medium">
            You are in a filtered view. Drag-and-drop ranking is temporarily disabled.
          </Text>
        </Box>
      )}

      {/* Course accordions with optional drag context */}
      {!isFilteredView ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <ApplicationAccordionGroups />
        </DndContext>
      ) : (
        <ApplicationAccordionGroups />
      )}

      {/* Visual summary */}
      <Box mt={12}>
        <VisualRepresentation />
      </Box>
    </Container>
  );
};

export default ApplicationPage;

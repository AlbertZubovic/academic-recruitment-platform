// src/components/candidates/candidateFormSections/ApplicationDetailsForm.tsx

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Select,
  Input,
  useToast,
  VStack,
  Tag,
  Wrap,
  HStack,
} from "@chakra-ui/react";
import { useCourses } from "@/context/CourseContext";
import { useAuth } from "@/context/AuthContext";
import { Course } from "@/types/course";

// Import both enums (ApplicationRole, ApplicationAvailability, and UserAvailability)
import {
  ApplicationRole,
  ApplicationAvailability,
  UserAvailability,
} from "@/types/enums";

/**
 * Helper: convert a UserAvailability into ApplicationAvailability.
 * If `ua` is null/undefined or not recognized, default to FULL_TIME.
 */
function mapUserToApplicationAvailability(
  ua: UserAvailability | null | undefined
): ApplicationAvailability {
  switch (ua) {
    case UserAvailability.FULL_TIME:
      return ApplicationAvailability.FULL_TIME;
    case UserAvailability.PART_TIME:
      return ApplicationAvailability.PART_TIME;
    default:
      return ApplicationAvailability.FULL_TIME;
  }
}

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  defaultRole?: ApplicationRole;
}

const ApplicationDetailsForm: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  course,
  defaultRole,
}) => {
  const { applyToCourse, updateApplicationDetails } = useCourses();
  const { user } = useAuth();
  const toast = useToast();

  // 1. If an existing application for defaultRole exists, capture it
  const existingAppForRole = (course.applicationDetails || []).find(
    (app) => app.role === defaultRole
  );

  // 2. Choose which role to pre‐select
  const firstAllowedRole: ApplicationRole = course.rolesAvailable[0];
  const initialRole: ApplicationRole =
    defaultRole && course.rolesAvailable.includes(defaultRole)
      ? defaultRole
      : firstAllowedRole;

  // 3. Choose default availability (either the existing app’s availability, or the user’s defaultAvailability)
  const initialAvailability: ApplicationAvailability = existingAppForRole
    ? existingAppForRole.appliedAvailability
    : mapUserToApplicationAvailability(user?.defaultAvailability);

  // 4. Default skills: either the existing app’s appliedSkills, or the user’s defaultSkills
  const initialSkills: string[] =
    existingAppForRole?.appliedSkills ?? user?.defaultSkills ?? [];

  // Local state
  const [role, setRole] = useState<ApplicationRole>(initialRole);
  const [availability, setAvailability] = useState<ApplicationAvailability>(
    initialAvailability
  );
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [newSkill, setNewSkill] = useState("");

  // Whenever the modal re‐opens, reset fields:
  useEffect(() => {
    if (!isOpen) return;

    // Re‐compute chosenRole & chosenApp each time
    const chosenRole: ApplicationRole =
      defaultRole && course.rolesAvailable.includes(defaultRole)
        ? (defaultRole as ApplicationRole)
        : (course.rolesAvailable[0] as ApplicationRole);

    const chosenApp = (course.applicationDetails || []).find(
      (app) => app.role === chosenRole
    );

    setRole(chosenRole);
    setAvailability(
      chosenApp
        ? chosenApp.appliedAvailability
        : mapUserToApplicationAvailability(user?.defaultAvailability)
    );
    setSkills(chosenApp ? chosenApp.appliedSkills : user?.defaultSkills ?? []);
    setNewSkill("");
  }, [isOpen, defaultRole, course.applicationDetails, course.rolesAvailable, user]);

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async () => {
    // Require at least one skill, a role, and availability
    if (!role || !availability || skills.length === 0) {
      toast({
        title:
          "Please pick a role, availability, and add at least one skill.",
        status: "warning",
        isClosable: true,
      });
      return;
    }

    // Determine if we are editing an existing application (PATCH) or creating a new one (POST)
    const isEditing = Boolean(
      existingAppForRole && existingAppForRole.role === role
    );

    if (isEditing) {
      // PATCH to /api/candidates/courses/:id/applications/me
      const patchPayload = {
        appliedAvailability: availability,
        appliedSkills: skills,
      };
      console.log(
        `[ApplicationDetailsForm] PATCH editing existing app for course ${course.id}, role ${role}:`,
        patchPayload
      );
      const success = await updateApplicationDetails(
        course.id,
        role,
        patchPayload
      );
      if (success) {
        toast({
          title: `Updated application as ${role}!`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
      } else {
        toast({
          title: "Failed to update application",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      // POST to /api/candidates/courses/:id/apply
      const newPayload = {
        role,
        appliedAvailability: availability,
        appliedSkills: skills,
      };
      console.log(
        `[ApplicationDetailsForm] POST new application for course ${course.id}, role ${role}:`,
        newPayload
      );
      const success = await applyToCourse(course.id, newPayload);
      if (success) {
        toast({
          title: `Applied as ${role}!`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
      } else {
        toast({
          title: "Error submitting application",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {existingAppForRole
            ? `Edit Application (as ${role})`
            : `Apply for ${course.name}: ${role}`}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* ── Role Selector ── */}
            <FormControl isRequired>
              <FormLabel>Role</FormLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as ApplicationRole)}
              >
                {course.rolesAvailable.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* ── Availability Selector ── */}
            <FormControl isRequired>
              <FormLabel>Availability</FormLabel>
              <Select
                value={availability}
                onChange={(e) =>
                  setAvailability(e.target.value as ApplicationAvailability)
                }
              >
                <option value={ApplicationAvailability.FULL_TIME}>
                  Full-Time
                </option>
                <option value={ApplicationAvailability.PART_TIME}>
                  Part-Time
                </option>
              </Select>
            </FormControl>

            {/* ── Skills Input ── */}
            <FormControl>
              <FormLabel>Add Skills</FormLabel>
              <Input
                placeholder="Type a skill, then press Enter or click Add"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Wrap mt={2} spacing={2}>
                {skills.map((skill, i) => (
                  <Tag
                    key={i}
                    size="md"
                    colorScheme="blue"
                    borderRadius="full"
                  >
                    <HStack spacing={1} align="center">
                      <span>{skill}</span>
                      <Button
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleRemoveSkill(skill)}
                      >
                        ×
                      </Button>
                    </HStack>
                  </Tag>
                ))}
              </Wrap>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="green" mr={3} onClick={handleSubmit}>
            {existingAppForRole ? "Update" : "Submit Application"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ApplicationDetailsForm;

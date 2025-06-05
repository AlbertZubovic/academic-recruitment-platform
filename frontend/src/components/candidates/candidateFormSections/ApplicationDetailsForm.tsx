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

// Import both enums:
import {
  ApplicationRole,
  ApplicationAvailability,
} from "@/types/enums";
import { UserAvailability } from "@/types/enums";

/**
 * Helper: convert a UserAvailability into the matching ApplicationAvailability.
 * If `ua` is null or not recognized, defaults to FULL_TIME.
 */
function mapUserToApplicationAvailability(
  ua: UserAvailability | null
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
  isEdit?: boolean;

  /** NEW: defaultRole tells the form which role to pre‐select */
  defaultRole?: ApplicationRole;
}

const ApplicationDetailsForm: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  course,
  isEdit = false,
  defaultRole,
}) => {
  const { applyToCourse, updateApplicationDetails } = useCourses();
  const { user } = useAuth();
  const toast = useToast();

  // Find if there’s an existing application object for defaultRole
  const existingAppForRole = (course.applicationDetails || []).find(
    (app) => app.role === defaultRole
  );

  // Determine which role to pre‐select (fall back to the first available)
  const firstAllowedRole: ApplicationRole = course.rolesAvailable[0];
  const initialRole: ApplicationRole =
    defaultRole && course.rolesAvailable.includes(defaultRole)
      ? defaultRole
      : firstAllowedRole;

  // Determine default availability:
  //   • If editing and existingAppForRole exists, use that.
  //   • Else, convert user.defaultAvailability → ApplicationAvailability.
  const initialAvailability: ApplicationAvailability = existingAppForRole
    ? existingAppForRole.appliedAvailability
    : mapUserToApplicationAvailability(user?.defaultAvailability ?? null);

  // Default skills come from either the existing application or the user’s default
  const initialSkills: string[] =
    existingAppForRole?.appliedSkills ?? user?.defaultSkills ?? [];

  // Local state (typed exactly as the enum types, not plain strings)
  const [role, setRole] = useState<ApplicationRole>(initialRole);
  const [availability, setAvailability] = useState<ApplicationAvailability>(
    initialAvailability
  );
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [newSkill, setNewSkill] = useState("");

  // Whenever the modal opens or defaultRole changes, reset fields:
  useEffect(() => {
    if (!isOpen) return;

    const chosenRole: ApplicationRole =
      defaultRole && course.rolesAvailable.includes(defaultRole)
        ? defaultRole
        : course.rolesAvailable[0];

    const chosenApp = (course.applicationDetails || []).find(
      (app) => app.role === chosenRole
    );

    setRole(chosenRole);
    setAvailability(
      chosenApp
        ? chosenApp.appliedAvailability
        : mapUserToApplicationAvailability(user?.defaultAvailability ?? null)
    );
    setSkills(chosenApp ? chosenApp.appliedSkills : user?.defaultSkills ?? []);
  }, [
    isOpen,
    defaultRole,
    course.applicationDetails,
    user,
    course.rolesAvailable,
  ]);

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
    // Ensure role, availability, and ≥1 skill are chosen
    if (!role || !availability || skills.length === 0) {
      toast({
        title:
          "Please select a role, availability, and add at least one skill.",
        status: "warning",
        isClosable: true,
      });
      return;
    }

    let success = false;
    if (isEdit && existingAppForRole) {
      // Update the existing application for this role
      success = await updateApplicationDetails(course.id, {
        role: role,
        appliedAvailability: availability,
        appliedSkills: skills,
      });
    } else {
      // New application
      success = await applyToCourse(course.id, {
        role: role,
        appliedAvailability: availability,
        appliedSkills: skills,
      });
    }

    if (success) {
      toast({
        title: isEdit
          ? `Updated application as ${role}!`
          : `Applied as ${role}!`,
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
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isEdit
            ? `Edit Application (as ${role})`
            : `Apply for ${course.name}: ${role}`}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* ─────────────── Role Selector ─────────────── */}
            <FormControl isRequired>
              <FormLabel>Role</FormLabel>
              <Select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as ApplicationRole)
                }
              >
                {course.rolesAvailable.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* ───────────── Availability Selector ───────────── */}
            <FormControl isRequired>
              <FormLabel>Availability</FormLabel>
              <Select
                value={availability}
                onChange={(e) =>
                  setAvailability(
                    e.target.value as ApplicationAvailability
                  )
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

            {/* ──────────────── Skills Input ──────────────── */}
            <FormControl>
              <FormLabel>Add Skills</FormLabel>
              <Input
                placeholder="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), handleAddSkill())
                }
              />
              <Wrap mt={2} spacing={2}>
                {skills.map((skill, i) => (
                  <Tag
                    key={i}
                    size="md"
                    colorScheme="blue"
                    borderRadius="full"
                  >
                    <HStack spacing={1}>
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
            {isEdit ? "Update" : "Submit Application"}
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

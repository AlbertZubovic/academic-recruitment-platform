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
}

const ApplicationDetailsForm: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  course,
  isEdit = false,
}) => {
  const { applyToCourse, updateApplicationDetails } = useCourses();
  const { user } = useAuth();
  const toast = useToast();

  // If editing, grab the existing application details:
  const existingApplication = (course as any).application;

  // Determine default “role” (use the first available role if nothing else):
  const defaultRole: ApplicationRole =
    (existingApplication?.role as ApplicationRole) ||
    (course.rolesAvailable[0] as ApplicationRole);

  // Determine default “availability”:
  //   • If editing and existingApplication.appliedAvailability exists, use that.
  //   • Else, convert user.defaultAvailability (UserAvailability) → ApplicationAvailability.
  const defaultAvailability: ApplicationAvailability = existingApplication
    ? (existingApplication.appliedAvailability as ApplicationAvailability)
    : mapUserToApplicationAvailability(user?.defaultAvailability ?? null);

  // Default skills come from either the existing application or the user’s default
  const defaultSkills: string[] =
    existingApplication?.appliedSkills ?? user?.defaultSkills ?? [];

  // Local state (typed exactly as the enum types, not as plain strings)
  const [role, setRole] = useState<ApplicationRole>(defaultRole);
  const [availability, setAvailability] = useState<ApplicationAvailability>(
    defaultAvailability
  );
  const [skills, setSkills] = useState<string[]>(defaultSkills);
  const [newSkill, setNewSkill] = useState("");

  // Whenever the modal opens (or if editing status changes), reset fields:
  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && existingApplication) {
      // Populate from existing application
      setRole(existingApplication.role as ApplicationRole);
      setAvailability(
        existingApplication.appliedAvailability as ApplicationAvailability
      );
      setSkills(existingApplication.appliedSkills ?? []);
    } else {
      // New application: use the first available role + user's default availability
      setRole(course.rolesAvailable[0] as ApplicationRole);
      setAvailability(
        mapUserToApplicationAvailability(user?.defaultAvailability ?? null)
      );
      setSkills(user?.defaultSkills ?? []);
    }
  }, [isOpen, isEdit, existingApplication, user, course.rolesAvailable]);

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
    // Ensure role, availability, and at least one skill are chosen:
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
    if (isEdit) {
      success = await updateApplicationDetails(course.id, {
        appliedAvailability: availability,
        appliedSkills: skills,
      });
    } else {
      success = await applyToCourse(course.id, {
        role: role,
        appliedAvailability: availability,
        appliedSkills: skills,
      });
    }

    if (success) {
      toast({
        title: isEdit ? "Application updated!" : "Application submitted!",
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
          {isEdit ? "Edit Application" : `Apply for ${course.name}`}
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
                    e.target
                      .value as ApplicationAvailability
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

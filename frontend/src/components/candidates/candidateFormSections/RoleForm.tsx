// src/components/candidates/candidateFormSections/RoleForm.tsx

import React, { useState } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Wrap,
  WrapItem,
  Tag,
  Box,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { Candidate } from "@/types/candidate";
import { PastRole } from "@/types/PastRole";
import { PastRoleType } from "@/types/enums";

interface RoleFormProps {
  candidateDetails: Partial<Candidate>;
  setCandidateDetails: React.Dispatch<React.SetStateAction<Partial<Candidate>>>;
  setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
  saveToBackend: (showToastMessage?: boolean) => Promise<boolean>;
}

const RoleForm: React.FC<RoleFormProps> = ({
  candidateDetails,
  setCandidateDetails,
  setHasChanges,
}) => {
  const [newRole, setNewRole] = useState({
    courseName: "",
    courseCode: "",
    role: "",
    semester: "",
  });
  const toast = useToast();

  const isAlphaOnly = (value: string) => /^[A-Za-z ]+$/.test(value);
  const isValidSemester = (value: string) =>
    /^(Autumn|Spring|Summer|Winter) \d{4}$/.test(value);
  const isValidCourseCode = (code: string) => /^[A-Z]{4}\d{4}$/.test(code);
  const toTitleCase = (str: string) =>
    str.replace(
      /\w\S*/g,
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );

  const handleAddRole = () => {
    const { courseName, courseCode, role, semester } = newRole;
    if (!courseName || !courseCode || !role || !semester) {
      toast({
        title: "Please fill out all role fields",
        status: "warning",
        isClosable: true,
      });
      return;
    }
    if (!isAlphaOnly(courseName) || !isAlphaOnly(role)) {
      toast({
        title: "Fields must only contain letters and spaces.",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (!isValidSemester(semester)) {
      toast({
        title: "Invalid Semester Format",
        description: "Expected: Spring 2024",
        status: "error",
        isClosable: true,
      });
      return;
    }
    if (!isValidCourseCode(courseCode)) {
      toast({
        title: "Invalid Course Code",
        description: "Expected format: COSC1234",
        status: "error",
        isClosable: true,
      });
      return;
    }

    const newPastRole: PastRole = {
      courseName: toTitleCase(courseName),
      courseCode,
      role: toTitleCase(role) as PastRoleType,
      semester,
    };

    setCandidateDetails((prev) => ({
      ...prev,
      pastRoles: [...(prev.pastRoles || []), newPastRole],
    }));
    setHasChanges(true);
    setNewRole({ courseName: "", courseCode: "", role: "", semester: "" });
    toast({
      title: "Role Added",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleRemoveRole = (index: number) => {
    setCandidateDetails((prev) => {
      const updated = [...(prev.pastRoles || [])];
      updated.splice(index, 1);
      return { ...prev, pastRoles: updated };
    });
    setHasChanges(true);
    toast({
      title: "Role Removed",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRole((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <FormControl>
      <FormLabel>Previous Roles</FormLabel>
      <VStack spacing={3} align="stretch">
        <Input
          name="courseName"
          placeholder="Course Name"
          value={newRole.courseName}
          onChange={handleChange}
        />
        <Input
          name="courseCode"
          placeholder="Course Code (e.g. COSC1234)"
          value={newRole.courseCode}
          onChange={handleChange}
        />
        <Input
          name="role"
          placeholder="Role (e.g. Tutor)"
          value={newRole.role}
          onChange={handleChange}
        />
        <Input
          name="semester"
          placeholder="Semester (e.g. Spring 2024)"
          value={newRole.semester}
          onChange={handleChange}
        />
        <Button onClick={handleAddRole} colorScheme="teal">
          Add Role
        </Button>
        <Wrap mt={4}>
          {candidateDetails.pastRoles?.map((r, i) => (
            <WrapItem key={i}>
              <Tag colorScheme="cyan" borderRadius="full">
                {r.courseCode} - {r.role}
                <Box
                  as="span"
                  ml={2}
                  fontWeight="bold"
                  cursor="pointer"
                  onClick={() => handleRemoveRole(i)}
                >
                  ✕
                </Box>
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
      </VStack>
    </FormControl>
  );
};

export default RoleForm;

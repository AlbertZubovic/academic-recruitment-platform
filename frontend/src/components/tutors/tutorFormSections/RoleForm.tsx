// src/components/tutors/TutorFormSections/RoleForm.tsx

/**
 * RoleForm Component
 * A form section within the tutor profile page that allows users
 * to enter and manage their previous teaching roles.
 *
 * It validates input fields and allows adding/removing of teaching roles,
 * storing them in the shared tutorDetails state.
 */

import React, { useState } from 'react';
import {
  FormControl, FormLabel, Input, Button, Wrap,
  WrapItem, Tag, Box, VStack, useToast
} from '@chakra-ui/react';
import { Tutor } from '@/types/tutor';
import { PastRole } from '@/types/pastRoles';

interface Props {
  tutorDetails: Partial<Tutor>;
  setTutorDetails: React.Dispatch<React.SetStateAction<Partial<Tutor>>>;
}

const RoleForm: React.FC<Props> = ({ tutorDetails, setTutorDetails }) => {
  const [newRole, setNewRole] = useState({ courseName: '', courseCode: '', role: '', semester: '' });
  const toast = useToast();

  // VALIDATION UTILITIES

  /**
   * isAlphaOnly
   * Ensures that input contains only alphabetic characters and spaces.
   * Used for course name and role title to avoid numeric/symbolic entries.
   */
  const isAlphaOnly = (value: string) => /^[A-Za-z ]+$/.test(value);

  /**
   * isValidSemester
   * Validates that the semester string follows the format: "Spring 2024", "Autumn 2025", etc.
   * Helps standardize semester input and prevents inconsistent naming.
   */
  const isValidSemester = (value: string) =>
    /^(Autumn|Spring|Summer|Winter) \d{4}$/.test(value);

  /**
   * isValidCourseCode
   * Validates course code format as four capital letters followed by four digits.
   * Example: COSC1234
   */
  const isValidCourseCode = (code: string) =>
    /^[A-Z]{4}\d{4}$/.test(code);

  /**
   * toTitleCase
   * Converts strings like "tutor" or "data science" to "Tutor" or "Data Science"
   * Ensures consistent formatting for role titles and course names.
   */
  const toTitleCase = (str: string) =>
    str.replace(/\w\S*/g, word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

  // EVENT HANDLERS

  const handleAddRole = () => {
    const { courseName, courseCode, role, semester } = newRole;

    // Check all fields are filled
    if (!courseName || !courseCode || !role || !semester) {
      toast({ title: 'Please fill out all role fields', status: 'warning', isClosable: true });
      return;
    }

    // Prevent numbers/symbols in courseName and role
    if (!isAlphaOnly(courseName) || !isAlphaOnly(role)) {
      toast({ title: 'Fields must only contain letters and spaces.', status: 'error', isClosable: true });
      return;
    }

    // Enforce proper semester naming
    if (!isValidSemester(semester)) {
      toast({
        title: 'Invalid Semester Format',
        description: 'Expected: Spring 2024',
        status: 'error',
        isClosable: true
      });
      return;
    }

    // Enforce COSC1234-style course code
    if (!isValidCourseCode(courseCode)) {
      toast({
        title: 'Invalid Course Code',
        description: 'Expected format: COSC1234',
        status: 'error',
        isClosable: true
      });
      return;
    }

    // Build and add the role to state
    const newPastRole: PastRole = {
      courseName: toTitleCase(courseName),
      courseCode,
      role: toTitleCase(role) as 'Tutor' | 'Lab Assistant',
      semester,
    };

    setTutorDetails(prev => ({
      ...prev,
      pastRoles: [...(prev.pastRoles || []), newPastRole]
    }));

    setNewRole({ courseName: '', courseCode: '', role: '', semester: '' });

    toast({ title: 'Role Added', status: 'success', duration: 2000, isClosable: true });
  };

  // Handler to remove a selected role from the list
  const handleRemoveRole = (index: number) => {
    setTutorDetails(prev => {
      const updated = [...(prev.pastRoles || [])];
      updated.splice(index, 1);
      return { ...prev, pastRoles: updated };
    });

    toast({ title: 'Role Removed', status: 'info', duration: 2000, isClosable: true });
  };

  // Updates local form state as inputs change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRole(prev => ({ ...prev, [name]: value }));
  };

    return (
    <FormControl>
      <FormLabel>Previous Roles</FormLabel>
      <VStack spacing={3} align="stretch">
        {/* Input fields for each role property */}
        <Input name="courseName" placeholder="Course Name" value={newRole.courseName} onChange={handleChange} />
        <Input name="courseCode" placeholder="Course Code (e.g. COSC1234)" value={newRole.courseCode} onChange={handleChange} />
        <Input name="role" placeholder="Role (e.g. Tutor)" value={newRole.role} onChange={handleChange} />
        <Input name="semester" placeholder="Semester (e.g. Spring 2024)" value={newRole.semester} onChange={handleChange} />

        {/* Button to add role */}
        <Button onClick={handleAddRole} colorScheme="teal">
          Add Role
        </Button>

        {/* Display added roles */}
        <Wrap mt={4}>
          {tutorDetails.pastRoles?.map((r, i) => (
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
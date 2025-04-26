// Example: src\components\tutors\tutorFormSections\ApplicationDetailsForm.tsx

import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, FormControl, FormLabel, Input, Select, Stack, Tag, TagLabel, TagCloseButton, Box, Text, useToast
} from '@chakra-ui/react';
import { useAuth } from '@/context/AuthContext';
import { useCourse } from '@/context/CourseContext';
import { Course } from '@/types/course';
import { Applicant } from '@/types/applicant'; // Import the new type

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course; // The course being applied to
}

const ApplyModal: React.FC<ApplyModalProps> = ({ isOpen, onClose, course }) => {
  const { user } = useAuth(); 
  const { courses, updateCourseData } = useCourse();
  const toast = useToast();

  // State to hold the application-specific details, initialized with user defaults
  const [appliedSkills, setAppliedSkills] = useState<string[]>([]);
  const [appliedAvailability, setAppliedAvailability] = useState<string>('');
  const [newSkill, setNewSkill] = useState(''); // For adding new skills

  // Load default values from user profile when modal opens or user changes
  useEffect(() => {
    if (user && isOpen) {
      setAppliedSkills(user.skills || []);
      setAppliedAvailability(user.availability || '');
    }
    // Reset form if modal closes or user logs out
    if (!isOpen || !user) {
        setAppliedSkills([]);
        setAppliedAvailability('');
        setNewSkill('');
    }
  }, [user, isOpen]);

  const handleSkillAdd = () => {
    if (newSkill && !appliedSkills.includes(newSkill.trim())) {
      setAppliedSkills([...appliedSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setAppliedSkills(appliedSkills.filter(skill => skill !== skillToRemove));
  };

  const handleApplySubmit = () => {
    if (!user || !user.isTutor) {
      toast({ title: "Error", description: "You must be logged in as a tutor.", status: "error", duration: 3000, isClosable: true });
      return;
    }

    // --- Check if already applied ---
    const targetCourse = courses.find(c => c.id === course.id);
    if (!targetCourse) {
        toast({ title: "Error", description: "Course not found.", status: "error", duration: 3000, isClosable: true });
        return; // Should not happen if course prop is valid
    }

    const existingApplication = targetCourse.applicants.find(app => String(app.userId) === String(user.id));
    if (existingApplication) {
        toast({ title: "Already Applied", description: "You have already applied to this course.", status: "info", duration: 3000, isClosable: true });
        onClose(); // Close the modal
        return;
    }

    // --- Create the ApplicantDetails object ---
    const applicationDetails: Applicant = {
      userId: String(user.id), // Ensure ID is string if needed
      appliedSkills: appliedSkills,
      appliedAvailability: appliedAvailability,
    };

    // --- Update Course Data ---
    const updatedCourses = courses.map(c =>
      c.id === course.id
        ? { ...c, applicants: [...c.applicants, applicationDetails] } // Add the object
        : c
    );
    updateCourseData(updatedCourses); // This updates CourseContext state and localStorage



    toast({ title: "Application Submitted", description: `Successfully applied to ${course.name}`, status: "success", duration: 3000, isClosable: true });
    onClose(); // Close the modal
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Apply for Tutor Position: {course?.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Text mb={4}>Review and update your details for this specific application.</Text>
          <FormControl mb={4}>
            <FormLabel>Availability for this Course</FormLabel>
            <Select
              placeholder="Select availability"
              value={appliedAvailability}
              onChange={(e) => setAppliedAvailability(e.target.value)}
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              {/* Add other options if applicable */}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Skills for this Course</FormLabel>
            <Box border="1px" borderColor="gray.200" borderRadius="md" p={2} minH="50px" mb={2}>
               {appliedSkills.length === 0 && <Text color="gray.500">No skills added yet.</Text>}
               {appliedSkills.map(skill => (
                 <Tag size="md" key={skill} borderRadius="full" variant="solid" colorScheme="blue" m="1">
                   <TagLabel>{skill}</TagLabel>
                   <TagCloseButton onClick={() => handleSkillRemove(skill)} />
                 </Tag>
               ))}
            </Box>
            <Stack direction="row">
                 <Input
                    placeholder="Add a skill (e.g., Python)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') { handleSkillAdd(); e.preventDefault(); } }}
                 />
                 <Button onClick={handleSkillAdd}>Add</Button>
            </Stack>
            <Text fontSize="xs" color="gray.500" mt={1}>Press Enter or click Add.</Text>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleApplySubmit}>
            Submit Application
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ApplyModal;

import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { useCourse } from '@/context/CourseContext';
import { useAuth } from '@/context/AuthContext';
import { Course } from '@/types/course';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
}

const ApplicationDetailsForm: React.FC<ApplyModalProps> = ({ isOpen, onClose, course }) => {
  const { user } = useAuth();
  const { updateApplicationDetails } = useCourse();
  const toast = useToast();

  const [availability, setAvailability] = useState<string>('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async () => {
    if (!availability) {
      toast({ title: 'Select availability', status: 'warning', isClosable: true });
      return;
    }

  const success = await updateApplicationDetails(course.id, {
    appliedSkills: skills,
    appliedAvailability: availability,
  });


    if (success) {
      toast({ title: 'Application submitted!', status: 'success', duration: 3000, isClosable: true });
      onClose();
    } else {
      toast({ title: 'Error submitting application', status: 'error', duration: 3000, isClosable: true });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Apply for {course.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Availability</FormLabel>
              <Select placeholder="Select availability" value={availability} onChange={(e) => setAvailability(e.target.value)}>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Add Skills</FormLabel>
              <Input
                placeholder="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              />
              <Wrap mt={2}>
                {skills.map((skill, i) => (
                  <Tag key={i} size="md" colorScheme="blue" borderRadius="full" cursor="pointer" onClick={() => handleRemoveSkill(skill)}>
                    {skill}
                  </Tag>
                ))}
              </Wrap>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="green" mr={3} onClick={handleSubmit}>Submit Application</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ApplicationDetailsForm;

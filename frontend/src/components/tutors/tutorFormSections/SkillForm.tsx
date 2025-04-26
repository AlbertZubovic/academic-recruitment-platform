// src/components/tutors/TutorFormSections/SkillForm.tsx

/**
 * SkillForm Component
 * Allows tutors to add and remove skills in their profile.
 * It manages input locally and updates the shared tutorDetails state.
 * Prevents duplicates and empty inputs.
 */

import React, { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  HStack,
  Wrap,
  WrapItem,
  Tag,
  Box,
  useToast
} from '@chakra-ui/react';
import { Tutor } from '@/types/tutor';

interface Props {
  tutorDetails: Partial<Tutor>;
  setTutorDetails: React.Dispatch<React.SetStateAction<Partial<Tutor>>>;
}

const SkillForm: React.FC<Props> = ({ tutorDetails, setTutorDetails }) => {
  const [skillInput, setSkillInput] = useState(''); // Tracks value of current input
  const toast = useToast();

  /**
   * Adds a new skill to the tutor's list.
   * Trims whitespace
   * Prevents empty input
   * Prevents adding duplicates
   */
  const handleAddSkill = () => {
    const trimmed = skillInput.trim();

    // Ignore empty submissions
    if (!trimmed) return;

    // Check for duplicates
    if (tutorDetails.skills?.includes(trimmed)) {
      toast({ title: 'Duplicate Skill', status: 'warning', isClosable: true });
      return;
    }

    // Add new skill to state
    setTutorDetails(prev => ({
      ...prev,
      skills: [...(prev.skills || []), trimmed]
    }));

    // Clear input
    setSkillInput('');
  };

  /**
   * Removes a skill from the tutor's list
   * Updates state by filtering out selected skill
   */
  const handleRemoveSkill = (skill: string) => {
    setTutorDetails(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(s => s !== skill)
    }));

    toast({ title: `Removed "${skill}"`, status: 'info', duration: 2000, isClosable: true });
  };

  return (
    <FormControl>
      <FormLabel>Skills</FormLabel>

      {/* Input field with add button */}
      <HStack>
        <Input
          placeholder="e.g. JavaScript"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddSkill();
            }
          }}
        />
        <Button colorScheme="blue" onClick={handleAddSkill}>Add</Button>
      </HStack>

      {/* Display existing skills as removable tags */}
      <Wrap mt={3}>
        {tutorDetails.skills?.map((skill, index) => (
          <WrapItem key={index}>
            <Tag colorScheme="blue" borderRadius="full">
              {skill}
              <Box
                as="span"
                ml={2}
                fontWeight="bold"
                cursor="pointer"
                aria-label={`Remove ${skill}`}
                onClick={() => handleRemoveSkill(skill)}
              >
                ✕
              </Box>
            </Tag>
          </WrapItem>
        ))}
      </Wrap>
    </FormControl>
  );
};

export default SkillForm;

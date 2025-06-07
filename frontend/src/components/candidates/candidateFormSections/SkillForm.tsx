// src/components/candidates/candidateFormSections/SkillForm.tsx

import React, { useState } from "react";
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
  FormErrorMessage,
} from "@chakra-ui/react";
import { Candidate } from "@/types/candidate";

interface SkillFormProps {
  candidateDetails: Partial<Candidate>;
  setCandidateDetails: React.Dispatch<React.SetStateAction<Partial<Candidate>>>;
  setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
  saveToBackend: (showToastMessage?: boolean) => Promise<boolean>;
}

const SkillForm: React.FC<SkillFormProps> = ({
  candidateDetails,
  setCandidateDetails,
  setHasChanges,
}) => {
  const [skillInput, setSkillInput] = useState("");
  const [error, setError] = useState("");

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) {
      setError("Skill cannot be empty.");
      return;
    }
    if (candidateDetails.skills?.includes(trimmed)) {
      setError("Duplicate skill.");
      return;
    }
    setCandidateDetails((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), trimmed],
    }));
    setHasChanges(true);
    setSkillInput("");
    setError("");
  };

  const handleRemoveSkill = (skill: string) => {
    setCandidateDetails((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s !== skill),
    }));
    setHasChanges(true);
  };

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel>Skills</FormLabel>
      <HStack>
        <Input
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          placeholder="Add a skill"
        />
        <Button colorScheme="blue" onClick={handleAddSkill}>
          Add
        </Button>
      </HStack>
      <FormErrorMessage>{error}</FormErrorMessage>
      <Wrap mt={3}>
        {candidateDetails.skills?.map((skill, index) => (
          <WrapItem key={index}>
            <Tag colorScheme="blue" borderRadius="full">
              {skill}
              <Box
                as="span"
                ml={2}
                fontWeight="bold"
                cursor="pointer"
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

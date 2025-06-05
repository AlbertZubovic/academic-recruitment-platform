// src/components/candidates/candidateFormSections/PersonalDetailsForm.tsx

import React from "react";
import {
  FormControl,
  FormLabel,
  Input,
  VStack,
  FormErrorMessage,
} from "@chakra-ui/react";
import { Candidate } from "@/types/candidate";

interface PersonalDetailsFormProps {
  candidateDetails: Partial<Candidate>;
  setCandidateDetails: React.Dispatch<React.SetStateAction<Partial<Candidate>>>;
  setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
  errors: { [key: string]: string };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  saveToBackend: (showToastMessage?: boolean) => Promise<boolean>;
}

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  candidateDetails,
  setCandidateDetails,
  setHasChanges,
  errors,
  setErrors,
}) => {
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "firstName":
        return value.trim() ? "" : "First name is required.";
      case "lastName":
        return value.trim() ? "" : "Last name is required.";
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ""
          : "Invalid email format.";
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCandidateDetails((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    setHasChanges(true);
  };

  return (
    <VStack spacing={4} align="stretch">
      <FormControl isRequired isInvalid={!!errors.firstName}>
        <FormLabel>First Name</FormLabel>
        <Input
          name="firstName"
          value={candidateDetails.firstName || ""}
          onChange={handleChange}
        />
        <FormErrorMessage>{errors.firstName}</FormErrorMessage>
      </FormControl>

      <FormControl isRequired isInvalid={!!errors.lastName}>
        <FormLabel>Last Name</FormLabel>
        <Input
          name="lastName"
          value={candidateDetails.lastName || ""}
          onChange={handleChange}
        />
        <FormErrorMessage>{errors.lastName}</FormErrorMessage>
      </FormControl>

      <FormControl isRequired isInvalid={!!errors.email}>
        <FormLabel>Email</FormLabel>
        <Input
          name="email"
          value={candidateDetails.email || ""}
          onChange={handleChange}
        />
        <FormErrorMessage>{errors.email}</FormErrorMessage>
      </FormControl>

      <FormControl>
        <FormLabel>Credentials</FormLabel>
        <Input
          name="credentials"
          value={candidateDetails.credentials || ""}
          onChange={handleChange}
        />
      </FormControl>
    </VStack>
  );
};

export default PersonalDetailsForm;

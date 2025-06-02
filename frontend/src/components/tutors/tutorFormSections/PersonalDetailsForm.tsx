import React from 'react';
import { FormControl, FormLabel, Input, VStack, FormErrorMessage } from '@chakra-ui/react';
import { Tutor } from '@/types/tutor';

interface PersonalDetailsFormProps {
  tutorDetails: Partial<Tutor>;
  setTutorDetails: React.Dispatch<React.SetStateAction<Partial<Tutor>>>;
  setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
  errors: { [key: string]: string };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  saveToBackend: (showToastMessage?: boolean) => Promise<boolean>;
}

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({ tutorDetails, setTutorDetails, setHasChanges, errors, setErrors }) => {
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
        return value.trim() ? '' : 'First name is required.';
      case 'lastName':
        return value.trim() ? '' : 'Last name is required.';
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Invalid email format.';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTutorDetails(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    setHasChanges(true);
  };

  return (
    <VStack spacing={4} align="stretch">
      <FormControl isRequired isInvalid={!!errors.firstName}>
        <FormLabel>First Name</FormLabel>
        <Input name="firstName" value={tutorDetails.firstName || ''} onChange={handleChange} />
        <FormErrorMessage>{errors.firstName}</FormErrorMessage>
      </FormControl>

      <FormControl isRequired isInvalid={!!errors.lastName}>
        <FormLabel>Last Name</FormLabel>
        <Input name="lastName" value={tutorDetails.lastName || ''} onChange={handleChange} />
        <FormErrorMessage>{errors.lastName}</FormErrorMessage>
      </FormControl>

      <FormControl isRequired isInvalid={!!errors.email}>
        <FormLabel>Email</FormLabel>
        <Input name="email" value={tutorDetails.email || ''} onChange={handleChange} />
        <FormErrorMessage>{errors.email}</FormErrorMessage>
      </FormControl>

      <FormControl>
        <FormLabel>Credentials</FormLabel>
        <Input name="credentials" value={tutorDetails.credentials || ''} onChange={handleChange} />
      </FormControl>
    </VStack>
  );
};

export default PersonalDetailsForm;

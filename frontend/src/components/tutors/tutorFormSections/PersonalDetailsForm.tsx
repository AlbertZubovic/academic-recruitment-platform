// src/components/tutors/TutorFormSections/PersonalDetailsForm.tsx

/**
 * PersonalDetailsForm Component
 * A form section used within the tutor profile that allows the user
 * to update their personal information such as name, email, and credentials.
 * The data is saved to localStorage for persistence.
 */

import React from 'react';
import { FormControl, FormLabel, Input, Button, VStack, useToast } from '@chakra-ui/react';
import { Tutor } from '@/types/tutor';

interface Props {
  tutorDetails: Partial<Tutor>;
  setTutorDetails: React.Dispatch<React.SetStateAction<Partial<Tutor>>>;
}

const PersonalDetailsForm: React.FC<Props> = ({ tutorDetails, setTutorDetails }) => {
  const toast = useToast();

  // Handles input field changes and updates the parent state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Updating ${name}:`, value);
  
    setTutorDetails((prev) => {
      const updated = { ...prev, [name]: value };
      console.log('New tutorDetails:', updated);
      return updated;
    });
  };
  

  // Validates and saves the entered personal details into localStorage
  const handleSave = () => {
    console.log('tutorDetails:', tutorDetails);
  
    const { firstName, lastName, email } = tutorDetails;
    if (!firstName || !lastName || !email) {
      toast({
        title: 'All fields are required',
        status: 'error',
        isClosable: true,
      });
      return;
    }
  
    toast({
      title: 'Details Saved',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  

  return (
    <VStack spacing={4} align="stretch">
      {/* First Name */}
      <FormControl isRequired>
        <FormLabel>First Name</FormLabel>
        <Input
          name="firstName"
          value={tutorDetails.firstName || ''}
          onChange={handleChange}
        />
      </FormControl>

      {/* Last Name */}
      <FormControl isRequired>
        <FormLabel>Last Name</FormLabel>
        <Input
          name="lastName"
          value={tutorDetails.lastName || ''}
          onChange={handleChange}
        />
      </FormControl>

      {/* Email */}
      <FormControl isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          name="email"
          type="email"
          value={tutorDetails.email || ''}
          onChange={handleChange}
        />
      </FormControl>

      {/* Academic Credentials */}
      <FormControl>
        <FormLabel>Credentials</FormLabel>
        <Input
          name="credentials"
          value={tutorDetails.credentials || ''}
          onChange={handleChange}
        />
      </FormControl>

      {/* Save Button */}
      <Button colorScheme="green" onClick={handleSave} alignSelf="flex-start">
        Save Details
      </Button>
    </VStack>
  );
};

export default PersonalDetailsForm;

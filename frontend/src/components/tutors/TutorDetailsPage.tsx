// TutorDetailsPage.tsx

import React, { useEffect, useState } from 'react';
import { Container, Heading, Box, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, VStack, StackDivider, Button } from '@chakra-ui/react';
import axios from 'axios';
import TutorDetailsCard from './TutorDetailsCard';
import SkillForm from './tutorFormSections/SkillForm';
import RoleForm from './tutorFormSections/RoleForm';
import PersonalDetailsForm from './tutorFormSections/PersonalDetailsForm';
import { Tutor } from '@/types/tutor';
import { useAuth } from '@/context/AuthContext';
import { globalToast } from "@/pages/_app";

const TutorDetailsPage = () => {
  const { user, setUser } = useAuth();
  const [tutorDetails, setTutorDetails] = useState<Partial<Tutor>>(user ?? {});
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      setTutorDetails({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        credentials: user.academicCredentials || '',
        skills: user.defaultSkills || [],
        pastRoles: [],
      });
    } else {
      setTutorDetails({});
    }
  }, [user]);

  const validateAllFields = () => {
    const newErrors: { [key: string]: string } = {};
    if (!tutorDetails.firstName?.trim()) newErrors.firstName = 'First name is required.';
    if (!tutorDetails.lastName?.trim()) newErrors.lastName = 'Last name is required.';
    if (!tutorDetails.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tutorDetails.email)) newErrors.email = 'Invalid email format.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveToBackend = async (showToastMessage: boolean = false) => {
    if (!validateAllFields()) return false;
    try {
      const payload = {
        firstname: tutorDetails.firstName,
        lastname: tutorDetails.lastName,
        email: tutorDetails.email,
        academic_credentials: tutorDetails.credentials,
        default_skills: tutorDetails.skills,
      };
      const response = await axios.put('http://localhost:5000/api/users/me', payload, { withCredentials: true });
      setUser(response.data);
      setHasChanges(false);
      if (showToastMessage) {
        globalToast({
          title: 'Profile Saved',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'bottom',
          containerStyle: { marginBottom: '10%' },
        });
      }
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update user.';
      if (showToastMessage) {
        globalToast({
          title: 'Save Error',
          description: message,
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'bottom',
          containerStyle: { marginBottom: '10%' },
        });
      }
      return false;
    }
  };

  useEffect(() => {
    const handleUnload = async () => {
      if (hasChanges) {
        await saveToBackend(false);
        sessionStorage.setItem("showSavedToast", "true");
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [hasChanges, tutorDetails]);

  const handleSaveClick = async () => {
    const success = await saveToBackend(true);
    if (success) {
      sessionStorage.removeItem("showSavedToast");
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <Heading mb={6} textAlign="center">My Tutor Profile</Heading>
      <Box mb={8}>{user && <TutorDetailsCard user={tutorDetails as Tutor} />}</Box>
      <Accordion allowToggle defaultIndex={[0]}>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">Update My Details</Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <VStack spacing={6} align="stretch" divider={<StackDivider />}>
              <PersonalDetailsForm tutorDetails={tutorDetails} setTutorDetails={setTutorDetails} setHasChanges={setHasChanges} errors={errors} setErrors={setErrors} saveToBackend={saveToBackend} />
              <SkillForm tutorDetails={tutorDetails} setTutorDetails={setTutorDetails} setHasChanges={setHasChanges} saveToBackend={saveToBackend} />
              <RoleForm tutorDetails={tutorDetails} setTutorDetails={setTutorDetails} setHasChanges={setHasChanges} saveToBackend={saveToBackend} />
            </VStack>
            <Button mt={6} colorScheme="blue" onClick={handleSaveClick}>Save All Changes</Button>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Container>
  );
};

export default TutorDetailsPage;

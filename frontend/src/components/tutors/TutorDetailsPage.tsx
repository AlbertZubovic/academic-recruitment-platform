// src/components/tutors/TutorDetailsPage.tsx

/**
 * TutorDetailsPage
 * This page allows a tutor to view and edit their profile information.
 * It includes:
 * Personal details (name, email, credentials)
 * Skill list (add/remove)
 * Previous roles (add/remove)
 *
 * All data is synced to localStorage and displayed via the TutorDetailsCard and AuthContext.
 */

import React, { useEffect, useState } from 'react';
import {
  Container,
  Heading,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  VStack,
  StackDivider,
} from '@chakra-ui/react';

import TutorDetailsCard from './TutorDetailsCard';
import SkillForm from './tutorFormSections/SkillForm';
import RoleForm from './tutorFormSections/RoleForm';
import PersonalDetailsForm from './tutorFormSections/PersonalDetailsForm';
import { Tutor } from '@/types/tutor';
import { useAuth } from '@/context/AuthContext';




const TutorDetailsPage = () => {
  const { user, setUser } = useAuth();

  // Local state to store editable tutor profile information
  const [tutorDetails, setTutorDetails] = useState<Partial<Tutor>>(user ?? {});

// On first load: initialize tutorDetails from AuthContext or fallback
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  if (!user) return;

  const storedManual = localStorage.getItem('tutorDetails');
  const parsed = storedManual ? JSON.parse(storedManual) : {};

  setTutorDetails({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    credentials: user.credentials,
    skills: user.skills,
    pastRoles: user.pastRoles,
    ...parsed,
  });
}, []);


// Whenever tutorDetails changes, persist to localStorage + update user and Users[]
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  if (!user || !tutorDetails) return;

  localStorage.setItem('tutorDetails', JSON.stringify(tutorDetails));

  const updatedUser = {
    ...user,
    firstName: tutorDetails.firstName ?? user.firstName,
    lastName: tutorDetails.lastName ?? user.lastName,
    email: tutorDetails.email ?? user.email,
    credentials: tutorDetails.credentials ?? user.credentials,
  
    skills: tutorDetails.skills?.length ? tutorDetails.skills : user.skills,
    pastRoles: tutorDetails.pastRoles?.length ? tutorDetails.pastRoles : user.pastRoles,
  };

  const userString = JSON.stringify(user);
  const updatedString = JSON.stringify(updatedUser);

  if (userString !== updatedString) {
    setUser(updatedUser);
  }
}, [tutorDetails]);

  

  

  return (
    <Container maxW="container.md" py={10}>
      <Heading mb={6} textAlign="center">
        My Tutor Profile
      </Heading>

      {/* Display full profile details */}
      <Box mb={8}>
        <TutorDetailsCard user={tutorDetails as Tutor} />
      </Box>

      {/* Editable form sections in accordion */}
      <Accordion allowToggle defaultIndex={[0]}>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              Update My Details
            </Box>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel>
            <VStack spacing={6} align="stretch" divider={<StackDivider />}>
              {/* Form to update name, email, credentials */}
              <PersonalDetailsForm
                tutorDetails={tutorDetails}
                setTutorDetails={setTutorDetails}
              />
              {/* Form to manage skill tags */}
              <SkillForm
                tutorDetails={tutorDetails}
                setTutorDetails={setTutorDetails}
              />
              {/* Form to add/remove past teaching roles */}
              <RoleForm
                tutorDetails={tutorDetails}
                setTutorDetails={setTutorDetails}
              />
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Container>
  );
};

export default TutorDetailsPage;

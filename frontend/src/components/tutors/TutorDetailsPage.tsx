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

import React, { useEffect, useState, useRef } from 'react';
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
  const [tutorDetails, setTutorDetails] = useState<Partial<Tutor>>(user ?? {});
  const isInitialMountOrUserLoad = useRef(true);

  // On first load or when user context changes: initialize/reset tutorDetails from user
  useEffect(() => {
    if (user) {
      console.log("TutorDetailsPage: Populating tutorDetails from user context:", user);
      
      setTutorDetails({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        credentials: user.academicCredentials || '',
        skills: user.defaultSkills || [],
        pastRoles: [], // Initialize pastRoles as empty; actual data will be fetched elsewhere
      });
    } else {
      console.log("TutorDetailsPage: No user in context, clearing tutorDetails.");
      setTutorDetails({}); // Clear details if user logs out or is not available
    }
  }, [user]);

  // Update backend when tutorDetails changes, but skip the very initial population
  useEffect(() => {
    // Skip if user is not loaded or tutorDetails is not yet populated (or empty)
    // This check is important to prevent updates if the user logs out or data is otherwise invalid.
    if (!user || !tutorDetails || Object.keys(tutorDetails).length === 0) {
      console.log("TutorDetailsPage: Skipping update - no user or tutorDetails are empty.");
      return;
    }

    // If it's the initial population phase (isInitialMountOrUserLoad is true),
    // mark it as done for subsequent runs and skip the API call for now.
    if (isInitialMountOrUserLoad.current) {
      console.log("TutorDetailsPage: Initial population of tutorDetails complete, skipping immediate backend update.");
      isInitialMountOrUserLoad.current = false; // Prevent this block from running again for this page load
      return; 
    }
    
    console.log("TutorDetailsPage: tutorDetails changed by user interaction, attempting backend update:", tutorDetails);

    const updateUserOnBackend = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("TutorDetailsPage: No token found, cannot update user.");
          return;
        }

        // Construct payload carefully, only send fields backend expects
        const payload = {
          firstname: tutorDetails.firstName,
          lastname: tutorDetails.lastName,
          email: tutorDetails.email, 
          academic_credentials: tutorDetails.credentials,
          default_skills: tutorDetails.skills,
          // pastRoles is intentionally omitted from payload as it's derived data
        };

        const response = await fetch("http://localhost:5000/api/users/me", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Failed to update user and parse error response" }));
          console.error("TutorDetailsPage: API error response on update:", errorData);
          throw new Error(errorData.message || "Failed to update user");
        }

        const updatedUser = await response.json();
        console.log("TutorDetailsPage: User updated on backend, updating AuthContext:", updatedUser);
        setUser(updatedUser); // Update the user context with fresh data from backend
      } catch (err) {
        console.error("TutorDetailsPage: Failed to update user details:", err);
      }
    };

    updateUserOnBackend();
  }, [tutorDetails, user, setUser]);

  return (
    <Container maxW="container.md" py={10}>
      <Heading mb={6} textAlign="center">
        My Tutor Profile
      </Heading>

      {/* Display full profile details */}
      <Box mb={8}>
        {user && <TutorDetailsCard user={tutorDetails as Tutor} />}
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

// src/components/candidates/CandidateDetailsPage.tsx

import React, { useEffect, useState } from "react";
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
  Button,
} from "@chakra-ui/react";
import axios from "axios";
import CandidateDetailsCard from "./CandidateDetailsCard";
import SkillForm from "./candidateFormSections/SkillForm";
import RoleForm from "./candidateFormSections/RoleForm";
import PersonalDetailsForm from "./candidateFormSections/PersonalDetailsForm";
import { Candidate } from "@/types/candidate";
import { useAuth } from "@/context/AuthContext";
import { globalToast } from "@/pages/_app";

const CandidateDetailsPage = () => {
  const { user, setUser } = useAuth();
  const [candidateDetails, setCandidateDetails] = useState<
    Partial<Candidate>
  >(user ?? {});
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      setCandidateDetails({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        credentials: user.academicCredentials || "",
        skills: user.defaultSkills || [],
        pastRoles: user.pastRoles || [],
      });
    } else {
      setCandidateDetails({});
    }
  }, [user]);

  const validateAllFields = () => {
    const newErrors: { [key: string]: string } = {};
    if (!candidateDetails.firstName?.trim())
      newErrors.firstName = "First name is required.";
    if (!candidateDetails.lastName?.trim())
      newErrors.lastName = "Last name is required.";
    if (
      !candidateDetails.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateDetails.email)
    )
      newErrors.email = "Invalid email format.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveToBackend = async (showToastMessage: boolean = false) => {
    if (!validateAllFields()) return false;
    try {
      const payload = {
        firstname: candidateDetails.firstName,
        lastname: candidateDetails.lastName,
        email: candidateDetails.email,
        academic_credentials: candidateDetails.credentials,
        default_skills: candidateDetails.skills,
      };
      const response = await axios.put(
        "http://localhost:5000/api/users/me",
        payload,
        { withCredentials: true }
      );
      setUser(response.data);
      setHasChanges(false);
      if (showToastMessage) {
        globalToast({
          title: "Profile Saved",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom",
          containerStyle: { marginBottom: "10%" },
        });
      }
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update user.";
      if (showToastMessage) {
        globalToast({
          title: "Save Error",
          description: message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom",
          containerStyle: { marginBottom: "10%" },
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
  }, [hasChanges, candidateDetails]);

  const handleSaveClick = async () => {
    const success = await saveToBackend(true);
    if (success) {
      sessionStorage.removeItem("showSavedToast");
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <Heading mb={6} textAlign="center">
        My Candidate Profile
      </Heading>
      <Box mb={8}>
        {user && <CandidateDetailsCard user={candidateDetails as Candidate} />}
      </Box>
      <Accordion allowToggle defaultIndex={[0]}>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">Update My Details</Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <VStack spacing={6} align="stretch" divider={<StackDivider />}>
              <PersonalDetailsForm
                candidateDetails={candidateDetails}
                setCandidateDetails={setCandidateDetails}
                setHasChanges={setHasChanges}
                errors={errors}
                setErrors={setErrors}
                saveToBackend={saveToBackend}
              />
              <SkillForm
                candidateDetails={candidateDetails}
                setCandidateDetails={setCandidateDetails}
                setHasChanges={setHasChanges}
                saveToBackend={saveToBackend}
              />
              <RoleForm
                candidateDetails={candidateDetails}
                setCandidateDetails={setCandidateDetails}
                setHasChanges={setHasChanges}
                saveToBackend={saveToBackend}
              />
            </VStack>
            <Button mt={6} colorScheme="blue" onClick={handleSaveClick}>
              Save All Changes
            </Button>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Container>
  );
};

export default CandidateDetailsPage;

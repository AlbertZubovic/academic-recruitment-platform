// src/components/modals/ApplicationStatusModal.tsx

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Tag,
  Wrap,
  Divider,
  Box,
  FormControl,
  FormLabel,
  Select,
  Input,
  TagLabel,
  TagCloseButton,
  Stack,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { Course } from '@/types/course';
import { Applicant } from '@/types/applicant';
import { useCourse } from '@/context/CourseContext';

export interface ApplicationModalData {
  course: Course;
  application: Applicant | null;
  status: 'Pending' | 'Selected';
}

interface ApplicationStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalData: ApplicationModalData | null;
}

const ApplicationStatusModal: React.FC<ApplicationStatusModalProps> = ({ isOpen, onClose, modalData }) => {
  const { updateApplicationDetails, deleteApplication } = useCourse();
  const toast = useToast();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  // State for editing application details
  const [editedAvailability, setEditedAvailability] = useState('');
  const [editedSkills, setEditedSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Update editing state when modal data changes
  useEffect(() => {
    if (isOpen && modalData?.application && modalData.status === 'Pending') {
      setEditedAvailability(modalData.application.appliedAvailability || '');
      setEditedSkills(modalData.application.appliedSkills || []);
      setIsEditing(false);
    } else {
      // Reset state when modal closes
      setEditedAvailability('');
      setEditedSkills([]);
      setNewSkill('');
      setIsEditing(false);
    }
  }, [isOpen, modalData]);

  if (!modalData) return null;

  const { course, application, status } = modalData;
  const isPending = status === 'Pending';

  // Edit handlers
  const handleSkillAdd = () => {
    if (newSkill && !editedSkills.includes(newSkill.trim())) {
      setEditedSkills([...editedSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setEditedSkills(editedSkills.filter(skill => skill !== skillToRemove));
  };

  const handleSaveChanges = () => {
    if (!application) return;

    const success = updateApplicationDetails(course.id, application.userId, {
      appliedAvailability: editedAvailability,
      appliedSkills: editedSkills,
    });

    if (success) {
      toast({ title: "Application Updated", status: "success", duration: 2000, isClosable: true });
      setIsEditing(false);
      onClose();
    } else {
      toast({ title: "Update Failed", description: "Could not update application.", status: "error", duration: 3000, isClosable: true });
    }
  };

  const handleDeleteConfirm = () => {
     if (!application) return;

     const success = deleteApplication(course.id, application.userId);
     onAlertClose();

     if (success) {
        toast({ title: "Application Withdrawn", status: "info", duration: 2000, isClosable: true });
        onClose();
     } else {
        toast({ title: "Withdrawal Failed", description: "Could not withdraw application.", status: "error", duration: 3000, isClosable: true });
     }
  };

  // Format availability string for display
  const formatAvailability = (avail: string | undefined) => {
    if (!avail) return "N/A";
    return avail.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Application Status: {course.name} ({course.courseCode})
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={5}>
              {/* Status Badge */}
              <Badge
                colorScheme={status === 'Selected' ? 'green' : 'orange'}
                variant="solid"
                fontSize="md"
                p={2}
                borderRadius="md"
                alignSelf="flex-start"
              >
                Status: {status}
              </Badge>

              {/* Course Information */}
              <Box>
                <Heading size="sm" mb={2}>Course Details</Heading>
                <Text><strong>Semester:</strong> {course.semester}</Text>
                <Text mt={1}><strong>Skills Required by Course:</strong></Text>
                <Wrap mt={1}>
                  {course.skills?.length > 0 ? (
                    course.skills.map((skill, i) => (
                      <Tag key={`course-skill-${i}`} size="sm" colorScheme="blue">
                        {skill}
                      </Tag>
                    ))
                  ) : (
                    <Text fontSize="sm" color="gray.500">No specific skills listed.</Text>
                  )}
                </Wrap>
              </Box>

              <Divider />

              {/* Application Details */}
              <Box>
                <HStack justify="space-between" mb={isEditing || !isPending ? 2 : 0}>
                   <Heading size="sm">Your Application Details</Heading>
                   {isPending && !isEditing && (
                       <Button size="xs" onClick={() => setIsEditing(true)}>Edit</Button>
                   )}
                </HStack>

                {!application ? (
                  <Text color="gray.500">Could not find your specific application details for this course.</Text>
                ) : isEditing ? (
                  // Editing View
                  <VStack as={FormControl} align="stretch" spacing={4} mt={2}>
                    <Box>
                      <FormLabel fontSize="sm" fontWeight="medium">Availability Submitted</FormLabel>
                      <Select
                        placeholder="Select availability"
                        value={editedAvailability}
                        onChange={(e) => setEditedAvailability(e.target.value)}
                        size="sm"
                      >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                      </Select>
                    </Box>
                    <Box>
                       <FormLabel fontSize="sm" fontWeight="medium">Skills Submitted</FormLabel>
                       <Box border="1px" borderColor="gray.200" borderRadius="md" p={2} minH="40px" mb={2}>
                           {editedSkills.length === 0 && <Text fontSize="xs" color="gray.500">No skills added yet.</Text>}
                           {editedSkills.map(skill => (
                             <Tag size="sm" key={skill} borderRadius="full" variant="solid" colorScheme="teal" m="1">
                               <TagLabel>{skill}</TagLabel>
                               <TagCloseButton onClick={() => handleSkillRemove(skill)} />
                             </Tag>
                           ))}
                       </Box>
                       <Stack direction="row">
                           <Input
                              size="sm"
                              placeholder="Add a skill"
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              onKeyPress={(e) => { if (e.key === 'Enter') { handleSkillAdd(); e.preventDefault(); } }}
                           />
                           <Button size="sm" onClick={handleSkillAdd}>Add</Button>
                       </Stack>
                    </Box>
                  </VStack>
                ) : (
                  // Read-only View
                  <VStack align="stretch" spacing={1}>
                    <Text>
                      <strong>Availability Submitted:</strong> {formatAvailability(application.appliedAvailability)}
                    </Text>
                    <Text mt={1}><strong>Skills Submitted:</strong></Text>
                    <Wrap mt={1}>
                      {application.appliedSkills?.length > 0 ? (
                        application.appliedSkills.map((skill, i) => (
                          <Tag key={`app-skill-${i}`} size="sm" colorScheme="teal">
                            {skill}
                          </Tag>
                        ))
                      ) : (
                        <Text fontSize="sm" color="gray.500">No specific skills submitted with this application.</Text>
                      )}
                    </Wrap>
                  </VStack>
                )}
              </Box>

            </VStack>
          </ModalBody>

          <ModalFooter justifyContent="space-between">
            <Box>
                {isPending && (
                    <Button colorScheme="red" variant="outline" size="sm" onClick={onAlertOpen}>
                        Withdraw Application
                    </Button>
                )}
            </Box>
            <Box>
                {isEditing ? (
                    <>
                        <Button variant="ghost" size="sm" mr={3} onClick={() => setIsEditing(false)}>
                            Cancel Edit
                        </Button>
                        <Button colorScheme="blue" size="sm" onClick={handleSaveChanges}>
                            Save Changes
                        </Button>
                    </>
                ) : (
                    <Button onClick={onClose} size="sm">Close</Button>
                )}
            </Box>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirmation Dialog */}
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Withdraw Application
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to withdraw your application for {course.name}? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Withdraw
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default ApplicationStatusModal;
// src/components/modals/CourseReviewModal.tsx

import React, { useState, useEffect, useMemo } from 'react';
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
  Textarea, // For comments
  useToast,
  Icon, // <-- Import Icon
} from '@chakra-ui/react';
import { MdCheckCircle } from 'react-icons/md'; // <-- Import icon for matching skills
import { Course } from '@/types/course';
import { Applicant } from '@/types/applicant';
import { User } from '@/types/user';
import { useApplicationContext } from '@/context/ApplicationContext'; // To get allUsers

interface CourseReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null; // The course being reviewed
}

// --- ApplicantComment Component (remains the same) ---
interface ApplicantCommentProps {
  courseId: string;
  courseSkills: string[];
  applicantDetail: Applicant;
  userProfile: User | undefined;
}

const ApplicantComment: React.FC<ApplicantCommentProps> = ({ courseId, courseSkills, applicantDetail, userProfile }) => {
  const [comment, setComment] = useState("");
  const toast = useToast();
  const commentKey = `comment-${courseId}-${applicantDetail.userId}`;

  useEffect(() => {
    const saved = localStorage.getItem(commentKey);
    setComment(saved || "");
  }, [commentKey]);

  const handleSaveComment = () => {
    try {
      localStorage.setItem(commentKey, comment);
      toast({
        title: "Comment Saved",
        description: `Comment for ${userProfile?.firstName || 'applicant'} saved.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to save comment:", error);
      toast({
        title: "Error Saving Comment",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const matchingSkills = useMemo(() => {
    const courseSkillSet = new Set(courseSkills.map(s => s.toLowerCase()));
    return new Set(
      (applicantDetail.appliedSkills || []).filter(appSkill =>
        courseSkillSet.has(appSkill.toLowerCase())
      )
    );
  }, [courseSkills, applicantDetail.appliedSkills]);

  const formatAvailability = (avail: string | undefined) => {
    if (!avail) return "N/A";
    if (avail.toLowerCase() === 'any') return 'Any'; // Handle 'any' if used
    return avail.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  if (!userProfile) {
    return <Text color="red.500" fontSize="sm">Error: User profile not found for ID {applicantDetail.userId}</Text>;
  }

  return (
    <Box borderWidth="1px" borderRadius="md" p={3} bg="white" w="100%">
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
            <Text fontWeight="medium">{userProfile.firstName} {userProfile.lastName}</Text>
            <Badge colorScheme={applicantDetail.appliedAvailability === 'full-time' ? 'green' : 'purple'}>
                {formatAvailability(applicantDetail.appliedAvailability)}
            </Badge>
        </HStack>
        <Box>
            <Text fontSize="sm" fontWeight="medium" mb={1}>Applied Skills:</Text>
            <Wrap>
                {(applicantDetail.appliedSkills || []).length > 0 ? (
                    applicantDetail.appliedSkills.map((skill) => {
                        const isMatch = matchingSkills.has(skill);
                        return (
                            <Tag key={skill} size="sm" colorScheme={isMatch ? 'green' : 'gray'} variant={isMatch ? 'solid' : 'subtle'}>
                                {isMatch && <Icon as={MdCheckCircle} mr={1} />}
                                {skill}
                            </Tag>
                        );
                    })
                ) : (
                    <Text fontSize="xs" color="gray.500">No skills listed for this application.</Text>
                )}
            </Wrap>
        </Box>
        <Textarea
          placeholder={`Add comments for ${userProfile.firstName}...`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          size="sm"
          rows={2}
        />
        <Button size="xs" colorScheme="blue" onClick={handleSaveComment} alignSelf="flex-end">
          Save Comment
        </Button>
      </VStack>
    </Box>
  );
};
// --- End ApplicantComment Component ---

// --- Main CourseReviewModal Component ---
const CourseReviewModal: React.FC<CourseReviewModalProps> = ({ isOpen, onClose, course }) => {
  const { allUsers } = useApplicationContext(); // Get all tutor profiles

  // --- Moved formatAvailability here or import from utils ---
  const formatAvailability = (avail: string | undefined): string => {
    if (!avail) return "N/A";
    if (avail.toLowerCase() === 'any') return 'Any';
    return avail.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };
  // --- End formatAvailability ---

  if (!course) return null; // Don't render if no course data

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="85vh"> {/* Limit modal height */}
        <ModalHeader>
          Review Applicants: {course.name} ({course.courseCode})
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack align="stretch" spacing={4}>
            {/* --- Course Requirements Section --- */}
            <Box mb={2}>
                <Heading size="xs" textTransform="uppercase" color="gray.600">Course Requirements</Heading>
                {/* Display Required Availability */}
                <HStack mt={2}>
                    <Text fontSize="sm" fontWeight="medium" minW="80px">Availability:</Text> {/* Added minW for alignment */}
                    <Badge colorScheme={
                        course.requiredAvailability === 'full-time' ? 'green' :
                        course.requiredAvailability === 'part-time' ? 'purple' : 'gray'
                    }>
                        {formatAvailability(course.requiredAvailability)}
                    </Badge>
                </HStack>
                {/* Display Required Skills */}
                <HStack mt={1} align="start"> {/* Use HStack and align start */}
                    <Text fontSize="sm" fontWeight="medium" minW="80px" pt={1}>Skills:</Text> {/* Added minW and padding top */}
                    <Wrap flex="1"> {/* Allow wrap to take remaining space */}
                        {course.skills?.length > 0 ? (
                            course.skills.map((skill, i) => (
                                <Tag key={`req-${i}`} size="sm" colorScheme="blue">
                                    {skill}
                                </Tag>
                            ))
                        ) : (
                            <Text fontSize="sm" color="gray.500" pt={1}>None specified.</Text>
                        )}
                    </Wrap>
                </HStack>
            </Box>
            {/* --- End Course Requirements Section --- */}
            <Divider />

            {/* Applicant List */}
            <Heading size="sm" mb={0}>Applicants ({course.applicants.length})</Heading>
            {course.applicants.length === 0 ? (
              <Text>No applicants for this course.</Text>
            ) : (
              // Use VStack for applicants list
              <VStack spacing={3} align="stretch">
                  {course.applicants.map((applicantDetail) => {
                    // Find user profile for each applicant
                    const userProfile = allUsers.find(u => String(u.id) === String(applicantDetail.userId));
                    return (
                      <ApplicantComment
                        key={applicantDetail.userId}
                        courseId={course.id}
                        courseSkills={course.skills || []} // Pass course skills
                        applicantDetail={applicantDetail}
                        userProfile={userProfile}
                      />
                    );
                  })}
              </VStack>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CourseReviewModal;

import React, { useState, useMemo } from "react";
import {
  VStack,
  HStack,
  Box,
  Button,
  Badge,
  Text,
  Tag,
  IconButton,
  Flex,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaStar, FaRegStar, FaEdit, FaTrashAlt } from "react-icons/fa";
import { Course } from "@/types/course";
import { ApplicationRole } from "@/types/enums";

interface UnifiedCourseDashboardProps {
  courses: Course[];
  userSkills: string[];
  bookmarks: Record<string, boolean>;
  onToggleBookmark: (courseId: string) => void;
  onApply: (course: Course, role: ApplicationRole) => void;
  onEdit: (course: Course, role: ApplicationRole) => void;
  onWithdraw: (courseId: string, status: string) => void;
  onReapply: (courseId: string) => Promise<boolean>;
}

type FilterType = "all" | "accepted" | "applied" | "saved" | "recommended" | "rejected";

const UnifiedCourseDashboard: React.FC<UnifiedCourseDashboardProps> = ({
  courses,
  userSkills,
  bookmarks,
  onToggleBookmark,
  onApply,
  onEdit,
  onWithdraw,
  onReapply,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Color mode values for better contrast in dark mode
  const cardBg = useColorModeValue("white", "gray.700");
  const cardBorder = useColorModeValue("gray.200", "gray.600");
  const panelBg = useColorModeValue("white", "gray.750");
  const subtleTextColor = useColorModeValue("gray.600", "gray.300");

  // Helper functions
  const computeMatchPercent = (required: string[], owned: string[]) => {
    if (required.length === 0) return 100;
    const lowerOwned = new Set(owned.map((s) => s.toLowerCase()));
    const matched = required.filter((r) => lowerOwned.has(r.toLowerCase()));
    return Math.round((matched.length / required.length) * 100);
  };

  const getMissingSkills = (required: string[], owned: string[]) => {
    const lowerOwned = new Set(owned.map((s) => s.toLowerCase()));
    return required.filter((r) => !lowerOwned.has(r.toLowerCase()));
  };

  const getApplicationStatus = (course: Course, role: ApplicationRole) => {
    const application = course.applicationDetails?.find(
      (app) => app.role === role
    );
    return application || null;
  };



  // Filter courses based on active filter
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const isBookmarked = bookmarks[course.id];
      
      // Get all applications for this course
      const applications = course.applicationDetails || [];
      const acceptedApps = applications.filter(app => !app.isWithdrawn && app.status === "Approved");
      const pendingApps = applications.filter(app => !app.isWithdrawn && app.status === "Pending");
      const rejectedApps = applications.filter(app => !app.isWithdrawn && app.status === "Rejected");

      // For recommended filter, check if course has 70%+ match
      const courseMatchPercent = computeMatchPercent(course.skills || [], userSkills || []);
      const isRecommended = courseMatchPercent >= 70;

      switch (activeFilter) {
        case "accepted":
          return acceptedApps.length > 0;
        case "applied":
          return pendingApps.length > 0;
        case "saved":
          return isBookmarked;
        case "recommended":
          return isRecommended;
        case "rejected":
          return rejectedApps.length > 0;
        case "all":
        default:
          return true;
      }
    });
  }, [courses, activeFilter, userSkills, bookmarks]);

  // Get filter counts
  const filterCounts = useMemo(() => {
    const counts = {
      all: courses.length,
      accepted: 0,
      applied: 0,
      saved: 0,
      recommended: 0,
      rejected: 0,
    };

    courses.forEach((course) => {
      const isBookmarked = bookmarks[course.id];
      const applications = course.applicationDetails || [];
      const acceptedApps = applications.filter(app => !app.isWithdrawn && app.status === "Approved");
      const pendingApps = applications.filter(app => !app.isWithdrawn && app.status === "Pending");
      const rejectedApps = applications.filter(app => !app.isWithdrawn && app.status === "Rejected");

      // Check if course has 70%+ match for recommended count
      const courseMatchPercent = computeMatchPercent(course.skills || [], userSkills || []);
      const isRecommended = courseMatchPercent >= 70;

      if (acceptedApps.length > 0) counts.accepted++;
      if (pendingApps.length > 0) counts.applied++;
      if (isBookmarked) counts.saved++;
      if (isRecommended) counts.recommended++;
      if (rejectedApps.length > 0) counts.rejected++;
    });

    return counts;
  }, [courses, userSkills, bookmarks]);

  const renderCourseCard = (course: Course) => {
    const missingSkills = getMissingSkills(course.skills || [], userSkills || []);
    const isBookmarked = bookmarks[course.id];
    


    // Helper function to get match percentage for a specific role
    const getRoleMatchPercent = (role: ApplicationRole) => {
      // Find the specific role and its skills
      const roleItem = course.rolesAvailable?.find(item => {
        const itemRole = typeof item === 'string' ? item : item.role;
        return itemRole === role;
      });
      
      // If we have role-specific skills, use them; otherwise use course skills
      const roleSkills = (roleItem && typeof roleItem !== 'string') 
        ? roleItem.skills 
        : course.skills || [];
      
      return computeMatchPercent(roleSkills, userSkills || []);
    };

    // Check if any role has 100% match for perfect match badge
    const hasAnyPerfectMatch = course.rolesAvailable?.some(roleItem => {
      const role = typeof roleItem === 'string' ? roleItem : roleItem.role;
      return getRoleMatchPercent(role) === 100;
    }) || false;

    // Filter roles based on current filter
    const getFilteredRoles = () => {
      const applications = course.applicationDetails || [];
      
      // Check if any role in this course has been rejected
      const hasRejectedRole = applications.some(app => !app.isWithdrawn && app.status === "Rejected");
      
      // Handle both old format (string[]) and new format (CourseRole[])
      const roles = course.rolesAvailable || [];
      
      return roles.filter(roleItem => {
        // Support both old string format and new object format
        const roleValue = typeof roleItem === 'string' ? roleItem : roleItem.role;
        const application = applications.find(app => app.role === roleValue);
        
        switch (activeFilter) {
          case "accepted":
            return application && !application.isWithdrawn && application.status === "Approved";
          case "applied":
            return application && !application.isWithdrawn && application.status === "Pending";
          case "rejected":
            return application && !application.isWithdrawn && application.status === "Rejected";
          case "all":
          case "saved":
          case "recommended":
          default:
            // For general filters, hide roles if any role in the course was rejected
            if (hasRejectedRole && (!application || application.isWithdrawn)) {
              return false;
            }
            return true;
        }
      });
    };

    const filteredRoles = getFilteredRoles();

    return (
      <AccordionItem 
        key={course.id}
        bg={cardBg}
        borderColor={cardBorder}
        borderWidth="1px"
        borderRadius="md"
        mb={2}
      >
        <AccordionButton p={4}>
          <Flex flex="1" align="center" justify="space-between">
            <VStack align="start" spacing={2} flex="1">
              {/* Course Title Row */}
              <HStack spacing={3} w="100%">
                <Text fontWeight="bold" fontSize="lg">
                  {course.name} ({course.courseCode})
                </Text>
                <Badge colorScheme="blue" variant="outline">
                  {course.semester}
                </Badge>
                {hasAnyPerfectMatch && (
                  <Badge colorScheme="green" variant="solid">
                    Perfect Match!
                  </Badge>
                )}
              </HStack>

              {/* Application Status Row */}
              <HStack spacing={4} w="100%">
                {filteredRoles.map((roleItem) => {
                  // Support both old string format and new object format
                  const role = typeof roleItem === 'string' ? roleItem : roleItem.role;
                  const application = getApplicationStatus(course, role);
                  const roleMatchPercent = getRoleMatchPercent(role);
                  
                  if (application && !application.isWithdrawn) {
                    // Show current application status with match percentage
                    const statusColor = 
                      application.status === "Approved" ? "green" :
                      application.status === "Pending" ? "yellow" : "red";
                    
                                          return (
                        <VStack key={role} spacing={1} align="start">
                          <HStack spacing={1}>
                            <Text fontSize="sm" fontWeight="medium">{role}:</Text>
                            <Badge colorScheme={statusColor} variant="solid">
                              {application.status}
                            </Badge>
                          </HStack>
                          <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                            {roleMatchPercent}% match
                          </Badge>
                        </VStack>
                      );
                  } else if (application && application.isWithdrawn) {
                    // Show withdrawn status with match percentage
                    return (
                      <VStack key={role} spacing={1} align="start">
                        <HStack spacing={1}>
                          <Text fontSize="sm" fontWeight="medium">{role}:</Text>
                          <Badge colorScheme="purple" variant="outline">
                            Withdrawn
                          </Badge>
                        </HStack>
                        <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                          {roleMatchPercent}% match
                        </Badge>
                      </VStack>
                    );
                  } else {
                    // Show available to apply with match percentage
                    return (
                      <VStack key={role} spacing={1} align="start">
                        <HStack spacing={1}>
                          <Text fontSize="sm" fontWeight="medium">{role}:</Text>
                          <Badge colorScheme="gray" variant="outline">
                            Available
                          </Badge>
                        </HStack>
                        <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                          {roleMatchPercent}% match
                        </Badge>
                      </VStack>
                    );
                  }
                })}
              </HStack>

              {/* Skills Preview */}
              <HStack spacing={1} flexWrap="wrap">
                {course.skills.slice(0, 4).map((skill) => {
                  const isMissing = missingSkills.includes(skill);
                  return (
                    <Tag
                      key={skill}
                      size="sm"
                      colorScheme={isMissing ? "gray" : "green"}
                      variant="subtle"
                    >
                      {skill}
                    </Tag>
                  );
                })}
                {course.skills.length > 4 && (
                  <Text fontSize="sm" color="gray.500">
                    +{course.skills.length - 4} more
                  </Text>
                )}
              </HStack>
            </VStack>

            {/* Bookmark and Expand Icons */}
            <HStack spacing={2}>
              <IconButton
                aria-label="Toggle bookmark"
                icon={isBookmarked ? <FaStar /> : <FaRegStar />}
                colorScheme={isBookmarked ? "yellow" : "gray"}
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(course.id);
                }}
              />
              <AccordionIcon />
            </HStack>
          </Flex>
        </AccordionButton>

        <AccordionPanel pb={4} bg={panelBg}>
          <VStack align="start" spacing={4}>
            {/* Role-specific Actions */}
            <VStack align="start" spacing={3} w="100%">
              <Text fontWeight="medium">Actions by Role:</Text>
              {filteredRoles.map((roleItem) => {
                // Support both old string format and new object format
                const role = typeof roleItem === 'string' ? roleItem : roleItem.role;
                const application = getApplicationStatus(course, role);
                
                return (
                  <Box 
                    key={role} 
                    p={3} 
                    borderWidth="1px" 
                    borderColor={cardBorder}
                    bg={cardBg}
                    borderRadius="md" 
                    w="100%"
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{role}</Text>
                        {application && (
                          <>
                            <Text fontSize="sm" color={subtleTextColor}>
                              Applied: {application.appliedAvailability}
                            </Text>
                            <Text fontSize="sm" color={subtleTextColor}>
                              Skills: {application.appliedSkills.join(", ")}
                            </Text>
                            {application.lecturerComment && (
                              <Text fontSize="sm" color={subtleTextColor}>
                                Comment: {application.lecturerComment}
                              </Text>
                            )}
                          </>
                        )}
                      </VStack>

                      <HStack spacing={2}>
                        {!application ? (
                          // No application - show apply button
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={() => onApply(course, role)}
                          >
                            Apply
                          </Button>
                        ) : application.isWithdrawn ? (
                          // Withdrawn - show reapply button
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => onReapply(course.id)}
                          >
                            Reapply
                          </Button>
                        ) : application.status === "Pending" ? (
                          // Pending - show edit and withdraw buttons
                          <>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              leftIcon={<FaEdit />}
                              onClick={() => onEdit(course, role)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              leftIcon={<FaTrashAlt />}
                              onClick={() => onWithdraw(course.id, application.status)}
                            >
                              Withdraw
                            </Button>
                          </>
                        ) : (
                          // Approved/Rejected - show status only
                          <Badge
                            colorScheme={application.status === "Approved" ? "green" : "red"}
                            variant="solid"
                          >
                            {application.status}
                          </Badge>
                        )}
                      </HStack>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          </VStack>
        </AccordionPanel>
      </AccordionItem>
    );
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Filter Tabs */}
      <Tabs 
        index={["all", "accepted", "applied", "saved", "recommended", "rejected"].indexOf(activeFilter)}
        onChange={(index) => {
          const filters: FilterType[] = ["all", "accepted", "applied", "saved", "recommended", "rejected"];
          setActiveFilter(filters[index]);
        }}
        variant="enclosed"
      >
        <TabList>
          <Tab>All ({filterCounts.all})</Tab>
          <Tab>Accepted ({filterCounts.accepted})</Tab>
          <Tab>Applied ({filterCounts.applied})</Tab>
          <Tab>Saved ({filterCounts.saved})</Tab>
          <Tab>Recommended ({filterCounts.recommended})</Tab>
          <Tab>Rejected ({filterCounts.rejected})</Tab>
        </TabList>

        <TabPanels>
          {/* All tabs use the same panel content */}
          {Array(6).fill(0).map((_, index) => (
            <TabPanel key={index} px={0}>
              {filteredCourses.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500">
                    {activeFilter === "accepted" && "No accepted applications"}
                    {activeFilter === "applied" && "No pending applications"}
                    {activeFilter === "saved" && "No saved courses"}
                    {activeFilter === "recommended" && "No recommended courses (70%+ match)"}
                    {activeFilter === "rejected" && "No rejected applications"}
                    {activeFilter === "all" && "No courses found"}
                  </Text>
                </Box>
              ) : (
                <Accordion allowToggle allowMultiple>
                  {filteredCourses.map(renderCourseCard)}
                </Accordion>
              )}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default UnifiedCourseDashboard; 
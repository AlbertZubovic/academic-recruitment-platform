// src/components/candidates/CandidatePage.tsx

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useCourses } from "@/context/CourseContext";
import { useAuth } from "@/context/AuthContext";
import { Course } from "@/types/course";
import { ApplicationRole } from "@/types/enums";
import { bookmarkService } from "@/services/bookmarkService";
import { useColorModeValue } from "@chakra-ui/react";

import {
  Container,
  Heading,
  VStack,
  Text,
  Button,
  useToast,
} from "@chakra-ui/react";
import { FaPencilAlt } from "react-icons/fa";
import ApplicationDetailsForm from "./candidateFormSections/ApplicationDetailsForm";
import UnifiedCourseDashboard from "./UnifiedCourseDashboard";

interface BookmarkMap {
  [courseId: string]: boolean;
}

const CandidatePage: React.FC = () => {
  const router = useRouter();
  const { courses, deleteApplication, reapplyApplication } = useCourses();
  const { user } = useAuth();
  const toast = useToast();
  const textColor = useColorModeValue("gray.900", "gray.200");



  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedRole, setSelectedRole] = useState<ApplicationRole | "">("");

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<BookmarkMap>({});

  // Load bookmarks from API on mount
  useEffect(() => {
    const loadBookmarks = async () => {
      if (!user) return;
      
      try {
        const bookmarkedCourseIds = await bookmarkService.getBookmarks();
        const bookmarkMap: BookmarkMap = {};
        bookmarkedCourseIds.forEach(courseId => {
          bookmarkMap[courseId] = true;
        });
        setBookmarks(bookmarkMap);
      } catch (error) {
        console.error("Failed to load bookmarks:", error);
        // Fallback to localStorage for backward compatibility
        const saved = localStorage.getItem("bookmarkedCourses");
        if (saved) {
          try {
            setBookmarks(JSON.parse(saved));
          } catch {
            setBookmarks({});
          }
        }
      }
    };

    loadBookmarks();
  }, [user]);

  const toggleBookmark = async (courseId: string) => {
    const isCurrentlyBookmarked = Boolean(bookmarks[courseId]);
    
    // Optimistic update
    setBookmarks((prev) => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));

    try {
      await bookmarkService.toggleBookmark(courseId, isCurrentlyBookmarked);
      
      toast({
        title: isCurrentlyBookmarked ? "Bookmark Removed" : "Bookmark Added",
        description: `Course ${isCurrentlyBookmarked ? "removed from" : "added to"} your bookmarks.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      // Revert optimistic update on error
      setBookmarks((prev) => ({
        ...prev,
        [courseId]: isCurrentlyBookmarked
      }));
      
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Failed to toggle bookmark:", error);
    }
  };

  // Handle actions from the unified dashboard
  const handleApply = (course: Course, role: ApplicationRole) => {
    setSelectedCourse(course);
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleEdit = (course: Course, role: ApplicationRole) => {
    setSelectedCourse(course);
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleWithdraw = async (courseId: string, status: string) => {
    await deleteApplication(courseId, status as "Pending" | "Approved" | "Rejected");
  };

  const handleReapply = async (courseId: string): Promise<boolean> => {
    return await reapplyApplication(courseId);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    setSelectedRole("");
  };

  if (!user || !user.isCandidate) {
    return (
      <Text textAlign="center" mt={10}>
        You are not authorized to view this page.
      </Text>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Course Dashboard
        </Heading>

        <Text fontSize="lg" textAlign="center" color={textColor}>
          Welcome, {user.firstName} {user.lastName}!
        </Text>

        <Button onClick={() => router.push("/mydetails")} leftIcon={<FaPencilAlt />}>
          Edit Details
        </Button>

        {/* Unified Course Dashboard */}
        <UnifiedCourseDashboard
          courses={courses}
          bookmarks={bookmarks}
          onToggleBookmark={toggleBookmark}
          onApply={handleApply}
          onEdit={handleEdit}
          onWithdraw={handleWithdraw}
          onReapply={handleReapply}
        />
      </VStack>

      {selectedCourse && (
        <ApplicationDetailsForm
          isOpen={isModalOpen}
          onClose={closeModal}
          course={selectedCourse}
          defaultRole={selectedRole as ApplicationRole}
        />
      )}
    </Container>
  );
};

export default CandidatePage;

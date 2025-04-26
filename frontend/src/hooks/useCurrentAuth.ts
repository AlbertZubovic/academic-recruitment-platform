// src/hooks/useCurrentAuth.ts

/**
 * useCurrentAuth
 * Custom hook that handles:
 * Email/password login with validation
 * Tutor applying to courses
 * Toast notifications on success/error
 * LocalStorage sync for user + course updates
 *
 * Used in tutor and login flows.
 */

import { useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { User } from "@/types/user";
import { useCourse } from "@/context/CourseContext";
import { Applicant } from "@/types/applicant";

// LocalStorage keys
const LS_USERS_KEY = "Users";
const LS_SIGNED_IN_USER_KEY = "signedInUser";

export function useCurrentAuth() {
  const toast = useToast();
  const router = useRouter();
  const { courses, updateCourseData } = useCourse();

  // Simple email format validation
  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  // Password strength check
  const isStrongPassword = (password: string) =>
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[@$!%*?&#^&()/<>]/.test(password);

  // Handles login with validation and toast feedback
  const login = (email: string, password: string) => {
    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (!isStrongPassword(password)) {
      toast({
        title: "Weak Password",
        description:
          "Password must contain uppercase, lowercase, number, and special character",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return false;
    }

    const raw = localStorage.getItem(LS_USERS_KEY);
    const storedUsers: User[] = raw ? JSON.parse(raw) : [];

    if (!storedUsers.length) {
      toast({
        title: "No Users Loaded",
        isClosable: true,
        status: "error",
        duration: 3000,
      });
      return false;
    }

    const storedUser = storedUsers.find((user) => user.email === email);

    if (!storedUser || storedUser.password !== password) {
      toast({
        title: "Login Failed",
        description: "Email or password is incorrect",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    localStorage.setItem(LS_SIGNED_IN_USER_KEY, JSON.stringify(storedUser));

    toast({
      title: "Login Successful",
      description: "Redirecting...",
      status: "success",
      duration: 2000,
      isClosable: true,
    });

    setTimeout(() => {
      router.push("/");
    }, 2000);

    return true;
  };

  /**
   * Allows a user to apply to a course, updating both:
   * Their user record (appliedCourses)
   * The course record (applicants)
   */
  const applyToCourse = (applicationDetails: Applicant, courseId: string) => {
    const storedUsers = JSON.parse(localStorage.getItem(LS_USERS_KEY) || "[]");
    const userIndex = storedUsers.findIndex((user: User) => String(user.id) === String(applicationDetails.userId));

    if (userIndex === -1) {
      toast({
        title: "User Not Found",
        description: "Could not find the user in local storage.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    const updatedUser = { ...storedUsers[userIndex] };

    // Initialize appliedCourses if it doesn't exist
    if (!updatedUser.appliedCourses) {
      updatedUser.appliedCourses = [];
    }

    // Prevent duplicate applications
    if (updatedUser.appliedCourses.includes(courseId)) {
      toast({
        title: "Already Applied",
        description: "You have already applied to this course.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    // Add courseId to appliedCourses and persist
    updatedUser.appliedCourses.push(courseId);
    storedUsers[userIndex] = updatedUser;

    localStorage.setItem(LS_USERS_KEY, JSON.stringify(storedUsers));
    localStorage.setItem(LS_SIGNED_IN_USER_KEY, JSON.stringify(updatedUser));

    // Success feedback
    toast({
      title: "Application Successful",
      description: "You have successfully applied to the course.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    // Update course applicants list
    const updatedCourses = courses.map((course) =>
      course.id === courseId
        ? {
            ...course,
            applicants: [...course.applicants, applicationDetails],
          }
        : course
    );

    updateCourseData(updatedCourses);
    return true;
  };

  return { login, applyToCourse };
}
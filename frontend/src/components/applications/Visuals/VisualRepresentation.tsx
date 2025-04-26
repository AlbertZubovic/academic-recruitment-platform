// src/components/applications/Visuals/VisualRepresentation.tsx

/**
 * VisualRepresentation.tsx
 *
 * Displays visual analytics related to selected applicants using interactive charts.
 * Charts include:
 *  Applicant selection frequency
 *  Skills distribution
 *  Availability breakdown
 *
 * Selections are pulled from localStorage and selection context.
 * Charts are broken into reusable subcomponents for maintainability.
 */

import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";

import { useSelectedApplicants } from "@/context/SelectedApplicantsContext";
import ApplicantSelectionChart from "./Charts/ApplicantSelectionChart";
import TopSkillsChart from "./Charts/TopSkillsChart";
import AvailabilityChart from "./Charts/AvailabilityChart";
import { User } from "@/types/user";
import { Course } from "@/types/course";
import { Applicant } from "@/types/applicant";
import { useCourse } from "@/context/CourseContext";





// Utility to fetch all tutors from localStorage
const getAllApplicants = (): User[] => { // Return User[] as we fetch full user details
  const coursesRaw = localStorage.getItem("Courses"); 
  const usersRaw = localStorage.getItem("Users");

  if (!coursesRaw || !usersRaw) {
    console.warn("Missing Courses or Users data in localStorage for VisualRepresentation.");
    return [];
  }

  const allApplicantUserIds = new Set<string>();

  try {
    // 1. Get all unique applicant IDs from courses
    const courses: Course[] = JSON.parse(coursesRaw);
    if (Array.isArray(courses)) {
      courses.forEach(course => {
        if (Array.isArray(course.applicants)) {
          // The element here is the Applicant details object
          course.applicants.forEach((applicantDetail: Applicant) => {
            // Use the userId property from the object
            allApplicantUserIds.add(String(applicantDetail.userId));
          });
        }
      });
    } else {
      console.warn("Parsed courses data is not an array.");
      return [];
    }

    // 2. Get all users once
    const allUsers: User[] = JSON.parse(usersRaw);
     if (!Array.isArray(allUsers)) {
        console.warn("Parsed users data is not an array.");
        return [];
     }

    // 3. Filter users: Must be a tutor AND their ID must be in the set of applied IDs
    const applicantUsers = allUsers.filter(user =>
        user.isTutor &&
        !user.isLecturer &&
        allApplicantUserIds.has(String(user.id))
    );

    // Return the User objects of tutors who have applied
    return applicantUsers;

  } catch (e) {
    console.error("Failed to parse data in getAllApplicants:", e);
    return [];
  }
};


const VisualRepresentation: React.FC = () => {
  const { selectedApplicants } = useSelectedApplicants();
  const { courses } = useCourse();

  // State types remain the same
  const [chartData, setChartData] = useState<{ name: string; id: string; count: number }[]>([]);
  const [skillData, setSkillData] = useState<{ skill: string; count: number }[]>([]);
  const [availabilityData, setAvailabilityData] = useState<{ type: string; count: number }[]>([]);

  useEffect(() => {

    const applicantsWhoApplied: User[] = getAllApplicants();
    const selectedIds = new Set(Object.values(selectedApplicants).flat().map(String)); // Set for faster lookup

    // Count selections by applicant ID
    const counts: Record<string, number> = {};
    Object.values(selectedApplicants).flat().forEach((id) => {
        const idStr = String(id);
        // Only count if the selected ID corresponds to a user who actually applied
        if (applicantsWhoApplied.some(appUser => String(appUser.id) === idStr)) {
            counts[idStr] = (counts[idStr] || 0) + 1;
        }
    });

    // Build selection chart data (based only on tutors who have applied)
    const data = applicantsWhoApplied.map((applicantUser) => ({
      id: String(applicantUser.id),
      name: `${applicantUser.firstName} ${applicantUser.lastName}`,
      count: counts[String(applicantUser.id)] || 0,
    }));

    // --- Logic Correction for Skills/Availability ---
    // We need to get the *applied* skills/availability for *selected* applicants,
    // not their default profile skills/availability.

    const skillMap: Record<string, number> = {};
    const availabilityMap: Record<string, number> = {};

    // Iterate through the actual course data to find the specific application details
    courses.forEach((course: Course) => {
        if (!Array.isArray(course.applicants)) return;

        course.applicants.forEach((application: Applicant) => {
            const userIdStr = String(application.userId);
            // Check if this applicant (userId) was selected for *any* course
            if (selectedIds.has(userIdStr)) {
                // Count their *applied* skills for this application
                if (Array.isArray(application.appliedSkills)) {
                    application.appliedSkills.forEach(skill => {
                        skillMap[skill] = (skillMap[skill] || 0) + 1;
                    });
                }
                // Count their *applied* availability
                if (application.appliedAvailability) {
                    const label = (application.appliedAvailability)
                        .split("-")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ");
                    availabilityMap[label] = (availabilityMap[label] || 0) + 1;
                }
            }
        });
    });
    // --- End Logic Correction ---


    const skills = Object.entries(skillMap).map(([skill, count]) => ({ skill, count }));
    const availability = Object.entries(availabilityMap).map(([type, count]) => ({ type, count }));

    setChartData(data);
    setSkillData(skills);
    setAvailabilityData(availability);

  }, [selectedApplicants, courses]); // Add courses as dependency

  // Overview stats calculation remains similar, using chartData
  const selectedOnly = chartData.filter(a => a.count > 0);
  const mostChosen = selectedOnly.length ? selectedOnly.reduce((max, curr) => curr.count > max.count ? curr : max) : null;
  const leastChosen = selectedOnly.length ? selectedOnly.reduce((min, curr) => curr.count < min.count ? curr : min) : null;
  const notSelected = chartData.filter((a) => a.count === 0);

  return (
    <Box bg="white" p={6} borderRadius="md" boxShadow="md" mt={8}>
      <Heading as="h3" size="lg" mb={4} textAlign="center">
        Selection Overview
      </Heading>
       <Text fontSize="sm" color="gray.500" textAlign="center" mb={4}>
        (Showing data only for tutors who have applied to at least one course)
      </Text>

      {/* Tabs remain the same */}
      <Tabs isLazy>
        <TabList mb={4} overflowX="auto">
          <Tab>Selections per Applicant</Tab>
          <Tab>Top Skills (from Selected Applications)</Tab>
          <Tab>Availability (from Selected Applications)</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <ApplicantSelectionChart data={chartData} />
          </TabPanel>
          <TabPanel>
            <TopSkillsChart data={skillData} />
          </TabPanel>
          <TabPanel>
            <AvailabilityChart data={availabilityData} />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Stats interpretation might change slightly */}
      <VStack align="start" mt={6} spacing={2}>
        <Text>
          <strong>Most Chosen (among applicants):</strong>{" "}
          {mostChosen ? `${mostChosen.name} (${mostChosen.count} selections)` : "N/A"}
        </Text>
        <Text>
          <strong>Least Chosen (among selected applicants):</strong>{" "}
          {leastChosen ? `${leastChosen.name} (${leastChosen.count} selections)` : "N/A"}
        </Text>
        <Text>
          <strong>Applied but Not Selected:</strong> {notSelected.length} applicant(s)
        </Text>
      </VStack>
    </Box>
  );
};

export default VisualRepresentation;
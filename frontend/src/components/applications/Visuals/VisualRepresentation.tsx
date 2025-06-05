// src/components/applications/Visuals/VisualRepresentation.tsx

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
import { useCourses } from "@/context/CourseContext";

import ApplicantSelectionChart from "./Charts/ApplicantSelectionChart";
import TopSkillsChart from "./Charts/TopSkillsChart";
import AvailabilityChart from "./Charts/AvailabilityChart";

import { Course } from "@/types/course";
import { LecturerApplication } from "@/types/Application";

interface SelectionData {
  id: string;
  name: string;
  count: number;
}

interface SkillData {
  skill: string;
  count: number;
}

interface AvailabilityData {
  type: string;
  count: number;
}

const VisualRepresentation: React.FC = () => {
  const { selectedApplicants } = useSelectedApplicants();
  const { courses } = useCourses();

  // State holds the data for each chart
  const [chartData, setChartData] = useState<SelectionData[]>([]);
  const [skillData, setSkillData] = useState<SkillData[]>([]);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData[]>(
    []
  );

  useEffect(() => {
    //
    // 1) Gather every application record from all courses:
    //    each `lectApp` is of type LecturerApplication:
    //      {
    //        applicationId: string;
    //        userId: string;
    //        name: string;               // “First Last”
    //        role: string;
    //        availability: "Full-Time" | "Part-Time";
    //        skills: string[];
    //        status: string;
    //        lecturerComment?: string | null;
    //        ranking?: number | null;
    //      }
    //
    //    We want a deduplicated list of all applicants (unique by userId).
    //
    const allApps: LecturerApplication[] = [];
    courses.forEach((course: Course & { applicants?: LecturerApplication[] }) => {
      if (Array.isArray(course.applicants)) {
        course.applicants.forEach((lectApp) => {
          allApps.push(lectApp);
        });
      }
    });

    // Build a map from userId → name (only first occurrence)
    const userMap: Record<string, string> = {};
    allApps.forEach((lectApp) => {
      const uid = String(lectApp.userId);
      if (!userMap[uid]) {
        userMap[uid] = lectApp.name;
      }
    });

    //
    // 2) Build a “selections per applicant” count:
    //    selectedApplicants: { [courseId]: string[] } where each array is userIds
    //
    const counts: Record<string, number> = {};
    Object.entries(selectedApplicants).forEach(([courseId, userIds]) => {
      userIds.forEach((uid) => {
        const key = String(uid);
        if (!counts[key]) counts[key] = 0;
        counts[key]++;
      });
    });

    // Turn userMap into an array of { id, name, count }
    const selectionArray: SelectionData[] = Object.entries(userMap).map(
      ([uid, name]) => ({
        id: uid,
        name,
        count: counts[uid] || 0,
      })
    );

    //
    // 3) Build “Top Skills (from selected applications)” and “Availability (from selected applications)”
    //
    const skillMap: Record<string, number> = {};
    const availabilityMap: Record<string, number> = {};

    courses.forEach((course: Course & { applicants?: LecturerApplication[] }) => {
      const courseId = course.id;
      const selectedForThisCourse = new Set(
        (selectedApplicants[courseId] || []).map((id) => String(id))
      );

      if (!Array.isArray(course.applicants)) return;

      course.applicants.forEach((lectApp: LecturerApplication) => {
        const uid = String(lectApp.userId);
        if (selectedForThisCourse.has(uid)) {
          // Count each skill
          lectApp.skills.forEach((skill) => {
            skillMap[skill] = (skillMap[skill] || 0) + 1;
          });

          // Count applied availability
          const avail = lectApp.availability; // “Full-Time” or “Part-Time”
          // Normalize into “Full Time” / “Part Time”
          const label = avail
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

          availabilityMap[label] = (availabilityMap[label] || 0) + 1;
        }
      });
    });

    const skillArray: SkillData[] = Object.entries(skillMap).map(
      ([skill, count]) => ({
        skill,
        count,
      })
    );

    const availabilityArray: AvailabilityData[] = Object.entries(
      availabilityMap
    ).map(([type, count]) => ({ type, count }));

    // Finally, set state
    setChartData(selectionArray);
    setSkillData(skillArray);
    setAvailabilityData(availabilityArray);
  }, [selectedApplicants, courses]);

  //
  // 4) Compute “most” / “least” / “not selected”
  //
  const selectedOnly = chartData.filter((a) => a.count > 0);
  const mostChosen = selectedOnly.length
    ? selectedOnly.reduce((max, curr) => (curr.count > max.count ? curr : max))
    : null;
  const leastChosen = selectedOnly.length
    ? selectedOnly.reduce((min, curr) => (curr.count < min.count ? curr : min))
    : null;
  const notSelected = chartData.filter((a) => a.count === 0);

  return (
    <Box bg="white" p={6} borderRadius="md" boxShadow="md" mt={8}>
      <Heading as="h3" size="lg" mb={4} textAlign="center">
        Selection Overview
      </Heading>
      <Text fontSize="sm" color="gray.500" textAlign="center" mb={4}>
        (Showing data only for candidates who have applied to at least one course)
      </Text>

      {/* Tabbed charts */}
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

      {/* Summary stats */}
      <VStack align="start" mt={6} spacing={2}>
        <Text>
          <strong>Most Chosen (among applicants):</strong>{" "}
          {mostChosen
            ? `${mostChosen.name} (${mostChosen.count} selections)`
            : "N/A"}
        </Text>
        <Text>
          <strong>Least Chosen (among selected applicants):</strong>{" "}
          {leastChosen
            ? `${leastChosen.name} (${leastChosen.count} selections)`
            : "N/A"}
        </Text>
        <Text>
          <strong>Applied but Not Selected:</strong> {notSelected.length} applicant(s)
        </Text>
      </VStack>
    </Box>
  );
};

export default VisualRepresentation;

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
  Spinner,
  Center,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";

import { useApplications } from "@/context/ApplicationContext";

import ApplicantSelectionChart from "./Charts/ApplicantSelectionChart";
import TopSkillsChart from "./Charts/TopSkillsChart";
import AvailabilityChart from "./Charts/AvailabilityChart";

import { LecturerApplication } from "@/types/Application";
import { Course as CourseType } from "@/types/course";

/**
 *  1) ApplicantSelectionChart expects:
 *     { id: string; name: string; count: number }[]
 */
interface SelectionData {
  id:    string;
  name:  string;
  count: number;
}

/**
 *  2) TopSkillsChart expects:
 *     { skill: string; count: number }[]
 */
interface SkillData {
  skillName: string;
  count:     number;
}

/**
 *  3) AvailabilityChart expects:
 *     { type: string; count: number }[]
 */
interface AvailabilityData {
  availability: string; // intermediate shape
  count:        number;
}

const VisualRepresentation: React.FC = () => {
  // Only the courses this lecturer teaches are in context now
  const { courses } = useApplications();

  // Intermediate state arrays
  const [selectionData, setSelectionData] = useState<SelectionData[]>([]);
  const [skillData, setSkillData] = useState<SkillData[]>([]);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData[]>([]);

  // Loading / error flags
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // ────────────────────────────────────────────────────────────────
      // 1) Gather **all** LecturerApplication objects across this lecturer’s courses
      //    and also separately collect only approved ones.
      // ────────────────────────────────────────────────────────────────
      const allApps: LecturerApplication[] = [];
      const approvedApps: LecturerApplication[] = [];

      courses.forEach((course: CourseType & { applicants?: LecturerApplication[] }) => {
        (course.applicants || []).forEach((app) => {
          allApps.push(app);
          if (app.status === "Approved") {
            approvedApps.push(app);
          }
        });
      });

      // ────────────────────────────────────────────────────────────────
      // 2) Build a map of userId → userName from approvedApps (for Selections chart)
      // ────────────────────────────────────────────────────────────────
      const userMap: Record<string, string> = {};
      approvedApps.forEach((app) => {
        const uid = String(app.userId);
        if (!userMap[uid]) {
          userMap[uid] = app.name;
        }
      });

      // ────────────────────────────────────────────────────────────────
      // 3) Count how many approvals per userId
      // ────────────────────────────────────────────────────────────────
      const counts: Record<string, number> = {};
      approvedApps.forEach((app) => {
        const uid = String(app.userId);
        counts[uid] = (counts[uid] || 0) + 1;
      });

      // ────────────────────────────────────────────────────────────────
      // 4) Build selectionData = [ { id, name, count }, … ]
      // ────────────────────────────────────────────────────────────────
      const selArray: SelectionData[] = Object.entries(userMap).map(
        ([uid, name]) => ({
          id:    uid,
          name,
          count: counts[uid] || 0,
        })
      );

      // ────────────────────────────────────────────────────────────────
      // 5) Tally skills and availability among **all** applicants (not only approved)
      // ────────────────────────────────────────────────────────────────
      const skillMap: Record<string, number> = {};
      const availabilityMap: Record<string, number> = {};

      allApps.forEach((app) => {
        // a) Count each appliedSkill
        app.appliedSkills.forEach((skill) => {
          skillMap[skill] = (skillMap[skill] || 0) + 1;
        });
        // b) Count appliedAvailability
        const avail = app.appliedAvailability; // "Full-Time" or "Part-Time"
        availabilityMap[avail] = (availabilityMap[avail] || 0) + 1;
      });

      // ────────────────────────────────────────────────────────────────
      // 6) Convert skillMap → [ { skillName, count }, … ]
      // ────────────────────────────────────────────────────────────────
      const skillArray: SkillData[] = Object.entries(skillMap).map(
        ([skillName, cnt]) => ({
          skillName,
          count: cnt,
        })
      );

      // ────────────────────────────────────────────────────────────────
      // 7) Convert availabilityMap → [ { availability, count }, … ]
      // ────────────────────────────────────────────────────────────────
      const availArray: AvailabilityData[] = Object.entries(availabilityMap).map(
        ([availability, cnt]) => ({
          availability,
          count: cnt,
        })
      );

      // ────────────────────────────────────────────────────────────────
      // 8) Store in local state
      // ────────────────────────────────────────────────────────────────
      setSelectionData(selArray);
      setSkillData(skillArray);
      setAvailabilityData(availArray);
    } catch (err: any) {
      setError(err.message || "Failed to build chart data.");
    } finally {
      setLoading(false);
    }
  }, [courses]); // Re‐run whenever `courses` changes

  if (loading) {
    return (
      <Center mt={8}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Box mt={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // Calculate summary stats (only among those with count > 0)
  // ────────────────────────────────────────────────────────────────
  const selectedOnly = selectionData.filter((a) => a.count > 0);
  const mostChosen = selectedOnly.length
    ? selectedOnly.reduce((max, curr) => (curr.count > max.count ? curr : max))
    : null;
  const leastChosen = selectedOnly.length
    ? selectedOnly.reduce((min, curr) => (curr.count < min.count ? curr : min))
    : null;
  const neverChosenCount = selectionData.filter((a) => a.count === 0).length;

  return (
    <Box bg="white" p={6} borderRadius="md" boxShadow="md" mt={8}>
      <Heading as="h3" size="lg" mb={4} textAlign="center">
        Selection Overview
      </Heading>
      <Text fontSize="sm" color="gray.500" textAlign="center" mb={4}>
        (Top Skills & Availability include all applicants;
         “Selections per Applicant” counts only approved applications.)
      </Text>

      {/* ─── TABBED CHARTS ─── */}
      <Tabs isLazy>
        <TabList mb={4} overflowX="auto">
          <Tab>Selections per Applicant</Tab>
          <Tab>Top Skills (All Applicants)</Tab>
          <Tab>Availability (All Applicants)</Tab>
        </TabList>

        <TabPanels>
          {/* 1) Selections per Applicant */}
          <TabPanel>
            {selectionData.length === 0 ? (
              <Text textAlign="center" color="gray.600">
                No approved applications yet, so no “Selections per Applicant” to show.
              </Text>
            ) : (
              <ApplicantSelectionChart data={selectionData} />
            )}
          </TabPanel>

          {/* 2) TopSkillsChart: all applicants, so map skillData → { skill, count } */}
          <TabPanel>
            <TopSkillsChart
              data={skillData.map(({ skillName, count }) => ({
                skill: skillName,
                count,
              }))}
            />
          </TabPanel>

          {/* 3) AvailabilityChart: all applicants, so map availabilityData → { type, count } */}
          <TabPanel>
            <AvailabilityChart
              data={availabilityData.map(({ availability, count }) => ({
                type: availability,
                count,
              }))}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* ─── SUMMARY STATISTICS ─── */}
      <VStack align="start" mt={6} spacing={2}>
        <Text>
          <strong>Most Chosen (approved):</strong>{" "}
          {mostChosen
            ? `${mostChosen.name} (${mostChosen.count} approvals)`
            : "N/A"}
        </Text>
        <Text>
          <strong>Least Chosen (among approved):</strong>{" "}
          {leastChosen
            ? `${leastChosen.name} (${leastChosen.count} approvals)`
            : "N/A"}
        </Text>
        <Text>
          <strong>Approved but Never Selected:</strong> {neverChosenCount} candidate(s)
        </Text>
      </VStack>
    </Box>
  );
};

export default VisualRepresentation;

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
  useColorModeValue,
} from "@chakra-ui/react";

import { useApplications } from "@/context/ApplicationContext";

import ApplicantSelectionChart from "./Charts/ApplicantSelectionChart";
import TopSkillsChart from "./Charts/TopSkillsChart";
import AvailabilityChart from "./Charts/AvailabilityChart";

import { LecturerApplication } from "@/types/Application";
import { Course as CourseType } from "@/types/course";


interface SelectionData {
  id:    string;
  name:  string;
  count: number;
}

interface SkillData {
  skillName: string;
  count:     number;
}

interface AvailabilityData {
  availability: string;
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

  // ─────────────── Color values for light/dark ───────────────
  const panelBg = useColorModeValue("white", "gray.700");
  const headingColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const errorTextColor = useColorModeValue("red.600", "red.300");
  const alertBg = useColorModeValue("red.50", "red.900");
  const tabListBg = useColorModeValue("gray.100", "gray.600");
  const summaryTextColor = useColorModeValue("gray.800", "whiteAlpha.900");

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
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

      const userMap: Record<string, string> = {};
      approvedApps.forEach((app) => {
        const uid = String(app.userId);
        if (!userMap[uid]) {
          userMap[uid] = app.name;
        }
      });

      const counts: Record<string, number> = {};
      approvedApps.forEach((app) => {
        const uid = String(app.userId);
        counts[uid] = (counts[uid] || 0) + 1;
      });

      const selArray: SelectionData[] = Object.entries(userMap).map(
        ([uid, name]) => ({
          id:    uid,
          name,
          count: counts[uid] || 0,
        })
      );

      const skillMap: Record<string, number> = {};
      const availabilityMap: Record<string, number> = {};

      allApps.forEach((app) => {
        // a) Count each appliedSkill
        app.appliedSkills.forEach((skill) => {
          skillMap[skill] = (skillMap[skill] || 0) + 1;
        });
        // b) Count appliedAvailability
        const avail = app.appliedAvailability;
        availabilityMap[avail] = (availabilityMap[avail] || 0) + 1;
      });

      const skillArray: SkillData[] = Object.entries(skillMap).map(
        ([skillName, cnt]) => ({
          skillName,
          count: cnt,
        })
      );

      const availArray: AvailabilityData[] = Object.entries(availabilityMap).map(
        ([availability, cnt]) => ({
          availability,
          count: cnt,
        })
      );

      setSelectionData(selArray);
      setSkillData(skillArray);
      setAvailabilityData(availArray);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to build chart data.");
    } finally {
      setLoading(false);
    }
  }, [courses]);

  if (loading) {
    return (
      <Center mt={8}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Box mt={8} bg={panelBg} borderRadius="md" boxShadow="md" p={4}>
        <Alert status="error" bg={alertBg}>
          <AlertIcon />
          <Text color={errorTextColor}>{error}</Text>
        </Alert>
      </Box>
    );
  }


  // a) most/least chosen among approved
  const selectedOnly = selectionData.filter((a) => a.count > 0);
  const mostChosen = selectedOnly.length
    ? selectedOnly.reduce((max, curr) => (curr.count > max.count ? curr : max))
    : null;
  const leastChosen = selectedOnly.length
    ? selectedOnly.reduce((min, curr) => (curr.count < min.count ? curr : min))
    : null;

  // b) "Not Approved" = applicants who appear anywhere but never got an approval
  const uniqueAllIds = new Set<string>();
  const uniqueApprovedIds = new Set<string>();
  courses.forEach((course) => {
    (course.applicants || []).forEach((app) => {
      uniqueAllIds.add(String(app.userId));
      if (app.status === "Approved") {
        uniqueApprovedIds.add(String(app.userId));
      }
    });
  });
  const notApprovedCount = uniqueAllIds.size - uniqueApprovedIds.size;

  return (
    <Box bg={panelBg} p={6} borderRadius="md" boxShadow="md" mt={8}>
      <Heading as="h3" size="lg" mb={4} textAlign="center" color={headingColor}>
        Selection Overview
      </Heading>
              <Text fontSize="sm" color={subTextColor} textAlign="center" mb={4}>
          (Top Skills & Availability include all applicants;  
          &quot;Selections per Applicant&quot; counts only approved applications.)
        </Text>

      {/* ─── TABBED CHARTS ─── */}
      <Tabs isLazy variant="enclosed">
        <TabList
          mb={4}
          flexWrap="wrap"
          bg={tabListBg}
          borderRadius="md"
        >
          <Tab>Selections per Applicant</Tab>
          <Tab>Top Skills (All Applicants)</Tab>
          <Tab>Availability (All Applicants)</Tab>
        </TabList>

        <TabPanels>
          {/* 1) Selections per Applicant */}
          <TabPanel bg={panelBg}>
            {selectionData.length === 0 ? (
                              <Text textAlign="center" color={subTextColor}>
                  No approved applications yet, so no &quot;Selections per Applicant&quot; to show.
                </Text>
            ) : (
              <ApplicantSelectionChart data={selectionData} />
            )}
          </TabPanel>

          {/* 2) TopSkillsChart: all applicants, so map skillData → { skill, count } */}
          <TabPanel bg={panelBg}>
            <TopSkillsChart
              data={skillData.map(({ skillName, count }) => ({
                skill: skillName,
                count,
              }))}
            />
          </TabPanel>

          {/* 3) AvailabilityChart: all applicants, so map availabilityData → { type, count } */}
          <TabPanel bg={panelBg}>
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
        <Text color={summaryTextColor}>
          <strong>Most Chosen (approved):</strong>{" "}
          {mostChosen
            ? `${mostChosen.name} (${mostChosen.count} approvals)`
            : "N/A"}
        </Text>
        <Text color={summaryTextColor}>
          <strong>Least Chosen (among approved):</strong>{" "}
          {leastChosen
            ? `${leastChosen.name} (${leastChosen.count} approvals)`
            : "N/A"}
        </Text>
        <Text color={summaryTextColor}>
          <strong>Not Approved:</strong> {notApprovedCount} candidate(s)
        </Text>
      </VStack>
    </Box>
  );
};

export default VisualRepresentation;

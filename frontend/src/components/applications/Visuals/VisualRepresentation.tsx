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

import { useSelectedApplicants } from "@/context/SelectedApplicantsContext";
import { useCourses } from "@/context/CourseContext";

import ApplicantSelectionChart from "./Charts/ApplicantSelectionChart";
import TopSkillsChart from "./Charts/TopSkillsChart";
import AvailabilityChart from "./Charts/AvailabilityChart";

import { Course } from "@/types/course";
import { LecturerApplication } from "@/types/Application";

// ─── 1) MATCH EXACTLY WHAT APPLICANTSELECTIONCHART EXPECTS ───
//  It needs an array of objects: { id: string; name: string; count: number; }
interface SelectionData {
  id:    string; // userId
  name:  string; // userName
  count: number; // how many times this userId appears in selectedApplicants
}

// ─── 2) TOPSKILLSCHART expects: { skillName: string; count: number } ───
interface SkillData {
  skillName: string;
  count:     number;
}

// ─── 3) AVAILABILITYCHART expects: { availability: string; count: number } ───
interface AvailabilityData {
  availability: string;
  count:        number;
}

const VisualRepresentation: React.FC = () => {
  const { selectedApplicants } = useSelectedApplicants();
  const { courses } = useCourses();

  // State for the three data arrays
  const [selectionData, setSelectionData] = useState<SelectionData[]>([]);
  const [skillData, setSkillData] = useState<SkillData[]>([]);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData[]>([]);

  // Loading / error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // ═══════════════════════════════════════════════════════════════
      // 1) FLATTEN all LecturerApplication across all courses into one array
      // ═══════════════════════════════════════════════════════════════
      const allApps: LecturerApplication[] = [];
      courses.forEach((course: Course & { applicants?: LecturerApplication[] }) => {
        (course.applicants || []).forEach((lectApp) => {
          allApps.push(lectApp);
        });
      });

      // ═══════════════════════════════════════════════════════════════
      // 2) BUILD userMap: userId → userName (first time we see them)
      // ═══════════════════════════════════════════════════════════════
      const userMap: Record<string, string> = {};
      allApps.forEach((lectApp) => {
        const uid = String(lectApp.userId);
        if (!userMap[uid]) {
          userMap[uid] = lectApp.name;
        }
      });

      // ═══════════════════════════════════════════════════════════════
      // 3) COUNT how many times each userId appears in selectedApplicants
      //    selectedApplicants: { [courseId: string]: string[] }
      // ═══════════════════════════════════════════════════════════════
      const counts: Record<string, number> = {};
      Object.values(selectedApplicants).forEach((uidArray) => {
        uidArray.forEach((uid) => {
          const key = String(uid);
          counts[key] = (counts[key] || 0) + 1;
        });
      });

      // ═══════════════════════════════════════════════════════════════
      // 4) BUILD selectionData = [ { id, name, count }, … ]
      // ═══════════════════════════════════════════════════════════════
      const selArray: SelectionData[] = Object.entries(userMap).map(
        ([uid, name]) => ({
          id:    uid,
          name,
          count: counts[uid] || 0,
        })
      );

      // ═══════════════════════════════════════════════════════════════
      // 5) TALLY UP "selected" applications to build skillMap + availabilityMap
      // ═══════════════════════════════════════════════════════════════
      const skillMap: Record<string, number> = {};
      const availabilityMap: Record<string, number> = {};

      courses.forEach((course: Course & { applicants?: LecturerApplication[] }) => {
        // Build a Set of userIds selected for THIS course
        const selectedForThisCourse = new Set(
          (selectedApplicants[course.id] || []).map((id) => String(id))
        );

        (course.applicants || []).forEach((lectApp) => {
          const uid = String(lectApp.userId);
          if (selectedForThisCourse.has(uid)) {
            // Count each applied skill
            lectApp.appliedSkills.forEach((skill) => {
              skillMap[skill] = (skillMap[skill] || 0) + 1;
            });
            // Count appliedAvailability
            const avail = lectApp.appliedAvailability; // e.g. "Full-Time"
            availabilityMap[avail] = (availabilityMap[avail] || 0) + 1;
          }
        });
      });

      // ═══════════════════════════════════════════════════════════════
      // 6) CONVERT skillMap → [ { skillName, count }, … ]
      // ═══════════════════════════════════════════════════════════════
      const skillArray: SkillData[] = Object.entries(skillMap).map(
        ([skillName, cnt]) => ({
          skillName,
          count: cnt,
        })
      );

      // ═══════════════════════════════════════════════════════════════
      // 7) CONVERT availabilityMap → [ { availability, count }, … ]
      // ═══════════════════════════════════════════════════════════════
      const availArray: AvailabilityData[] = Object.entries(availabilityMap).map(
        ([availability, cnt]) => ({
          availability,
          count: cnt,
        })
      );

      // ═══════════════════════════════════════════════════════════════
      // 8) SET STATE
      // ═══════════════════════════════════════════════════════════════
      setSelectionData(selArray);
      setSkillData(skillArray);
      setAvailabilityData(availArray);
    } catch (err: any) {
      setError(err.message || "Failed to build chart data.");
    } finally {
      setLoading(false);
    }
  }, [selectedApplicants, courses]);

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

  // ═══════════════════════════════════════════════════════════════
  // 9) SUMMARY STATS (only among those with count > 0)
  // ═══════════════════════════════════════════════════════════════
  const selectedOnly = selectionData.filter((a) => a.count > 0);
  const mostChosen = selectedOnly.length
    ? selectedOnly.reduce((max, curr) =>
        curr.count > max.count ? curr : max
      )
    : null;
  const leastChosen = selectedOnly.length
    ? selectedOnly.reduce((min, curr) =>
        curr.count < min.count ? curr : min
      )
    : null;
  const neverChosenCount = selectionData.filter((a) => a.count === 0).length;

  return (
    <Box bg="white" p={6} borderRadius="md" boxShadow="md" mt={8}>
      <Heading as="h3" size="lg" mb={4} textAlign="center">
        Selection Overview
      </Heading>
      <Text fontSize="sm" color="gray.500" textAlign="center" mb={4}>
        (Charts update based on Selection)
      </Text>

      {/* ─── TABBED CHARTS ─── */}
      <Tabs isLazy>
        <TabList mb={4} overflowX="auto">
          <Tab>Selections per Applicant</Tab>
          <Tab>Top Skills (from Selected Applications)</Tab>
          <Tab>Availability (from Selected Applications)</Tab>
        </TabList>

        <TabPanels>
          {/* 1) Pass selectionData to ApplicantSelectionChart */}
          <TabPanel>
            <ApplicantSelectionChart data={selectionData} />
          </TabPanel>

          {/* 2) Pass skillData to TopSkillsChart */}
          <TabPanel>
            <TopSkillsChart data={skillData} />
          </TabPanel>

          {/* 3) Pass availabilityData to AvailabilityChart */}
          <TabPanel>
            <AvailabilityChart data={availabilityData} />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* ─── SUMMARY STATS ─── */}
      <VStack align="start" mt={6} spacing={2}>
        <Text>
          <strong>Most Chosen:</strong>{" "}
          {mostChosen
            ? `${mostChosen.name} (${mostChosen.count} selections)`
            : "N/A"}
        </Text>
        <Text>
          <strong>Least Chosen (among those selected):</strong>{" "}
          {leastChosen
            ? `${leastChosen.name} (${leastChosen.count} selections)`
            : "N/A"}
        </Text>
        <Text>
          <strong>Applied but Never Selected:</strong> {neverChosenCount} candidate(s)
        </Text>
      </VStack>
    </Box>
  );
};

export default VisualRepresentation;

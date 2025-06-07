// src/components/applications/Visuals/charts/ApplicantSelectionChart.tsx

/**
 * ApplicantSelectionChart.tsx
 *
 * A reusable bar chart component that visualizes how many times each applicant
 * has been selected across all courses.
 *
 * Features:
 * Responsive layout that scales with container size
 * Horizontal X axis with applicant names
 * Vertical Y axis representing count of selections
 * Tooltip on hover
 * Labels showing count directly on bars
 */

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";

interface ApplicantSelectionChartProps {
    data: { name: string; id: string; count: number }[];
}
  

// ApplicantSelectionChart Component
const ApplicantSelectionChart: React.FC<ApplicantSelectionChartProps> = ({ data }) => {
  return (
    // Responsive container ensures chart scales with screen or parent
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        {/* X-axis maps to applicant names */}
        <XAxis dataKey="name" />

        {/* Y-axis maps to count of selections */}
        <YAxis allowDecimals={false} />

        {/* Tooltip displays data on hover */}
        <Tooltip />

        {/* Each bar represents one applicant */}
        <Bar dataKey="count" fill="#3182CE">
          {/* Show count as label on top of bar */}
          <LabelList dataKey="count" position="top" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ApplicantSelectionChart;

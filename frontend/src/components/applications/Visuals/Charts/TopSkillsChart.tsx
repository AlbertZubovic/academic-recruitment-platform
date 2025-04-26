// src/components/applications/Visuals/charts/TopSkillsChart.tsx

/**
 * TopSkillsChart.tsx
 *
 * A vertical bar chart that visualizes the most common skills
 * among selected applicants. Helps lecturers quickly identify
 * top skill sets across all chosen candidates.
 *
 * Features:
 * Vertical bar layout
 * Y axis represents skill names
 * X axis shows frequency
 * Tooltip on hover with exact counts
 * Bar labels for readability
 * Responsive and styled with Recharts
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
  CartesianGrid,
} from "recharts";

interface TopSkillsChartProps {
  data: { skill: string; count: number }[];
}

// TopSkillsChart Component
const TopSkillsChart: React.FC<TopSkillsChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        {/* Grid lines for better readability */}
        <CartesianGrid strokeDasharray="3 3" />

        {/* X axis for frequency values */}
        <XAxis type="number" allowDecimals={false} />

        {/* Y axis for skill names */}
        <YAxis type="category" dataKey="skill" width={120} />

        {/* Tooltip shows details on hover */}
        <Tooltip />

        {/* Each bar is a skill, colored in purple */}
        <Bar dataKey="count" fill="#805AD5">
          <LabelList dataKey="count" position="right" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopSkillsChart;

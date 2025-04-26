// src/components/applications/Visuals/charts/AvailabilityChart.tsx

/**
 * AvailabilityChart.tsx
 *
 * A reusable bar chart component that visualizes the availability
 * of selected applicants.
 * 
 * Features:
 * Responsive layout
 * Vertical Y axis for count, horizontal X axis for availability type
 * Labels displayed on top of each bar
 * Clean and simple styling with Chakra and Recharts
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

interface AvailabilityChartProps {
  data: { type: string; count: number }[];
}

// AvailabilityChart Component
const AvailabilityChart: React.FC<AvailabilityChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        {/* Add light grid lines for clarity */}
        <CartesianGrid strokeDasharray="3 3" />

        {/* X axis for availability types (Full Time, Part Time) */}
        <XAxis dataKey="type" />

        {/* Y axis shows count of applicants for each type */}
        <YAxis allowDecimals={false} />

        {/* Tooltip shows value on hover */}
        <Tooltip />

        {/* Bar represents the number of applicants per availability type */}
        <Bar dataKey="count" fill="#38A169">
          {/* Label on top of each bar showing the count */}
          <LabelList dataKey="count" position="top" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AvailabilityChart;

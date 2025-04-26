// src/components/applications/Controls/SortDropdown.tsx

/**
 * SortDropdown Component
 * A dropdown selector for sorting applicant lists based on different criteria.
 * Options:
 * course       Sort by course name alphabetically (A–Z)
 * availability Sort applicants within courses by availability (Full time first)
 * grouped      Group courses based on applicant volume (High/Medium/Low Demand)
 */

import React from 'react';
import { Select, FormControl, FormLabel } from '@chakra-ui/react';

interface SortDropdownProps {
  onSort: (sortBy: string) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ onSort }) => {
  return (
    <FormControl>
      {/* Descriptive label for context */}
      <FormLabel>Sort Applicants By</FormLabel>
      
      {/* Dropdown select with options mapped to sort criteria */}
      <Select
        onChange={(e) => onSort(e.target.value)}
        defaultValue="course" // Initial sort option
      >
        <option value="course">Course Name (A-Z)</option>
        <option value="availability">Availability (Full Time - Part Time)</option>
        <option value="grouped">Grouped by Course Demand</option>
      </Select>
    </FormControl>
  );
};

export default SortDropdown;

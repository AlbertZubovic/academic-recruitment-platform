// src/components/applications/Controls/SearchBar.tsx

/**
 * SearchBar Component
 * A reusable input component that allows the user to filter applicants 
 * based on search criteria.
 * Features:
 * Controlled input using React useState hook.
 * Real time updates as the user types.
 * Includes Chakra UI styling with labels and spacing for consistent UI.
 */

import React, { useState } from 'react';
import { Input, Box, FormControl, FormLabel } from '@chakra-ui/react';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  // Local state to track the user's input in the search field
  const [searchTerm, setSearchTerm] = useState('');

  // Update searchTerm as user types and notify the parent component
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);      // Update local input state
    onSearch(value);           // Notify parent component with new value
  };

  return (
    <Box mb={4}>
      <FormControl>
        {/* Input label for accessibility and clarity */}
        <FormLabel>Search Applicants</FormLabel>
        <Input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by name, course, availability, or skills"
        />
      </FormControl>
    </Box>
  );
};

export default SearchBar;

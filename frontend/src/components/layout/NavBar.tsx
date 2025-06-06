// src/components/layout/NavBar.tsx

import React from "react";
import {
  Box,
  Wrap,
  WrapItem,
  Button,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/modules/navBar.module.css";

const NavBar: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box className={styles.navBar} bg="blue.500" color="white" p={1}>
      <Wrap spacing={2} justify="left" align="center" h="100%">
        {/* Home link - always visible */}
        <WrapItem>
          <ChakraLink href="/" _hover={{ textDecoration: "none" }}>
            <Button 
              colorScheme="blue" 
              size="sm" 
              bg="blue.500"
              borderRadius={2}
              color="white"
              _hover={{ bg: "blue.400" }}
              _active={{ bg: "blue.600" }}
            >
              Home
            </Button>
          </ChakraLink>
        </WrapItem>

        {/* Candidate-specific link (was "Tutor") */}
        {user?.isCandidate && (
          <WrapItem>
            <ChakraLink href="/candidates" _hover={{ textDecoration: "none" }}>
              <Button 
                colorScheme="blue" 
                size="sm" 
                bg="blue.500"
                borderRadius={2}
                color="white"
                _hover={{ bg: "blue.400" }}
                _active={{ bg: "blue.600" }}
              >
                Opportunities
              </Button>
            </ChakraLink>
          </WrapItem>
        )}

        {/* Lecturer-specific link */}
        {user?.isLecturer && (
          <WrapItem>
            <ChakraLink href="/lecturer/applications" _hover={{ textDecoration: "none" }}>
              <Button 
                colorScheme="blue" 
                bg="blue.500"
                size="sm" 
                borderRadius={2}
                color="white"
                _hover={{ bg: "blue.400" }}
                _active={{ bg: "blue.600" }}
              >
                Applications
              </Button>
            </ChakraLink>
          </WrapItem>
        )}
      </Wrap>
    </Box>
  );
};

export default NavBar;

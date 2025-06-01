// src/components/layout/NavBar.tsx

import React from "react";
import { Box, Wrap, WrapItem, Button, Link as ChakraLink } from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/modules/navBar.module.css";

const NavBar: React.FC = () => {
  const { user, isLoggedIn } = useAuth();

  return (
    <Box className={styles.navBar} bg="blue.500" color="white" p={1}>
      <Wrap spacing={2} justify="left" align="center" h="100%">

        {/* Home link - always visible */}
        <WrapItem>
          <ChakraLink href="/" _hover={{ textDecoration: "none" }}>
            <Button colorScheme="blue" size="sm" borderRadius={8}>
              Home
            </Button>
          </ChakraLink>
        </WrapItem>

        {/* Tutor-specific link */}
        {isLoggedIn && user?.isTutor && (
          <WrapItem>
            <ChakraLink href="/tutors" _hover={{ textDecoration: "none" }}>
              <Button colorScheme="blue" size="sm" borderRadius={8}>
                Opportunities
              </Button>
            </ChakraLink>
          </WrapItem>
        )}

        {/* Lecturer-specific link */}
        {isLoggedIn && user?.isLecturer && (
          <WrapItem>
            <ChakraLink href="/applications" _hover={{ textDecoration: "none" }}>
              <Button colorScheme="blue" size="sm" borderRadius={8}>
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

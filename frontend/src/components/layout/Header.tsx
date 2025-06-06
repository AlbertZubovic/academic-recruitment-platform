// src/components/layout/Header.tsx

import React from "react";
import { Text, IconButton, Tooltip, useColorMode, HStack } from "@chakra-ui/react";
import { FaGraduationCap } from "react-icons/fa";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";

import AuthButton from "../auth/AuthButton";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/modules/header.module.css";

const Header: React.FC = () => {
  const { loading } = useAuth();
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();

  if (loading) return null;

  const goToLanding = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/");
  };

  return (
    <header className={styles.header}>
      {/* Logo and Title */}
      <a
        href="/landing"
        className={styles.logoTitle}
        onClick={goToLanding}
      >
        <div className={styles.logo}>
          <FaGraduationCap />
        </div>
        <Text className={styles.title}>TeachTeam</Text>
      </a>

      {/* Auth buttons and Dark Mode Toggle */}
      <div className={styles.authButton}>
        <HStack spacing={2}>
          {/* Dark Mode Toggle */}
          <Tooltip
            label={colorMode === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            <IconButton
              aria-label="Toggle dark mode"
              icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              size="md"
              variant="ghost"
              colorScheme={colorMode === "light" ? "whiteAlpha" : "yellow"}
              color={colorMode === "light" ? "white" : "yellow.300"}
            />
          </Tooltip>
          <AuthButton />
        </HStack>
      </div>
    </header>
  );
};

export default Header;

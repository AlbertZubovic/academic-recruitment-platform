// src/components/layout/header.tsx

/**
 * Header Component
 * Displays the top heading bar across the site.
 * Includes:
 * App logo (links to homepage)
 * Auth buttons (Sign In / Sign Up or Logout)
 *
 * Uses Chakra UI for consistent styling and FontAwesome for the icon.
 * Visibility depends on AuthContext loading state.
 */

import React from "react";
import Link from "next/link";
import { Text } from "@chakra-ui/react";
import { FaGraduationCap } from "react-icons/fa";

import AuthButton from "../auth/AuthButton";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/modules/header.module.css";

const Header: React.FC = () => {
  const { loading } = useAuth();

  // Avoid rendering header while auth is still loading
  if (loading) return null;

  return (
    <header className={styles.header}>
      {/* Logo and Title */}
      <Link href="/" passHref legacyBehavior>
        <a className={styles.logoTitle}>
          <div className={styles.logo}>
            <FaGraduationCap />
          </div>
          <Text className={styles.title}>TeachTeam</Text>
        </a>
      </Link>

      {/* Auth buttons */}
      <div className={styles.authButton}>
        <AuthButton />
      </div>
    </header>
  );
};

export default Header;

// src/components/layout/Header.tsx

import React from "react";
import Link from "next/link";
import { Text } from "@chakra-ui/react";
import { FaGraduationCap } from "react-icons/fa";
import { useRouter } from "next/router";

import AuthButton from "../auth/AuthButton";
import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/modules/header.module.css";

const Header: React.FC = () => {
  const { loading } = useAuth();
  const router = useRouter();

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

      {/* Auth buttons */}
      <div className={styles.authButton}>
        <AuthButton />
      </div>
    </header>
  );
};

export default Header;

// src/components/layout/footer.tsx

import React from "react";
import { FaGithub, FaChalkboardTeacher } from "react-icons/fa";
import styles from "@/styles/modules/footer.module.css";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.leftSection}>
        <FaChalkboardTeacher className={styles.icon} />
        <span>Albert Zubovic, Andrew Goode</span>
      </div>
      <div className={styles.linkContainer}>
        <FaGithub className={styles.icon} />
        <a
          href="https://github.com/rmit-fsd-2025-s1/s4007755-s3832786-a2"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub Repository
        </a>
      </div>
    </footer>
  );
};

export default Footer;

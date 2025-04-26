// pages/tutor.tsx

/**
 * Tutor Page
 * Displays the tutor application form and details component.
 * This page is rendered for users with the Tutor role.
 */

import React from "react";
import TutorDetailsPage from "@/components/tutors/TutorDetailsPage";

export default function Tutor() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <div className="pageBackground" style={{ flex: 1 }}>
        <TutorDetailsPage />
      </div>
    </div>
  );
}

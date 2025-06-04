// pages/candidate-details.tsx

/**
 * Candidate Details Page
 * Displays the candidate’s profile form and details component.
 * This page is intended for users with the Candidate role.
 */

import React from "react";
import CandidateDetailsPage from "@/components/candidates/CandidateDetailsPage";

export default function CandidateDetails() {
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
        <CandidateDetailsPage />
      </div>
    </div>
  );
}

// pages/candidates.tsx

/**
 * Candidate Page
 * Displays the candidate interface for applying to roles.
 * Only visible to users with the Candidate role.
 */

import React from "react";
import CandidatePage from "@/components/candidates/CandidatePage";

const Candidates = () => {
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
        <CandidatePage />
      </div>
    </div>
  );
};

export default Candidates;

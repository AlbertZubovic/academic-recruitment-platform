// pages/tutors.tsx

/**
 * Tutor Page
 * Displays the tutor interface for applying to roles.
 * Only visible to users with the Tutor role.
 */

import React from "react";
import TutorPage from "@/components/tutors/TutorPage";

const Tutor = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div className="pageBackground" style={{ flex: 1 }}>
        <TutorPage />
      </div>
    </div>
  );
};

export default Tutor;

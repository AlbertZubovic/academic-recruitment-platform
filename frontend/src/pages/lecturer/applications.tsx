// pages/applications.tsx

/**
 * Applications Page
 * Displays the list of tutor applicants to the lecturer.
 * Allows sorting, searching, ranking, and commenting.
 * Only visible to users with the Lecturer role.
 */

import React from "react";
import ApplicationPage from "@/components/applications/ApplicationPage";

export default function Applications() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div className="pageBackground" style={{ flex: 1 }}>
        <ApplicationPage />
      </div>
    </div>
  );
}

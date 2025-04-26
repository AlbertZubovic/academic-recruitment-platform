// pages/index.tsx

/**
 * Home Page
 * This is the landing page of the application.
 * It displays key information about TeachTeam.
 */

import React from 'react';
import LandingPage from '@/components/LandingPage';

export default function Home() {
  return (
    <div className="pageBackground" style={{ flex: 1 }}>
      <LandingPage />
    </div>
  );
}

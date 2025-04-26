// src/components/layout/layout.tsx

/**
 * Layout Component
 * Provides the global layout wrapper used across all pages.
 * Includes:
 * Header
 * Conditional NavBar (only for logged-in users)
 * Page content container
 * Footer
 *
 * Usage:
 * Wraps every page through _app.tsx to ensure a consistent structure.
 */

import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import NavBar from './NavBar';
import { useAuth } from "@/context/AuthContext";

interface LayoutProps {
  Component: React.ElementType;
  pageProps: Record<string, unknown>;
}

// The Layout component wraps page content, receives Component & pageProps from _app.tsx
const Layout: React.FC<LayoutProps> = ({ Component, pageProps}) => {
  const { isLoggedIn, user } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      {/* Global header */}
      <Header />

      {/* Show navigation bar only when user is logged in */}
      {isLoggedIn && <NavBar user={user} />}

      {/* Page-specific content */}
      <div className="pageBackground" style={{ flex: 1 }}>
        <Component {...pageProps} />
      </div>

      {/* Global footer */}
      <Footer />
    </div>
  );
};

export default Layout;

// src/components/layout/Layout.tsx

import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import NavBar from "./NavBar";
import { useAuth } from "@/context/AuthContext";

interface LayoutProps {
  Component: React.ElementType;
  pageProps: Record<string, unknown>;
}

const Layout: React.FC<LayoutProps> = ({ Component, pageProps }) => {
  const { user } = useAuth();
  const isLoggedIn = !!user;

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
      {isLoggedIn && <NavBar />}

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

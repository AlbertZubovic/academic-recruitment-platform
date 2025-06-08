// src/components/layout/Layout.tsx

import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import NavBar from "./NavBar";
import { useAuth } from "@/context/AuthContext";
import BlockedUserModal from "../auth/BlockedUserModal";

interface LayoutProps {
  Component: React.ElementType;
  pageProps: Record<string, unknown>;
}

const Layout: React.FC<LayoutProps> = ({ Component, pageProps }) => {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const isBlocked = user?.isBlocked || false;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      {/* Blocked user modal - shows when user is logged in but blocked */}
      <BlockedUserModal isOpen={isLoggedIn && isBlocked} />

      {/* Global header */}
      <Header />

      {/* Show navigation bar only when user is logged in and not blocked */}
      {isLoggedIn && !isBlocked && <NavBar />}

      {/* Page-specific content */}
      <div className="pageBackground" style={{ flex: 1 }}>
        {/* Only render page content if user is not blocked */}
        {!isBlocked && <Component {...pageProps} />}
        
        {/* Show message when blocked user tries to access content */}
        {isLoggedIn && isBlocked && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            padding: '2rem'
          }}>
            <div style={{ textAlign: 'center', color: '#666' }}>
              <p>Please complete the account verification process.</p>
            </div>
          </div>
        )}
      </div>

      {/* Global footer */}
      <Footer />
    </div>
  );
};

export default Layout;

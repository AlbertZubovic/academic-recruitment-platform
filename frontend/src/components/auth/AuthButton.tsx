// src/components/auth/authButton.tsx

/**
 * AuthButton Component
 * Displays authentication-related buttons based on login status:
 * If logged in shows Logout button.
 * If logged out shows Sign In and Sign Up buttons.
 * 
 * Handles routing and logout via AuthContext.
 * Uses Chakra UI for styling and toast notifications.
 */

import React from "react";
import { useRouter } from "next/router";
import { Button, ButtonGroup, useToast } from "@chakra-ui/react";
import { FaUnlock } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

// Component definition
const AuthButton: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const { isLoggedIn, logout } = useAuth();

  
  // Handles logout logic and feedback
  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "bottom",
    });

    setTimeout(() => {
      logout();
      router.push("/");
    }, 1200);
  };

  // Redirects to sign in page
  const handleSignIn = () => {
    router.push("/signin");
  };

  // Redirects to sign up page
  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <div className="authButton">
      {isLoggedIn ? (
        <Button
          colorScheme="blue"
          leftIcon={<FaUnlock />}
          onClick={handleLogout}
          aria-label="Logout"
        >
          Logout
        </Button>
      ) : (
        <ButtonGroup spacing={4}>
          <Button colorScheme="blue" onClick={handleSignIn} aria-label="Sign In">
            Sign In
          </Button>
          <Button variant="outline" colorScheme="blue" onClick={handleSignUp} aria-label="Sign Up">
            Sign Up
          </Button>
        </ButtonGroup>
      )}
    </div>
  );
};

export default AuthButton;

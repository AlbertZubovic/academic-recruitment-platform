// src/components/auth/AuthButton.tsx

import React from "react";
import { useRouter } from "next/router";
import { Button, ButtonGroup, useToast } from "@chakra-ui/react";
import { FaUnlock } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

const AuthButton: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const { user, signOut, loading } = useAuth();

  const isLoggedIn = !!user;

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });
      router.push("/");
    } catch (err) {
    }
  };

  const handleSignIn = () => {
    router.push("/signin");
  };

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
          isLoading={loading}
          aria-label="Logout"
        >
          Logout
        </Button>
      ) : (
        <ButtonGroup spacing={4}>
          <Button
            colorScheme="blue"
            onClick={handleSignIn}
            isDisabled={loading}
            aria-label="Sign In"
          >
            Sign In
          </Button>
          <Button
            variant="outline"
            colorScheme="blue"
            onClick={handleSignUp}
            isDisabled={loading}
            aria-label="Sign Up"
          >
            Sign Up
          </Button>
        </ButtonGroup>
      )}
    </div>
  );
};

export default AuthButton;

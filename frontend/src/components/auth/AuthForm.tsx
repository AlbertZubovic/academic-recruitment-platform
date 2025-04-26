// src/components/auth/AuthForm.tsx

// Password strength check disabled during login since users are pre-created
// Code kept for demonstration purposes
//
// if (type === "signin" && !isStrongPassword(password)) {
//   toast({
//     title: "Weak Password",
//     description: "Your password appears weak. Consider using a stronger one.",
//     status: "warning",
//     duration: 3000,
//     isClosable: true,
//     position: "bottom",
//   });
// }

/**
 * AuthForm Component:
 * 
 * This component handles both Sign In and Sign Up views.
 * Displays a form to collect user email and password.
 * Validates input, especially enforcing strong password during sign up.
 * For sign in, checks credentials using the login method from AuthContext.
 * Shows toast notifications for success, failure, or validation issues.
 * Redirects user on successful login.
 **/

import React, { useState } from "react";
import { Link } from "@chakra-ui/react";
import { Box, Button, FormControl, FormLabel, Heading, Input, useToast, VStack, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { useAuth } from "@/context/AuthContext";

// props interface - signin or signup
interface AuthFormProps {
  type: "signin" | "signup";
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();
  const { login } = useAuth();
  const router = useRouter();

  // Password strength validation
  // Requires 8+ characters, uppercase letter, and number
  const isStrongPassword = (pwd: string) =>
    /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(pwd);

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!email || !password) {
      toast({
        title: "Missing Fields",
        description: "All fields are required.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    // Validate password for signup
    if (type === "signup" && !isStrongPassword(password)) {
      toast({
        title: "Weak Password",
        description:
          "Password must be at least 8 characters, include an uppercase letter and a number.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    setIsLoading(true);

    // Add small delay for UX
    setTimeout(() => {
      if (type === "signin") {
        const success = login(email, password);

        if (success) {
          toast({
            title: "Success",
            description: "Login successful!",
            status: "success",
            duration: 2500,
            isClosable: true,
            position: "bottom",
          });

          // Reset form fields
          setEmail("");
          setPassword("");

          // Redirect to homepage
          setTimeout(() => {
            router.push("/");
          }, 1200);
        } else {
          toast({
            title: "Login Failed",
            description: "Incorrect email or password.",
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "bottom",
          });
        }
      } else {
        // Signup not implemented
        toast({
          title: "Coming Soon",
          description: "Sign-up will be implemented in Assignment 2.",
          status: "info",
          duration: 3000,
          isClosable: true,
          position: "bottom",
        });
      }

      setIsLoading(false);
    }, 500);
  };

  return (
    <Box
      minH="90vh"
      bgGradient="linear(to-r, blue.50, blue.100)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <Box maxW="md" w="100%" p={8} bg="white" boxShadow="lg" borderRadius="xl">
        {/* Heading section */}
        <Box textAlign="center" mb={4}>
          <Heading size="lg" color="blue.600">
            {type === "signin" ? "Welcome Back" : "Create Your Account"}
          </Heading>
          <Text fontSize="sm" color="gray.500">
            {type === "signin"
              ? "Enter your credentials to continue"
              : "Sign up to get started"}
          </Text>
        </Box>

        {/* Auth form */}
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            {/* Email field */}
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                _hover={{ borderColor: "blue.400" }}
                focusBorderColor="blue.500"
              />
            </FormControl>

            {/* Password field */}
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                _hover={{ borderColor: "blue.400" }}
                focusBorderColor="blue.500"
              />
            </FormControl>

            {/* Submit button */}
            <Button
              type="submit"
              isLoading={isLoading}
              colorScheme="blue"
              width="100%"
              borderRadius="md"
              fontWeight="bold"
            >
              {type === "signin" ? "Sign In" : "Sign Up"}
            </Button>

            {/* Link to signup */}
            {type === "signin" && (
              <Text fontSize="sm">
                Need an account?{" "}
                <NextLink href="/signup" passHref legacyBehavior>
                  <Link color="blue.500" fontWeight="semibold">
                    Sign up
                  </Link>
                </NextLink>
              </Text>
            )}
          </VStack>
        </form>
      </Box>
    </Box>
  );
};

export default AuthForm;

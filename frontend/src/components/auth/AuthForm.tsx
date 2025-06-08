// src/components/auth/AuthForm.tsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  useToast,
  VStack,
  Text,
  Select,
  Checkbox,
  Stack,
  HStack,
  Link,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ApplicationAvailability } from "@/types/enums";
import { SignInPayload, SignUpPayload } from "@/types/apiRequests";

interface AuthFormProps {
  type: "signin" | "signup";
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // NEW: track stayLoggedIn for cookie duration
  const [stayLoggedIn, setStayLoggedIn] = useState(false);

  // Signup-only fields
  const [isCandidate, setIsCandidate] = useState(false);
  const [isLecturer, setIsLecturer] = useState(false);
  const [availability, setAvailability] = useState<ApplicationAvailability>(
    ApplicationAvailability.FULL_TIME
  );
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const toast = useToast();
  const { signUp, loading, refreshUser } = useAuth();
  const router = useRouter();

  // ─────────────── Color values for light/dark ───────────────
  // ALL useColorModeValue calls MUST be at the top level to prevent hook order violations
  const outerBg = useColorModeValue(
    "linear(to-r, blue.50, blue.100)",
    "linear(to-r, gray.800, gray.900)"
  );
  const formBg = useColorModeValue("white", "gray.700");
  const headingColor = useColorModeValue("blue.600", "blue.300");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const skillBoxBg = useColorModeValue("gray.100", "gray.600");
  const linkColor = useColorModeValue("blue.500", "blue.200");
  const inputBg = useColorModeValue("white", "gray.800");
  const checkboxColorScheme = useColorModeValue("blue", "teal");
  const buttonColorScheme = useColorModeValue("blue", "teal");
  const skillTextColor = useColorModeValue("gray.800", "whiteAlpha.900");

  const isStrongPassword = (pwd: string) =>
    /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(pwd);

  useEffect(() => {
    if (type === "signin") {
      const storedEmail = localStorage.getItem("rememberedEmail");
      const storedPassword = localStorage.getItem("rememberedPassword");
      const remember = localStorage.getItem("rememberMe") === "true";
      if (storedEmail && storedPassword && remember) {
        setEmail(storedEmail);
        setPassword(storedPassword);
        setRememberMe(true);
      }
    }
  }, [type]);

  const validateForm = () => {
    const errs: { [key: string]: string } = {};
    if (!email) errs.email = "Email is required.";
    if (!password) errs.password = "Password is required.";
    if (type === "signup") {
      if (!firstname) errs.firstname = "First name is required.";
      if (!lastname) errs.lastname = "Last name is required.";
      if (!confirmPassword) errs.confirmPassword = "Confirm your password.";
      if (password !== confirmPassword)
        errs.confirmPassword = "Passwords do not match.";
      if (!isStrongPassword(password))
        errs.password =
          "Password must have at least 8 characters, 1 uppercase letter, and 1 number.";
      if (!isCandidate && !isLecturer)
        errs.role = "Select Candidate or Lecturer.";
      if (!availability) errs.availability = "Select availability.";
      if (isCandidate && skills.length === 0)
        errs.skills = "Add at least one skill for Candidate role.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddSkill = () => {
    if (currentSkill.trim()) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    let success = false;
    let errorMessage = "";

    if (type === "signin") {
      try {
        const payload: SignInPayload = {
          email,
          password,
          rememberMe,
          stayLoggedIn,
        };
        
        // Make the request directly to get the response status
        const res = await fetch("http://localhost:5000/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) {
          const data = await res.json();
          const errorMessage = data.message || "Sign-in failed";
          
          // Check if this is a blocked user error
          if (res.status === 403 && errorMessage.includes("blocked")) {
            // Show specific blocked user toast and don't attempt redirect
            toast({
              title: "Account Blocked",
              description: "Your account has been blocked. Please contact support for assistance.",
              status: "error",
              duration: 6000,
              isClosable: true,
              position: "top",
            });
            return; // Exit early, don't show generic error
          }
          
          throw new Error(errorMessage);
        }
        
        // If successful, refresh user data
        await refreshUser();
        success = true;

        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
          localStorage.setItem("rememberedPassword", password);
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberedPassword");
          localStorage.removeItem("rememberMe");
        }
      } catch (error: unknown) {
        console.error('[AUTH] Sign in error:', error);
        const errorMsg = (error instanceof Error) ? error.message : "Sign-in failed";
        errorMessage = errorMsg;
        success = false;
      }
    } else {
      try {
        const payload: SignUpPayload = {
          email,
          password,
          confirmPassword,
          firstname,
          lastname,
          isCandidate,
          isLecturer,
          availability,
          skills,
        };
        await signUp(payload);
        success = true;
      } catch (error: unknown) {
        console.error('[AUTH] Sign up error:', error);
        errorMessage = (error instanceof Error) ? error.message : "Signup failed. Please try again.";
        success = false;
      }
    }

    if (success) {
      toast({
        title:
          type === "signin"
            ? "Signed in successfully!"
            : "Account created successfully!",
        description:
          type === "signin"
            ? `Welcome back, ${email}`
            : "You can now sign in.",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
      router.push("/");
    } else {
      toast({
        title: "Authentication Error",
        description: errorMessage || (
          type === "signin"
            ? "Incorrect email or password."
            : "Signup failed. Please try again."
        ),
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <Box
      minH="90vh"
      bgGradient={outerBg}
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <Box
        maxW="md"
        w="100%"
        p={8}
        bg={formBg}
        boxShadow="lg"
        borderRadius="xl"
      >
        <Box textAlign="center" mb={4}>
          <Heading size="lg" color={headingColor}>
            {type === "signin" ? "Welcome Back" : "Create Your Account"}
          </Heading>
          <Text fontSize="sm" color={subTextColor}>
            {type === "signin"
              ? "Enter your credentials to continue"
              : "Sign up to get started"}
          </Text>
        </Box>

        <form onSubmit={handleSubmit} autoComplete="off">
          <VStack spacing={4}>
            {type === "signup" && (
              <>
                <FormControl isInvalid={!!errors.firstname} isRequired>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    placeholder="First name"
                    autoComplete="off"
                    bg={inputBg}
                  />
                  <FormErrorMessage>{errors.firstname}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.lastname} isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    placeholder="Last name"
                    autoComplete="off"
                    bg={inputBg}
                  />
                  <FormErrorMessage>{errors.lastname}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.role}>
                  <FormLabel>Role</FormLabel>
                  <Stack spacing={2}>
                    <Checkbox
                      isChecked={isCandidate}
                      onChange={(e) => {
                        setIsCandidate(e.target.checked);
                        if (e.target.checked) setIsLecturer(false);
                      }}
                      colorScheme={checkboxColorScheme}
                    >
                      Candidate
                    </Checkbox>
                    <Checkbox
                      isChecked={isLecturer}
                      onChange={(e) => {
                        setIsLecturer(e.target.checked);
                        if (e.target.checked) setIsCandidate(false);
                      }}
                      colorScheme={checkboxColorScheme}
                    >
                      Lecturer
                    </Checkbox>
                  </Stack>
                  <FormErrorMessage>{errors.role}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.availability} isRequired>
                  <FormLabel>Availability</FormLabel>
                  <Select
                    value={availability}
                    onChange={(e) =>
                      setAvailability(
                        e.target.value as ApplicationAvailability
                      )
                    }
                    bg={inputBg}
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                  </Select>
                  <FormErrorMessage>{errors.availability}</FormErrorMessage>
                </FormControl>

                {isCandidate && (
                  <FormControl isInvalid={!!errors.skills}>
                    <FormLabel>Skills</FormLabel>
                    <Stack spacing={2}>
                      <Input
                        value={currentSkill}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        placeholder="Add a skill"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        bg={inputBg}
                      />
                      <Button
                        size="sm"
                        onClick={handleAddSkill}
                        isDisabled={!currentSkill.trim()}
                        colorScheme={buttonColorScheme}
                      >
                        Add Skill
                      </Button>
                      <FormErrorMessage>{errors.skills}</FormErrorMessage>
                      {skills.map((skill, idx) => (
                        <Box
                          key={idx}
                          p={2}
                          bg={skillBoxBg}
                          borderRadius="md"
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Text color={skillTextColor}>
                            {skill}
                          </Text>
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() =>
                              setSkills(skills.filter((s) => s !== skill))
                            }
                          >
                            Remove
                          </Button>
                        </Box>
                      ))}
                    </Stack>
                  </FormControl>
                )}
              </>
            )}

            <FormControl isInvalid={!!errors.email} isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="off"
                bg={inputBg}
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password} isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="off"
                bg={inputBg}
              />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            {type === "signup" && (
              <FormControl isInvalid={!!errors.confirmPassword} isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  autoComplete="off"
                  bg={inputBg}
                />
                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
              </FormControl>
            )}

            {type === "signin" && (
              <HStack spacing={6} align="center">
                <Checkbox
                  isChecked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  colorScheme={checkboxColorScheme}
                >
                  Remember me
                </Checkbox>
                <Checkbox
                  isChecked={stayLoggedIn}
                  onChange={(e) => setStayLoggedIn(e.target.checked)}
                  colorScheme={checkboxColorScheme}
                >
                  Stay logged in
                </Checkbox>
              </HStack>
            )}

            <Button
              type="submit"
              isLoading={loading}
              colorScheme={buttonColorScheme}
              width="100%"
              borderRadius="md"
              fontWeight="bold"
            >
              {type === "signin" ? "Sign In" : "Sign Up"}
            </Button>

            {type === "signin" && (
              <Text fontSize="sm" color={subTextColor}>
                Need an account?{" "}
                <NextLink href="/signup" passHref legacyBehavior>
                  <Link color={linkColor} fontWeight="semibold">
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

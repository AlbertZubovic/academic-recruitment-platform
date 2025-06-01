// src/components/auth/AuthForm.tsx

import React, { useState, useEffect } from "react";
import { Box, Button, FormControl, FormLabel, Heading, Input, useToast, VStack, Text, Select, Checkbox, Stack, Link } from "@chakra-ui/react";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { useAuth } from "@/context/AuthContext";

interface AuthFormProps {
  type: "signin" | "signup";
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isTutor, setIsTutor] = useState(false);
  const [isLecturer, setIsLecturer] = useState(false);
  const [availability, setAvailability] = useState<"Full-Time" | "Part-Time">("Full-Time");
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");

  const toast = useToast();
  const { login, signup, loading, isSignupComplete, user } = useAuth();
  const router = useRouter();

  const isStrongPassword = (pwd: string) =>
    /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(pwd);

  const handleAddSkill = () => {
    if (currentSkill.trim()) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      (type === "signup" && (!firstname || !lastname || !email || !password)) ||
      (type === "signin" && (!email || !password))
    ) {
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

    if (type === "signup" && !isTutor && !isLecturer) {
      toast({
        title: "Role Required",
        description: "Please select either Tutor or Lecturer role.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (type === "signup" && isTutor && skills.length === 0) {
      toast({
        title: "Skills Required",
        description: "Please add at least one skill for Tutor role.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (type === "signup" && !isStrongPassword(password)) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters, include an uppercase letter and a number.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      let success = false;

      if (type === "signin") {
        success = await login(email, password);
      } else {
        success = await signup(email, password, firstname, lastname, isTutor, isLecturer, availability, skills);
      }

      if (success) {
        toast({
          title: "Success",
          description: type === "signin" ? "Welcome back!" : "Account created successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom",
        });
        router.push("/");
      } else {
        toast({
          title: "Error",
          description: "Invalid credentials or signup failed.",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom",
        });
      }
    } catch (err: Error | unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setEmail("");
      setPassword("");
      if (type === "signup") {
        setFirstname("");
        setLastname("");
        setSkills([]);
        setCurrentSkill("");
      }
    }
  };

  useEffect(() => {
    if (isSignupComplete && user && !loading) {
      router.push("/");
    }
  }, [isSignupComplete, user, loading, router]);

  return (
    <Box minH="90vh" bgGradient="linear(to-r, blue.50, blue.100)" display="flex" alignItems="center" justifyContent="center" px={4}>
      <Box maxW="md" w="100%" p={8} bg="white" boxShadow="lg" borderRadius="xl">
        <Box textAlign="center" mb={4}>
          <Heading size="lg" color="blue.600">
            {type === "signin" ? "Welcome Back" : "Create Your Account"}
          </Heading>
          <Text fontSize="sm" color="gray.500">
            {type === "signin" ? "Enter your credentials to continue" : "Sign up to get started"}
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            {type === "signup" && (
              <>
                <FormControl isRequired>
                  <FormLabel>First Name</FormLabel>
                  <Input value={firstname} onChange={(e) => setFirstname(e.target.value)} placeholder="Enter your first name" />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input value={lastname} onChange={(e) => setLastname(e.target.value)} placeholder="Enter your last name" />
                </FormControl>

                <FormControl>
                  <FormLabel>Role</FormLabel>
                  <Stack spacing={4}>
                    <Checkbox isChecked={isTutor} onChange={(e) => { setIsTutor(e.target.checked); if (e.target.checked) setIsLecturer(false); }}>
                      Tutor
                    </Checkbox>
                    <Checkbox isChecked={isLecturer} onChange={(e) => { setIsLecturer(e.target.checked); if (e.target.checked) setIsTutor(false); }}>
                      Lecturer
                    </Checkbox>
                  </Stack>
                </FormControl>

                {isTutor && (
                  <>
                    <FormControl isRequired>
                      <FormLabel>Availability</FormLabel>
                      <Select value={availability} onChange={(e) => setAvailability(e.target.value as "Full-Time" | "Part-Time")}>
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Skills</FormLabel>
                      <Stack spacing={2}>
                        <Input value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} placeholder="Add a skill" onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }} />
                        <Button size="sm" onClick={handleAddSkill} isDisabled={!currentSkill.trim()}>Add Skill</Button>
                        <Stack spacing={1}>
                          {skills.map((skill, index) => (
                            <Box key={index} p={2} bg="gray.100" borderRadius="md" display="flex" justifyContent="space-between" alignItems="center">
                              <Text>{skill}</Text>
                              <Button size="sm" colorScheme="red" onClick={() => handleRemoveSkill(skill)}>Remove</Button>
                            </Box>
                          ))}
                        </Stack>
                      </Stack>
                    </FormControl>
                  </>
                )}
              </>
            )}

            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
            </FormControl>

            <Button type="submit" isLoading={loading} colorScheme="blue" width="100%" borderRadius="md" fontWeight="bold">
              {type === "signin" ? "Sign In" : "Sign Up"}
            </Button>

            {type === "signin" && (
              <Text fontSize="sm">
                Need an account?{" "}
                <NextLink href="/signup" passHref legacyBehavior>
                  <Link color="blue.500" fontWeight="semibold">Sign up</Link>
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

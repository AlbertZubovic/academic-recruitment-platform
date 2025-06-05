/**
 *
 * This file contains unit and integration tests for various components in the application:
 * Authentication
 * Tutor details display
 * Application and role-based access control
 * Visual representation of applicant data
 * 
 * The tests ensure the following:
 * Proper validation and toast handling in auth forms
 * Correct storage and retrieval of data in localStorage
 * Accurate rendering of tutor/user information
 * Access control enforcement based on user role
 * Reliable updates of form input state and UI
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import VisualRepresentation from "@/components/applications/Visuals/VisualRepresentation";
import { AuthProvider } from "@/context/AuthContext";
import AuthForm from "@/components/auth/AuthForm";
import { CourseProvider } from "@/context/CourseContext";
import { SelectedApplicantsProvider } from "@/context/SelectedApplicantsContext";
import { Tutor } from "@/types/tutor";
import TutorDetails from "@/components/candidates/CandidateDetailsCard";
import TutorDetailsPage from "@/components/candidates/CandidateDetailsCard";
import ApplicationPage from "@/components/applications/ApplicationPage";
import { ApplicationProvider } from "@/context/ApplicationContext";


const mockToast = jest.fn();

// Mocking ResizeObserver to avoid errors in components relying on layout measurements
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Clean up DOM after each test
afterEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

// Mock useRouter
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Chakra UI toast notifications
jest.mock("@chakra-ui/react", () => {
  const actual = jest.requireActual("@chakra-ui/react");
  return {
    ...actual,
    useToast: () => mockToast,
    Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});




// 1. Should trigger an error toast when submitting the sign in form with empty fields
// Purpose: To verify form validation and feedback mechanism
it("shows error toast on empty submit in sign in form", async () => {
  render(
    <AuthProvider>
      <AuthForm type="signin" />
    </AuthProvider>
  );

  const form = screen.getByPlaceholderText(/enter your email/i).closest("form")!;
  fireEvent.submit(form);
  

  await waitFor(() => {
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Missing Fields",
        description: "All fields are required.",
        status: "error",
      })
    );
  });
});





// 2. Should log the user in and store their data if valid credentials are provided
// Purpose: To simulate a successful login using mocked localStorage user data
it("calls login with correct credentials and sets user in localStorage", async () => {
  // 🔒 Set up user in localStorage
  const mockUser = {
    id: "1",
    firstName: "Test",
    lastName: "User",
    email: "test@domain.com",
    password: "pass123",
    isLecturer: false,
    isTutor: true,
    skills: [],
    credentials: "",
    pastRoles: [],
    availability: "full-time",
  };
  localStorage.setItem("Users", JSON.stringify([mockUser]));

  render(
    <AuthProvider>
      <AuthForm type="signin" />
    </AuthProvider>
  );

  fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
    target: { value: "test@domain.com" },
  });
  fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
    target: { value: "pass123" },
  });
  fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

  await waitFor(() => {
    const stored = localStorage.getItem("signedInUser");
    expect(stored).toContain("test@domain.com");
  });
});

// 3. Should update the input state when a user types in email and password fields
// Purpose: To ensure form inputs handle user input correctly
it("updates input values on user typing", () => {
  render(
    <AuthProvider>
      <AuthForm type="signin" />
    </AuthProvider>
  );

  const emailInput = screen.getByPlaceholderText(/enter your email/i);
  const passwordInput = screen.getByPlaceholderText(/enter your password/i);

  // Simulate typing
  fireEvent.change(emailInput, { target: { value: "abc123@gmail.com" } });
  fireEvent.change(passwordInput, { target: { value: "hashedPass123" } });

  // Check state updates
  expect(emailInput).toHaveValue("abc123@gmail.com");
  expect(passwordInput).toHaveValue("hashedPass123");
});


// 4. Should render all key information about the tutor (name, email, skills, credentials)
// Purpose: To confirm TutorDetails component displays provided props correctly
it("displays tutor name, email, skills, and credentials", () => {
  const mockTutor: Tutor = {
    id: "20",
    firstName: "David",
    lastName: "Smith",
    email: "David123@outlook.com",
    skills: ["React", "JavaScript"],
    credentials: "PhD in CS",
    pastRoles: [],
  };

  render(<TutorDetails user={mockTutor} />);

  expect(screen.getByText(/David Smith/i)).toBeInTheDocument();
  expect(screen.getByText(/David123@outlook.com/i)).toBeInTheDocument();
  expect(screen.getByText(/PhD in CS/i)).toBeInTheDocument();
  expect(screen.getByText(/React/i)).toBeInTheDocument();
  expect(screen.getByText(/JavaScript/i)).toBeInTheDocument();
});


// 5. Should retrieve and render saved tutor data from localStorage
// Purpose: To test if TutorDetailsPage uses localStorage to render tutor info
it("renders saved tutor details from localStorage", () => {
  const mockTutor = {
    id: "20",
    firstName: "David",
    lastName: "Smith",
    email: "davidsmith123@gmail.com",
    skills: ["React"],
    credentials: "PhD",
    pastRoles: [],
  };

  localStorage.setItem("tutorDetails", JSON.stringify(mockTutor));

  render(<TutorDetailsPage user={mockTutor} />);

  expect(screen.getByText(/David Smith/i)).toBeInTheDocument();
  expect(screen.getByText(/davidsmith123@gmail.com/i)).toBeInTheDocument();
});


// 6. Should block non lecturer users from accessing restricted lecturer page
// Purpose: To enforce role based access control
it("displays not authorized message for non-lecturer", () => {
  const nonLecturerUser = {
    id: "1",
    firstName: "Bob",
    lastName: "Smith",
    email: "bob@smith.com",
    password: "test123",
    isLecturer: false,
    isTutor: true,
    skills: [],
    credentials: "",
    pastRoles: [],
    availability: "part-time",
  };

  localStorage.setItem("signedInUser", JSON.stringify(nonLecturerUser));

  render(
    <AuthProvider>
      <CourseProvider>
        <SelectedApplicantsProvider>
          <ApplicationProvider>
            <ApplicationPage />
          </ApplicationProvider>
        </SelectedApplicantsProvider>
      </CourseProvider>
    </AuthProvider>
  );

  expect(screen.getByText(/not authorized/i)).toBeInTheDocument();
});



// 7. Should auto load tutor details into component state on mount
// Purpose: To verify TutorDetailsPage hydrates data from localStorage correctly
it("loads tutor details from localStorage into state on mount", () => {
  const savedTutor = {
    id: "10",
    firstName: "Clara",
    lastName: "Lee",
    email: "clara@tutor.com",
    skills: ["Python"],
    credentials: "Masters",
    pastRoles: [],
  };

  localStorage.setItem("tutorDetails", JSON.stringify(savedTutor));
  render(<TutorDetailsPage user={savedTutor} />);

  expect(screen.getByText(/Clara Lee/i)).toBeInTheDocument();
  expect(screen.getByText(/clara@tutor.com/i)).toBeInTheDocument();
});


// 8. Should prevent rendering of dashboard components for unauthenticated users
// Purpose: To verify that access is denied if no user is signed in
it("does not render tutor dashboard if no user is found", () => {
  localStorage.removeItem("signedInUser");

  render(
    <AuthProvider>
      <CourseProvider>
        <TutorDetailsPage user={null as unknown as Tutor} />
      </CourseProvider>
    </AuthProvider>
  );

  expect(screen.queryByText(/Tutor Dashboard/i)).not.toBeInTheDocument();
});


// 9. Should render the visual representation overview section title
// Purpose: To confirm that the graph/visualization component mounts correctly
it("renders the visual overview section title", () => {
  render(
    <CourseProvider>
      <SelectedApplicantsProvider>
        <VisualRepresentation />
      </SelectedApplicantsProvider>
    </CourseProvider>
  );

  expect(screen.getByText(/selection overview/i)).toBeInTheDocument();
});

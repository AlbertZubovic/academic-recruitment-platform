// src/context/AuthContext.tsx

// Authentication context provider
// Manages login state and provides user data to components
// Initializes mock data for the application

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { User } from "@/types/user";
//import mockCourses from "../data/mockCourseList.json";
//import mockUsers from "../data/dummyLogins.json";

// Constants for localStorage keys
// const LS_KEYS = {
//   USERS: "Users",
//   SIGNED_IN_USER: "signedInUser",
//   COURSES: "Courses",
// };

// Context interface
interface AuthContextProps {
  isLoggedIn: boolean;
  user: User | null;
  setUser: (user: User) => void;
  setAuthTrigger: (value: number) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  signup: (
    email: string,
    password: string,
    firstname: string,
    lastname: string,
    isTutor: boolean,
    isLecturer: boolean,
    availability: "Full-Time" | "Part-Time",
    skills: string[]
  ) => Promise<boolean>;
  isSignupComplete: boolean;
}

// Create context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Hook for consuming the context
export const useAuth = (): AuthContextProps => {
  // console.log("useAuth called"); // Keep for debugging if needed
  const context = useContext(AuthContext);
  // console.log("context", context); // Keep for debugging if needed
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userState, setUserState] = useState<User | null>(null);
  const [authTrigger, setAuthTrigger] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSignupComplete, setIsSignupComplete] = useState<boolean>(false);

  // Initialize mock data if localStorage is empty
  useEffect(() => {
    const restoreUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to restore session");
        }

        const fetchedUser = await response.json();
        setUserState(fetchedUser);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Session restore failed:", error);
        localStorage.removeItem("token");
        setUserState(null);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, [authTrigger]);
  

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) throw new Error(data.message || "Login failed");
  
      localStorage.setItem("token", data.token);
      
      const userResponse = await fetch("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const userData = await userResponse.json();
      setUserState(userData);
      setIsLoggedIn(true);
      return true;
      
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };
  

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUserState(null);
    setIsLoggedIn(false);
    setAuthTrigger(Date.now());
  };
  

  // Memoize updateUser, which is exposed as 'setUser' in the context value
  const updateUser = useCallback((updatedUserData: User) => {
    setUserState(updatedUserData);
  }, []);

  // Signup function
  const signup = async (
    email: string,
    password: string,
    firstname: string,
    lastname: string,
    isTutor: boolean,
    isLecturer: boolean,
    availability: "Full-Time" | "Part-Time",
    skills: string[]
  ): Promise<boolean> => {
    setLoading(true);
    setIsSignupComplete(false);
    try {
      localStorage.removeItem("token");
      setUserState(null);
      setIsLoggedIn(false);

      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstname,
          lastname,
          is_tutor: isTutor,
          is_lecturer: isLecturer,
          default_availability: availability,
          default_skills: skills
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Signup failed");

      localStorage.setItem("token", data.token);
      
      const userResponseAfterSignup = await fetch("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      if (!userResponseAfterSignup.ok) {
        throw new Error("Failed to fetch user data after signup");
      }

      const userData = await userResponseAfterSignup.json();
      
      setUserState(userData);
      setIsLoggedIn(true);
      setIsSignupComplete(true);
      
      return true;
    } catch (err) {
      console.error("Signup error:", err);
      setIsSignupComplete(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update the context value
  const value: AuthContextProps = {
    isLoggedIn,
    user: userState,
    setUser: updateUser,
    setAuthTrigger,
    login,
    logout,
    loading,
    signup,
    isSignupComplete,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export { AuthContext };

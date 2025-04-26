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
} from "react";
import { User } from "@/types/user";
import mockCourses from "../data/mockCourseList.json";
import mockUsers from "../data/dummyLogins.json";

// Constants for localStorage keys
const LS_KEYS = {
  USERS: "Users",
  SIGNED_IN_USER: "signedInUser",
  COURSES: "Courses",
};

// Context interface
interface AuthContextProps {
  isLoggedIn: boolean;
  user: User | null;
  setUser: (user: User) => void;
  setAuthTrigger: (value: number) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  loading: boolean;
}

// Create context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Hook for consuming the context
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
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
  const [user, setUser] = useState<User | null>(null);
  const [authTrigger, setAuthTrigger] = useState<number>(Date.now());
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize mock data if localStorage is empty
  useEffect(() => {
    try {
      const existingUsersRaw = localStorage.getItem(LS_KEYS.USERS);
      const existingUsers = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];
  
      const shouldSeedUsers = !Array.isArray(existingUsers) || existingUsers.length === 0;
  
      if (shouldSeedUsers) {
        console.log('Seeding mock users');
        localStorage.setItem(LS_KEYS.USERS, JSON.stringify(mockUsers.users));
      }
  
      const existingCoursesRaw = localStorage.getItem(LS_KEYS.COURSES);
      const existingCourses = existingCoursesRaw ? JSON.parse(existingCoursesRaw) : [];
  
      const shouldSeedCourses = !Array.isArray(existingCourses) || existingCourses.length === 0;
  
      if (shouldSeedCourses) {
        console.log('Seeding mock courses');
        localStorage.setItem(LS_KEYS.COURSES, JSON.stringify(mockCourses));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);
  
  // Restore user session from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem(LS_KEYS.SIGNED_IN_USER);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, [authTrigger]);

  // Login function - validates credentials against localStorage
  const login = (email: string, password: string): boolean => {
    const storedUsers = localStorage.getItem(LS_KEYS.USERS);
    if (storedUsers) {
      const users: User[] = JSON.parse(storedUsers);
      const foundUser = users.find(
        (u) => u.email === email && u.password === password
      );
      if (foundUser) {
        localStorage.setItem(LS_KEYS.SIGNED_IN_USER, JSON.stringify(foundUser));
        setUser(foundUser);
        setIsLoggedIn(true);
        return true;
      }
    }
    return false;
  };

  // Logout function - clears session
  const logout = () => {
    localStorage.removeItem(LS_KEYS.SIGNED_IN_USER);
    setUser(null);
    setIsLoggedIn(false);
    setAuthTrigger(Date.now());
  };

  // Update user data in both session and users collection
  const setUserAndPersist = (updatedUser: User) => {
    try {
      // Update signed in user
      localStorage.setItem(LS_KEYS.SIGNED_IN_USER, JSON.stringify(updatedUser));
      setUser(updatedUser);
  
      // Update in users collection
      const allUsersRaw = localStorage.getItem(LS_KEYS.USERS);
      if (allUsersRaw) {
        const allUsers: User[] = JSON.parse(allUsersRaw);
  
        const updatedUsers = allUsers.map((u) =>
          String(u.id) === String(updatedUser.id) ? { ...u, ...updatedUser } : u
        );
  
        localStorage.setItem(LS_KEYS.USERS, JSON.stringify(updatedUsers));
      }
    } catch (error) {
      console.error('Failed to persist user:', error);
    }
  };
     
  // Context value
  const value: AuthContextProps = {
    isLoggedIn,
    user,
    setUser: setUserAndPersist,
    setAuthTrigger,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export { AuthContext };

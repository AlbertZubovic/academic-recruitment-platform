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
  login: (email: string, password: string) => Promise<boolean>;
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
  
        if (!response.ok) throw new Error("Failed to restore session");
  
        const user = await response.json();
        setUser(user);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Session restore failed:", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };
  
    restoreUser();
  }, [authTrigger]);
  

  // Login function - validates credentials against localStorage
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) throw new Error(data.message || "Login failed");
  
      // Save token and user to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("signedInUser", JSON.stringify(data.user));
  
      setUser(data.user);
      setIsLoggedIn(true);
      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };
  

  // Logout function - clears session
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("signedInUser");
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

// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types/user";

interface AuthContextProps {
  isLoggedIn: boolean;
  user: User | null;
  setUser: (user: User) => void;
  setAuthTrigger: (value: number) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
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

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userState, setUserState] = useState<User | null>(null);
  const [authTrigger, setAuthTrigger] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSignupComplete, setIsSignupComplete] = useState<boolean>(false);

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        credentials: "include",
      });

      if (res.status === 401) {
        setUserState(null);
        setIsLoggedIn(false);
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch user");

      const data = await res.json();
      setUserState(data);
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Fetch user error:", err);
      setUserState(null);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      setLoading(true);
      await fetchUser();
      setLoading(false);
    };
    restoreSession();
  }, [authTrigger]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Login failed");
      }

      await fetchUser();
      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

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
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          firstname,
          lastname,
          is_tutor: isTutor,
          is_lecturer: isLecturer,
          default_availability: availability,
          default_skills: skills,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Signup failed");
      }

      await fetchUser();
      setIsSignupComplete(true);
      return true;
    } catch (err) {
      console.error("Signup error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUserState(null);
      setIsLoggedIn(false);
      setAuthTrigger(Date.now());
    }
  };

  const value: AuthContextProps = {
    isLoggedIn,
    user: userState,
    setUser: setUserState,
    setAuthTrigger,
    login,
    logout,
    loading,
    signup,
    isSignupComplete,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };

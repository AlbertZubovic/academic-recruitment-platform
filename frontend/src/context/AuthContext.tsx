import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types/user";

interface AuthContextProps {
  isLoggedIn: boolean;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (data: SignUpData) => Promise<boolean>;
  loading: boolean;
  isSignupComplete: boolean;
}

interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  firstname: string;
  lastname: string;
  isTutor: boolean;
  isLecturer: boolean;
  availability: "Full-Time" | "Part-Time";
  skills: string[];
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSignupComplete, setIsSignupComplete] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", { credentials: "include" });
      if (!res.ok) throw new Error("No session");
      const data = await res.json();
      setUser(data);
      setIsLoggedIn(true);
    } catch {
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, rememberMe }),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      await fetchUser();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

const signup = async (data: SignUpData) => {
  try {
    if (data.password !== data.confirmPassword) throw new Error("Passwords do not match");
    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Signup failed");
    await fetchUser();
    setIsSignupComplete(true);
    return true;
  } catch (err) {
    console.error(err);
    setIsSignupComplete(false);
    return false;
  }
};


  const logout = async () => {
    await fetch("http://localhost:5000/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    setIsLoggedIn(false);
  };

  return <AuthContext.Provider value={{ isLoggedIn, user, setUser,login, logout, signup, loading, isSignupComplete }}>{children}</AuthContext.Provider>;
};

// src/context/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { User } from "@/types/user";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userState, setUserState] = useState<User | null>(null);
  const [authTrigger, setAuthTrigger] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSignupComplete, setIsSignupComplete] = useState(false);

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch user data");
      const data = await response.json();
      setUserState(data);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Fetch user error:", error);
      sessionStorage.removeItem("token");
      setUserState(null);
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      await fetchUser(token);
      setLoading(false);
    };
    restoreSession();
  }, [authTrigger]);

const login = async (email: string, password: string): Promise<boolean> => {
  setLoading(true);
  try {
    const response = await fetch("http://localhost:5000/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      data = {};
    }

    if (!response.ok) {
      console.error("Login failed:", data.message || "Login failed");
      return false;
    }

    sessionStorage.setItem("token", data.token);
    await fetchUser(data.token);
    return true;
  } catch (err) {
    console.error("Login error:", err);
    return false;
  } finally {
    setLoading(false);
  }
};


  const logout = () => {
    sessionStorage.removeItem("token");
    setUserState(null);
    setIsLoggedIn(false);
    setAuthTrigger(Date.now());
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
  ) => {
    setLoading(true);
    setIsSignupComplete(false);
    try {
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
          default_skills: skills,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Signup failed");
      sessionStorage.setItem("token", data.token);
      await fetchUser(data.token);
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

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user: userState,
        setUser: setUserState,
        setAuthTrigger,
        login,
        logout,
        loading,
        signup,
        isSignupComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };

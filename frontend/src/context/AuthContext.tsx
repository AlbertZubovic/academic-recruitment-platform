// src/context/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { SignInPayload, SignUpPayload } from "@/types/apiRequests";
import { MeResponse } from "@/types/apiResponses";
import { User } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (creds: SignInPayload) => Promise<void>;
  signUp: (creds: SignUpPayload) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

const AUTH_API_BASE = "http://localhost:5000/api/auth";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshUser()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (creds: SignInPayload) => {
    setError(null);
    try {
      const res = await fetch(`${AUTH_API_BASE}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(creds),
      });
      if (!res.ok) {
        const data = await res.json();
        const errorMessage = data.message || "Sign‐in failed";
        
        // For blocked users, handle gracefully without throwing an error
        if (res.status === 403 && errorMessage.includes("blocked")) {
          // Don't throw an error, instead return early
          // The calling component will handle showing the toast
          return;
        }
        
        throw new Error(errorMessage);
      }
      await refreshUser();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Sign-in failed";
      setError(errorMessage);
      throw err;
    }
  };

  const signUp = async (creds: SignUpPayload) => {
    setError(null);
    try {
      const res = await fetch(`${AUTH_API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(creds),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Sign‐up failed");
      }
      await refreshUser();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Sign-up failed";
      setError(errorMessage);
      throw err;
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      const res = await fetch(`${AUTH_API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Sign‐out failed");
      }
      setUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Sign-out failed";
      setError(errorMessage);
      throw err;
    }
  };

  const refreshUser = async () => {
    try {
      const res = await fetch(`${AUTH_API_BASE}/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const data: MeResponse = await res.json();
        const mapped: User = {
          id: data.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          isLecturer: data.isLecturer,
          isCandidate: data.isCandidate,
          isAdmin: data.isAdmin,
          defaultSkills: data.defaultSkills,
          defaultAvailability: data.defaultAvailability,
          academicCredentials: data.academicCredentials,
          pastRoles: data.pastRoles,
          created: data.created,
          isBlocked: data.isBlocked,
        };
        setUser(mapped);
      } else if (res.status === 403) {
        // User is blocked - clear user state (toast will be shown by calling component)
        setUser(null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
};

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
import { useToast } from "@chakra-ui/react";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (creds: SignInPayload) => Promise<void>;
  signUp: (creds: SignUpPayload) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (u: User | null) => void;  // ← added setter
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Fetch current user on mount
  useEffect(() => {
    refreshUser()
      .catch(() => {
        /* ignore */
      })
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (creds: SignInPayload) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(creds),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Sign‐in failed");
      }
      await refreshUser();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signUp = async (creds: SignUpPayload) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
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
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Sign‐out failed");
      }
      setUser(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (res.ok) {
        const data: MeResponse = await res.json();
        // Map MeResponse → User (our front-end shape)
        const mapped: User = {
          id: data.id,
          email: data.email,
          firstname: data.firstname,
          lastname: data.lastname,
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
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signIn, signUp, signOut, refreshUser, setUser }}
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

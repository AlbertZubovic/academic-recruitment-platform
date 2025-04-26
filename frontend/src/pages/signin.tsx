// src/pages/signin.tsx

/**
 * Sign-In Page
 * Initializes mock users and renders the AuthForm in sign in mode.
 * This is the login page users will use to access their role specific dashboards.
 */

import React, { useEffect } from "react";
import AuthForm from "@/components/auth/AuthForm";
import dummyLogins from "../data/dummyLogins.json";
import { User } from "@/types/user";
import { PastRole } from "@/types/pastRoles";

const SignInPage = () => {
  useEffect(() => {
    const storedData = localStorage.getItem("Users");

    // If no users found in localStorage, seed with dummy logins
    if (!storedData) {
      const formattedUsers: User[] = dummyLogins.users.map((user) => ({
        ...user,
        id: String(user.id),
        availability: user.availability as "part-time" | "full-time",
        pastRoles: user.pastRoles as PastRole[],
      }));

      localStorage.setItem("Users", JSON.stringify(formattedUsers));
    }
  }, []);

  return <AuthForm type="signin" />;
};

export default SignInPage;

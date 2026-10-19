"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserProfile, fetchUserProfile } from "../lib/api";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginWithToken: (rawToken: string) => Promise<boolean>;
  loginWithOrcid: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AUTH_TOKEN_KEY = "ubuntubio_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Re-verify session on mount
  const refreshUser = useCallback(async () => {
    try {
      const storedToken = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      const profile = await fetchUserProfile(storedToken);
      if (profile) {
        setUser(profile);
      } else {
        // Token expired or invalid
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setUser(null);
        setToken(null);
      }
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Login with a given Personal Access Token
  const loginWithToken = useCallback(
    async (rawToken: string): Promise<boolean> => {
      setIsLoading(true);
      const cleanToken = rawToken.trim();
      const profile = await fetchUserProfile(cleanToken);
      if (profile) {
        localStorage.setItem(AUTH_TOKEN_KEY, cleanToken);
        setToken(cleanToken);
        setUser(profile);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    },
    []
  );

  // Redirect to ORCID OAuth authorization endpoint
  const loginWithOrcid = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.href = "/api/auth/orcid/authorize";
    }
  }, []);

  // Logout and clear credentials
  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        loginWithToken,
        loginWithOrcid,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  loginWithToken: async () => false,
  loginWithOrcid: () => {},
  logout: () => {},
  refreshUser: async () => {},
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  return context || defaultAuthContext;
}

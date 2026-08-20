"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AuthUser,
  AuthSession,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "./auth-types";
import { authClient } from "./auth-client";

export interface AuthModalContext {
  title?: string;
  message: string;
  returnTo?: string;
  onAuthenticated?: () => void;
}

interface AuthContextValue {
  currentUser: AuthUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<AuthUser>) => void;
  // Auth Required Modal
  authModalOpen: boolean;
  authModalContext: AuthModalContext | null;
  openAuthModal: (context: AuthModalContext) => void;
  closeAuthModal: () => void;
  requireAuth: (context?: AuthModalContext) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [session, setSession] = useState<AuthSession | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return authClient.getSession();
    } catch {
      return null;
    }
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return authClient.getSession()?.user || null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalContext, setAuthModalContext] = useState<AuthModalContext | null>(null);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthResponse> => {
      setIsLoading(true);
      try {
        const res = await authClient.login(credentials);
        if (res.success && res.session) {
          setSession(res.session);
          setCurrentUser(res.session.user);
        }
        return res;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (data: RegisterData): Promise<AuthResponse> => {
      setIsLoading(true);
      try {
        const res = await authClient.register(data);
        if (res.success && res.session) {
          setSession(res.session);
          setCurrentUser(res.session.user);
        }
        return res;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authClient.logout();
      setSession(null);
      setCurrentUser(null);
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const updateUser = useCallback((data: Partial<AuthUser>) => {
    setCurrentUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      setSession((prevSess) => (prevSess ? { ...prevSess, user: updated } : null));
      return updated;
    });
  }, []);

  const openAuthModal = useCallback((context: AuthModalContext) => {
    setAuthModalContext(context);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setAuthModalContext(null);
  }, []);

  const requireAuth = useCallback(
    (context?: AuthModalContext): boolean => {
      if (currentUser) {
        return true;
      }
      openAuthModal({
        title: context?.title || "Sign in to continue",
        message:
          context?.message ||
          "Create an account or sign in to complete this action on TheVrindaGroup.",
        returnTo: context?.returnTo || pathname,
        onAuthenticated: context?.onAuthenticated,
      });
      return false;
    },
    [currentUser, pathname, openAuthModal]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        session,
        isAuthenticated: Boolean(currentUser),
        isLoading,
        login,
        register,
        logout,
        updateUser,
        authModalOpen,
        authModalContext,
        openAuthModal,
        closeAuthModal,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

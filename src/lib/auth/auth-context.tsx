"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AuthUser,
  AuthSession,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  VerifyOtpRequest,
  ResendOtpRequest,
  ResetPasswordRequest,
} from "./auth-types";
import { authClient } from "./auth-client";

export interface AuthModalContext {
  title?: string;
  message: string;
  returnTo?: string;
  onAuthenticated?: () => void;
}

export interface AuthContextValue {
  currentUser: AuthUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  requestRegistration: (data: RegisterData) => Promise<AuthResponse>;
  verifyOtp: (req: VerifyOtpRequest) => Promise<AuthResponse>;
  resendOtp: (req: { target: string; type: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION" | "PASSWORD_RESET" }) => Promise<{ success: boolean; message: string; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; error?: string }>;
  resetPassword: (req: ResetPasswordRequest) => Promise<{ success: boolean; message: string; error?: string }>;
  loginWithGoogle: (idToken: string) => Promise<AuthResponse>;
  linkGoogleAccount: (idToken: string, password: string) => Promise<AuthResponse>;
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

  const session = React.useSyncExternalStore(
    (onStoreChange) => authClient.subscribe(onStoreChange),
    () => authClient.getSession(),
    () => null
  );

  const currentUser = session?.user || null;

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalContext, setAuthModalContext] = useState<AuthModalContext | null>(null);

  // Synchronize and verify session against backend /api/auth/me on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const stored = authClient.getSession();
        if (stored?.accessToken) {
          const verification = await authClient.verifySession();
          if (isMounted && verification.isDefinitiveFailure) {
            authClient.clearSession();
          }
        }
      } catch {
        // Suppress unexpected initialization errors to guarantee isInitialized flips
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthResponse> => {
      setIsLoading(true);
      try {
        const res = await authClient.login(credentials);
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
        return res;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const requestRegistration = useCallback(
    async (data: RegisterData): Promise<AuthResponse> => {
      setIsLoading(true);
      try {
        const res = await authClient.requestRegistration(data);
        return res;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const verifyOtp = useCallback(
    async (req: VerifyOtpRequest): Promise<AuthResponse> => {
      setIsLoading(true);
      try {
        const res = await authClient.verifyOtp(req);
        return res;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const resendOtp = useCallback(
    async (req: ResendOtpRequest) => {
      return authClient.resendOtp(req);
    },
    []
  );

  const forgotPassword = useCallback(
    async (email: string) => {
      setIsLoading(true);
      try {
        return await authClient.forgotPassword(email);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const resetPassword = useCallback(
    async (req: ResetPasswordRequest) => {
      setIsLoading(true);
      try {
        return await authClient.resetPassword(req);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const loginWithGoogle = useCallback(
    async (idToken: string): Promise<AuthResponse> => {
      setIsLoading(true);
      try {
        const res = await authClient.loginWithGoogle(idToken);
        return res;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const linkGoogleAccount = useCallback(
    async (idToken: string, password: string): Promise<AuthResponse> => {
      setIsLoading(true);
      try {
        const res = await authClient.linkGoogleAccount(idToken, password);
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
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const updateUser = useCallback((data: Partial<AuthUser>) => {
    const current = authClient.getSession();
    if (current?.user) {
      const updatedUser = { ...current.user, ...data };
      authClient.saveSession({ ...current, user: updatedUser });
    }
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
        isInitialized,
        login,
        register,
        requestRegistration,
        verifyOtp,
        resendOtp,
        forgotPassword,
        resetPassword,
        loginWithGoogle,
        linkGoogleAccount,
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

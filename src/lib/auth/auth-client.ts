// ==============================================================================
// TheVrindaGroup - Real Authentication Service Client
// Communicates with backend Express API endpoints at /api/auth/*
// ==============================================================================

import { apiClient, ApiClientError } from "../api-client";
import {
  AuthUser,
  AuthSession,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ResetPasswordRequest,
  VerifyOtpRequest,
  UserRole,
} from "./auth-types";

const SESSION_STORAGE_KEY = "thevrindagroup_auth_session_v1";

interface BackendAuthResponseData {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    isActive: boolean;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

interface BackendRefreshResponseData {
  accessToken: string;
  refreshToken: string;
}

interface BackendRequestRegistrationData {
  registrationId: string;
  email: string;
  phone: string | null;
  message: string;
}

interface BackendVerifyOtpResponseData {
  isComplete: boolean;
  message?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  user?: BackendAuthResponseData["user"];
  accessToken?: string;
  refreshToken?: string;
}

class AuthService {
  private memorySession: AuthSession | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    // Connect token provider to apiClient
    apiClient.setTokenProvider(() => this.getAccessToken());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch {
        // Ignore subscriber errors
      }
    });
  }

  public getSession(): AuthSession | null {
    if (typeof window === "undefined") {
      return this.memorySession;
    }
    if (this.memorySession) {
      return this.memorySession;
    }
    try {
      const stored =
        localStorage.getItem(SESSION_STORAGE_KEY) ||
        sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return null;
      this.memorySession = JSON.parse(stored) as AuthSession;
      return this.memorySession;
    } catch {
      return null;
    }
  }

  public getAccessToken(): string | null {
    const session = this.getSession();
    return session ? session.accessToken : null;
  }

  public getRefreshToken(): string | null {
    const session = this.getSession();
    return session ? session.refreshToken : null;
  }

  public saveSession(session: AuthSession, persistent = true): void {
    this.memorySession = session;
    if (typeof window === "undefined") {
      this.notify();
      return;
    }
    try {
      const json = JSON.stringify(session);
      if (persistent) {
        localStorage.setItem(SESSION_STORAGE_KEY, json);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, json);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // Storage write error ignored
    }
    this.notify();
  }

  public clearSession(): void {
    this.memorySession = null;
    if (typeof window === "undefined") {
      this.notify();
      return;
    }
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Storage remove error ignored
    }
    this.notify();
  }

  /**
   * Real Backend User Login: POST /api/auth/login
   */
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const email = credentials.identifier.trim().toLowerCase();
      const password = credentials.password;

      const res = await apiClient.post<BackendAuthResponseData>("/auth/login", {
        email,
        password,
      });

      const { user: rawUser, accessToken, refreshToken } = res.data;

      const user: AuthUser = {
        ...rawUser,
        avatar: rawUser.avatarUrl || undefined,
      };

      const session: AuthSession = {
        user,
        accessToken,
        refreshToken,
      };

      this.saveSession(session, Boolean(credentials.rememberMe));

      return {
        success: true,
        user,
        session,
        message: res.message || "Successfully logged in.",
      };
    } catch (err: unknown) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Unable to sign in. Please check your credentials.";
      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Real Backend User Registration: POST /api/auth/register
   */
  public async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const cleanEmail = data.email.trim().toLowerCase();
      const cleanPhone = data.phone ? data.phone.trim() : undefined;

      const res = await apiClient.post<BackendAuthResponseData>("/auth/register", {
        name: data.name.trim(),
        email: cleanEmail,
        password: data.password,
        phone: cleanPhone || undefined,
        role: data.role,
      });

      const { user: rawUser, accessToken, refreshToken } = res.data;

      const user: AuthUser = {
        ...rawUser,
        agencyName: data.agencyName?.trim(),
        agencyWebsite: data.agencyWebsite?.trim(),
        lookingFor: data.lookingFor,
        intent: data.intent,
        avatar: rawUser.avatarUrl || undefined,
      };

      const session: AuthSession = {
        user,
        accessToken,
        refreshToken,
      };

      this.saveSession(session, true);

      return {
        success: true,
        user,
        session,
        message: res.message || "Account created successfully.",
      };
    } catch (err: unknown) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Unable to create account. Please try again.";
      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Real Backend Google Authentication: POST /api/auth/google
   */
  public async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    try {
      const res = await apiClient.post<BackendAuthResponseData>("/auth/google", {
        idToken,
      });

      const { user: rawUser, accessToken, refreshToken } = res.data;

      const user: AuthUser = {
        ...rawUser,
        avatar: rawUser.avatarUrl || undefined,
      };

      const session: AuthSession = {
        user,
        accessToken,
        refreshToken,
      };

      this.saveSession(session, true);

      return {
        success: true,
        user,
        session,
        message: res.message || "Successfully authenticated with Google.",
      };
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        return {
          success: false,
          error: err.message,
          code: err.code,
        };
      }
      return {
        success: false,
        error: "Google authentication failed. Please try again.",
      };
    }
  }

  /**
   * Real Backend Account Linking with Google: POST /api/auth/google/link
   */
  public async linkGoogleAccount(idToken: string, password: string): Promise<AuthResponse> {
    try {
      const res = await apiClient.post<BackendAuthResponseData>("/auth/google/link", {
        idToken,
        password,
      });

      const { user: rawUser, accessToken, refreshToken } = res.data;

      const user: AuthUser = {
        ...rawUser,
        avatar: rawUser.avatarUrl || undefined,
      };

      const session: AuthSession = {
        user,
        accessToken,
        refreshToken,
      };

      this.saveSession(session, true);

      return {
        success: true,
        user,
        session,
        message: res.message || "Google account linked successfully.",
      };
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        return {
          success: false,
          error: err.message,
          code: err.code,
        };
      }
      return {
        success: false,
        error: "Failed to link Google account. Please check your credentials.",
      };
    }
  }

  /**
   * Real Backend Token Refresh: POST /api/auth/refresh
   */
  public async refreshSession(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearSession();
      return false;
    }

    try {
      const res = await apiClient.post<BackendRefreshResponseData>("/auth/refresh", {
        refreshToken,
      });

      const session = this.getSession();
      if (session) {
        session.accessToken = res.data.accessToken;
        session.refreshToken = res.data.refreshToken;
        this.saveSession(session, true);
        return true;
      }
      return false;
    } catch (err: unknown) {
      // ONLY clear session if refresh request receives a definitive 401/403 (invalid/expired/revoked token)
      if (err instanceof ApiClientError && (err.statusCode === 401 || err.statusCode === 403)) {
        this.clearSession();
      }
      return false;
    }
  }

  public async refreshToken(): Promise<boolean> {
    return this.refreshSession();
  }

  /**
   * Real Backend User Logout: POST /api/auth/logout
   */
  public async logout(): Promise<void> {
    const token = this.getAccessToken();
    if (token) {
      try {
        await apiClient.post("/auth/logout", undefined, { token });
      } catch {
        // Clear local session even if network fails
      }
    }
    this.clearSession();
  }

  /**
   * Comprehensive Session Verification with Network Safety
   * Differentiates between:
   * - 200 OK (Verified)
   * - 401/403 with failed refresh (isDefinitiveFailure: true -> terminal failure)
   * - Network error / cold start / timeout (isDefinitiveFailure: false -> preserves local session)
   */
  public async verifySession(): Promise<{
    user: AuthUser | null;
    isDefinitiveFailure: boolean;
  }> {
    const session = this.getSession();
    if (!session || !session.accessToken) {
      return { user: null, isDefinitiveFailure: false };
    }

    try {
      const res = await apiClient.get<{ user: BackendAuthResponseData["user"] }>("/auth/me");
      const rawUser = res.data.user;
      const user: AuthUser = {
        ...rawUser,
        avatar: rawUser.avatarUrl || undefined,
      };

      const currentSession = this.getSession();
      if (currentSession) {
        currentSession.user = user;
        this.saveSession(currentSession, true);
      }
      return { user, isDefinitiveFailure: false };
    } catch (err: unknown) {
      if (err instanceof ApiClientError && (err.statusCode === 401 || err.statusCode === 403)) {
        // Access token expired or invalid -> attempt refresh token rotation
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
          return { user: null, isDefinitiveFailure: true };
        }

        try {
          const refreshRes = await apiClient.post<BackendRefreshResponseData>("/auth/refresh", {
            refreshToken,
          });

          const refreshedSession = this.getSession();
          if (refreshedSession) {
            refreshedSession.accessToken = refreshRes.data.accessToken;
            refreshedSession.refreshToken = refreshRes.data.refreshToken;
            this.saveSession(refreshedSession, true);
          }

          // Retry fetching user profile with the newly rotated access token
          const userRes = await apiClient.get<{ user: BackendAuthResponseData["user"] }>("/auth/me");
          const rawUser = userRes.data.user;
          const user: AuthUser = {
            ...rawUser,
            avatar: rawUser.avatarUrl || undefined,
          };

          if (refreshedSession) {
            refreshedSession.user = user;
            this.saveSession(refreshedSession, true);
          }

          return { user, isDefinitiveFailure: false };
        } catch (refreshErr: unknown) {
          if (
            refreshErr instanceof ApiClientError &&
            (refreshErr.statusCode === 401 || refreshErr.statusCode === 403)
          ) {
            // Refresh token is definitively invalid/revoked/expired
            return { user: null, isDefinitiveFailure: true };
          }
          // Network error or 5xx during refresh -> preserve existing session
          return { user: session.user || null, isDefinitiveFailure: false };
        }
      }

      // Transient network error (e.g. status 0, timeout, offline, cold start)
      // DO NOT treat as definitive failure: preserve existing locally stored session
      return { user: session.user || null, isDefinitiveFailure: false };
    }
  }

  /**
   * Real Backend Profile Rehydration: GET /api/auth/me
   */
  public async getCurrentUser(): Promise<AuthUser | null> {
    const result = await this.verifySession();
    return result.user;
  }

  /**
   * Staged Verification-First Registration Request: POST /api/auth/register/request
   */
  public async requestRegistration(data: RegisterData): Promise<AuthResponse> {
    try {
      const res = await apiClient.post<BackendRequestRegistrationData>("/auth/register/request", {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || undefined,
        password: data.password,
        role: data.role || "BUYER",
      });

      return {
        success: true,
        registrationId: res.data.registrationId,
        message: res.message || "Verification codes dispatched to your email and mobile number.",
      };
    } catch (err: unknown) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Unable to process registration request. Please try again.";
      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Real Backend OTP Verification: POST /api/auth/otp/verify
   */
  public async verifyOtp(req: VerifyOtpRequest): Promise<AuthResponse> {
    try {
      const target = req.target || req.identifier;
      if (!target) {
        return { success: false, error: "Target destination is required for verification." };
      }

      const res = await apiClient.post<BackendVerifyOtpResponseData>("/auth/otp/verify", {
        target,
        type: req.type || "EMAIL_VERIFICATION",
        otp: req.otp.trim(),
        registrationId: req.registrationId,
      });

      if (res.data.isComplete && res.data.user && res.data.accessToken && res.data.refreshToken) {
        const rawUser = res.data.user;
        const user: AuthUser = {
          ...rawUser,
          avatar: rawUser.avatarUrl || undefined,
        };

        const session: AuthSession = {
          user,
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        };

        this.saveSession(session, true);

        return {
          success: true,
          isComplete: true,
          user,
          session,
          message: res.message || "Verification complete. Account created successfully.",
        };
      }

      return {
        success: true,
        isComplete: false,
        emailVerified: res.data.emailVerified,
        phoneVerified: res.data.phoneVerified,
        message: res.message || "Verification step completed.",
      };
    } catch (err: unknown) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Invalid verification code. Please try again.";
      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Real Backend Resend OTP: POST /api/auth/otp/resend
   */
  public async resendOtp(req: { target: string; type: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION" | "PASSWORD_RESET" }): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const res = await apiClient.post<{ success: boolean; message: string }>("/auth/otp/resend", {
        target: req.target.trim(),
        type: req.type,
      });

      return {
        success: true,
        message: res.message || "A new verification code has been dispatched.",
      };
    } catch (err: unknown) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Unable to resend verification code. Please wait before trying again.";
      return {
        success: false,
        message,
        error: message,
      };
    }
  }

  /**
   * Real Backend Forgot Password: POST /api/auth/forgot-password
   */
  public async forgotPassword(email: string): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const res = await apiClient.post<{ success: boolean; message: string }>("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      return {
        success: true,
        message: res.message || "Password recovery instructions have been sent if an account exists.",
      };
    } catch (err: unknown) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Unable to request password recovery. Please try again.";
      return {
        success: false,
        message,
        error: message,
      };
    }
  }

  /**
   * Real Backend Reset Password: POST /api/auth/reset-password
   */
  public async resetPassword(req: ResetPasswordRequest): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const res = await apiClient.post<{ success: boolean; message: string }>("/auth/reset-password", {
        email: req.email.trim().toLowerCase(),
        token: req.token.trim(),
        newPassword: req.newPassword,
      });

      return {
        success: true,
        message: res.message || "Password reset successfully. Please log in with your new password.",
      };
    } catch (err: unknown) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : "Invalid or expired password reset link.";
      return {
        success: false,
        message,
        error: message,
      };
    }
  }

  /**
   * Compatibility wrapper for requestPasswordReset
   */
  public async requestPasswordReset(req: { identifier: string }): Promise<{ success: boolean; message: string; error?: string }> {
    return this.forgotPassword(req.identifier);
  }
}

export const authClient = new AuthService();


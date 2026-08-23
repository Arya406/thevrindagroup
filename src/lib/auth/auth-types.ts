// ==============================================================================
// TheVrindaGroup - Frontend Authentication Data Types
// ==============================================================================

export type UserRole = "BUYER" | "OWNER" | "AGENT" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive?: boolean;
  avatarUrl?: string | null;
  avatar?: string;
  agencyName?: string;
  agencyWebsite?: string;
  lookingFor?: "buy" | "rent" | "both";
  intent?: "list" | "find";
  createdAt?: string | Date;
  updatedAt?: string | Date;
  lastLoginAt?: string | Date | null;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

export interface LoginCredentials {
  identifier: string; // Email
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  agencyName?: string;
  agencyWebsite?: string;
  lookingFor?: "buy" | "rent" | "both";
  intent?: "list" | "find";
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  session?: AuthSession;
  error?: string;
  message?: string;
}

export interface ResetPasswordRequest {
  identifier: string;
}

export interface VerifyOtpRequest {
  identifier: string;
  otp: string;
}

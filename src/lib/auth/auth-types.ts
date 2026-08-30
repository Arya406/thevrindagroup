// ==============================================================================
// TheVrindaGroup - Frontend Authentication Data Types
// ==============================================================================

export type UserRole = "BUYER" | "OWNER" | "AGENT" | "ADMIN";

export type OtpType = "EMAIL_VERIFICATION" | "PHONE_VERIFICATION" | "PASSWORD_RESET";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive?: boolean;
  avatarUrl?: string | null;
  avatar?: string;
  googleId?: string | null;
  authProvider?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
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
  role?: UserRole;
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
  code?: string;
  message?: string;
  registrationId?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  isComplete?: boolean;
}

export interface RequestRegistrationRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: UserRole;
}

export interface VerifyOtpRequest {
  target: string;
  type: OtpType;
  otp: string;
  registrationId?: string;
  identifier?: string; // Legacy compatibility
}

export interface ResendOtpRequest {
  target: string;
  type: OtpType;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

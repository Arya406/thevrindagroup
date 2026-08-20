export type UserRole = "BUYER" | "OWNER" | "AGENT";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  agencyName?: string;
  agencyWebsite?: string;
  avatar?: string;
  lookingFor?: "buy" | "rent" | "both";
  intent?: "list" | "find";
  createdAt: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: number;
}

export interface LoginCredentials {
  identifier: string; // Email or Phone
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
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
  identifier: string; // Email or Phone
}

export interface VerifyOtpRequest {
  identifier: string;
  otp: string;
}

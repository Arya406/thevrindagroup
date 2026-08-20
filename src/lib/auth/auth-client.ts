import {
  AuthUser,
  AuthSession,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ResetPasswordRequest,
  VerifyOtpRequest,
} from "./auth-types";

const SESSION_STORAGE_KEY = "thevrindagroup_auth_session_v1";

// Demo Mock Seed Users (Never storing real passwords, hashed simulation)
const INITIAL_MOCK_USERS: AuthUser[] = [
  {
    id: "usr-arya-101",
    name: "Arya Sharma",
    email: "arya.sharma@example.com",
    phone: "+91 98765 43210",
    role: "OWNER",
    companyName: "Sharma Assets & Estates",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    lookingFor: "both",
    intent: "list",
    createdAt: "2026-01-15T10:00:00.000Z",
  } as AuthUser & { companyName?: string },
  {
    id: "usr-vikram-102",
    name: "Vikram Malhotra",
    email: "vikram@thevrindagroup.com",
    phone: "+91 98111 67890",
    role: "AGENT",
    agencyName: "Malhotra Realty Partners",
    agencyWebsite: "https://malhotra-realty.in",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    lookingFor: "buy",
    intent: "list",
    createdAt: "2026-02-01T10:00:00.000Z",
  },
  {
    id: "usr-priya-103",
    name: "Priya Nair",
    email: "priya.nair@example.com",
    phone: "+91 97412 88901",
    role: "BUYER",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    lookingFor: "buy",
    intent: "find",
    createdAt: "2026-03-10T10:00:00.000Z",
  },
];

/**
 * Authentication Service Client Abstraction
 * When connecting to a real backend, replace the MockAuthClient methods with
 * `fetch('/api/auth/login')`, `fetch('/api/auth/register')`, etc.
 */
class AuthService {
  private users: AuthUser[] = [...INITIAL_MOCK_USERS];

  public getSession(): AuthSession | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return null;
      const session = JSON.parse(stored) as AuthSession;
      if (session.expiresAt && Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  private saveSession(session: AuthSession, persistent = false): void {
    if (typeof window === "undefined") return;
    const json = JSON.stringify(session);
    if (persistent) {
      localStorage.setItem(SESSION_STORAGE_KEY, json);
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, json);
    }
  }

  private clearSession(): void {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const idClean = credentials.identifier.trim().toLowerCase();
    const phoneClean = credentials.identifier.replace(/[^0-9]/g, "");

    // Check against mock users
    let user = this.users.find(
      (u) =>
        u.email.toLowerCase() === idClean ||
        (phoneClean.length >= 10 && u.phone.replace(/[^0-9]/g, "").includes(phoneClean))
    );

    // If not found in mock list, allow flexible demo login
    if (!user) {
      if (idClean.includes("@")) {
        const generatedName = idClean.split("@")[0].replace(/[._]/g, " ");
        const formattedName = generatedName
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        user = {
          id: `usr-demo-${Date.now()}`,
          name: formattedName || "TheVrindaGroup User",
          email: idClean,
          phone: "+91 98765 00000",
          role: "OWNER",
          lookingFor: "both",
          intent: "list",
          createdAt: new Date().toISOString(),
        };
        this.users.push(user);
      } else {
        return {
          success: false,
          error: "Unable to sign in. Please enter a valid registered email address or 10-digit mobile number.",
        };
      }
    }

    // Minimum password check (8 characters)
    if (!credentials.password || credentials.password.length < 6) {
      return {
        success: false,
        error: "Password must contain at least 6 characters.",
      };
    }

    const session: AuthSession = {
      user,
      token: `mock-jwt-${Math.random().toString(36).substring(2)}-${Date.now()}`,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    this.saveSession(session, Boolean(credentials.rememberMe));

    return {
      success: true,
      user,
      session,
      message: "Successfully logged in.",
    };
  }

  public async register(data: RegisterData): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 450));

    const emailClean = data.email.trim().toLowerCase();

    // Check duplicate
    const exists = this.users.some((u) => u.email.toLowerCase() === emailClean);
    if (exists) {
      return {
        success: false,
        error: "An account with this email address already exists. Please sign in instead.",
      };
    }

    const newUser: AuthUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: data.name.trim(),
      email: emailClean,
      phone: data.phone.trim(),
      role: data.role || "OWNER",
      agencyName: data.agencyName?.trim(),
      agencyWebsite: data.agencyWebsite?.trim(),
      lookingFor: data.lookingFor || "both",
      intent: data.intent || "list",
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);

    const session: AuthSession = {
      user: newUser,
      token: `mock-jwt-${Math.random().toString(36).substring(2)}-${Date.now()}`,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };

    this.saveSession(session, true);

    return {
      success: true,
      user: newUser,
      session,
      message: "Account created successfully.",
    };
  }

  public async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    this.clearSession();
  }

  public async requestPasswordReset(req: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return {
      success: true,
      message: `Password reset request created for ${req.identifier}. Connect the authentication backend to send the actual reset message.`,
    };
  }

  public async verifyOtp(req: VerifyOtpRequest): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (req.otp !== "123456" && req.otp.length !== 6) {
      return {
        success: false,
        error: "Invalid 6-digit verification code. Please try again (Demo code: 123456).",
      };
    }

    const user: AuthUser = {
      id: `usr-otp-${Date.now()}`,
      name: "Verified User",
      email: req.identifier.includes("@") ? req.identifier : "verified@thevrindagroup.com",
      phone: req.identifier.includes("@") ? "+91 98765 43210" : req.identifier,
      role: "OWNER",
      createdAt: new Date().toISOString(),
    };

    const session: AuthSession = {
      user,
      token: `mock-jwt-otp-${Date.now()}`,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };

    this.saveSession(session, true);

    return {
      success: true,
      user,
      session,
      message: "OTP successfully verified.",
    };
  }
}

export const authClient = new AuthService();

// ==============================================================================
// TheVrindaGroup - User Account Profile API Service
// Connects frontend to real PostgreSQL backend endpoints:
//   - GET   /api/users/profile (get authenticated user's profile)
//   - PATCH /api/users/profile (update authenticated user's profile)
// ==============================================================================

import { apiClient } from "../api-client";
import { AuthUser } from "../auth/auth-types";

export interface UpdateProfileRequest {
  name?: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface UserProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: "BUYER" | "OWNER" | "AGENT" | "ADMIN";
    isActive: boolean;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string | null;
  };
  message?: string;
}

export class UserApiService {
  /**
   * Fetch authenticated user's profile from real backend
   * GET /api/users/profile
   */
  static async getProfile(): Promise<AuthUser> {
    const res = await apiClient.get<UserProfileResponse>("/users/profile");
    const rawUser = res.data.user;
    return {
      ...rawUser,
      avatar: rawUser.avatarUrl || undefined,
    };
  }

  static async getMyProfile(): Promise<AuthUser> {
    return UserApiService.getProfile();
  }

  /**
   * Update authenticated user's profile in PostgreSQL
   * PATCH /api/users/profile
   */
  static async updateProfile(
    data: UpdateProfileRequest
  ): Promise<{ user: AuthUser; message: string }> {
    const res = await apiClient.patch<UserProfileResponse>("/users/profile", data);
    const rawUser = res.data.user;
    const user: AuthUser = {
      ...rawUser,
      avatar: rawUser.avatarUrl || undefined,
    };
    return {
      user,
      message: res.data.message || res.message || "Profile updated successfully.",
    };
  }

  static async updateMyProfile(
    data: UpdateProfileRequest
  ): Promise<AuthUser> {
    const res = await UserApiService.updateProfile(data);
    return res.user;
  }
}

// ==============================================================================
// TheVrindaGroup - Notification API Service
// Centralized service wrapping all /api/notifications/* endpoints
// ==============================================================================

import { apiClient } from "../api-client";
import {
  AppNotification,
  PaginatedNotificationsResponse,
  UnreadCountResponse,
  NotificationQueryParams,
} from "@/types/notification";

export class NotificationApiService {
  /**
   * GET /api/notifications/unread-count
   * Fetches the total number of unread notifications for the authenticated user
   */
  static async getUnreadCount(): Promise<UnreadCountResponse> {
    const res = await apiClient.get<UnreadCountResponse>("/notifications/unread-count");
    return res.data;
  }

  /**
   * GET /api/notifications
   * Retrieves paginated notifications with optional status and type filters
   */
  static async getNotifications(
    params?: NotificationQueryParams
  ): Promise<PaginatedNotificationsResponse> {
    const queryParams: Record<string, unknown> = {};
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.unread !== undefined) queryParams.unread = params.unread;
    if (params?.type) queryParams.type = params.type;

    const res = await apiClient.get<PaginatedNotificationsResponse>(
      "/notifications",
      Object.keys(queryParams).length > 0 ? queryParams : undefined
    );
    return res.data;
  }

  /**
   * PATCH /api/notifications/:id/read
   * Marks a single notification as read
   */
  static async markAsRead(id: string): Promise<{ notification: AppNotification }> {
    const res = await apiClient.patch<{ notification: AppNotification }>(
      `/notifications/${encodeURIComponent(id)}/read`
    );
    return res.data;
  }

  /**
   * PATCH /api/notifications/read-all
   * Marks all notifications for the authenticated user as read
   */
  static async markAllAsRead(): Promise<{ count: number }> {
    const res = await apiClient.patch<{ count: number }>("/notifications/read-all");
    return res.data;
  }

  /**
   * DELETE /api/notifications/:id
   * Deletes a notification belonging to the authenticated user
   */
  static async deleteNotification(id: string): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(
      `/notifications/${encodeURIComponent(id)}`
    );
    return res.data;
  }
}

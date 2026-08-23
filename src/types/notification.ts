// ==============================================================================
// TheVrindaGroup - Notification Types & Contracts
// Mirrors backend Prisma schema & API response contracts
// ==============================================================================

export type NotificationType =
  | "ENQUIRY_CREATED"
  | "ENQUIRY_STATUS_CHANGED"
  | "SITE_VISIT_REQUESTED"
  | "SITE_VISIT_CONFIRMED"
  | "SITE_VISIT_RESCHEDULED"
  | "SITE_VISIT_CANCELLED"
  | "SITE_VISIT_COMPLETED"
  | "SITE_VISIT_NO_SHOW"
  | "PROPERTY_PUBLISHED"
  | "PROPERTY_SOLD"
  | "PROPERTY_RENTED"
  | "LEAD_ASSIGNED"
  | "LEAD_REASSIGNED"
  | "LEAD_UNASSIGNED";

export type NotificationChannel = "IN_APP" | "EMAIL" | "SMS" | "WHATSAPP" | "PUSH";

export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "READ";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  title: string;
  message: string;
  propertyId?: string | null;
  enquiryId?: string | null;
  siteVisitId?: string | null;
  readAt?: string | null;
  sentAt?: string | null;
  failedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedNotificationsResponse {
  notifications: AppNotification[];
  pagination: NotificationPaginationMeta;
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  unread?: boolean;
  type?: NotificationType;
}

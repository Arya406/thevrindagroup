// ==============================================================================
// TheVrindaGroup - Shared Frontend API Response Types
// Matches Backend Standard Envelope Format
// ==============================================================================

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, unknown>;
  body?: unknown;
  token?: string | null;
}

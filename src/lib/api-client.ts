// ==============================================================================
// TheVrindaGroup - Centralized Typed Frontend API Client
// Handles Base URL, Headers, JWT Bearer Injection, Query Params & Error Envelope
// ==============================================================================

import { ApiSuccessResponse, ApiErrorResponse, RequestOptions } from "@/types/api";

export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isNetworkError: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_SERVER_ERROR",
    details?: unknown,
    isNetworkError: boolean = false
  ) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isNetworkError = isNetworkError;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export type TokenProvider = () => string | null | Promise<string | null>;

class ApiClient {
  private baseUrl: string;
  private tokenProvider: TokenProvider | null = null;

  constructor(baseUrl?: string) {
    const rawUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    this.baseUrl = rawUrl.replace(/\/+$/, "");
  }

  /**
   * Set a dynamic token provider (e.g. from AuthContext or AuthService)
   */
  public setTokenProvider(provider: TokenProvider): void {
    this.tokenProvider = provider;
  }

  /**
   * Get the current access token
   */
  private async getAccessToken(explicitToken?: string | null): Promise<string | null> {
    if (explicitToken !== undefined) {
      return explicitToken;
    }
    if (this.tokenProvider) {
      try {
        const token = await this.tokenProvider();
        if (token) return token;
      } catch {
        // Ignore provider error and fallback
      }
    }
    return null;
  }

  /**
   * Build a fully-qualified URL with encoded query parameters
   */
  public buildUrl(path: string, params?: Record<string, unknown>): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${cleanPath}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          return;
        }
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (item !== undefined && item !== null && item !== "") {
              url.searchParams.append(key, String(item));
            }
          });
        } else {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Core request dispatcher with JSON serialization, JWT attachment & Error normalization
   */
  public async request<T = unknown>(
    path: string,
    options: RequestOptions = {}
  ): Promise<ApiSuccessResponse<T>> {
    const { params, body, token, headers: customHeaders, ...fetchInit } = options;
    const url = this.buildUrl(path, params);

    const headers = new Headers(customHeaders);
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    // Auto-attach JSON header if body is provided, not FormData, and Content-Type not explicitly set
    if (body !== undefined && !headers.has("Content-Type") && !isFormData) {
      headers.set("Content-Type", "application/json");
    }

    // Auto-attach JWT Bearer token if available
    const accessToken = await this.getAccessToken(token);
    if (accessToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const config: RequestInit = {
      cache: "no-store",
      ...fetchInit,
      headers,
      body:
        body !== undefined
          ? isFormData
            ? (body as FormData)
            : typeof body === "string"
            ? body
            : JSON.stringify(body)
          : undefined,
    };

    let response: Response;
    try {
      response = await fetch(url, config);
    } catch (networkErr: unknown) {
      const msg = networkErr instanceof Error ? networkErr.message : "Failed to connect to backend server";
      throw new ApiClientError(
        `Network error: ${msg}. Please ensure the backend server is running.`,
        0,
        "NETWORK_ERROR",
        undefined,
        true
      );
    }

    // Parse Response Body
    let json: unknown;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        json = await response.json();
      } catch {
        json = null;
      }
    } else {
      const text = await response.text();
      json = text ? { message: text } : null;
    }

    // Handle HTTP Error Codes (4xx, 5xx)
    if (!response.ok) {
      const errorObj = (json as ApiErrorResponse)?.error;
      const errorMessage =
        errorObj?.message ||
        (json as { message?: string })?.message ||
        `Request failed with status ${response.status} (${response.statusText})`;
      const errorCode = errorObj?.code || `HTTP_${response.status}`;
      const errorDetails = errorObj?.details;

      throw new ApiClientError(errorMessage, response.status, errorCode, errorDetails);
    }

    // Return Normalized Success Envelope
    if (json && typeof json === "object" && "success" in json && (json as ApiSuccessResponse<T>).success === true) {
      return json as ApiSuccessResponse<T>;
    }

    // Fallback wrapper if endpoint returns raw JSON data
    return {
      success: true,
      data: json as T,
    };
  }

  /**
   * HTTP GET
   */
  public async get<T = unknown>(
    path: string,
    params?: Record<string, unknown>,
    options?: RequestOptions
  ): Promise<ApiSuccessResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: "GET",
      params,
    });
  }

  /**
   * HTTP POST
   */
  public async post<T = unknown>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiSuccessResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body,
    });
  }

  /**
   * HTTP PATCH
   */
  public async patch<T = unknown>(
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiSuccessResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body,
    });
  }

  /**
   * HTTP POST for Multipart / FormData File Uploads
   */
  public async upload<T = unknown>(
    path: string,
    formData: FormData,
    options?: RequestOptions
  ): Promise<ApiSuccessResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: formData,
    });
  }

  /**
   * HTTP DELETE
   */
  public async delete<T = unknown>(
    path: string,
    options?: RequestOptions
  ): Promise<ApiSuccessResponse<T>> {
    return this.request<T>(path, {
      ...options,
      method: "DELETE",
    });
  }
}

// Global Default API Client Singleton
export const apiClient = new ApiClient();
export { ApiClient };

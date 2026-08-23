// ==============================================================================
// TheVrindaGroup - Property Enquiry API Service
// Connects Frontend Enquiry & Contact UI to Backend Express API (/api/properties/:id/enquiries, /api/enquiries/*)
// ==============================================================================

import { apiClient, ApiClientError } from "../api-client";

export type BackendEnquiryStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "SITE_VISIT_SCHEDULED"
  | "CLOSED"
  | "NOT_INTERESTED";

export interface BackendEnquiryBuyer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
}

export interface BackendEnquiryProperty {
  id: string;
  title: string;
  slug: string;
  referenceCode: string;
  price: number;
  priceUnit: "TOTAL" | "MONTHLY" | "YEARLY" | "PER_SQ_FT";
  listingType: "SALE" | "RENT" | "LEASE";
  propertyType: string;
  status: string;
  location: {
    city: string;
    locality: string;
    state: string;
    pincode: string;
  } | null;
  primaryImage: {
    url: string;
    altText: string | null;
  } | null;
}

export interface BackendPropertyEnquiry {
  id: string;
  propertyId: string;
  buyerId: string;
  message: string | null;
  status: BackendEnquiryStatus;
  contactedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  property: BackendEnquiryProperty;
  buyer?: BackendEnquiryBuyer;
}

export interface BackendPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BackendEnquiriesResponse {
  enquiries: BackendPropertyEnquiry[];
  pagination: BackendPaginationMeta;
}

export interface CreateEnquiryInput {
  message?: string | null;
}

export interface EnquiryFilterParams {
  page?: number;
  limit?: number;
  status?: BackendEnquiryStatus;
  sort?: "NEWEST" | "OLDEST";
}

export class EnquiryApiService {
  /**
   * Submit an enquiry for a property (BUYER role required) -> POST /api/properties/:propertyId/enquiries
   */
  public static async createEnquiry(
    propertyId: string,
    input: CreateEnquiryInput = {}
  ): Promise<BackendPropertyEnquiry> {
    const res = await apiClient.post<{ enquiry: BackendPropertyEnquiry }>(
      `/properties/${propertyId}/enquiries`,
      {
        message: input.message?.trim() || null,
      }
    );
    return res.data.enquiry;
  }

  /**
   * Get current authenticated user's submitted enquiries -> GET /api/enquiries/my
   */
  public static async getMyEnquiries(
    params: EnquiryFilterParams = {}
  ): Promise<BackendEnquiriesResponse> {
    const query: Record<string, unknown> = {};
    if (params.page) query.page = params.page;
    if (params.limit) query.limit = params.limit;
    if (params.status) query.status = params.status;
    if (params.sort) query.sort = params.sort;

    const res = await apiClient.get<BackendEnquiriesResponse>("/enquiries/my", query);
    return (
      res.data || {
        enquiries: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }
    );
  }

  /**
   * Get enquiries for a specific property (Owner / Agent of property only) -> GET /api/properties/:propertyId/enquiries
   */
  public static async getPropertyEnquiries(
    propertyId: string,
    params: EnquiryFilterParams = {}
  ): Promise<BackendEnquiriesResponse> {
    const query: Record<string, unknown> = {};
    if (params.page) query.page = params.page;
    if (params.limit) query.limit = params.limit;
    if (params.status) query.status = params.status;
    if (params.sort) query.sort = params.sort;

    const res = await apiClient.get<BackendEnquiriesResponse>(
      `/properties/${propertyId}/enquiries`,
      query
    );
    return (
      res.data || {
        enquiries: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }
    );
  }

  /**
   * Get a single enquiry by UUID -> GET /api/enquiries/:id
   */
  public static async getEnquiryById(id: string): Promise<BackendPropertyEnquiry | null> {
    try {
      const res = await apiClient.get<{ enquiry: BackendPropertyEnquiry }>(`/enquiries/${id}`);
      return res.data?.enquiry || null;
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.statusCode === 404) {
        return null;
      }
      throw err;
    }
  }

  /**
   * Update enquiry status (Owner / Agent of property only) -> PATCH /api/enquiries/:id/status
   */
  public static async updateEnquiryStatus(
    id: string,
    status: BackendEnquiryStatus
  ): Promise<BackendPropertyEnquiry> {
    const res = await apiClient.patch<{ enquiry: BackendPropertyEnquiry }>(
      `/enquiries/${id}/status`,
      { status }
    );
    return res.data.enquiry;
  }

  /**
   * Buyer cancel/close own enquiry -> PATCH /api/enquiries/:id/close
   */
  public static async closeMyEnquiry(id: string): Promise<BackendPropertyEnquiry> {
    const res = await apiClient.patch<{ enquiry: BackendPropertyEnquiry }>(
      `/enquiries/${id}/close`
    );
    return res.data.enquiry;
  }
}

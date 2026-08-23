// ==============================================================================
// TheVrindaGroup - Site Visit Scheduling & Management API Service
// Connects frontend to real PostgreSQL backend endpoints:
//   - POST   /api/properties/:propertyId/site-visits (Request visit - BUYER)
//   - GET    /api/site-visits/my                     (Get my visits - BUYER)
//   - GET    /api/properties/:propertyId/site-visits (Get property visits - OWNER/AGENT)
//   - GET    /api/site-visits/:id                    (Get single visit details)
//   - PATCH  /api/site-visits/:id/confirm            (Confirm visit - OWNER/AGENT)
//   - PATCH  /api/site-visits/:id/reschedule         (Reschedule visit - OWNER/AGENT)
//   - PATCH  /api/site-visits/:id/cancel             (Cancel visit - BUYER)
//   - PATCH  /api/site-visits/:id/cancel-by-owner    (Cancel visit - OWNER/AGENT)
//   - PATCH  /api/site-visits/:id/complete           (Mark visit complete - OWNER/AGENT)
//   - PATCH  /api/site-visits/:id/no-show            (Mark visit no-show - OWNER/AGENT)
// ==============================================================================

import { apiClient } from "../api-client";
import { BackendPagination } from "./property-api";

export type BackendSiteVisitStatus =
  | "REQUESTED"
  | "CONFIRMED"
  | "RESCHEDULED"
  | "COMPLETED"
  | "CANCELLED_BY_BUYER"
  | "CANCELLED_BY_OWNER"
  | "NO_SHOW";

export interface BackendSiteVisitProperty {
  id: string;
  title: string;
  slug: string;
  referenceCode: string;
  price: number;
  priceUnit: "TOTAL" | "MONTHLY" | "YEARLY" | "PER_SQ_FT";
  listingType: "SALE" | "RENT" | "LEASE";
  propertyType: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SOLD" | "RENTED";
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

export interface BackendSiteVisitBuyer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
}

export interface BackendSiteVisit {
  id: string;
  propertyId: string;
  buyerId: string;
  enquiryId: string | null;
  scheduledAt: string;
  status: BackendSiteVisitStatus;
  buyerNote: string | null;
  ownerNote: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  property: BackendSiteVisitProperty;
  buyer?: BackendSiteVisitBuyer;
}

export interface CreateSiteVisitDto {
  scheduledAt: string;
  buyerNote?: string | null;
  enquiryId?: string | null;
}

export interface RescheduleSiteVisitDto {
  scheduledAt: string;
  ownerNote?: string | null;
}

export interface CancelSiteVisitByBuyerDto {
  buyerNote?: string | null;
}

export interface CancelSiteVisitByOwnerDto {
  ownerNote?: string | null;
}

export interface BuyerSiteVisitQueryParams {
  page?: number;
  limit?: number;
  status?: BackendSiteVisitStatus;
  sort?: "NEWEST" | "OLDEST";
}

export interface OwnerSiteVisitQueryParams {
  page?: number;
  limit?: number;
  status?: BackendSiteVisitStatus;
  from?: string;
  to?: string;
}

export interface SingleSiteVisitResponse {
  siteVisit: BackendSiteVisit;
}

export interface PaginatedSiteVisitsResponse {
  siteVisits: BackendSiteVisit[];
  pagination: BackendPagination;
}

export class SiteVisitApiService {
  /**
   * Request a new site visit on a published property (BUYER role)
   * POST /api/properties/:propertyId/site-visits
   */
  static async createSiteVisit(
    propertyId: string,
    data: CreateSiteVisitDto
  ): Promise<BackendSiteVisit> {
    const res = await apiClient.post<SingleSiteVisitResponse>(
      `/properties/${propertyId}/site-visits`,
      data
    );
    return res.data.siteVisit;
  }

  /**
   * Get buyer's scheduled site visits with pagination and filters
   * GET /api/site-visits/my (BUYER role)
   */
  static async getMySiteVisits(
    params?: BuyerSiteVisitQueryParams
  ): Promise<PaginatedSiteVisitsResponse> {
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.status) queryParams.status = params.status;
    if (params?.sort) queryParams.sort = params.sort;

    const res = await apiClient.get<PaginatedSiteVisitsResponse>(
      "/site-visits/my",
      queryParams
    );
    return res.data;
  }

  /**
   * Get property's site visits for property owner or listing agent
   * GET /api/properties/:propertyId/site-visits (OWNER / AGENT role)
   */
  static async getPropertySiteVisits(
    propertyId: string,
    params?: OwnerSiteVisitQueryParams
  ): Promise<PaginatedSiteVisitsResponse> {
    const queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.status) queryParams.status = params.status;
    if (params?.from) queryParams.from = params.from;
    if (params?.to) queryParams.to = params.to;

    const res = await apiClient.get<PaginatedSiteVisitsResponse>(
      `/properties/${propertyId}/site-visits`,
      queryParams
    );
    return res.data;
  }

  /**
   * Get single site visit by ID (Authorized Buyer, Owner, or Agent)
   * GET /api/site-visits/:id
   */
  static async getSiteVisitById(id: string): Promise<BackendSiteVisit> {
    const res = await apiClient.get<SingleSiteVisitResponse>(`/site-visits/${id}`);
    return res.data.siteVisit;
  }

  /**
   * Confirm a requested site visit (OWNER / AGENT role)
   * PATCH /api/site-visits/:id/confirm
   */
  static async confirmSiteVisit(id: string): Promise<BackendSiteVisit> {
    const res = await apiClient.patch<SingleSiteVisitResponse>(
      `/site-visits/${id}/confirm`
    );
    return res.data.siteVisit;
  }

  /**
   * Reschedule a site visit to a new future time slot (OWNER / AGENT role)
   * PATCH /api/site-visits/:id/reschedule
   */
  static async rescheduleSiteVisit(
    id: string,
    data: RescheduleSiteVisitDto
  ): Promise<BackendSiteVisit> {
    const res = await apiClient.patch<SingleSiteVisitResponse>(
      `/site-visits/${id}/reschedule`,
      data
    );
    return res.data.siteVisit;
  }

  /**
   * Cancel site visit by the buyer who requested it (BUYER role)
   * PATCH /api/site-visits/:id/cancel
   */
  static async cancelSiteVisitByBuyer(
    id: string,
    data?: CancelSiteVisitByBuyerDto
  ): Promise<BackendSiteVisit> {
    const res = await apiClient.patch<SingleSiteVisitResponse>(
      `/site-visits/${id}/cancel`,
      data || {}
    );
    return res.data.siteVisit;
  }

  /**
   * Cancel site visit by property owner or agent (OWNER / AGENT role)
   * PATCH /api/site-visits/:id/cancel-by-owner
   */
  static async cancelSiteVisitByOwner(
    id: string,
    data?: CancelSiteVisitByOwnerDto
  ): Promise<BackendSiteVisit> {
    const res = await apiClient.patch<SingleSiteVisitResponse>(
      `/site-visits/${id}/cancel-by-owner`,
      data || {}
    );
    return res.data.siteVisit;
  }

  /**
   * Mark a completed on-site inspection (OWNER / AGENT role)
   * PATCH /api/site-visits/:id/complete
   */
  static async completeSiteVisit(id: string): Promise<BackendSiteVisit> {
    const res = await apiClient.patch<SingleSiteVisitResponse>(
      `/site-visits/${id}/complete`
    );
    return res.data.siteVisit;
  }

  /**
   * Record visitor no-show (OWNER / AGENT role)
   * PATCH /api/site-visits/:id/no-show
   */
  static async markNoShowSiteVisit(id: string): Promise<BackendSiteVisit> {
    const res = await apiClient.patch<SingleSiteVisitResponse>(
      `/site-visits/${id}/no-show`
    );
    return res.data.siteVisit;
  }
}

// ==============================================================================
// TheVrindaGroup - Admin & CRM API Service
// Wraps all 25 /api/admin/* endpoints with full TypeScript type safety.
// ==============================================================================

import { apiClient } from "../api-client";
import {
  AdminUser,
  PaginationMeta,
  DashboardSummaryResponse,
  DashboardLeadsResponse,
  DashboardPropertiesResponse,
  DashboardOwnerMetricItem,
  SafeAgency,
  SafeAgencyMember,
  SafeAgentProfile,
  AdminAgentPerformanceItem,
  AdminSafeEnquiry,
  AdminSafeSiteVisit,
  SafeAuditLog,
  UserRole,
  PropertyStatus,
  ListingType,
  PropertyType,
  EnquiryStatus,
  SiteVisitStatus,
  AuditAction,
  AgencyMemberRole,
  AgentAvailability,
} from "@/types/admin";
import { Property } from "@/types/property";

export interface AdminUserQueryParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
  active?: boolean;
}

export interface AdminPropertyQueryParams {
  page?: number;
  limit?: number;
  status?: PropertyStatus;
  listingType?: ListingType;
  propertyType?: PropertyType;
  city?: string;
  ownerId?: string;
  search?: string;
}

export interface AdminEnquiryQueryParams {
  page?: number;
  limit?: number;
  status?: EnquiryStatus;
  propertyId?: string;
  buyerId?: string;
  ownerId?: string;
  from?: string;
  to?: string;
}

export interface AdminSiteVisitQueryParams {
  page?: number;
  limit?: number;
  status?: SiteVisitStatus;
  propertyId?: string;
  buyerId?: string;
  ownerId?: string;
  from?: string;
  to?: string;
}

export interface AgencyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
}

export interface AdminAuditLogQueryParams {
  page?: number;
  limit?: number;
  action?: AuditAction;
  entityType?: string;
  actorId?: string;
  from?: string;
  to?: string;
}

export class AdminApiService {
  // ============================================================================
  // 1. DASHBOARD & CRM ANALYTICS
  // ============================================================================

  static async getDashboardSummary(params?: { from?: string; to?: string }): Promise<DashboardSummaryResponse> {
    const res = await apiClient.get<DashboardSummaryResponse>("/admin/dashboard/summary", params as Record<string, unknown>);
    return res.data;
  }

  static async getDashboardLeads(params?: { from?: string; to?: string }): Promise<DashboardLeadsResponse> {
    const res = await apiClient.get<DashboardLeadsResponse>("/admin/dashboard/leads", params as Record<string, unknown>);
    return res.data;
  }

  static async getDashboardProperties(params?: { from?: string; to?: string }): Promise<DashboardPropertiesResponse> {
    const res = await apiClient.get<DashboardPropertiesResponse>("/admin/dashboard/properties", params as Record<string, unknown>);
    return res.data;
  }

  static async getDashboardOwners(): Promise<DashboardOwnerMetricItem[]> {
    const res = await apiClient.get<{ owners: DashboardOwnerMetricItem[] }>("/admin/dashboard/owners");
    return res.data.owners;
  }

  static async getAgentPerformance(): Promise<AdminAgentPerformanceItem[]> {
    const res = await apiClient.get<{ performance: AdminAgentPerformanceItem[] }>("/admin/dashboard/agents/performance");
    return res.data.performance;
  }

  // ============================================================================
  // 2. USER MANAGEMENT
  // ============================================================================

  static async getUsers(params?: AdminUserQueryParams): Promise<{ users: AdminUser[]; pagination: PaginationMeta }> {
    const res = await apiClient.get<{ users: AdminUser[]; pagination: PaginationMeta }>("/admin/users", params as Record<string, unknown>);
    return res.data;
  }

  static async getUserById(id: string): Promise<AdminUser> {
    const res = await apiClient.get<{ user: AdminUser }>(`/admin/users/${id}`);
    return res.data.user;
  }

  static async updateUserRole(id: string, role: UserRole): Promise<AdminUser> {
    const res = await apiClient.patch<{ user: AdminUser }>(`/admin/users/${id}/role`, { role });
    return res.data.user;
  }

  static async activateUser(id: string): Promise<AdminUser> {
    const res = await apiClient.patch<{ user: AdminUser }>(`/admin/users/${id}/activate`);
    return res.data.user;
  }

  static async deactivateUser(id: string): Promise<AdminUser> {
    const res = await apiClient.patch<{ user: AdminUser }>(`/admin/users/${id}/deactivate`);
    return res.data.user;
  }

  // ============================================================================
  // 3. PROPERTY MANAGEMENT & MODERATION
  // ============================================================================

  static async getProperties(params?: AdminPropertyQueryParams): Promise<{ properties: Property[]; pagination: PaginationMeta }> {
    const res = await apiClient.get<{ properties: Property[]; pagination: PaginationMeta }>("/admin/properties", params as Record<string, unknown>);
    return res.data;
  }

  static async getPropertyById(id: string): Promise<Property> {
    const res = await apiClient.get<{ property: Property }>(`/admin/properties/${id}`);
    return res.data.property;
  }

  static async publishProperty(id: string): Promise<Property> {
    const res = await apiClient.patch<{ property: Property }>(`/admin/properties/${id}/publish`);
    return res.data.property;
  }

  static async unpublishProperty(id: string): Promise<Property> {
    const res = await apiClient.patch<{ property: Property }>(`/admin/properties/${id}/unpublish`);
    return res.data.property;
  }

  static async archiveProperty(id: string): Promise<Property> {
    const res = await apiClient.patch<{ property: Property }>(`/admin/properties/${id}/archive`);
    return res.data.property;
  }

  // ============================================================================
  // 4. ENQUIRY MANAGEMENT & CRM LEAD ASSIGNMENT
  // ============================================================================

  static async getEnquiries(params?: AdminEnquiryQueryParams): Promise<{ enquiries: AdminSafeEnquiry[]; pagination: PaginationMeta }> {
    const res = await apiClient.get<{ enquiries: AdminSafeEnquiry[]; pagination: PaginationMeta }>("/admin/enquiries", params as Record<string, unknown>);
    return res.data;
  }

  static async getEnquiryById(id: string): Promise<AdminSafeEnquiry> {
    const res = await apiClient.get<{ enquiry: AdminSafeEnquiry }>(`/admin/enquiries/${id}`);
    return res.data.enquiry;
  }

  static async assignLead(enquiryId: string, agentId: string, reason?: string): Promise<AdminSafeEnquiry> {
    const res = await apiClient.post<{ lead: AdminSafeEnquiry }>(`/admin/enquiries/${enquiryId}/assign`, {
      agentId,
      reason,
    });
    return res.data.lead;
  }

  static async reassignLead(enquiryId: string, toAgentId: string, reason: string): Promise<AdminSafeEnquiry> {
    const res = await apiClient.patch<{ lead: AdminSafeEnquiry }>(`/admin/enquiries/${enquiryId}/reassign`, {
      agentId: toAgentId,
      reason,
    });
    return res.data.lead;
  }

  static async unassignLead(enquiryId: string, reason: string): Promise<AdminSafeEnquiry> {
    const res = await apiClient.patch<{ lead: AdminSafeEnquiry }>(`/admin/enquiries/${enquiryId}/unassign`, {
      reason,
    });
    return res.data.lead;
  }

  static async autoAssignLead(enquiryId: string): Promise<AdminSafeEnquiry> {
    const res = await apiClient.post<{ lead: AdminSafeEnquiry }>(`/admin/enquiries/${enquiryId}/auto-assign`);
    return res.data.lead;
  }

  // ============================================================================
  // 5. SITE VISIT OVERSIGHT
  // ============================================================================

  static async getSiteVisits(params?: AdminSiteVisitQueryParams): Promise<{ siteVisits: AdminSafeSiteVisit[]; pagination: PaginationMeta }> {
    const res = await apiClient.get<{ siteVisits: AdminSafeSiteVisit[]; pagination: PaginationMeta }>("/admin/site-visits", params as Record<string, unknown>);
    return res.data;
  }

  static async getSiteVisitById(id: string): Promise<AdminSafeSiteVisit> {
    const res = await apiClient.get<{ siteVisit: AdminSafeSiteVisit }>(`/admin/site-visits/${id}`);
    return res.data.siteVisit;
  }

  // ============================================================================
  // 6. AGENCY MANAGEMENT
  // ============================================================================

  static async createAgency(data: {
    name: string;
    code: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
  }): Promise<SafeAgency> {
    const res = await apiClient.post<{ agency: SafeAgency }>("/admin/agencies", data);
    return res.data.agency;
  }

  static async getAgencies(params?: AgencyQueryParams): Promise<{ agencies: SafeAgency[]; pagination: PaginationMeta }> {
    const res = await apiClient.get<{ agencies: SafeAgency[]; pagination: PaginationMeta }>("/admin/agencies", params as Record<string, unknown>);
    return res.data;
  }

  static async getAgencyById(id: string): Promise<SafeAgency> {
    const res = await apiClient.get<{ agency: SafeAgency }>(`/admin/agencies/${id}`);
    return res.data.agency;
  }

  static async updateAgency(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
    }
  ): Promise<SafeAgency> {
    const res = await apiClient.patch<{ agency: SafeAgency }>(`/admin/agencies/${id}`, data);
    return res.data.agency;
  }

  static async activateAgency(id: string): Promise<SafeAgency> {
    const res = await apiClient.patch<{ agency: SafeAgency }>(`/admin/agencies/${id}/activate`);
    return res.data.agency;
  }

  static async deactivateAgency(id: string): Promise<SafeAgency> {
    const res = await apiClient.patch<{ agency: SafeAgency }>(`/admin/agencies/${id}/deactivate`);
    return res.data.agency;
  }

  // Agency Members
  static async addAgencyMember(
    agencyId: string,
    userId: string,
    role?: AgencyMemberRole
  ): Promise<SafeAgencyMember> {
    const res = await apiClient.post<{ member: SafeAgencyMember }>(`/admin/agencies/${agencyId}/members`, {
      userId,
      role,
    });
    return res.data.member;
  }

  static async updateAgencyMember(
    agencyId: string,
    memberId: string,
    data: { role?: AgencyMemberRole; isActive?: boolean }
  ): Promise<SafeAgencyMember> {
    const res = await apiClient.patch<{ member: SafeAgencyMember }>(`/admin/agencies/${agencyId}/members/${memberId}`, data);
    return res.data.member;
  }

  static async removeAgencyMember(agencyId: string, memberId: string): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`/admin/agencies/${agencyId}/members/${memberId}`);
    return res.data;
  }

  // Agent Profiles
  static async getAgentProfile(userId: string): Promise<SafeAgentProfile> {
    const res = await apiClient.get<{ profile: SafeAgentProfile }>(`/admin/agents/${userId}/profile`);
    return res.data.profile;
  }

  static async updateAgentProfile(
    userId: string,
    data: {
      employeeCode?: string;
      designation?: string;
      specialization?: string;
      citiesServed?: string[];
      localitiesServed?: string[];
      maxActiveLeads?: number;
      availabilityStatus?: AgentAvailability;
    }
  ): Promise<SafeAgentProfile> {
    const res = await apiClient.patch<{ profile: SafeAgentProfile }>(`/admin/agents/${userId}/profile`, data);
    return res.data.profile;
  }

  // ============================================================================
  // 7. AUDIT LOGS
  // ============================================================================

  static async getAuditLogs(params?: AdminAuditLogQueryParams): Promise<{ auditLogs: SafeAuditLog[]; pagination: PaginationMeta }> {
    const res = await apiClient.get<{ auditLogs: SafeAuditLog[]; pagination: PaginationMeta }>("/admin/audit-logs", params as Record<string, unknown>);
    return res.data;
  }
}

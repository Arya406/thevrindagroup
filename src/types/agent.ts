// ==============================================================================
// TheVrindaGroup - Frontend Agent CRM Workspace Type Definitions
// ==============================================================================

import { EnquiryStatus, AssignmentStatus, PaginationMeta } from "./admin";

export interface AgentSafeLead {
  id: string;
  propertyId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
    slug: string;
    referenceCode: string;
    price: number;
    city: string;
    location?: {
      address: string;
      locality: string;
      city: string;
    };
  };
  buyer?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  owner?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
  assignmentStatus?: AssignmentStatus;
  assignedAt?: string | null;
  currentAssignment?: {
    id: string;
    agentId: string;
    status: AssignmentStatus;
    reason: string | null;
    assignedAt: string;
  } | null;
  siteVisits?: Array<{
    id: string;
    visitDate: string;
    preferredSlot: string;
    status: string;
  }>;
}

export interface PaginatedAgentLeads {
  leads: AgentSafeLead[];
  pagination: PaginationMeta;
}

export interface AgentDashboardMetrics {
  totalAssignedLeads: number;
  newLeads: number;
  contactedLeads: number;
  interestedLeads: number;
  siteVisitScheduled: number;
  closedLeads: number;
  notInterestedLeads: number;
  activeSiteVisits: number;
  completedSiteVisits: number;
  conversionRate: number;
  leadsReceivedToday: number;
  leadsClosedToday: number;
}

export interface AgentLeadQueryDto {
  page?: number;
  limit?: number;
  status?: EnquiryStatus;
  assignmentStatus?: AssignmentStatus;
  from?: string;
  to?: string;
  search?: string;
}

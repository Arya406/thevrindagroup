// ==============================================================================
// TheVrindaGroup - Frontend Admin & CRM Type Definitions
// ==============================================================================

export type UserRole = "BUYER" | "OWNER" | "AGENT" | "ADMIN";
export type PropertyStatus = "DRAFT" | "PENDING_APPROVAL" | "PUBLISHED" | "REJECTED" | "SOLD" | "RENTED" | "ARCHIVED";
export type ListingType = "SALE" | "RENT" | "LEASE";
export type PropertyType = "APARTMENT" | "VILLA" | "PENTHOUSE" | "PLOT" | "COMMERCIAL" | "OFFICE" | "SHOP" | "SHOWROOM" | "WAREHOUSE" | "LAND";
export type EnquiryStatus = "NEW" | "CONTACTED" | "INTERESTED" | "SITE_VISIT_SCHEDULED" | "CLOSED" | "NOT_INTERESTED";
export type SiteVisitStatus = "REQUESTED" | "CONFIRMED" | "RESCHEDULED" | "COMPLETED" | "CANCELLED_BY_BUYER" | "CANCELLED_BY_OWNER" | "NO_SHOW";
export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "PUBLISH" | "UNPUBLISH" | "ARCHIVE" | "ACTIVATE" | "DEACTIVATE" | "ASSIGN" | "REASSIGN" | "UNASSIGN" | "STATUS_CHANGE";
export type AgencyMemberRole = "AGENT" | "MANAGER" | "ADMIN";
export type AgentAvailability = "AVAILABLE" | "BUSY" | "ON_LEAVE" | "INACTIVE";
export type AssignmentStatus = "UNASSIGNED" | "ASSIGNED" | "REASSIGNED" | "COMPLETED";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: {
    propertiesOwned: number;
    enquiriesSubmitted: number;
    favorites: number;
    siteVisits: number;
    unreadNotifications: number;
  };
}

export interface DashboardSummaryResponse {
  users: {
    total: number;
    buyers: number;
    owners: number;
    agents: number;
    admins: number;
  };
  properties: {
    total: number;
    draft: number;
    published: number;
    sold: number;
    rented: number;
    archived: number;
  };
  enquiries: {
    total: number;
    new: number;
    contacted: number;
    interested: number;
    siteVisitScheduled: number;
    closed: number;
    notInterested: number;
  };
  siteVisits: {
    total: number;
    requested: number;
    confirmed: number;
    rescheduled: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
}

export interface DashboardLeadsResponse {
  total: number;
  new: number;
  contacted: number;
  interested: number;
  siteVisitScheduled: number;
  closed: number;
  notInterested: number;
  conversionRate: number;
  assignedLeads?: number;
  unassignedLeads?: number;
  reassignmentCount?: number;
  topAgents?: Array<{
    id: string;
    name: string;
    email: string;
    leadsCount: number;
    closedCount: number;
  }>;
}

export interface DashboardPropertiesResponse {
  total: number;
  published: number;
  sold: number;
  rented: number;
  archived: number;
  draft: number;
  mostActiveProperties: Array<{
    id: string;
    title: string;
    slug: string;
    referenceCode: string;
    enquiryCount: number;
  }>;
  mostFavoritedProperties: Array<{
    id: string;
    title: string;
    slug: string;
    referenceCode: string;
    favoriteCount: number;
  }>;
  propertiesWithUpcomingSiteVisits: Array<{
    id: string;
    title: string;
    slug: string;
    referenceCode: string;
    upcomingVisitCount: number;
  }>;
}

export interface DashboardOwnerMetricItem {
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  propertiesCount: number;
  publishedProperties: number;
  enquiriesCount: number;
  siteVisitsCount: number;
  soldCount: number;
  rentedCount: number;
}

export interface SafeAgency {
  id: string;
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  members?: SafeAgencyMember[];
}

export interface SafeAgencyMember {
  id: string;
  agencyId: string;
  userId: string;
  role: AgencyMemberRole;
  joinedAt: string;
  isActive: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
  };
}

export interface SafeAgentProfile {
  id: string;
  userId: string;
  agencyId: string | null;
  employeeCode: string | null;
  designation: string | null;
  specialization: string | null;
  citiesServed: string[];
  localitiesServed: string[];
  maxActiveLeads: number;
  currentActiveLeads: number;
  availabilityStatus: AgentAvailability;
  createdAt: string;
  updatedAt: string;
  user?: AdminUser;
  agency?: SafeAgency | null;
}

export interface AdminAgentPerformanceItem {
  agent: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
  };
  profile?: SafeAgentProfile | null;
  totalAssigned: number;
  activeLeads: number;
  contacted: number;
  interested: number;
  siteVisits: number;
  closed: number;
  notInterested: number;
  conversionRate: number;
  completedSiteVisits: number;
}

export interface AdminSafeEnquiry {
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
  };
  assignedAgent?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
  assignedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
  assignedAt?: string | null;
  assignmentStatus?: AssignmentStatus;
  assignmentHistory?: Array<{
    id: string;
    agentId: string;
    status: AssignmentStatus;
    reason: string | null;
    assignedAt: string;
    agent: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export interface AdminSafeSiteVisit {
  id: string;
  propertyId: string;
  userId: string;
  visitDate: string;
  preferredSlot: string;
  status: SiteVisitStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
    referenceCode: string;
    city: string;
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
  };
}

export interface SafeAuditLog {
  id: string;
  actorId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

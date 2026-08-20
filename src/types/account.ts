export type PropertyStatus =
  | "ACTIVE"
  | "PENDING"
  | "DRAFT"
  | "REJECTED"
  | "EXPIRED"
  | "SOLD"
  | "RENTED";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "SITE VISIT"
  | "NEGOTIATION"
  | "CLOSED"
  | "NOT INTERESTED";

export type LeadEnquiryType =
  | "Request Callback"
  | "Schedule Visit"
  | "Request More Information"
  | "Request Pricing"
  | "Request Floor Plan";

export type VisitStatus = "UPCOMING" | "COMPLETED" | "CANCELLED";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "owner" | "agent";
  companyName?: string;
  companyWebsite?: string;
  avatarUrl?: string;
  notifications: {
    emailNotifications: boolean;
    enquiryAlerts: boolean;
    visitReminders: boolean;
  };
}

export interface ManagedProperty {
  id: string;
  title: string;
  location: string;
  city: string;
  price: number;
  formattedPrice: string;
  image: string;
  status: PropertyStatus;
  views: number;
  enquiries: number;
  saves: number;
  visits: number;
  postedAt: string;
  propertyType: string;
  transactionType: "sale" | "rent";
  category: "residential" | "commercial";
  bhk?: string;
  carpetArea: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  enquiryType: LeadEnquiryType;
  message: string;
  preferredTime?: string;
  createdAt: string;
  status: LeadStatus;
}

export interface ScheduledVisit {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  visitorName: string;
  visitorPhone: string;
  visitorEmail: string;
  date: string; // e.g. "Tomorrow, 10:30 AM" or "Saturday, Aug 24"
  timeSlot: string;
  status: VisitStatus;
  notes?: string;
}

export interface AccountStats {
  activeListings: number;
  pendingReview: number;
  totalEnquiries: number;
  upcomingVisits: number;
  totalViews: number;
}

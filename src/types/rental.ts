export type FurnishingType =
  | "Fully Furnished"
  | "Semi Furnished"
  | "Unfurnished";

export type TenantPreference =
  | "Family"
  | "Bachelor"
  | "Working Professional"
  | "Student"
  | "Any";

export type RentalAvailability =
  | "Immediately Available"
  | "Within 15 Days"
  | "Within 30 Days";

export type RentalPropertyType =
  | "apartment"
  | "independent-house"
  | "villa"
  | "studio"
  | "pg";

export interface RentalProperty {
  id: string;
  title: string;
  monthlyRent: number; // in INR per month (e.g. 32000)
  formattedRent: string; // "₹ 32,000 / mo"
  securityDeposit: string; // "₹ 1.20 Lacs"
  securityDepositNumeric: number;
  maintenanceCharges?: string; // "₹ 2,500 / mo"
  noticePeriod?: string; // "1 Month"
  bhk: string; // "1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"
  bhkNumeric: number;
  bathrooms: number;
  carpetArea: string;
  location: string;
  locality: string;
  city: string;
  address: string;
  propertyType: RentalPropertyType;
  furnishingStatus: FurnishingType;
  tenantPreference: TenantPreference[];
  availability: RentalAvailability;
  availableFromDate?: string;
  floor?: string;
  totalFloors?: string;
  ageOfProperty?: string;
  parking?: string;
  facing?: string;
  isReraVerified: boolean;
  isOwnerVerified: boolean;
  sellerType: "owner" | "agent" | "developer";
  sellerName: string;
  sellerPhone?: string;
  image: string;
  images: string[];
  description: string;
  amenities: string[];
  nearbyFacilities?: {
    metro?: string;
    itParks?: string;
    schools?: string;
    hospitals?: string;
    shopping?: string;
  };
  postedDate: string;
  isFeatured?: boolean;
}

export interface RentalFilters {
  city: string;
  locality: string;
  minRent?: number;
  maxRent?: number;
  rentRange: string;
  bhkList: string[];
  propertyTypes: string[];
  furnishingList: string[];
  tenantPreferences: string[];
  availabilityList: string[];
  amenities: string[];
  sellerTypes: string[];
  isReraOnly: boolean;
  isOwnerOnly: boolean;
}

export interface RentalEnquiry {
  propertyId: string;
  propertyTitle: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  interestType: "Schedule Visit" | "Request Callback" | "WhatsApp" | "More Information";
  message: string;
}

export interface RentalVisitRequest {
  propertyId: string;
  propertyTitle: string;
  userName: string;
  userPhone: string;
  visitDate: string;
  preferredSlot: "Morning (09:00 AM - 12:00 PM)" | "Afternoon (12:00 PM - 04:00 PM)" | "Evening (04:00 PM - 07:00 PM)";
  notes?: string;
}

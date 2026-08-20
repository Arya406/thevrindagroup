export type CommercialTransactionType =
  | "rent"
  | "sale"
  | "lease"
  | "coworking";

export type CommercialPropertyType =
  | "office"
  | "shop"
  | "showroom"
  | "warehouse"
  | "industrial"
  | "coworking"
  | "plot"
  | "retail"
  | "restaurant";

export type CommercialFurnishing =
  | "Fully Furnished"
  | "Semi Furnished"
  | "Bare Shell"
  | "Warm Shell"
  | "Unfurnished";

export interface CommercialProperty {
  id: string;
  title: string;
  transactionType: CommercialTransactionType;
  propertyType: CommercialPropertyType;
  priceFormatted: string; // e.g. "₹ 4.50 L / mo" or "₹ 8.50 Cr"
  priceNumeric: number;
  carpetArea: string; // e.g. "4,500 sq.ft"
  builtUpArea?: string; // e.g. "5,200 sq.ft"
  areaNumeric: number; // in sq.ft for sorting
  location: string;
  locality: string;
  businessDistrict: string;
  city: string;
  address: string;
  floor: string;
  totalFloors: string;
  parking: string; // e.g. "8 Reserved Car Parks"
  furnishingStatus: CommercialFurnishing;
  possessionStatus: "Ready to Move" | "Under Construction" | "Immediate";
  ageOfProperty?: string;
  isReraVerified: boolean;
  reraNumber?: string;
  sellerType: "developer" | "agent" | "owner";
  sellerName: string;
  sellerPhone?: string;
  image: string;
  images: string[];
  description: string;
  amenities: string[];
  // Financial & Lease Terms
  securityDeposit?: string; // "6 Months Rent"
  maintenanceCharges?: string; // "₹ 15 / sq.ft"
  lockInPeriod?: string; // "3 Years"
  noticePeriod?: string; // "3 Months"
  estimatedRentalYield?: string; // "8.4% p.a." (for sale properties)
  estimatedMonthlyRent?: string; // "₹ 5.80 L / mo" (for sale properties)
  nearbyFacilities?: {
    metro?: string;
    airport?: string;
    highway?: string;
    businessHub?: string;
    hotels?: string;
    banking?: string;
  };
  postedDate: string;
  isFeatured?: boolean;
}

export interface CommercialFilters {
  city: string;
  locality: string;
  businessDistrict: string;
  transactionType: string;
  propertyTypes: string[];
  minArea?: number;
  maxArea?: number;
  areaRange: string;
  minPrice?: number;
  maxPrice?: number;
  priceRange: string;
  possessionStatus: string[];
  furnishingList: string[];
  floorLevels: string[];
  parkingList: string[];
  amenities: string[];
  isReraOnly: boolean;
}

export interface CommercialEnquiry {
  propertyId: string;
  propertyTitle: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  companyName: string;
  businessType: string;
  interestType:
    | "Schedule Site Visit"
    | "Request Callback"
    | "Request Pricing"
    | "Request Floor Plan"
    | "Request More Information";
  message: string;
}

export interface CommercialVisitRequest {
  propertyId: string;
  propertyTitle: string;
  userName: string;
  userPhone: string;
  companyName?: string;
  visitDate: string;
  preferredSlot:
    | "Morning (09:00 AM - 12:00 PM)"
    | "Afternoon (12:00 PM - 04:00 PM)"
    | "Evening (04:00 PM - 07:00 PM)";
  notes?: string;
}

export interface CoworkingSpaceOption {
  id: string;
  title: string;
  type: "Private Office" | "Dedicated Desk" | "Hot Desk" | "Meeting Room" | "Virtual Office";
  capacity: string;
  startingPrice: string;
  pricingPeriod: string;
  amenities: string[];
  image: string;
}

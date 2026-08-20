export type OwnerType = "owner" | "agent" | "developer";

export type PostTransactionType = "sale" | "rent";

export type PropertyCategory = "residential" | "commercial";

export type ResidentialType =
  | "apartment"
  | "villa"
  | "independent-house"
  | "builder-floor"
  | "plot"
  | "studio";

export type CommercialType =
  | "office"
  | "shop"
  | "showroom"
  | "warehouse"
  | "coworking"
  | "retail"
  | "industrial"
  | "plot";

export interface UploadedPhoto {
  id: string;
  url: string;
  name: string;
  isCover: boolean;
}

export interface ListingLocation {
  city: string;
  locality: string;
  projectSociety: string;
  landmark: string;
  address: string;
}

export interface ResidentialDetails {
  bhk: string; // "1", "2", "3", "4", "5+"
  bathrooms: string; // "1", "2", "3", "4+"
  balconies: string; // "0", "1", "2", "3+"
  carpetArea: string; // e.g. "1450"
  builtUpArea?: string; // e.g. "1750"
  floor: string; // e.g. "4th Floor"
  totalFloors: string; // e.g. "14"
  propertyAge: string; // "< 1 Year", "1-3 Years", "3-5 Years", "5-10 Years", "10+ Years"
  facing: string; // "East", "North", "North-East", "West", "South"
  furnishing: "Fully Furnished" | "Semi Furnished" | "Unfurnished";
  parking: "1 Covered" | "2 Covered" | "1 Open" | "2+ Covered" | "None";
  possessionStatus: "Ready to Move" | "Under Construction" | "New Launch";
}

export interface CommercialDetails {
  carpetArea: string; // e.g. "4500"
  builtUpArea?: string; // e.g. "5200"
  floor: string; // e.g. "6th Floor"
  totalFloors: string; // e.g. "18"
  propertyAge: string;
  parking: string; // e.g. "8 Reserved Parking"
  furnishing: "Fully Furnished" | "Semi Furnished" | "Warm Shell" | "Bare Shell" | "Unfurnished";
  possessionStatus: "Ready to Move" | "Under Construction" | "Immediate";
  hasConferenceRoom?: boolean;
  hasReception?: boolean;
  hasPantry?: boolean;
  hasPowerBackup?: boolean;
  hasCentralAc?: boolean;
  hasFireSafety?: boolean;
}

export interface ListingPricing {
  // For Sale
  expectedPrice?: string; // e.g. "12500000"
  isPriceNegotiable?: boolean;
  // For Rent
  monthlyRent?: string; // e.g. "35000"
  securityDeposit?: string; // e.g. "150000"
  maintenanceCharges?: string; // e.g. "3500"
  availableFrom?: string;
  // Commercial Specific
  leaseDuration?: string; // e.g. "3 Years"
}

export interface PropertyListingDraft {
  id: string;
  currentStep: number; // 0 = Landing, 1 = Type, 2 = Loc, 3 = Details, 4 = Photos, 5 = Price, 6 = Amenities & Desc, 7 = Review, 8 = Success
  ownerType: OwnerType;
  transaction: PostTransactionType;
  category: PropertyCategory;
  residentialType: ResidentialType;
  commercialType: CommercialType;
  location: ListingLocation;
  residentialDetails: ResidentialDetails;
  commercialDetails: CommercialDetails;
  photos: UploadedPhoto[];
  pricing: ListingPricing;
  amenities: string[];
  description: string;
  isConfirmed: boolean;
  submittedAt?: string;
}

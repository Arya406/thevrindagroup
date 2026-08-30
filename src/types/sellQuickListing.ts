// ==============================================================================
// TheVrindaGroup - SELL Quick Listing Architecture Types (V1)
// Supports Residential, Plot / Land, and Commercial with Skip-for-Now capability
// ==============================================================================

export type QuickListingCategory = "residential" | "plot" | "commercial";

export type ResidentialSubtype =
  | "house"
  | "apartment"
  | "villa"
  | "builder-floor"
  | "other";

export type PlotSubtype =
  | "residential-plot"
  | "commercial-plot"
  | "agricultural-land"
  | "other";

export type CommercialSubtype =
  | "office"
  | "shop"
  | "showroom"
  | "warehouse"
  | "industrial"
  | "hotel"
  | "restaurant"
  | "building"
  | "other";

export type QuickListingSubtype =
  | ResidentialSubtype
  | PlotSubtype
  | CommercialSubtype;

export type AreaUnitOption = "SQ_FT" | "SQ_YD" | "SQ_M" | "ACRE" | "BIGHA";

export type FacingDirection =
  | "North"
  | "South"
  | "East"
  | "West"
  | "North-East"
  | "North-West"
  | "South-East"
  | "South-West";

export type FurnishingType = "UNFURNISHED" | "SEMI_FURNISHED" | "FULLY_FURNISHED";

export interface QuickListingPhoto {
  id: string;
  file?: File | null;
  previewUrl: string;
  name: string;
  isExisting?: boolean;
  remoteId?: string;
}

export interface QuickListingLocation {
  state: string;
  city: string;
  locality: string;
  address: string;
  pincode: string;
  landmark?: string;
}

export interface QuickListingFormState {
  // Category & Type
  category: QuickListingCategory;
  subtype: QuickListingSubtype;

  // Residential-specific conditional fields
  houseRooms?: string; // for House
  bhk?: string; // for Apartment, Villa, Builder Floor: "1", "2", "3", "4", "5+"

  // Pricing (Asking Price only)
  askingPrice: string;

  // Location
  location: QuickListingLocation;

  // Area (Optional with units)
  area: string;
  areaUnit: AreaUnitOption;
  plotArea?: string;
  carpetArea?: string;
  builtUpArea?: string;

  // Optional Specifications
  bathrooms?: string;
  furnishingStatus?: FurnishingType | "";
  amenities: string[];
  facing?: FacingDirection | "";

  // Plot-specific optional fields
  plotWidth?: string;
  plotLength?: string;
  roadWidth?: string;

  // Commercial-specific optional fields
  propertyFloor?: string;
  totalFloors?: string;
  buildingFloors?: string;

  // Title & Description
  title: string;
  isTitleManuallyEdited: boolean;
  description: string;

  // Photos (Optional)
  photos: QuickListingPhoto[];

  // Skipped sections tracking
  skippedSections: Record<string, boolean>;
}

export interface QuickListingSubmissionResult {
  id: string;
  referenceCode: string;
  title: string;
  category: QuickListingCategory;
  subtype: QuickListingSubtype;
  city: string;
  locality: string;
  price: string;
  status: "DRAFT" | "PUBLISHED";
  submittedAt: string;
}

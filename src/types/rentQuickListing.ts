// ==============================================================================
// TheVrindaGroup - RENT Quick Listing Architecture (V1) Types
// Zero-Default Rule: All optional fields default to empty string / empty array
// ==============================================================================

export type RentCategory = "residential" | "commercial";

export type RentResidentialSubtype =
  | "house"
  | "apartment"
  | "villa"
  | "other";

export type RentHouseType = "full-house" | "part-of-house" | "room";

export type RentCommercialSubtype =
  | "office"
  | "shop"
  | "showroom"
  | "other";

export type RentRoomBathroom = "private" | "shared" | "";

export type RentVillaParking = "available" | "not-available" | "";

export type RentFurnishingStatus =
  | ""
  | "UNFURNISHED"
  | "SEMI_FURNISHED"
  | "FULLY_FURNISHED";

export type RentAreaUnitOption = "SQ_FT" | "SQ_YD" | "SQ_M" | "ACRE";

export interface RentPhotoItem {
  id: string;
  file: File | null;
  previewUrl: string;
  name: string;
  isExisting?: boolean;
  remoteId?: string;
}

export interface RentQuickListingLocation {
  state: string;
  city: string;
  locality: string;
  address: string;
  pincode: string;
  landmark?: string;
}

export interface RentQuickListingFormState {
  // Top-level classification
  category: RentCategory;
  residentialSubtype: RentResidentialSubtype;
  commercialSubtype: RentCommercialSubtype;

  // House-specific classification
  houseType: RentHouseType;
  houseFloor: string; // REQUIRED if houseType === 'part-of-house'
  houseRooms: string; // Optional for full-house / part-of-house
  roomBathroom: RentRoomBathroom; // Optional for room (private/shared)

  // Apartment & Villa fields
  bhk: string; // Optional for apartment & villa (no default)
  villaParking: RentVillaParking; // Optional for villa (available/not-available)

  // Residential Other fields
  residentialOtherType: string; // "Studio", "Duplex", "Farm House", "Independent Floor", "Paying Guest", "Other"
  customPropertyType: string; // If residentialOtherType === 'Other'

  // Commercial fields
  builtUpArea: string; // Optional for office, shop, showroom
  areaUnit: RentAreaUnitOption;

  // Shared Residential Specs (House, Flat, Villa)
  bathrooms: string; // Optional (1, 2, 3, 4, 5+)
  furnishingStatus: RentFurnishingStatus;
  amenities: string[]; // Centralized amenity names/slugs

  // Pricing (Required across all flows)
  monthlyRent: string; // Only 1 pricing field

  // Location (State & City required, locality/address/pincode optional)
  location: RentQuickListingLocation;

  // Photos (Optional everywhere)
  photos: RentPhotoItem[];

  // Title & Description
  title: string;
  isTitleManuallyEdited: boolean;
  description: string;

  // Track skipped sections
  skippedSections: Record<string, boolean>;
}

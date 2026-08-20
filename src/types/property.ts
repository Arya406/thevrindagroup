export type ListingType = "buy" | "rent" | "commercial";

export type PropertyType =
  | "apartment"
  | "villa"
  | "plot"
  | "penthouse"
  | "commercial-office"
  | "retail-shop";

export interface Property {
  id: string;
  title: string;
  price: string;
  priceNumeric: number; // in INR
  bhk: number | string;
  bathrooms: number;
  carpetArea: string; // e.g. "1,450 sq.ft"
  location: string;
  city: string;
  address: string;
  propertyType: PropertyType;
  listingType: ListingType;
  isReraVerified: boolean;
  reraNumber?: string;
  sellerType: "owner" | "agent";
  sellerName: string;
  sellerPhone?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  image: string;
  images: string[];
  description: string;
  furnishingStatus: "Furnished" | "Semi-Furnished" | "Unfurnished";
  possessionStatus: "Ready to Move" | "Under Construction";
  floor?: string;
  facing?: string;
  parking?: string;
  amenities: string[];
  postedDate: string;
}

export interface NewProject {
  id: string;
  name: string;
  developer: string;
  location: string;
  city: string;
  startingPrice: string;
  startingPriceNumeric: number;
  propertyTypes: string; // e.g. "2, 3 & 4 BHK Luxury Apartments"
  possessionDate: string;
  possessionStatus: string;
  image: string;
  reraNumber: string;
  tag?: string;
  unitsAvailable?: number;
  highlight: string;
}

export interface CityInfo {
  id: string;
  name: string;
  state: string;
  propertyCount: string;
  image: string;
  popularLocalities: string[];
}

export interface SearchFilterState {
  listingType: ListingType;
  location: string;
  propertyType: string;
  budget: string;
  bhk: string;
}

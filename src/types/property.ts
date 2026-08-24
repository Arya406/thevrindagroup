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
  referenceCode?: string;
  slug?: string;
  title: string;
  price: string;
  priceNumeric: number; // in INR
  priceUnit?: string;
  bhk: number | string;
  bathrooms: number;
  carpetArea: string; // e.g. "1,450 sq.ft"
  areaNumeric?: number;
  location: string;
  city: string;
  state?: string;
  pincode?: string;
  address: string;
  propertyType: PropertyType;
  listingType: ListingType;
  isReraVerified: boolean;
  reraNumber?: string;
  sellerType: "owner" | "agent" | "developer";
  sellerName: string;
  sellerPhone?: string;
  owner?: {
    id: string;
    name: string;
    email?: string;
    phone?: string | null;
    avatarUrl?: string | null;
    role?: string;
  };
  isFeatured?: boolean;
  isNew?: boolean;
  image: string;
  images: string[];
  description: string;
  furnishingStatus: "Furnished" | "Semi-Furnished" | "Unfurnished" | string;
  possessionStatus: "Ready to Move" | "Under Construction" | string;
  floor?: string;
  facing?: string;
  parking?: string;
  amenities: string[];
  postedDate: string;
  status?: string;
  isApproved?: boolean;
}

export interface NewProject {
  id: string;
  name: string;
  developer: string;
  location: string;
  city: string;
  startingPrice: string;
  startingPriceNumeric: number;
  propertyTypes: string;
  possessionDate: string;
  possessionStatus?: string;
  image: string;
  reraNumber?: string;
  tag?: string;
  unitsAvailable?: number;
  highlight?: string;
}

export interface CityInfo {
  id: string;
  name: string;
  state: string;
  propertyCount: string;
  image: string;
  popularLocalities: string[];
}

export interface CommercialProperty {
  id: string;
  title: string;
  price: string;
  priceNumeric: number;
  suitableFor: string[];
  carpetArea: string;
  location: string;
  city: string;
  image: string;
  type: "office" | "retail" | "warehouse";
}

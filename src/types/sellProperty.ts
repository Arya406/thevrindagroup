// ==============================================================================
// TheVrindaGroup - Minimal Sell Property Form Types
// ==============================================================================

export type SellCategory = "residential" | "commercial" | "plot";

export type ResidentialSubtype = "apartment" | "villa" | "independent-house";

export type CommercialSubtype = "office" | "shop" | "showroom" | "warehouse";

export type PlotSubtype = "plot";

export type SellSubtype = ResidentialSubtype | CommercialSubtype | PlotSubtype;

export interface SellPropertyPhoto {
  id: string;
  file?: File | null;
  previewUrl: string;
  name: string;
  isExisting?: boolean;
  remoteId?: string;
}

export interface SellPropertyFormState {
  category: SellCategory;
  subtype: SellSubtype;
  city: string;
  locality: string;
  projectSociety: string;
  landmark: string;
  pincode: string;
  bhk: string; // "1", "2", "3", "4", "5+"
  area: string;
  areaUnit: "SQ_FT" | "SQ_YD" | "ACRE";
  expectedPrice: string;
  isPriceNegotiable: boolean;
  photos: SellPropertyPhoto[];
}

export interface SubmittedPropertyResult {
  id: string;
  referenceCode: string;
  title: string;
  category: SellCategory;
  subtype: SellSubtype;
  city: string;
  locality: string;
  area: string;
  price: string;
  status: "DRAFT";
  submittedAt: string;
}

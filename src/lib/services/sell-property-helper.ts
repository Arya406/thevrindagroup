// ==============================================================================
// TheVrindaGroup - Minimal Sell Property Form Helper & DTO Mapper
// ==============================================================================

import { CreatePropertyDto } from "./property-api";
import {
  SellPropertyFormState,
  SellCategory,
  SellSubtype,
} from "@/types/sellProperty";

const CITY_STATE_MAP: Record<string, string> = {
  bangalore: "Karnataka",
  bengaluru: "Karnataka",
  mysore: "Karnataka",
  mysuru: "Karnataka",
  mangalore: "Karnataka",
  mumbai: "Maharashtra",
  pune: "Maharashtra",
  nagpur: "Maharashtra",
  thane: "Maharashtra",
  navi_mumbai: "Maharashtra",
  delhi: "Delhi",
  new_delhi: "Delhi",
  gurgaon: "Haryana",
  gurugram: "Haryana",
  faridabad: "Haryana",
  noida: "Uttar Pradesh",
  greater_noida: "Uttar Pradesh",
  ghaziabad: "Uttar Pradesh",
  lucknow: "Uttar Pradesh",
  varanasi: "Uttar Pradesh",
  hyderabad: "Telangana",
  secunderabad: "Telangana",
  chennai: "Tamil Nadu",
  coimbatore: "Tamil Nadu",
  madurai: "Tamil Nadu",
  kolkata: "West Bengal",
  ahmedabad: "Gujarat",
  surat: "Gujarat",
  vadodara: "Gujarat",
  jaipur: "Rajasthan",
  kochi: "Kerala",
  ernakulam: "Kerala",
  thiruvananthapuram: "Kerala",
  chandigarh: "Chandigarh",
  goa: "Goa",
  bhubaneswar: "Odisha",
  patna: "Bihar",
  indore: "Madhya Pradesh",
  bhopal: "Madhya Pradesh",
};

/**
 * Infer Indian state from city name
 */
export function inferIndianState(city: string): string {
  const normalized = city.trim().toLowerCase().replace(/\s+/g, "_");
  if (CITY_STATE_MAP[normalized]) {
    return CITY_STATE_MAP[normalized];
  }
  // Check substring match
  for (const [key, state] of Object.entries(CITY_STATE_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return state;
    }
  }
  return "Karnataka";
}

/**
 * Format Indian Price into clean short text (₹ Lakhs / ₹ Cr)
 */
export function formatIndianPricePreview(val: string | number): string {
  if (val === undefined || val === null || val === "") return "";
  const str = String(val).trim();
  if (str.includes("-")) return "";

  const numeric = typeof val === "number" ? val : Number(str);
  if (isNaN(numeric) || numeric <= 0) return "";

  if (numeric >= 10000000) {
    const cr = (numeric / 10000000).toFixed(2).replace(/\.00$/, "");
    return `₹${cr} Cr`;
  }
  if (numeric >= 100000) {
    const l = (numeric / 100000).toFixed(2).replace(/\.00$/, "");
    return `₹${l} Lakh`;
  }
  return `₹${numeric.toLocaleString("en-IN")}`;
}

/**
 * Map SellPropertyFormState into typed CreatePropertyDto for POST /api/properties or PATCH /api/properties/:id
 */
export function mapSellDraftToCreateDto(form: SellPropertyFormState): CreatePropertyDto {
  const city = form.city.trim() || "Bangalore";
  const locality = form.locality.trim() || "Central";
  const society = form.projectSociety?.trim() || "";
  const landmark = form.landmark?.trim() || null;
  const pincode = form.pincode?.trim() || "";

  // 1. Property Type Mapping
  let propertyType: CreatePropertyDto["propertyType"] = "APARTMENT";
  if (form.category === "residential") {
    if (form.subtype === "villa") {
      propertyType = "VILLA";
    } else if (form.subtype === "independent-house") {
      propertyType = "HOUSE";
    } else {
      propertyType = "APARTMENT";
    }
  } else if (form.category === "commercial") {
    switch (form.subtype) {
      case "office":
        propertyType = "OFFICE";
        break;
      case "shop":
        propertyType = "SHOP";
        break;
      case "showroom":
        propertyType = "SHOWROOM";
        break;
      case "warehouse":
        propertyType = "WAREHOUSE";
        break;
      default:
        propertyType = "OFFICE";
    }
  } else {
    propertyType = "PLOT";
  }

  // 2. Price and Area (Strict numeric conversion)
  const price = Number(form.expectedPrice.trim());
  const area = Number(form.area.trim());
  const areaUnit = form.areaUnit || "SQ_FT";

  // 3. Bedrooms (Residential only)
  let bedrooms: number | null = null;
  if (form.category === "residential") {
    bedrooms = parseInt(form.bhk.replace(/[^0-9]/g, "") || "2", 10) || 2;
  }

  // 4. Construct Descriptive Title
  let title = "";
  const place = society ? `${society}, ${locality}` : locality;
  if (form.category === "residential") {
    const typeLabel =
      form.subtype === "villa"
        ? "Villa"
        : form.subtype === "independent-house"
        ? "Independent House"
        : "Apartment";
    title = `${bedrooms} BHK ${typeLabel} in ${place}, ${city}`;
  } else if (form.category === "commercial") {
    const subtypeLabel = form.subtype.charAt(0).toUpperCase() + form.subtype.slice(1);
    title = `${area} sq.ft ${subtypeLabel} Space in ${place}, ${city}`;
  } else {
    const unitLabel = areaUnit === "ACRE" ? "Acres" : areaUnit === "SQ_YD" ? "sq.yd" : "sq.ft";
    title = `${area} ${unitLabel} Plot / Land in ${place}, ${city}`;
  }

  // 5. Construct Draft Description
  const formattedPrice = formatIndianPricePreview(price);
  const description = `Property submission for ${title}. Features ${area} ${areaUnit} with an expected price of ${formattedPrice || "₹" + price}. Submitted for TheVrindaGroup verification.`;

  // 6. Address synthesis
  const address = society
    ? `${society}, ${locality}, ${city}`
    : `${locality}, ${city}`;

  const state = inferIndianState(city);

  return {
    title,
    description,
    propertyType,
    listingType: "SALE",
    price,
    priceUnit: "TOTAL",
    area,
    areaUnit,
    bedrooms,
    bathrooms: null,
    balconies: null,
    floorNumber: null,
    totalFloors: null,
    furnishingStatus: null,
    availableFrom: null,
    location: {
      address,
      locality,
      city,
      state,
      pincode,
      landmark,
    },
    amenityIds: [],
  };
}

export interface MapPropertyInput {
  propertyType?: string;
  location?: {
    locality?: string;
    city?: string;
    landmark?: string;
    pincode?: string;
  } | string;
  city?: string;
  pincode?: string;
  images?: string[];
  bhk?: string | number;
  areaNumeric?: number;
  areaUnit?: "SQ_FT" | "SQ_YD" | "ACRE";
  priceNumeric?: number;
}

/**
 * Map an existing Property entity into SellPropertyFormState for Edit Mode
 */
export function mapPropertyToSellFormState(property: MapPropertyInput): SellPropertyFormState {
  let category: SellCategory = "residential";
  let subtype: SellSubtype = "apartment";

  const pt = (property.propertyType || "").toLowerCase();
  if (pt === "commercial-office" || pt === "office") {
    category = "commercial";
    subtype = "office";
  } else if (pt === "retail-shop" || pt === "shop") {
    category = "commercial";
    subtype = "shop";
  } else if (pt === "showroom") {
    category = "commercial";
    subtype = "showroom";
  } else if (pt === "warehouse") {
    category = "commercial";
    subtype = "warehouse";
  } else if (pt === "plot" || pt === "land") {
    category = "plot";
    subtype = "plot";
  } else if (pt === "villa") {
    category = "residential";
    subtype = "villa";
  } else if (pt === "house" || pt === "independent-house") {
    category = "residential";
    subtype = "independent-house";
  } else {
    category = "residential";
    subtype = "apartment";
  }

  // Extract locality, city, landmark, pincode safely
  let locality = "";
  let city = property.city || "Bangalore";
  let landmark = "";
  let pincode = property.pincode || "";

  if (property.location) {
    if (typeof property.location === "object") {
      locality = property.location.locality || "";
      if (property.location.city) city = property.location.city;
      if (property.location.landmark) landmark = property.location.landmark;
      if (property.location.pincode) pincode = property.location.pincode;
    } else if (typeof property.location === "string") {
      locality = property.location.split(",")[0]?.trim() || "";
    }
  }

  // Extract existing photos
  const existingPhotos = (property.images || []).map((imgUrl: string, idx: number) => ({
    id: `existing-photo-${idx}-${Date.now()}`,
    file: null,
    previewUrl: imgUrl,
    name: `Photo ${idx + 1}`,
    isExisting: true,
  }));

  return {
    category,
    subtype,
    city,
    locality,
    projectSociety: "",
    landmark,
    pincode,
    bhk: property.bhk ? String(property.bhk) : "2",
    area: property.areaNumeric ? String(property.areaNumeric) : "",
    areaUnit: property.areaUnit || "SQ_FT",
    expectedPrice: property.priceNumeric ? String(property.priceNumeric) : "",
    isPriceNegotiable: true,
    photos: existingPhotos,
  };
}

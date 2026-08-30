// ==============================================================================
// TheVrindaGroup - SELL Quick Listing Helper & DTO Mapper
// Generates accurate titles from populated fields without artificial defaults
// ==============================================================================

import {
  QuickListingCategory,
  QuickListingSubtype,
  QuickListingFormState,
  AreaUnitOption,
} from "../../types/sellQuickListing";
import { findDistricts } from "../../data/location/canonicalLocations";
import { CreatePropertyDto } from "./property-api";

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
  kota: "Rajasthan",
  jodhpur: "Rajasthan",
  udaipur: "Rajasthan",
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
  if (!city || !city.trim()) return "Rajasthan";
  const canonicalMatches = findDistricts(city.trim());
  if (canonicalMatches.length > 0) {
    return canonicalMatches[0].state;
  }
  const normalized = city.trim().toLowerCase().replace(/\s+/g, "_");
  if (CITY_STATE_MAP[normalized]) {
    return CITY_STATE_MAP[normalized];
  }
  for (const [key, state] of Object.entries(CITY_STATE_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return state;
    }
  }
  return "Rajasthan";
}

/**
 * Format Indian Price into clean short text (₹ Lakhs / ₹ Cr)
 */
export function formatIndianPricePreview(val: string | number | undefined | null): string {
  if (val === undefined || val === null || val === "") return "";
  const str = String(val).trim();
  if (str.includes("-")) return "";

  const numeric = typeof val === "number" ? val : Number(str);
  if (isNaN(numeric) || numeric <= 0) return "";

  if (numeric >= 10000000) {
    const cr = (numeric / 10000000).toFixed(2).replace(/\.00$/, "");
    return `₹ ${cr} Cr`;
  }
  if (numeric >= 100000) {
    const l = (numeric / 100000).toFixed(2).replace(/\.00$/, "");
    return `₹ ${l} Lakh`;
  }
  return `₹ ${numeric.toLocaleString("en-IN")}`;
}

/**
 * Get readable label for area units
 */
export function formatAreaUnitLabel(unit: AreaUnitOption): string {
  switch (unit) {
    case "SQ_FT":
      return "Sq.Ft.";
    case "SQ_YD":
      return "Sq.Yard";
    case "SQ_M":
      return "Sq.M.";
    case "ACRE":
      return "Acres";
    case "BIGHA":
      return "Bigha";
    default:
      return "Sq.Ft.";
  }
}

/**
 * Deterministic title generator based ONLY on populated fields.
 * NEVER creates fake BHK, fake city, or fake area when not provided.
 */
export function generateDeterministicTitle(form: Partial<QuickListingFormState>): string {
  const category = form.category || "residential";
  const subtype = form.subtype;
  const city = form.location?.city?.trim() || "";
  const locality = form.location?.locality?.trim() || "";

  // Location string: "Talwandi, Kota", "Kota", or ""
  let locationStr = "";
  if (locality && city) {
    locationStr = `${locality}, ${city}`;
  } else if (locality) {
    locationStr = locality;
  } else if (city) {
    locationStr = city;
  }

  const inLocation = locationStr ? ` in ${locationStr}` : "";

  // 1. RESIDENTIAL
  if (category === "residential") {
    switch (subtype) {
      case "house": {
        const rawRooms = form.houseRooms?.trim() || "";
        const cleanNumber = rawRooms.replace(/[^0-9+]/g, "").trim();
        const prefix = cleanNumber ? `${cleanNumber} Room ` : "";
        return `${prefix}House for Sale${inLocation}`;
      }
      case "villa": {
        const bhk = form.bhk?.trim();
        const prefix = bhk ? `${bhk} BHK ` : "";
        return `${prefix}Villa for Sale${inLocation}`;
      }
      case "builder-floor": {
        const bhk = form.bhk?.trim();
        const prefix = bhk ? `${bhk} BHK ` : "";
        return `${prefix}Builder Floor for Sale${inLocation}`;
      }
      case "other": {
        return `Residential Property for Sale${inLocation}`;
      }
      case "apartment":
      default: {
        const bhk = form.bhk?.trim();
        const prefix = bhk ? `${bhk} BHK ` : "";
        return `${prefix}Flat / Apartment for Sale${inLocation}`;
      }
    }
  }

  // 2. PLOT / LAND
  if (category === "plot") {
    const areaVal = form.area?.trim() || form.plotArea?.trim() || "";
    const unitLabel = form.areaUnit ? formatAreaUnitLabel(form.areaUnit) : "Sq.Ft.";
    const areaPrefix = areaVal ? `${Number(areaVal).toLocaleString("en-IN")} ${unitLabel} ` : "";

    switch (subtype) {
      case "commercial-plot":
        return `${areaPrefix}Commercial Plot for Sale${inLocation}`;
      case "agricultural-land":
        return `${areaPrefix}Agricultural Land for Sale${inLocation}`;
      case "other":
        return `${areaPrefix}Plot / Land for Sale${inLocation}`;
      case "residential-plot":
      default:
        return `${areaPrefix}Residential Plot for Sale${inLocation}`;
    }
  }

  // 3. COMMERCIAL
  if (category === "commercial") {
    const areaVal = form.area?.trim() || form.builtUpArea?.trim() || form.carpetArea?.trim() || "";
    const unitLabel = form.areaUnit ? formatAreaUnitLabel(form.areaUnit) : "Sq.Ft.";
    const areaPrefix = areaVal ? `${Number(areaVal).toLocaleString("en-IN")} ${unitLabel} ` : "";

    switch (subtype) {
      case "shop":
        return `${areaPrefix}Commercial Shop for Sale${inLocation}`;
      case "showroom":
        return `${areaPrefix}Commercial Showroom for Sale${inLocation}`;
      case "warehouse":
        return `${areaPrefix}Warehouse / Godown for Sale${inLocation}`;
      case "industrial":
        return `${areaPrefix}Industrial Property for Sale${inLocation}`;
      case "hotel":
        return `${areaPrefix}Hotel / Guest House for Sale${inLocation}`;
      case "restaurant":
        return `${areaPrefix}Restaurant / Cafe Space for Sale${inLocation}`;
      case "building":
        return `${areaPrefix}Commercial Building for Sale${inLocation}`;
      case "other":
        return `${areaPrefix}Commercial Property for Sale${inLocation}`;
      case "office":
      default:
        return `${areaPrefix}Commercial Office Space for Sale${inLocation}`;
    }
  }

  return `Property for Sale${inLocation}`;
}

/**
 * Map QuickListingFormState to CreatePropertyDto
 */
export function mapQuickListingToBackendDto(
  form: QuickListingFormState
): CreatePropertyDto {
  const finalTitle = form.isTitleManuallyEdited && form.title.trim()
    ? form.title.trim()
    : generateDeterministicTitle(form);

  const city = form.location.city.trim() || "Kota";
  const locality = form.location.locality.trim() || city;
  const address = form.location.address.trim() || `${locality}, ${city}`;
  const state = form.location.state.trim() || inferIndianState(city);
  const pincode = form.location.pincode.trim() || "";
  const landmark = form.location.landmark?.trim() || null;

  // 1. Property Type Mapping
  let propertyType: CreatePropertyDto["propertyType"] = "APARTMENT";
  if (form.category === "residential") {
    switch (form.subtype) {
      case "house":
        propertyType = "HOUSE";
        break;
      case "villa":
        propertyType = "VILLA";
        break;
      case "builder-floor":
        propertyType = "APARTMENT";
        break;
      case "other":
        propertyType = "APARTMENT";
        break;
      case "apartment":
      default:
        propertyType = "APARTMENT";
        break;
    }
  } else if (form.category === "plot") {
    switch (form.subtype) {
      case "agricultural-land":
        propertyType = "LAND";
        break;
      case "commercial-plot":
      case "residential-plot":
      case "other":
      default:
        propertyType = "PLOT";
        break;
    }
  } else if (form.category === "commercial") {
    switch (form.subtype) {
      case "shop":
        propertyType = "SHOP";
        break;
      case "showroom":
        propertyType = "SHOWROOM";
        break;
      case "warehouse":
      case "industrial":
        propertyType = "WAREHOUSE";
        break;
      case "hotel":
      case "restaurant":
      case "building":
      case "other":
      case "office":
      default:
        propertyType = "OFFICE";
        break;
    }
  }

  // 2. Price and Area
  const price = Number(form.askingPrice.trim()) || 0;
  const numericArea =
    Number(form.area.trim()) ||
    Number(form.plotArea?.trim()) ||
    Number(form.carpetArea?.trim()) ||
    Number(form.builtUpArea?.trim()) ||
    0;

  // AreaUnit conversion to safe Prisma enum
  let areaUnit: "SQ_FT" | "SQ_YD" | "SQ_M" | "ACRE" = "SQ_FT";
  if (form.areaUnit === "SQ_YD" || form.areaUnit === "BIGHA") {
    areaUnit = "SQ_YD";
  } else if (form.areaUnit === "SQ_M") {
    areaUnit = "SQ_M";
  } else if (form.areaUnit === "ACRE") {
    areaUnit = "ACRE";
  }

  // 3. Bedrooms / Rooms
  let bedrooms: number | null = null;
  if (form.category === "residential") {
    if (form.subtype === "house" && form.houseRooms) {
      bedrooms = parseInt(form.houseRooms.replace(/[^0-9]/g, "") || "", 10) || null;
    } else if (form.bhk) {
      bedrooms = parseInt(form.bhk.replace(/[^0-9]/g, "") || "", 10) || null;
    }
  }

  // 4. Bathrooms
  const bathrooms = form.bathrooms
    ? parseInt(form.bathrooms.replace(/[^0-9]/g, "") || "", 10) || null
    : null;

  // 5. Floor information
  const floorNumber = form.propertyFloor
    ? parseInt(form.propertyFloor.replace(/[^0-9]/g, "") || "", 10) || null
    : null;

  const totalFloors = form.totalFloors
    ? parseInt(form.totalFloors.replace(/[^0-9]/g, "") || "", 10)
    : form.buildingFloors
    ? parseInt(form.buildingFloors.replace(/[^0-9]/g, "") || "", 10)
    : null;

  // 6. Furnishing
  const furnishingStatus =
    form.furnishingStatus === "UNFURNISHED" ||
    form.furnishingStatus === "SEMI_FURNISHED" ||
    form.furnishingStatus === "FULLY_FURNISHED"
      ? form.furnishingStatus
      : null;

  // 7. Description (Zero synthesized marketing fallback)
  const description = form.description?.trim() || "";

  return {
    title: finalTitle,
    description,
    propertyType,
    listingType: "SALE",
    price,
    priceUnit: "TOTAL",
    area: numericArea,
    areaUnit,
    bedrooms,
    bathrooms,
    balconies: null,
    floorNumber,
    totalFloors,
    furnishingStatus,
    availableFrom: null,
    location: {
      address,
      locality,
      city,
      state,
      pincode,
      landmark,
    },
    amenityIds: form.amenities || [],
  };
}

/**
 * Map an existing Property entity into QuickListingFormState for Edit Mode
 */
export function mapPropertyToQuickListingFormState(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prop: any
): QuickListingFormState {
  let category: QuickListingCategory = "residential";
  let subtype: QuickListingSubtype = "apartment";

  const pt = (prop.propertyType || "").toUpperCase();
  const titleLower = (prop.title || "").toLowerCase();

  if (pt === "HOUSE" || titleLower.includes("house for sale")) {
    category = "residential";
    subtype = "house";
  } else if (pt === "VILLA" || titleLower.includes("villa for sale")) {
    category = "residential";
    subtype = "villa";
  } else if (
    titleLower.includes("builder floor") ||
    titleLower.includes("builder-floor") ||
    pt === "BUILDER_FLOOR" ||
    pt === "BUILDER-FLOOR"
  ) {
    category = "residential";
    subtype = "builder-floor";
  } else if (pt === "PLOT" || titleLower.includes("plot for sale")) {
    category = "plot";
    if (titleLower.includes("commercial plot")) {
      subtype = "commercial-plot";
    } else {
      subtype = "residential-plot";
    }
  } else if (
    pt === "LAND" ||
    titleLower.includes("agricultural land") ||
    titleLower.includes("land for sale")
  ) {
    category = "plot";
    subtype = "agricultural-land";
  } else if (pt === "OFFICE" || pt === "COMMERCIAL-OFFICE") {
    category = "commercial";
    subtype = "office";
  } else if (pt === "SHOP" || pt === "RETAIL-SHOP") {
    category = "commercial";
    subtype = "shop";
  } else if (pt === "SHOWROOM") {
    category = "commercial";
    subtype = "showroom";
  } else if (pt === "WAREHOUSE") {
    category = "commercial";
    subtype = "warehouse";
  } else if (pt === "APARTMENT") {
    category = "residential";
    subtype = "apartment";
  } else {
    category = "residential";
    subtype = "apartment";
  }

  // Location
  let city = prop.city || "";
  let locality = "";
  let address = "";
  let state = "";
  let pincode = prop.pincode || "";
  let landmark = "";

  if (prop.location && typeof prop.location === "object") {
    city = prop.location.city || city;
    locality = prop.location.locality || "";
    address = prop.location.address || "";
    state = prop.location.state || "";
    pincode = prop.location.pincode || pincode;
    landmark = prop.location.landmark || "";
  } else if (typeof prop.location === "string") {
    locality = prop.location;
  }

  // Photos
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingPhotos = (prop.images || []).map((img: any, idx: number) => {
    const url = typeof img === "string" ? img : img.url || "";
    const id = typeof img === "object" && img.id ? img.id : `existing-${idx}`;
    return {
      id: `existing-photo-${idx}-${Date.now()}`,
      file: null,
      previewUrl: url,
      name: `Photo ${idx + 1}`,
      isExisting: true,
      remoteId: id,
    };
  });

  const bhkVal =
    prop.bedrooms !== null && prop.bedrooms !== undefined
      ? String(prop.bedrooms)
      : prop.bhk !== null && prop.bhk !== undefined
      ? String(prop.bhk)
      : "";
  const areaVal = prop.areaNumeric ? String(prop.areaNumeric) : prop.area ? String(prop.area) : "";
  const priceVal = prop.priceNumeric ? String(prop.priceNumeric) : prop.price ? String(prop.price).replace(/[^0-9]/g, "") : "";

  return {
    category,
    subtype,
    houseRooms: subtype === "house" ? bhkVal : undefined,
    bhk: subtype !== "house" ? bhkVal : undefined,
    askingPrice: priceVal,
    location: {
      city,
      locality,
      address,
      state: state || inferIndianState(city),
      pincode,
      landmark,
    },
    area: areaVal,
    areaUnit: prop.areaUnit || "SQ_FT",
    bathrooms: prop.bathrooms !== null && prop.bathrooms !== undefined ? String(prop.bathrooms) : "",
    furnishingStatus: prop.furnishingStatus || "",
    amenities: (prop.amenities || []).map((a: { name?: string; amenity?: { name?: string } } | string) =>
      typeof a === "string" ? a : a.name || a.amenity?.name || ""
    ).filter(Boolean),
    facing: prop.facing || "",
    title: prop.title || "",
    isTitleManuallyEdited: Boolean(prop.title),
    description: prop.description || "",
    photos: existingPhotos,
    skippedSections: {},
  };
}

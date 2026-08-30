// ==============================================================================
// TheVrindaGroup - RENT Quick Listing Architecture (V1) Helper
// Deterministic Title Generation, DTO Translation & Hydration
// Zero-Default Rule: Never synthesize fake numbers, fake BHK, or fake text
// ==============================================================================

import { CreatePropertyDto } from "@/lib/services/property-api";
import {
  RentQuickListingFormState,
  RentCategory,
  RentResidentialSubtype,
  RentCommercialSubtype,
  RentHouseType,
  RentAreaUnitOption,
} from "../../types/rentQuickListing";
import { findDistricts } from "../../data/location/canonicalLocations";

/**
 * Format Indian Price for display (e.g. 15000 -> ₹15,000 / mo)
 */
export function formatRentPricePreview(priceStr: string | number): string {
  const numeric = typeof priceStr === "number" ? priceStr : Number(String(priceStr).replace(/[^0-9]/g, ""));
  if (!numeric || isNaN(numeric) || numeric <= 0) return "";
  return `₹${numeric.toLocaleString("en-IN")} / mo`;
}

/**
 * Format Area Unit for Display
 */
export function formatRentAreaUnitLabel(unit: RentAreaUnitOption): string {
  switch (unit) {
    case "SQ_YD":
      return "Sq.Yd.";
    case "SQ_M":
      return "Sq.M.";
    case "ACRE":
      return "Acres";
    case "SQ_FT":
    default:
      return "Sq.Ft.";
  }
}

/**
 * Infer Indian state from popular cities or canonical lookup
 */
export function inferIndianState(city: string): string {
  if (!city || !city.trim()) return "Rajasthan";
  const canonicalMatches = findDistricts(city.trim());
  if (canonicalMatches.length > 0) {
    return canonicalMatches[0].state;
  }
  const c = city.trim().toLowerCase();
  if (c === "kota" || c === "jaipur" || c === "udaipur" || c === "jodhpur" || c === "ajmer" || c === "bikaner") {
    return "Rajasthan";
  }
  if (c === "bangalore" || c === "bengaluru" || c === "mysore" || c === "hubli") {
    return "Karnataka";
  }
  if (c === "mumbai" || c === "pune" || c === "nagpur" || c === "nashik" || c === "thane") {
    return "Maharashtra";
  }
  if (c === "delhi" || c === "new delhi") {
    return "Delhi";
  }
  if (c === "hyderabad" || c === "secunderabad") {
    return "Telangana";
  }
  if (c === "chennai" || c === "coimbatore") {
    return "Tamil Nadu";
  }
  if (c === "gurgaon" || c === "gurugram" || c === "faridabad") {
    return "Haryana";
  }
  if (c === "noida" || c === "greater noida" || c === "lucknow" || c === "kanpur") {
    return "Uttar Pradesh";
  }
  if (c === "kolkata" || c === "howrah") {
    return "West Bengal";
  }
  return "Rajasthan";
}

/**
 * Deterministic Title Generator for RENT Listings
 * Examples:
 * - "3 BHK Flat for Rent in Talwandi, Kota"
 * - "Flat for Rent in Kota"
 * - "Villa for Rent in Kota"
 * - "1,500 Sq.Ft. Office for Rent in Kota"
 * - "Office for Rent in Kota"
 * - "Shop for Rent in Kota"
 * - "Room for Rent in Talwandi, Kota"
 * - "1st Floor Part of House for Rent in Kunhari, Kota"
 */
export function generateDeterministicRentTitle(
  form: Partial<RentQuickListingFormState>
): string {
  const city = form.location?.city?.trim() || "";
  const locality = form.location?.locality?.trim() || "";

  let locSegment = "";
  if (locality && city) {
    locSegment = ` in ${locality}, ${city}`;
  } else if (city) {
    locSegment = ` in ${city}`;
  } else if (locality) {
    locSegment = ` in ${locality}`;
  }

  // 1. RESIDENTIAL
  if (form.category !== "commercial") {
    const sub = form.residentialSubtype || "apartment";

    if (sub === "house") {
      const houseType = form.houseType || "full-house";
      if (houseType === "full-house") {
        const rooms = form.houseRooms?.trim();
        const prefix = rooms ? `${rooms} Room ` : "";
        return `${prefix}House for Rent${locSegment}`.trim();
      }
      if (houseType === "part-of-house") {
        const floor = form.houseFloor?.trim();
        const rooms = form.houseRooms?.trim();
        let prefix = "";
        if (floor && rooms) prefix = `${floor} (${rooms} Room) `;
        else if (floor) prefix = `${floor} `;
        else if (rooms) prefix = `${rooms} Room `;
        return `${prefix}Part of House for Rent${locSegment}`.trim();
      }
      if (houseType === "room") {
        return `Room for Rent${locSegment}`.trim();
      }
      return `House for Rent${locSegment}`.trim();
    }

    if (sub === "apartment") {
      const bhk = form.bhk?.trim();
      const prefix = bhk ? `${bhk} ` : "";
      return `${prefix}Flat for Rent${locSegment}`.trim();
    }

    if (sub === "villa") {
      const bhk = form.bhk?.trim();
      const prefix = bhk ? `${bhk} ` : "";
      return `${prefix}Villa for Rent${locSegment}`.trim();
    }

    if (sub === "other") {
      const otherType =
        form.residentialOtherType === "Other" && form.customPropertyType?.trim()
          ? form.customPropertyType.trim()
          : form.residentialOtherType?.trim() || "Residential Property";
      return `${otherType} for Rent${locSegment}`.trim();
    }

    return `Residential Property for Rent${locSegment}`.trim();
  }

  // 2. COMMERCIAL
  const commSub = form.commercialSubtype || "office";
  const rawArea = Number(form.builtUpArea?.replace(/[^0-9]/g, "") || "");
  const unitLabel = formatRentAreaUnitLabel(form.areaUnit || "SQ_FT");
  const areaPrefix = rawArea && rawArea > 0 ? `${rawArea.toLocaleString("en-IN")} ${unitLabel} ` : "";

  if (commSub === "office") {
    return `${areaPrefix}Office for Rent${locSegment}`.trim();
  }
  if (commSub === "shop") {
    return `${areaPrefix}Shop for Rent${locSegment}`.trim();
  }
  if (commSub === "showroom") {
    return `${areaPrefix}Showroom for Rent${locSegment}`.trim();
  }

  return `Commercial Space for Rent${locSegment}`.trim();
}

/**
 * Map RentQuickListingFormState to CreatePropertyDto
 */
export function mapRentListingToBackendDto(
  form: RentQuickListingFormState
): CreatePropertyDto {
  const finalTitle = form.isTitleManuallyEdited && form.title.trim()
    ? form.title.trim()
    : generateDeterministicRentTitle(form);

  const city = form.location.city.trim();
  const locality = form.location.locality?.trim() || "";
  const address = form.location.address?.trim() || "";
  const state = form.location.state.trim();
  const pincode = form.location.pincode?.trim() || "";
  const landmark = form.location.landmark?.trim() || null;

  // 1. Property Type Mapping
  let propertyType: CreatePropertyDto["propertyType"] = "APARTMENT";
  if (form.category === "residential") {
    switch (form.residentialSubtype) {
      case "house":
        propertyType = "HOUSE";
        break;
      case "villa":
        propertyType = "VILLA";
        break;
      case "other":
        if (form.residentialOtherType === "Studio") propertyType = "STUDIO";
        else if (form.residentialOtherType === "Duplex" || form.residentialOtherType === "Farm House") propertyType = "HOUSE";
        else propertyType = "APARTMENT";
        break;
      case "apartment":
      default:
        propertyType = "APARTMENT";
        break;
    }
  } else if (form.category === "commercial") {
    switch (form.commercialSubtype) {
      case "shop":
        propertyType = "SHOP";
        break;
      case "showroom":
        propertyType = "SHOWROOM";
        break;
      case "other":
      case "office":
      default:
        propertyType = "OFFICE";
        break;
    }
  }

  // 2. Pricing and Area
  const price = Number(form.monthlyRent.replace(/[^0-9]/g, "").trim()) || 0;
  const numericArea =
    form.category === "commercial"
      ? Number(form.builtUpArea?.replace(/[^0-9]/g, "").trim()) || 0
      : 0;

  // 3. Bedrooms / Rooms
  let bedrooms: number | null = null;
  if (form.category === "residential") {
    if (form.residentialSubtype === "house") {
      if (form.houseType === "full-house" || form.houseType === "part-of-house") {
        bedrooms = parseInt(form.houseRooms?.replace(/[^0-9]/g, "") || "", 10) || null;
      }
    } else if (form.residentialSubtype === "apartment" || form.residentialSubtype === "villa") {
      bedrooms = parseInt(form.bhk?.replace(/[^0-9]/g, "") || "", 10) || null;
    }
  }

  // 4. Bathrooms
  let bathrooms: number | null = null;
  if (form.category === "residential") {
    if (form.residentialSubtype === "house" && form.houseType === "room") {
      if (form.roomBathroom === "private") bathrooms = 1;
    } else if (form.residentialSubtype === "house" || form.residentialSubtype === "apartment" || form.residentialSubtype === "villa") {
      bathrooms = parseInt(form.bathrooms?.replace(/[^0-9]/g, "") || "", 10) || null;
    }
  }

  // 5. Floor Information
  let floorNumber: number | null = null;
  if (form.category === "residential" && form.residentialSubtype === "house" && form.houseType === "part-of-house") {
    const parsedFloor = parseInt(form.houseFloor?.replace(/[^0-9]/g, "") || "", 10);
    floorNumber = !isNaN(parsedFloor) ? parsedFloor : form.houseFloor?.toLowerCase().includes("ground") ? 0 : 1;
  }

  // 6. Furnishing
  const furnishingStatus =
    form.category === "residential" &&
    (form.furnishingStatus === "UNFURNISHED" ||
      form.furnishingStatus === "SEMI_FURNISHED" ||
      form.furnishingStatus === "FULLY_FURNISHED")
      ? form.furnishingStatus
      : null;

  // 7. Amenities (Integrate Parking for Villa if selected)
  const amenitySet = new Set(form.amenities || []);
  if (form.category === "residential" && form.residentialSubtype === "villa") {
    if (form.villaParking === "available") {
      amenitySet.add("Parking");
    } else if (form.villaParking === "not-available") {
      amenitySet.delete("Parking");
    }
  }

  // 8. Description (Zero fallback synthesis)
  const description = form.description?.trim() || "";

  return {
    title: finalTitle,
    description,
    propertyType,
    listingType: "RENT",
    price,
    priceUnit: "MONTHLY",
    area: numericArea,
    areaUnit: form.areaUnit || "SQ_FT",
    bedrooms,
    bathrooms,
    balconies: null,
    floorNumber,
    totalFloors: null,
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
    amenityIds: Array.from(amenitySet),
  };
}

/**
 * Map an existing Property entity into RentQuickListingFormState for Edit Mode
 */
export function mapPropertyToRentQuickListingFormState(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prop: any
): RentQuickListingFormState {
  let category: RentCategory = "residential";
  let residentialSubtype: RentResidentialSubtype = "apartment";
  let commercialSubtype: RentCommercialSubtype = "office";
  let houseType: RentHouseType = "full-house";

  const pt = (prop.propertyType || "").toUpperCase();
  const titleLower = (prop.title || "").toLowerCase();

  if (pt === "OFFICE") {
    category = "commercial";
    commercialSubtype = "office";
  } else if (pt === "SHOP") {
    category = "commercial";
    commercialSubtype = "shop";
  } else if (pt === "SHOWROOM") {
    category = "commercial";
    commercialSubtype = "showroom";
  } else if (pt === "WAREHOUSE") {
    category = "commercial";
    commercialSubtype = "other";
  } else if (pt === "VILLA") {
    category = "residential";
    residentialSubtype = "villa";
  } else if (pt === "HOUSE") {
    category = "residential";
    residentialSubtype = "house";
    if (titleLower.includes("room for rent") && !titleLower.includes("room house")) {
      houseType = "room";
    } else if (titleLower.includes("part of house") || prop.floorNumber !== null) {
      houseType = "part-of-house";
    } else {
      houseType = "full-house";
    }
  } else if (pt === "STUDIO") {
    category = "residential";
    residentialSubtype = "other";
  } else {
    category = "residential";
    residentialSubtype = "apartment";
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
  const areaVal = prop.areaNumeric && prop.areaNumeric > 0 ? String(prop.areaNumeric) : prop.area && Number(prop.area) > 0 ? String(prop.area) : "";
  const priceVal = prop.priceNumeric ? String(prop.priceNumeric) : prop.price ? String(prop.price).replace(/[^0-9]/g, "") : "";

  // Amenities
  const rawAmenities = (prop.amenities || []).map((a: { name?: string; amenity?: { name?: string } } | string) =>
    typeof a === "string" ? a : a.name || a.amenity?.name || ""
  ).filter(Boolean);

  const hasParking = rawAmenities.some((a: string) => a.toLowerCase() === "parking");

  return {
    category,
    residentialSubtype,
    commercialSubtype,
    houseType,
    houseFloor: prop.floorNumber !== null && prop.floorNumber !== undefined ? `${prop.floorNumber === 0 ? "Ground" : prop.floorNumber + (prop.floorNumber === 1 ? "st" : prop.floorNumber === 2 ? "nd" : prop.floorNumber === 3 ? "rd" : "th")} Floor` : "",
    houseRooms: residentialSubtype === "house" ? bhkVal : "",
    roomBathroom: prop.bathrooms === 1 ? "private" : "",
    bhk: residentialSubtype === "apartment" || residentialSubtype === "villa" ? bhkVal : "",
    villaParking: hasParking ? "available" : "",
    residentialOtherType: pt === "STUDIO" ? "Studio" : "Other",
    customPropertyType: "",
    builtUpArea: areaVal,
    areaUnit: prop.areaUnit || "SQ_FT",
    bathrooms: prop.bathrooms !== null && prop.bathrooms !== undefined ? String(prop.bathrooms) : "",
    furnishingStatus: prop.furnishingStatus || "",
    amenities: rawAmenities,
    monthlyRent: priceVal,
    location: {
      city,
      locality,
      address,
      state: state || inferIndianState(city),
      pincode,
      landmark,
    },
    photos: existingPhotos,
    title: prop.title || "",
    isTitleManuallyEdited: Boolean(prop.title),
    description: prop.description || "",
    skippedSections: {},
  };
}

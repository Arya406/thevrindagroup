// ==============================================================================
// TheVrindaGroup - Property API Service
// Connects Marketplace, Detail, & Posting to Backend Express API (/api/properties/*)
// ==============================================================================

import { apiClient, ApiClientError } from "../api-client";
import { Property, ListingType, PropertyType } from "../../types/property";
import { PropertyListingDraft } from "../../types/postProperty";
import { RentalProperty, FurnishingType, RentalPropertyType } from "../../types/rental";
import { CommercialProperty, CommercialPropertyType, CommercialFurnishing } from "../../types/commercial";

export interface BackendPropertyImage {
  id: string;
  propertyId: string;
  url: string;
  altText: string | null;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface BackendPropertyLocation {
  id: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface BackendPropertyAmenity {
  propertyId: string;
  amenityId: string;
  amenity?: {
    id: string;
    name: string;
    category: string;
    icon: string | null;
  };
}

export interface BackendPropertyOwner {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: "BUYER" | "OWNER" | "AGENT" | "ADMIN";
}

export interface BackendProperty {
  id: string;
  referenceCode: string;
  ownerId: string;
  title: string;
  slug: string;
  description: string;
  propertyType: string;
  listingType: "SALE" | "RENT" | "LEASE";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SOLD" | "RENTED";
  price: number;
  priceUnit: "TOTAL" | "MONTHLY" | "YEARLY" | "PER_SQ_FT";
  area: number;
  areaUnit: "SQ_FT" | "SQ_YD" | "SQ_M" | "ACRE";
  bedrooms: number | null;
  bathrooms: number | null;
  balconies: number | null;
  floorNumber: number | null;
  totalFloors: number | null;
  furnishingStatus: "FULLY_FURNISHED" | "SEMI_FURNISHED" | "UNFURNISHED" | null;
  availableFrom: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: BackendPropertyOwner;
  location?: BackendPropertyLocation;
  images?: BackendPropertyImage[];
  amenities?: BackendPropertyAmenity[];
}

export interface BackendPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BackendPropertiesData {
  properties: BackendProperty[];
  pagination: BackendPagination;
}

export interface CreatePropertyLocationDto {
  address: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CreatePropertyDto {
  title: string;
  description: string;
  propertyType:
    | "APARTMENT"
    | "HOUSE"
    | "VILLA"
    | "PLOT"
    | "STUDIO"
    | "PENTHOUSE"
    | "OFFICE"
    | "SHOP"
    | "WAREHOUSE"
    | "SHOWROOM"
    | "LAND";
  listingType: "SALE" | "RENT" | "LEASE";
  price: number;
  priceUnit?: "TOTAL" | "MONTHLY" | "YEARLY" | "PER_SQ_FT";
  area: number;
  areaUnit?: "SQ_FT" | "SQ_YD" | "SQ_M" | "ACRE";
  bedrooms?: number | null;
  bathrooms?: number | null;
  balconies?: number | null;
  floorNumber?: number | null;
  totalFloors?: number | null;
  furnishingStatus?: "FULLY_FURNISHED" | "SEMI_FURNISHED" | "UNFURNISHED" | null;
  availableFrom?: string | null;
  location: CreatePropertyLocationDto;
  amenityIds?: string[];
}

export interface PropertyFilterParams {
  search?: string;
  listingType?: ListingType | "SALE" | "RENT" | "LEASE" | "buy" | "rent" | "commercial";
  propertyType?: string;
  city?: string;
  locality?: string;
  budget?: string;
  areaRange?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bhk?: string | number;
  bedrooms?: number;
  bathrooms?: number;
  furnishingStatus?: string;
  amenityIds?: string[];
  sort?: string;
  page?: number;
  limit?: number;
}

/**
 * Format Indian Rupee currency safely
 */
export function formatIndianPrice(
  amount: number,
  listingType?: "SALE" | "RENT" | "LEASE" | ListingType
): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "Price on Request";

  let formatted = "";
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2).replace(/\.00$/, "");
    formatted = `₹${cr} Cr`;
  } else if (amount >= 100000) {
    const l = (amount / 100000).toFixed(2).replace(/\.00$/, "");
    formatted = `₹${l} L`;
  } else {
    formatted = `₹${amount.toLocaleString("en-IN")}`;
  }

  if (listingType === "RENT" || listingType === "rent") {
    formatted += " / mo";
  }
  return formatted;
}

/**
 * Map backend property entity to frontend Property interface
 */
export function mapBackendPropertyToFrontend(bp: BackendProperty): Property {
  const fallbackImage =
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

  // Sort images: primary first, then by displayOrder
  const sortedImages = (bp.images || [])
    .slice()
    .sort((a, b) => {
      if (a.isPrimary) return -1;
      if (b.isPrimary) return 1;
      return a.displayOrder - b.displayOrder;
    })
    .map((img) => img.url);

  const primaryImage = sortedImages[0] || fallbackImage;

  // Map listingType
  let listingType: ListingType = "buy";
  if (bp.listingType === "RENT") listingType = "rent";
  else if (bp.listingType === "LEASE") listingType = "commercial";

  // Map propertyType to frontend UI categories
  let propertyType: PropertyType = "apartment";
  const pt = bp.propertyType?.toUpperCase();
  if (pt === "VILLA" || pt === "HOUSE") propertyType = "villa";
  else if (pt === "PLOT" || pt === "LAND") propertyType = "plot";
  else if (pt === "PENTHOUSE") propertyType = "penthouse";
  else if (pt === "OFFICE") propertyType = "commercial-office";
  else if (pt === "SHOP" || pt === "SHOWROOM") propertyType = "retail-shop";

  // Map Furnishing
  let furnishingStatus: "Furnished" | "Semi-Furnished" | "Unfurnished" = "Unfurnished";
  if (bp.furnishingStatus === "FULLY_FURNISHED") furnishingStatus = "Furnished";
  else if (bp.furnishingStatus === "SEMI_FURNISHED") furnishingStatus = "Semi-Furnished";

  // Map Amenities list
  const amenitiesList = (bp.amenities || [])
    .map((pa) => pa.amenity?.name)
    .filter((name): name is string => Boolean(name));

  const locality = bp.location?.locality || "";
  const city = bp.location?.city || "Bangalore";
  const address = bp.location?.address || "";
  const displayLocation = locality ? `${locality}, ${city}` : city;

  const bhkValue = bp.bedrooms !== null && bp.bedrooms !== undefined ? bp.bedrooms : 2;

  return {
    id: bp.id,
    referenceCode: bp.referenceCode,
    slug: bp.slug,
    title: bp.title,
    price: formatIndianPrice(bp.price, bp.listingType),
    priceNumeric: bp.price,
    priceUnit: bp.priceUnit,
    bhk: bhkValue,
    bathrooms: bp.bathrooms || 2,
    carpetArea: `${bp.area.toLocaleString("en-IN")} ${
      bp.areaUnit === "SQ_FT" ? "sq.ft" : bp.areaUnit.toLowerCase()
    }`,
    areaNumeric: bp.area,
    location: displayLocation,
    city: city,
    state: bp.location?.state || "Karnataka",
    pincode: bp.location?.pincode || "560001",
    address: address || displayLocation,
    propertyType,
    listingType,
    isReraVerified: true,
    reraNumber: bp.referenceCode,
    sellerType: bp.owner?.role === "AGENT" ? "agent" : "owner",
    sellerName: bp.owner?.name || "TheVrindaGroup Verified Seller",
    sellerPhone: "+91 98765 43210",
    isFeatured: true,
    isNew: false,
    image: primaryImage,
    images: sortedImages.length > 0 ? sortedImages : [fallbackImage],
    description: bp.description,
    furnishingStatus,
    possessionStatus: "Ready to Move",
    amenities:
      amenitiesList.length > 0
        ? amenitiesList
        : ["24/7 Security", "Power Backup", "Car Parking", "Water Supply"],
    postedDate: new Date(bp.createdAt).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: bp.status,
    isApproved: bp.status === "PUBLISHED",
  };
}

/**
 * Translate frontend filter options to backend query parameters
 */
export function buildBackendSearchParams(filters: PropertyFilterParams): Record<string, unknown> {
  const query: Record<string, unknown> = {};

  // Keyword / Locality Search
  if (filters.search && filters.search.trim()) {
    query.search = filters.search.trim();
  }

  // Listing Type
  if (filters.listingType) {
    const lt = String(filters.listingType).toUpperCase();
    if (lt === "BUY" || lt === "SALE") query.listingType = "SALE";
    else if (lt === "RENT") query.listingType = "RENT";
    else if (lt === "COMMERCIAL" || lt === "LEASE") query.listingType = "LEASE";
  }

  // Property Type
  if (filters.propertyType && filters.propertyType !== "all" && filters.propertyType !== "All") {
    const pt = filters.propertyType.toLowerCase();
    if (pt === "apartment") query.propertyType = "APARTMENT";
    else if (pt === "villa") query.propertyType = "VILLA";
    else if (pt === "plot") query.propertyType = "PLOT";
    else if (pt === "penthouse") query.propertyType = "PENTHOUSE";
    else if (pt === "commercial-office" || pt === "office") query.propertyType = "OFFICE";
    else if (pt === "retail-shop" || pt === "shop") query.propertyType = "SHOP";
    else if (pt === "showroom") query.propertyType = "SHOWROOM";
    else if (pt === "warehouse") query.propertyType = "WAREHOUSE";
    else if (pt === "house" || pt === "independent-house") query.propertyType = "HOUSE";
    else if (pt === "studio") query.propertyType = "STUDIO";
    else if (pt === "land") query.propertyType = "LAND";
  }

  // City
  if (filters.city && filters.city !== "All" && filters.city !== "all") {
    query.city = filters.city.trim();
  }

  // Locality
  if (filters.locality && filters.locality.trim()) {
    query.locality = filters.locality.trim();
  }

  // Budget mapping (Residential Buy, Rent, & Commercial)
  if (filters.budget && filters.budget !== "any") {
    // Buy presets
    if (filters.budget === "under-50l") {
      query.maxPrice = 5000000;
    } else if (filters.budget === "50l-1cr") {
      query.minPrice = 5000000;
      query.maxPrice = 10000000;
    } else if (filters.budget === "1cr-2.5cr") {
      query.minPrice = 10000000;
      query.maxPrice = 25000000;
    } else if (filters.budget === "2.5cr-5cr") {
      query.minPrice = 25000000;
      query.maxPrice = 50000000;
    } else if (filters.budget === "above-5cr") {
      query.minPrice = 50000000;
    }
    // Rent presets
    else if (filters.budget === "under-15k") {
      query.maxPrice = 15000;
    } else if (filters.budget === "15k-30k") {
      query.minPrice = 15000;
      query.maxPrice = 30000;
    } else if (filters.budget === "30k-50k") {
      query.minPrice = 30000;
      query.maxPrice = 50000;
    } else if (filters.budget === "50k-75k") {
      query.minPrice = 50000;
      query.maxPrice = 75000;
    } else if (filters.budget === "above-75k") {
      query.minPrice = 75000;
    }
    // Commercial presets
    else if (filters.budget === "under-1l") {
      query.maxPrice = 100000;
    } else if (filters.budget === "1l-5l") {
      query.minPrice = 100000;
      query.maxPrice = 500000;
    } else if (filters.budget === "5l-10l") {
      query.minPrice = 500000;
      query.maxPrice = 1000000;
    } else if (filters.budget === "10l-25l") {
      query.minPrice = 1000000;
      query.maxPrice = 2500000;
    } else if (filters.budget === "above-25l") {
      query.minPrice = 2500000;
    }
  }

  // Commercial area ranges
  if (filters.minArea === undefined && filters.maxArea === undefined && filters.areaRange && filters.areaRange !== "any") {
    if (filters.areaRange === "under-1000") {
      query.maxArea = 1000;
    } else if (filters.areaRange === "1000-3000") {
      query.minArea = 1000;
      query.maxArea = 3000;
    } else if (filters.areaRange === "3000-7500") {
      query.minArea = 3000;
      query.maxArea = 7500;
    } else if (filters.areaRange === "7500-15000") {
      query.minArea = 7500;
      query.maxArea = 15000;
    } else if (filters.areaRange === "above-15000") {
      query.minArea = 15000;
    }
  }

  if (filters.minPrice !== undefined) query.minPrice = filters.minPrice;
  if (filters.maxPrice !== undefined) query.maxPrice = filters.maxPrice;
  if (filters.minArea !== undefined) query.minArea = filters.minArea;
  if (filters.maxArea !== undefined) query.maxArea = filters.maxArea;

  // Bedrooms / BHK
  if (filters.bedrooms !== undefined) {
    query.bedrooms = filters.bedrooms;
  } else if (filters.bhk && filters.bhk !== "any") {
    const num = parseInt(String(filters.bhk).replace(/[^0-9]/g, ""), 10);
    if (!isNaN(num)) query.bedrooms = num;
  }

  if (filters.bathrooms !== undefined) query.bathrooms = filters.bathrooms;

  // Furnishing
  if (filters.furnishingStatus) {
    const fs = filters.furnishingStatus.toLowerCase();
    if (fs.includes("fully") || fs === "furnished") query.furnishingStatus = "FULLY_FURNISHED";
    else if (fs.includes("semi")) query.furnishingStatus = "SEMI_FURNISHED";
    else if (fs.includes("unfurnished") || fs.includes("bare")) query.furnishingStatus = "UNFURNISHED";
  }

  // Amenities
  if (filters.amenityIds && filters.amenityIds.length > 0) {
    query.amenityIds = filters.amenityIds;
  }

  // Sorting
  if (filters.sort) {
    if (filters.sort === "price-asc" || filters.sort === "PRICE_LOW_TO_HIGH") query.sort = "PRICE_LOW_TO_HIGH";
    else if (filters.sort === "price-desc" || filters.sort === "PRICE_HIGH_TO_LOW") query.sort = "PRICE_HIGH_TO_LOW";
    else if (filters.sort === "area-asc" || filters.sort === "AREA_LOW_TO_HIGH") query.sort = "AREA_LOW_TO_HIGH";
    else if (filters.sort === "area-desc" || filters.sort === "AREA_HIGH_TO_LOW") query.sort = "AREA_HIGH_TO_LOW";
    else query.sort = "NEWEST";
  } else {
    query.sort = "NEWEST";
  }

  // Pagination
  query.page = filters.page || 1;
  query.limit = filters.limit || 20;

  return query;
}

/**
 * Adapter: Map PostPropertyWizard draft state to backend CreatePropertyDto
 */
export function mapDraftToCreatePropertyDto(draft: PropertyListingDraft): CreatePropertyDto {
  const isResidential = draft.category === "residential";

  // 1. Property Type Mapping to Prisma Enum
  let propertyType: CreatePropertyDto["propertyType"] = "APARTMENT";
  if (isResidential) {
    switch (draft.residentialType) {
      case "villa":
        propertyType = "VILLA";
        break;
      case "independent-house":
        propertyType = "HOUSE";
        break;
      case "plot":
        propertyType = "PLOT";
        break;
      case "studio":
        propertyType = "STUDIO";
        break;
      case "apartment":
      case "builder-floor":
      default:
        propertyType = "APARTMENT";
        break;
    }
  } else {
    switch (draft.commercialType) {
      case "office":
      case "coworking":
        propertyType = "OFFICE";
        break;
      case "shop":
      case "retail":
        propertyType = "SHOP";
        break;
      case "showroom":
        propertyType = "SHOWROOM";
        break;
      case "warehouse":
        propertyType = "WAREHOUSE";
        break;
      case "industrial":
      case "plot":
      default:
        propertyType = "LAND";
        break;
    }
  }

  // 2. Listing Type Mapping
  let listingType: "SALE" | "RENT" | "LEASE" = "SALE";
  if (draft.transaction === "rent") {
    listingType = isResidential ? "RENT" : "LEASE";
  } else {
    listingType = "SALE";
  }

  // 3. Price & Units
  let price = 0;
  if (draft.transaction === "sale") {
    price = parseFloat(draft.pricing.expectedPrice || "0") || 1000000;
  } else {
    price = parseFloat(draft.pricing.monthlyRent || "0") || 25000;
  }

  const priceUnit = draft.transaction === "rent" ? "MONTHLY" : "TOTAL";

  // 4. Area & Specs
  const rawArea = isResidential
    ? draft.residentialDetails.carpetArea || draft.residentialDetails.builtUpArea || "1000"
    : draft.commercialDetails.carpetArea || draft.commercialDetails.builtUpArea || "1000";
  const area = parseFloat(rawArea.replace(/[^0-9.]/g, "")) || 1000;

  let bedrooms: number | null = null;
  let bathrooms: number | null = null;
  let balconies: number | null = null;
  let floorNumber: number | null = null;
  let totalFloors: number | null = null;
  let furnishingStatus: "FULLY_FURNISHED" | "SEMI_FURNISHED" | "UNFURNISHED" | null = null;

  if (isResidential) {
    bedrooms = parseInt(draft.residentialDetails.bhk?.replace(/[^0-9]/g, "") || "2", 10) || 2;
    bathrooms = parseInt(draft.residentialDetails.bathrooms?.replace(/[^0-9]/g, "") || "2", 10) || 2;
    balconies = parseInt(draft.residentialDetails.balconies?.replace(/[^0-9]/g, "") || "1", 10) || 1;
    floorNumber = parseInt(draft.residentialDetails.floor?.replace(/[^0-9]/g, "") || "1", 10) || 1;
    totalFloors = parseInt(draft.residentialDetails.totalFloors?.replace(/[^0-9]/g, "") || "10", 10) || 10;

    if (draft.residentialDetails.furnishing === "Fully Furnished") {
      furnishingStatus = "FULLY_FURNISHED";
    } else if (draft.residentialDetails.furnishing === "Semi Furnished") {
      furnishingStatus = "SEMI_FURNISHED";
    } else {
      furnishingStatus = "UNFURNISHED";
    }
  } else {
    floorNumber = parseInt(draft.commercialDetails.floor?.replace(/[^0-9]/g, "") || "1", 10) || 1;
    totalFloors = parseInt(draft.commercialDetails.totalFloors?.replace(/[^0-9]/g, "") || "10", 10) || 10;

    if (draft.commercialDetails.furnishing === "Fully Furnished") {
      furnishingStatus = "FULLY_FURNISHED";
    } else if (
      draft.commercialDetails.furnishing === "Semi Furnished" ||
      draft.commercialDetails.furnishing === "Warm Shell"
    ) {
      furnishingStatus = "SEMI_FURNISHED";
    } else {
      furnishingStatus = "UNFURNISHED";
    }
  }

  // 5. Title & Description Construction
  const city = draft.location.city?.trim() || "Bangalore";
  const locality = draft.location.locality?.trim() || draft.location.projectSociety?.trim() || "Central";
  const society = draft.location.projectSociety?.trim();

  let title = "";
  if (society) {
    title = isResidential
      ? `${bedrooms} BHK ${draft.residentialType || "Apartment"} in ${society}, ${locality}`
      : `${draft.commercialType || "Commercial"} Space in ${society}, ${locality}`;
  } else {
    title = isResidential
      ? `${bedrooms} BHK ${draft.residentialType || "Apartment"} in ${locality}, ${city}`
      : `${draft.commercialType || "Commercial"} Space in ${locality}, ${city}`;
  }

  let description = draft.description?.trim() || "";
  if (description.length < 10) {
    description = `Premium verified ${isResidential ? `${bedrooms} BHK residential property` : "commercial space"} located in ${locality}, ${city}. Features ${area} sq.ft area with modern amenities, excellent connectivity, and 100% verified documentation.`;
  }

  const address =
    draft.location.address?.trim() ||
    (society ? `${society}, ${locality}, ${city}` : `${locality}, ${city}, Karnataka`);

  const pincodeMatch = address.match(/\b([1-9][0-9]{5})\b/);
  const pincode = pincodeMatch ? pincodeMatch[1] : "560001";

  return {
    title: title.slice(0, 200),
    description: description.slice(0, 10000),
    propertyType,
    listingType,
    price,
    priceUnit,
    area,
    areaUnit: "SQ_FT",
    bedrooms,
    bathrooms,
    balconies,
    floorNumber,
    totalFloors,
    furnishingStatus,
    location: {
      address: address.slice(0, 300),
      locality: locality.slice(0, 100),
      city: city.slice(0, 100),
      state: "Karnataka",
      pincode,
      landmark: draft.location.landmark?.trim() || null,
      latitude: null,
      longitude: null,
    },
    amenityIds: [],
  };
}

export class PropertyApiService {
  /**
   * Fetch public published property listings with search filters and pagination
   */
  public static async getProperties(filters: PropertyFilterParams = {}): Promise<{
    properties: Property[];
    pagination: BackendPagination;
  }> {
    const query = buildBackendSearchParams(filters);
    const res = await apiClient.get<BackendPropertiesData>("/properties", query);

    const rawProperties = res.data?.properties || [];
    const pagination = res.data?.pagination || {
      page: 1,
      limit: 20,
      total: rawProperties.length,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    return {
      properties: rawProperties.map(mapBackendPropertyToFrontend),
      pagination,
    };
  }

  /**
   * Search published property listings (alias to getProperties)
   */
  public static async searchProperties(filters: PropertyFilterParams = {}) {
    return PropertyApiService.getProperties(filters);
  }

  /**
   * Fetch a single property by UUID
   */
  public static async getPropertyById(id: string): Promise<Property | null> {
    try {
      const res = await apiClient.get<BackendProperty>(`/properties/${id}`);
      if (!res.data || !res.data.id) return null;
      return mapBackendPropertyToFrontend(res.data);
    } catch (err: unknown) {
      if (err instanceof ApiClientError && (err.statusCode === 404 || err.statusCode === 422)) {
        return null;
      }
      throw err;
    }
  }

  /**
   * Fetch a single property by human-readable slug
   */
  public static async getPropertyBySlug(slug: string): Promise<Property | null> {
    try {
      const res = await apiClient.get<BackendProperty>(`/properties/slug/${slug}`);
      if (!res.data || !res.data.id) return null;
      return mapBackendPropertyToFrontend(res.data);
    } catch (err: unknown) {
      if (err instanceof ApiClientError && (err.statusCode === 404 || err.statusCode === 422)) {
        return null;
      }
      throw err;
    }
  }

  /**
   * Create a new property listing (Owner / Agent only) -> POST /api/properties
   */
  public static async createProperty(dto: CreatePropertyDto): Promise<Property> {
    const res = await apiClient.post<BackendProperty>("/properties", dto);
    return mapBackendPropertyToFrontend(res.data);
  }

  /**
   * Add an image to an existing property -> POST /api/properties/:propertyId/images
   */
  public static async addPropertyImage(
    propertyId: string,
    image: {
      url: string;
      altText?: string | null;
      displayOrder?: number;
      isPrimary?: boolean;
    }
  ): Promise<BackendPropertyImage> {
    const res = await apiClient.post<{ image: BackendPropertyImage }>(
      `/properties/${propertyId}/images`,
      image
    );
    return res.data.image;
  }

  /**
   * Upload binary image files to an existing property -> POST /api/properties/:propertyId/images/upload
   */
  public static async uploadPropertyImages(
    propertyId: string,
    files: File[],
    options?: { isPrimary?: boolean }
  ): Promise<BackendPropertyImage[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });
    if (options?.isPrimary) {
      formData.append("isPrimary", "true");
    }

    const res = await apiClient.upload<{ images: BackendPropertyImage[]; count: number }>(
      `/properties/${propertyId}/images/upload`,
      formData
    );
    return res.data.images;
  }

  /**
   * Upload single binary image file to an existing property
   */
  public static async uploadPropertyImage(
    propertyId: string,
    file: File,
    options?: { isPrimary?: boolean }
  ): Promise<BackendPropertyImage> {
    const images = await this.uploadPropertyImages(propertyId, [file], options);
    return images[0];
  }

  /**
   * Publish a draft property -> POST /api/properties/:id/publish
   */
  public static async publishProperty(id: string): Promise<Property> {
    const res = await apiClient.post<BackendProperty>(`/properties/${id}/publish`);
    return mapBackendPropertyToFrontend(res.data);
  }

  /**
   * Fetch authenticated user's own property listings -> GET /api/properties/my
   */
  public static async getMyProperties(params: { page?: number; limit?: number } = {}): Promise<{
    properties: Property[];
    pagination: BackendPagination;
  }> {
    const res = await apiClient.get<{
      items: BackendProperty[];
      pagination: BackendPagination;
    }>("/properties/my", {
      page: params.page || 1,
      limit: params.limit || 20,
    });

    const rawProperties = res.data?.items || [];
    const pagination = res.data?.pagination || {
      page: 1,
      limit: 20,
      total: rawProperties.length,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    return {
      properties: rawProperties.map(mapBackendPropertyToFrontend),
      pagination,
    };
  }

  /**
   * Update an existing property -> PATCH /api/properties/:id
   */
  public static async updateProperty(
    id: string,
    data: Partial<CreatePropertyDto>
  ): Promise<Property> {
    const res = await apiClient.patch<BackendProperty>(`/properties/${id}`, data);
    return mapBackendPropertyToFrontend(res.data);
  }

  /**
   * Archive a property -> POST /api/properties/:id/archive
   */
  public static async archiveProperty(id: string): Promise<Property> {
    const res = await apiClient.post<BackendProperty>(`/properties/${id}/archive`);
    return mapBackendPropertyToFrontend(res.data);
  }

  /**
   * Mark a property as sold -> POST /api/properties/:id/sold
   */
  public static async markSoldProperty(id: string): Promise<Property> {
    const res = await apiClient.post<BackendProperty>(`/properties/${id}/sold`);
    return mapBackendPropertyToFrontend(res.data);
  }

  /**
   * Mark a property as rented -> POST /api/properties/:id/rented
   */
  public static async markRentedProperty(id: string): Promise<Property> {
    const res = await apiClient.post<BackendProperty>(`/properties/${id}/rented`);
    return mapBackendPropertyToFrontend(res.data);
  }

  /**
   * Unpublish a published property -> POST /api/properties/:id/unpublish
   */
  public static async unpublishProperty(id: string): Promise<Property> {
    const res = await apiClient.post<BackendProperty>(`/properties/${id}/unpublish`);
    return mapBackendPropertyToFrontend(res.data);
  }

  /**
   * Delete a property -> DELETE /api/properties/:id
   */
  public static async deleteProperty(id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete<{ message?: string }>(`/properties/${id}`);
    return {
      success: true,
      message: res.data?.message || "Property deleted successfully.",
    };
  }
}

/**
 * Adapter: Maps unified Property model to RentalProperty interface for /rent views
 */
export function mapPropertyToRentalProperty(p: Property): RentalProperty {
  const rentNumeric = p.priceNumeric || 25000;
  const bhkNum =
    typeof p.bhk === "number"
      ? p.bhk
      : parseInt(String(p.bhk || "2").replace(/[^0-9]/g, ""), 10) || 2;

  let furnishingStatus: FurnishingType = "Semi Furnished";
  if (p.furnishingStatus === "Furnished" || p.furnishingStatus === "FULLY_FURNISHED") {
    furnishingStatus = "Fully Furnished";
  } else if (p.furnishingStatus === "Unfurnished" || p.furnishingStatus === "UNFURNISHED") {
    furnishingStatus = "Unfurnished";
  }

  let propertyType: RentalPropertyType = "apartment";
  if (p.propertyType === "villa") propertyType = "villa";
  else if (p.propertyType === "plot") propertyType = "apartment";

  return {
    id: p.id,
    title: p.title,
    monthlyRent: rentNumeric,
    formattedRent: `₹ ${rentNumeric.toLocaleString("en-IN")} / mo`,
    securityDeposit: `₹ ${(rentNumeric * 2).toLocaleString("en-IN")}`,
    securityDepositNumeric: rentNumeric * 2,
    maintenanceCharges: "₹ 2,500 / mo",
    noticePeriod: "1 Month",
    bhk: `${bhkNum} BHK`,
    bhkNumeric: bhkNum,
    bathrooms: p.bathrooms || 2,
    carpetArea: p.carpetArea || "1,200 sq.ft",
    location: p.location || "Bangalore",
    locality: p.location?.split(",")?.[0]?.trim() || "Bangalore",
    city: p.city || "Bangalore",
    address: p.address || p.location || "Bangalore",
    propertyType,
    furnishingStatus,
    tenantPreference: ["Family", "Bachelor", "Working Professional"],
    availability: "Immediately Available",
    isReraVerified: p.isReraVerified ?? true,
    isOwnerVerified: true,
    sellerType: p.sellerType === "agent" ? "agent" : "owner",
    sellerName: p.sellerName || "Verified Landlord",
    sellerPhone: p.sellerPhone || "+91 98765 43210",
    image:
      p.image ||
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    images: p.images && p.images.length > 0 ? p.images : [p.image],
    description: p.description,
    amenities:
      p.amenities && p.amenities.length > 0
        ? p.amenities
        : ["24/7 Security", "Power Backup", "Car Parking", "Lift"],
    postedDate: p.postedDate || "Recently",
    isFeatured: p.isFeatured,
  };
}

/**
 * Adapter: Maps unified Property model to CommercialProperty interface for /commercial views
 */
export function mapPropertyToCommercialProperty(p: Property): CommercialProperty {
  const priceNum = p.priceNumeric || 150000;
  const isRentOrLease = p.listingType === "rent" || p.listingType === "commercial";
  const formattedPrice = formatIndianPrice(priceNum, isRentOrLease ? "RENT" : "SALE");

  let propertyType: CommercialPropertyType = "office";
  if (p.propertyType === "retail-shop") propertyType = "shop";
  else if (p.propertyType === "commercial-office") propertyType = "office";

  let furnishingStatus: CommercialFurnishing = "Semi Furnished";
  if (p.furnishingStatus === "Furnished" || p.furnishingStatus === "FULLY_FURNISHED") {
    furnishingStatus = "Fully Furnished";
  } else if (p.furnishingStatus === "Unfurnished" || p.furnishingStatus === "UNFURNISHED") {
    furnishingStatus = "Bare Shell";
  }

  return {
    id: p.id,
    title: p.title,
    transactionType: isRentOrLease ? "lease" : "sale",
    propertyType,
    priceFormatted: formattedPrice,
    priceNumeric: priceNum,
    carpetArea: p.carpetArea || "2,500 sq.ft",
    areaNumeric: p.areaNumeric || 2500,
    location: p.location || "Bangalore",
    locality: p.location?.split(",")?.[0]?.trim() || "Bangalore",
    businessDistrict: p.location?.split(",")?.[0]?.trim() || "CBD / Tech Corridor",
    city: p.city || "Bangalore",
    address: p.address || p.location || "Bangalore",
    floor: p.floor || "4th Floor",
    totalFloors: "12 Floors",
    parking: "Reserved Parking Available",
    furnishingStatus,
    possessionStatus: "Ready to Move",
    isReraVerified: p.isReraVerified ?? true,
    reraNumber: p.reraNumber || p.referenceCode,
    sellerType: p.sellerType === "agent" ? "agent" : "owner",
    sellerName: p.sellerName || "Verified Asset Manager",
    sellerPhone: p.sellerPhone || "+91 98765 43210",
    image:
      p.image ||
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    images: p.images && p.images.length > 0 ? p.images : [p.image],
    description: p.description,
    amenities:
      p.amenities && p.amenities.length > 0
        ? p.amenities
        : ["High Speed Lifts", "Power Backup", "24/7 Security", "Central AC"],
    securityDeposit: "3 Months Rent",
    maintenanceCharges: "₹ 15 / sq.ft",
    lockInPeriod: "3 Years",
    noticePeriod: "3 Months",
    postedDate: p.postedDate || "Recently",
    isFeatured: p.isFeatured,
  };
}


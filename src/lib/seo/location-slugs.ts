// ==============================================================================
// TheVrindaGroup - Location Slug Resolution & Validation
// Deterministic conversion between URL slugs and Canonical Administrative Entities
// ==============================================================================

import {
  CANONICAL_STATES_DATA,
  CanonicalState,
  getDistrictsByState,
  isValidStateDistrict,
} from "@/data/location/canonicalLocations";

/**
 * Deterministically converts any state or district name to a URL-safe lowercase slug.
 * Example: "Uttar Pradesh" -> "uttar-pradesh"
 * Example: "Dr. B.R. Ambedkar Konaseema" -> "dr-b-r-ambedkar-konaseema"
 */
export function toLocationSlug(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Resolves a state URL slug back to its exact CanonicalState entity.
 * Returns null if the slug does not match any of the 36 canonical States/UTs.
 */
export function resolveStateSlug(slug: string): CanonicalState | null {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim();
  for (const state of CANONICAL_STATES_DATA) {
    if (toLocationSlug(state.name) === cleanSlug) {
      return state;
    }
  }
  return null;
}

/**
 * Resolves a district URL slug within a canonical state name back to its official district name.
 * Returns null if the district slug does not match any official district for that state.
 */
export function resolveDistrictSlug(
  stateName: string,
  districtSlug: string
): string | null {
  if (!stateName || !districtSlug) return null;
  const cleanDistrictSlug = districtSlug.toLowerCase().trim();
  const districts = getDistrictsByState(stateName);
  for (const district of districts) {
    if (toLocationSlug(district) === cleanDistrictSlug) {
      return district;
    }
  }
  return null;
}

export interface ResolvedLocation {
  state: CanonicalState;
  district: string | null;
  stateSlug: string;
  districtSlug: string | null;
}

/**
 * Unified resolver for State and District route parameters.
 * Validates against canonical hierarchy. Returns null for invalid combinations.
 */
export function resolveLocationParams(
  stateSlugParam: string,
  districtSlugParam?: string
): ResolvedLocation | null {
  const state = resolveStateSlug(stateSlugParam);
  if (!state) return null;

  const stateSlug = toLocationSlug(state.name);

  if (!districtSlugParam) {
    return {
      state,
      district: null,
      stateSlug,
      districtSlug: null,
    };
  }

  const district = resolveDistrictSlug(state.name, districtSlugParam);
  if (!district) return null;

  // Strict verification against canonical hierarchy
  if (!isValidStateDistrict(state.name, district)) {
    return null;
  }

  return {
    state,
    district,
    stateSlug,
    districtSlug: toLocationSlug(district),
  };
}

// ==============================================================================
// TheVrindaGroup - Dynamic Search Engine Sitemap (sitemap.xml)
// Emits only verified public canonical URLs and active inventory landing pages
// ==============================================================================

import type { MetadataRoute } from "next";
import { PropertyApiService } from "@/lib/services/property-api";
import {
  findState,
  getDistrictsByState,
} from "@/data/location/canonicalLocations";
import { toLocationSlug } from "@/lib/seo/location-slugs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://thevrindagroup.com";
  const now = new Date();

  // Core public canonical routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/buy`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rent`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/commercial`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/post-property`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    // Query published properties to dynamically index non-empty location hubs
    const res = await PropertyApiService.getProperties({ limit: 100 });
    const properties = res.properties || [];

    const activeSaleStates = new Set<string>();
    const activeSaleDistricts = new Set<string>(); // "stateSlug/distSlug"

    const activeRentStates = new Set<string>();
    const activeRentDistricts = new Set<string>();

    const activeCommStates = new Set<string>();
    const activeCommDistricts = new Set<string>();

    for (const p of properties) {
      if (!p.state) continue;
      const canonicalState = findState(p.state);
      if (!canonicalState) continue;

      const stateSlug = toLocationSlug(canonicalState.name);
      const isCommercial = p.listingType === "commercial" || p.propertyType?.startsWith("commercial");
      const isRent = p.listingType === "rent";
      const isSale = p.listingType === "buy";

      if (isCommercial) {
        activeCommStates.add(stateSlug);
      } else if (isRent) {
        activeRentStates.add(stateSlug);
      } else if (isSale) {
        activeSaleStates.add(stateSlug);
      }

      // Check if property matches a canonical district in that state
      if (p.city || p.location || p.address) {
        const stateDistricts = getDistrictsByState(canonicalState.name);
        const searchBlob = `${p.city || ""} ${p.location || ""} ${p.address || ""}`.toLowerCase();

        for (const dist of stateDistricts) {
          if (searchBlob.includes(dist.toLowerCase())) {
            const distSlug = toLocationSlug(dist);
            const comboKey = `${stateSlug}/${distSlug}`;

            if (isCommercial) {
              activeCommDistricts.add(comboKey);
            } else if (isRent) {
              activeRentDistricts.add(comboKey);
            } else if (isSale) {
              activeSaleDistricts.add(comboKey);
            }
            break;
          }
        }
      }
    }

    const dynamicLocationRoutes: MetadataRoute.Sitemap = [];

    // Sale locations
    for (const sSlug of activeSaleStates) {
      dynamicLocationRoutes.push({
        url: `${baseUrl}/property-for-sale/${sSlug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
    for (const combo of activeSaleDistricts) {
      dynamicLocationRoutes.push({
        url: `${baseUrl}/property-for-sale/${combo}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }

    // Rent locations
    for (const sSlug of activeRentStates) {
      dynamicLocationRoutes.push({
        url: `${baseUrl}/property-for-rent/${sSlug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
    for (const combo of activeRentDistricts) {
      dynamicLocationRoutes.push({
        url: `${baseUrl}/property-for-rent/${combo}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }

    // Commercial locations
    for (const sSlug of activeCommStates) {
      dynamicLocationRoutes.push({
        url: `${baseUrl}/commercial-property/${sSlug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
    for (const combo of activeCommDistricts) {
      dynamicLocationRoutes.push({
        url: `${baseUrl}/commercial-property/${combo}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }

    const dynamicPropertyRoutes: MetadataRoute.Sitemap = [];
    const seenPropertyUrls = new Set<string>();

    for (const p of properties) {
      const isCommercial = p.listingType === "commercial" || p.propertyType?.startsWith("commercial");
      const propUrl = isCommercial
        ? `${baseUrl}/commercial/property/${p.slug || p.id}`
        : `${baseUrl}/property/${p.slug || p.id}`;

      if (!seenPropertyUrls.has(propUrl)) {
        seenPropertyUrls.add(propUrl);
        dynamicPropertyRoutes.push({
          url: propUrl,
          lastModified: p.postedDate ? new Date(p.postedDate) : now,
          changeFrequency: "daily",
          priority: 0.7,
        });
      }
    }

    return [...staticRoutes, ...dynamicLocationRoutes, ...dynamicPropertyRoutes];
  } catch {
    // Fallback gracefully to core canonical static routes if API is not reachable
    return staticRoutes;
  }
}

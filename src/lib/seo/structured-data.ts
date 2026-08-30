// ==============================================================================
// TheVrindaGroup - Schema.org JSON-LD Structured Data Generators
// Production Real Estate & Organization Semantic SEO
// ==============================================================================

import { BRAND } from "@/config/brand";
import { Property } from "@/types/property";
import { CommercialProperty } from "@/types/commercial";

const BASE_URL = "https://thevrindagroup.com";

/**
 * Format image URL to ensure absolute HTTPS URL
 */
function toAbsoluteImageUrl(url?: string): string {
  if (!url) return `${BASE_URL}/logo.jpeg`;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Site-wide Organization Schema
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    legalName: BRAND.legalName,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.jpeg`,
    description: BRAND.description,
    email: BRAND.email,
  };
}

/**
 * Homepage WebSite Schema with Sitelinks SearchAction
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND.name,
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/buy?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * BreadcrumbList Schema for hierarchical search engine navigation
 */
export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url.startsWith("/") ? "" : "/"}${item.url}`,
    })),
  };
}

/**
 * Residential Property RealEstateListing & Residence Schema
 */
export function generatePropertyJsonLd(property: Property) {
  const propertyUrl = `${BASE_URL}/property/${property.slug || property.id}`;

  let residenceSubtype = "Residence";
  if (property.propertyType === "apartment" || property.propertyType === "builder-floor") {
    residenceSubtype = "Apartment";
  } else if (property.propertyType === "villa" || property.propertyType === "house") {
    residenceSubtype = "SingleFamilyResidence";
  }

  const allImages = (
    property.images && property.images.length > 0
      ? property.images
      : property.image
      ? [property.image]
      : []
  ).map(toAbsoluteImageUrl);

  const numericBedrooms =
    typeof property.bhk === "number"
      ? property.bhk
      : typeof property.bhk === "string"
      ? parseInt(property.bhk, 10) || undefined
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": ["RealEstateListing", residenceSubtype],
    name: property.title,
    description: property.description || property.title,
    url: propertyUrl,
    image: allImages.length > 0 ? allImages : [`${BASE_URL}/logo.jpeg`],
    datePosted: property.postedDate || undefined,
    offers: {
      "@type": "Offer",
      price: property.priceNumeric > 0 ? property.priceNumeric : undefined,
      priceCurrency: "INR",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: property.priceNumeric > 0 ? property.priceNumeric : undefined,
        priceCurrency: "INR",
        valueAddedTaxIncluded: true,
      },
      availability: "https://schema.org/InStock",
      businessFunction:
        property.listingType === "rent"
          ? "http://purl.org/goodrelations/v1#LeaseOut"
          : "http://purl.org/goodrelations/v1#Sell",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address || property.location,
      addressLocality: property.location || property.city,
      addressRegion: property.state || property.city,
      postalCode: property.pincode || undefined,
      addressCountry: "IN",
    },
    ...(numericBedrooms ? { numberOfBedrooms: numericBedrooms } : {}),
    ...(property.bathrooms ? { numberOfBathroomsTotal: property.bathrooms } : {}),
    ...(property.carpetArea
      ? {
          floorSize: {
            "@type": "QuantitativeValue",
            value: property.areaNumeric || parseFloat(property.carpetArea) || undefined,
            unitCode: "FTK",
            unitText: "sq.ft",
          },
        }
      : {}),
    ...(property.amenities && property.amenities.length > 0
      ? {
          amenityFeature: property.amenities.map((amenity) => ({
            "@type": "LocationFeatureSpecification",
            name: amenity,
            value: true,
          })),
        }
      : {}),
  };
}

/**
 * Commercial Property RealEstateListing & CommercialRealEstate Schema
 */
export function generateCommercialPropertyJsonLd(property: CommercialProperty) {
  const propertyUrl = `${BASE_URL}/commercial/property/${property.id}`;

  const allImages = (
    property.images && property.images.length > 0
      ? property.images
      : property.image
      ? [property.image]
      : []
  ).map(toAbsoluteImageUrl);

  return {
    "@context": "https://schema.org",
    "@type": ["RealEstateListing", "CommercialRealEstate"],
    name: property.title,
    description: property.description || property.title,
    url: propertyUrl,
    image: allImages.length > 0 ? allImages : [`${BASE_URL}/logo.jpeg`],
    offers: {
      "@type": "Offer",
      price: property.priceNumeric > 0 ? property.priceNumeric : undefined,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      businessFunction:
        property.transactionType === "lease" || property.transactionType === "rent"
          ? "http://purl.org/goodrelations/v1#LeaseOut"
          : "http://purl.org/goodrelations/v1#Sell",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address || property.location,
      addressLocality: property.locality || property.location || property.city,
      addressRegion: property.city,
      addressCountry: "IN",
    },
    ...(property.carpetArea
      ? {
          floorSize: {
            "@type": "QuantitativeValue",
            value: property.areaNumeric || parseFloat(property.carpetArea) || undefined,
            unitCode: "FTK",
            unitText: "sq.ft",
          },
        }
      : {}),
    ...(property.amenities && property.amenities.length > 0
      ? {
          amenityFeature: property.amenities.map((amenity) => ({
            "@type": "LocationFeatureSpecification",
            name: amenity,
            value: true,
          })),
        }
      : {}),
  };
}

// ==============================================================================
// TheVrindaGroup - Residential Property Detail Route (/property/[id])
// Server-Side Dynamic Metadata & Schema.org Structured Data
// ==============================================================================

import { Metadata } from "next";
import { PropertyApiService } from "@/lib/services/property-api";
import { PropertyDetailContent } from "@/components/property/PropertyDetailContent";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  generatePropertyJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/seo/structured-data";

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    let property = await PropertyApiService.getPropertyById(id);
    if (!property) {
      property = await PropertyApiService.getPropertyBySlug(id);
    }

    if (!property) {
      return {
        title: "Property Listing | TheVrindaGroup",
        description: "Verified residential property listing on TheVrindaGroup.",
        robots: {
          index: false,
          follow: true,
        },
      };
    }

    const bhkLabel = property.bhk ? `${property.bhk} BHK ` : "";
    const locationLabel = property.location
      ? `${property.location}, ${property.city}`
      : property.city;
    const typeLabel = property.propertyType
      ? property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)
      : "Property";
    const transactionLabel = property.listingType === "rent" ? "for Rent" : "for Sale";

    const title = `${bhkLabel}${typeLabel} ${transactionLabel} in ${locationLabel} | TheVrindaGroup`;
    const description = `${property.title} - ${property.price} in ${property.address || locationLabel}. ${
      property.carpetArea ? `${property.carpetArea} carpet area. ` : ""
    }Verified direct owner / agent real estate listing on TheVrindaGroup.`;

    const canonicalUrl = `https://thevrindagroup.com/property/${property.slug || property.id}`;
    const primaryImage =
      property.images && property.images.length > 0
        ? property.images[0]
        : property.image || "https://thevrindagroup.com/logo.jpeg";

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        type: "website",
        images: [
          {
            url: primaryImage,
            alt: property.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [primaryImage],
      },
    };
  } catch {
    return {
      title: "Property Details | TheVrindaGroup",
      description: "Discover verified residential properties for sale and rent with TheVrindaGroup.",
    };
  }
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { id } = await params;

  let initialProperty = null;
  try {
    initialProperty = await PropertyApiService.getPropertyById(id);
    if (!initialProperty) {
      initialProperty = await PropertyApiService.getPropertyBySlug(id);
    }
  } catch {
    initialProperty = null;
  }

  const breadcrumbs = [
    { name: "Home", url: "/" },
    {
      name: initialProperty?.listingType === "rent" ? "Properties For Rent" : "Properties For Sale",
      url: initialProperty?.listingType === "rent" ? "/rent" : "/buy",
    },
    ...(initialProperty
      ? [
          {
            name: initialProperty.title,
            url: `/property/${initialProperty.slug || initialProperty.id}`,
          },
        ]
      : []),
  ];

  return (
    <>
      {initialProperty && (
        <>
          <JsonLd
            id="property-structured-data"
            data={generatePropertyJsonLd(initialProperty)}
          />
          <JsonLd
            id="property-breadcrumb-data"
            data={generateBreadcrumbJsonLd(breadcrumbs)}
          />
        </>
      )}
      <PropertyDetailContent propertyId={id} initialProperty={initialProperty} />
    </>
  );
}

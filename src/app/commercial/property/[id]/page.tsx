// ==============================================================================
// TheVrindaGroup - Commercial Property Detail Route (/commercial/property/[id])
// Server-Side Dynamic Metadata & Schema.org Structured Data
// ==============================================================================

import { Metadata } from "next";
import { PropertyApiService, mapPropertyToCommercialProperty } from "@/lib/services/property-api";
import { CommercialPropertyDetailContent } from "@/components/commercial/CommercialPropertyDetailContent";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  generateCommercialPropertyJsonLd,
  generateBreadcrumbJsonLd,
} from "@/lib/seo/structured-data";

interface CommercialPropertyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CommercialPropertyPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    let rawProperty = await PropertyApiService.getPropertyById(id);
    if (!rawProperty) {
      rawProperty = await PropertyApiService.getPropertyBySlug(id);
    }

    if (!rawProperty) {
      return {
        title: "Commercial Property | TheVrindaGroup",
        description: "Verified commercial property asset listing on TheVrindaGroup.",
        robots: {
          index: false,
          follow: true,
        },
      };
    }

    const property = mapPropertyToCommercialProperty(rawProperty);
    const locationLabel = property.locality
      ? `${property.locality}, ${property.city}`
      : property.city;
    const typeLabel = property.propertyType
      ? property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)
      : "Commercial Asset";
    const transactionLabel =
      property.transactionType === "lease"
        ? "for Lease"
        : property.transactionType === "rent"
        ? "for Rent"
        : "for Sale";

    const title = `${typeLabel} ${transactionLabel} in ${locationLabel} | TheVrindaGroup Commercial`;
    const description = `${property.title} - ${property.priceFormatted} in ${property.address || locationLabel}. ${
      property.carpetArea ? `${property.carpetArea} carpet area. ` : ""
    }Verified enterprise commercial space with direct leasing desk representation on TheVrindaGroup.`;

    const canonicalUrl = `https://thevrindagroup.com/commercial/property/${property.id}`;
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
      title: "Commercial Property Details | TheVrindaGroup",
      description: "Discover verified commercial office spaces, shops, and showrooms with TheVrindaGroup.",
    };
  }
}

export default async function CommercialPropertyDetailPage({
  params,
}: CommercialPropertyPageProps) {
  const { id } = await params;

  let initialProperty = null;
  try {
    let rawProperty = await PropertyApiService.getPropertyById(id);
    if (!rawProperty) {
      rawProperty = await PropertyApiService.getPropertyBySlug(id);
    }
    if (rawProperty) {
      initialProperty = mapPropertyToCommercialProperty(rawProperty);
    }
  } catch {
    initialProperty = null;
  }

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Commercial Properties", url: "/commercial" },
    ...(initialProperty
      ? [
          {
            name: initialProperty.title,
            url: `/commercial/property/${initialProperty.id}`,
          },
        ]
      : []),
  ];

  return (
    <>
      {initialProperty && (
        <>
          <JsonLd
            id="commercial-property-structured-data"
            data={generateCommercialPropertyJsonLd(initialProperty)}
          />
          <JsonLd
            id="commercial-breadcrumb-data"
            data={generateBreadcrumbJsonLd(breadcrumbs)}
          />
        </>
      )}
      <CommercialPropertyDetailContent
        propertyId={id}
        initialProperty={initialProperty}
      />
    </>
  );
}

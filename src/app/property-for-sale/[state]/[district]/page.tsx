// ==============================================================================
// TheVrindaGroup - District Residential Sale Landing Route (/property-for-sale/[state]/[district])
// Server Component with Canonical Validation & Dynamic Indexing Guard
// ==============================================================================

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveLocationParams } from "@/lib/seo/location-slugs";
import { PropertyApiService } from "@/lib/services/property-api";
import { Property } from "@/types/property";
import { LocationLandingView } from "@/components/seo/LocationLandingView";

interface DistrictSalePageProps {
  params: Promise<{ state: string; district: string }>;
}

export async function generateMetadata({
  params,
}: DistrictSalePageProps): Promise<Metadata> {
  const { state: stateSlug, district: districtSlug } = await params;
  const resolved = resolveLocationParams(stateSlug, districtSlug);

  if (!resolved || !resolved.district) {
    return {
      title: "Location Not Found | TheVrindaGroup",
      robots: { index: false, follow: false },
    };
  }

  const { state, district, stateSlug: sSlug, districtSlug: dSlug } = resolved;
  const canonicalUrl = `https://thevrindagroup.com/property-for-sale/${sSlug}/${dSlug}`;

  let totalCount = 0;
  try {
    const res = await PropertyApiService.getProperties({
      state: state.name,
      district: district,
      listingType: "buy",
      limit: 1,
    });
    totalCount = res.pagination?.total || res.properties.length || 0;
  } catch {
    totalCount = 0;
  }

  const title = `Properties for Sale in ${district}, ${state.name} | TheVrindaGroup`;
  const description = `Explore verified properties for sale in ${district}, ${state.name}. Browse available homes, apartments, villas, and plots listed on TheVrindaGroup.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: totalCount > 0,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: [{ url: "https://thevrindagroup.com/logo.jpeg" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://thevrindagroup.com/logo.jpeg"],
    },
  };
}

export default async function DistrictSalePage({ params }: DistrictSalePageProps) {
  const { state: stateSlug, district: districtSlug } = await params;
  const resolved = resolveLocationParams(stateSlug, districtSlug);

  if (!resolved || !resolved.district) {
    notFound();
  }

  const { state, district } = resolved;

  let properties: Property[] = [];
  let totalCount = 0;

  try {
    const res = await PropertyApiService.getProperties({
      state: state.name,
      district: district,
      listingType: "buy",
      limit: 18,
    });
    properties = res.properties || [];
    totalCount = res.pagination?.total || properties.length;
  } catch {
    properties = [];
    totalCount = 0;
  }

  return (
    <LocationLandingView
      transactionType="buy"
      state={state}
      district={district}
      properties={properties}
      totalCount={totalCount}
    />
  );
}

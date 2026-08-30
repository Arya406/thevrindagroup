// ==============================================================================
// TheVrindaGroup - State Residential Rent Landing Route (/property-for-rent/[state])
// Server Component with Canonical Validation & Dynamic Indexing Guard
// ==============================================================================

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveLocationParams } from "@/lib/seo/location-slugs";
import { PropertyApiService } from "@/lib/services/property-api";
import { Property } from "@/types/property";
import { LocationLandingView } from "@/components/seo/LocationLandingView";

interface StateRentPageProps {
  params: Promise<{ state: string }>;
}

export async function generateMetadata({
  params,
}: StateRentPageProps): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const resolved = resolveLocationParams(stateSlug);

  if (!resolved) {
    return {
      title: "Location Not Found | TheVrindaGroup",
      robots: { index: false, follow: false },
    };
  }

  const { state } = resolved;
  const canonicalUrl = `https://thevrindagroup.com/property-for-rent/${resolved.stateSlug}`;

  let totalCount = 0;
  try {
    const res = await PropertyApiService.getProperties({
      state: state.name,
      listingType: "rent",
      limit: 1,
    });
    totalCount = res.pagination?.total || res.properties.length || 0;
  } catch {
    totalCount = 0;
  }

  const title = `Properties for Rent in ${state.name} | TheVrindaGroup`;
  const description = `Explore verified residential properties for rent in ${state.name}. Browse rental apartments, flats, independent houses, and villas on TheVrindaGroup.`;

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

export default async function StateRentPage({ params }: StateRentPageProps) {
  const { state: stateSlug } = await params;
  const resolved = resolveLocationParams(stateSlug);

  if (!resolved) {
    notFound();
  }

  const { state } = resolved;

  let properties: Property[] = [];
  let totalCount = 0;
  const activeDistrictsSet = new Set<string>();

  try {
    const res = await PropertyApiService.getProperties({
      state: state.name,
      listingType: "rent",
      limit: 18,
    });
    properties = res.properties || [];
    totalCount = res.pagination?.total || properties.length;

    // Collect districts with active published rental listings in this state
    for (const p of properties) {
      if (p.location) {
        for (const dist of state.districts) {
          if (
            p.location.toLowerCase().includes(dist.toLowerCase()) ||
            (p.address && p.address.toLowerCase().includes(dist.toLowerCase())) ||
            (p.city && p.city.toLowerCase().includes(dist.toLowerCase()))
          ) {
            activeDistrictsSet.add(dist);
          }
        }
      }
    }
  } catch {
    properties = [];
    totalCount = 0;
  }

  return (
    <LocationLandingView
      transactionType="rent"
      state={state}
      district={null}
      properties={properties}
      activeDistricts={Array.from(activeDistrictsSet)}
      totalCount={totalCount}
    />
  );
}

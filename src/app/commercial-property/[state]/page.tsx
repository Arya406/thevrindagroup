// ==============================================================================
// TheVrindaGroup - State Commercial Property Landing Route (/commercial-property/[state])
// Server Component with Canonical Validation & Dynamic Indexing Guard
// ==============================================================================

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveLocationParams } from "@/lib/seo/location-slugs";
import { PropertyApiService } from "@/lib/services/property-api";
import { Property } from "@/types/property";
import { LocationLandingView } from "@/components/seo/LocationLandingView";

interface StateCommercialPageProps {
  params: Promise<{ state: string }>;
}

export async function generateMetadata({
  params,
}: StateCommercialPageProps): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const resolved = resolveLocationParams(stateSlug);

  if (!resolved) {
    return {
      title: "Location Not Found | TheVrindaGroup",
      robots: { index: false, follow: false },
    };
  }

  const { state } = resolved;
  const canonicalUrl = `https://thevrindagroup.com/commercial-property/${resolved.stateSlug}`;

  let totalCount = 0;
  try {
    const res = await PropertyApiService.getProperties({
      state: state.name,
      listingType: "commercial",
      limit: 1,
    });
    totalCount = res.pagination?.total || res.properties.length || 0;
  } catch {
    totalCount = 0;
  }

  const title = `Commercial Properties in ${state.name} | TheVrindaGroup Commercial`;
  const description = `Explore verified commercial real estate in ${state.name}. Browse premium office spaces, retail shops, showrooms, and warehouses listed on TheVrindaGroup.`;

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

export default async function StateCommercialPage({ params }: StateCommercialPageProps) {
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
      listingType: "commercial",
      limit: 18,
    });
    properties = res.properties || [];
    totalCount = res.pagination?.total || properties.length;

    // Collect districts with active published commercial listings in this state
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
      transactionType="commercial"
      state={state}
      district={null}
      properties={properties}
      activeDistricts={Array.from(activeDistrictsSet)}
      totalCount={totalCount}
    />
  );
}

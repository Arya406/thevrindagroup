// ==============================================================================
// TheVrindaGroup - Official Homepage
// Redesigned Trust-First Real Estate Experience
// "Buy with Confidence. Sell with Trust."
// Server Component with Organization & WebSite JSON-LD Structured Data
// ==============================================================================

import { Metadata } from "next";
import { HomePageContent } from "@/components/home/HomePageContent";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "TheVrindaGroup | Buy, Rent & Sell Verified Properties Across India",
  description:
    "India's leading real estate platform with 100% verified listings. Buy apartments, rent verified homes, lease commercial spaces, or sell with zero brokerage.",
  alternates: {
    canonical: "https://thevrindagroup.com",
  },
  openGraph: {
    title: "TheVrindaGroup | Buy, Rent & Sell Properties in India",
    description:
      "Search verified apartments, houses, villas, and commercial real estate across India with TheVrindaGroup.",
    url: "https://thevrindagroup.com",
    siteName: "TheVrindaGroup",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://thevrindagroup.com/logo.jpeg",
        width: 800,
        height: 800,
        alt: "TheVrindaGroup Real Estate Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TheVrindaGroup | Real Estate Platform",
    description:
      "Search verified apartments, houses, villas, and commercial real estate across India.",
    images: ["https://thevrindagroup.com/logo.jpeg"],
  },
};

export default function HomePage() {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <>
      <JsonLd id="organization-structured-data" data={organizationSchema} />
      <JsonLd id="website-structured-data" data={websiteSchema} />
      <HomePageContent />
    </>
  );
}

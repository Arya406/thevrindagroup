// ==============================================================================
// TheVrindaGroup - List Your Property Route (/post-property)
// Architecture: Transaction Selection (Sell vs Rent) -> Flow Specific Experience
// ==============================================================================

import { Metadata } from "next";
import { Suspense } from "react";
import { PostPropertyContainer } from "@/components/post-property/PostPropertyContainer";

export const metadata: Metadata = {
  title: "List Your Property for Sale or Rent | Free Property Listing | TheVrindaGroup",
  description:
    "List your residential, commercial property, or plot for sale or rent with zero brokerage on TheVrindaGroup. Connect with verified buyers and tenants across India.",
  alternates: {
    canonical: "https://thevrindagroup.com/post-property",
  },
  openGraph: {
    title: "List Your Property for Sale or Rent | TheVrindaGroup",
    description:
      "List your residential, commercial property, or plot for sale or rent with zero brokerage on TheVrindaGroup.",
    url: "https://thevrindagroup.com/post-property",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "List Your Property for Sale or Rent | TheVrindaGroup",
    description:
      "List your residential, commercial property, or plot for sale or rent with zero brokerage on TheVrindaGroup.",
  },
};

export default function PostPropertyPage() {
  return (
    <div className="min-h-screen bg-bg-light/60">
      <Suspense
        fallback={
          <div className="py-20 text-center text-xs font-semibold text-text-muted">
            Loading Property Form...
          </div>
        }
      >
        <PostPropertyContainer />
      </Suspense>
    </div>
  );
}

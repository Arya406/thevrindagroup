import { Metadata } from "next";
import { Suspense } from "react";
import { PropertyListingsView } from "@/components/marketplace/PropertyListingsView";

export const metadata: Metadata = {
  title: "Properties for Sale in India | Buy Verified Homes | TheVrindaGroup",
  description:
    "Explore verified apartments, independent villas, builder floors, and residential plots for sale across India with TheVrindaGroup.",
};

export default function BuyPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs font-semibold text-text-muted">
          Loading properties...
        </div>
      }
    >
      <PropertyListingsView defaultListingType="buy" />
    </Suspense>
  );
}

import { Metadata } from "next";
import { Suspense } from "react";
import { PropertyListingsView } from "@/components/marketplace/PropertyListingsView";

export const metadata: Metadata = {
  title: "Property Search & Discovery | TheVrindaGroup Real Estate",
  description:
    "Search verified apartments, houses, villas, and commercial properties across India with TheVrindaGroup.",
};

export default function PropertiesPage() {
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

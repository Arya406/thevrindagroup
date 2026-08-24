// ==============================================================================
// TheVrindaGroup - Single-Page Sell / Post Property Route (/post-property)
// ==============================================================================

import { Metadata } from "next";
import { Suspense } from "react";
import { SellPropertyForm } from "@/components/sell-property/SellPropertyForm";

export const metadata: Metadata = {
  title: "Sell Your Property in 2 Minutes | List Online for Free | TheVrindaGroup",
  description:
    "Sell or list your residential, commercial property, or plot with zero brokerage on TheVrindaGroup. Submit details in under 2 minutes and connect with verified buyers across India.",
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
        <SellPropertyForm />
      </Suspense>
    </div>
  );
}

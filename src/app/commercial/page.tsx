import { Metadata } from "next";
import { Suspense } from "react";
import { CommercialPageContent } from "@/components/commercial/CommercialPageContent";
import { Container } from "@/components/ui";
import { PropertySkeleton } from "@/components/marketplace/PropertySkeleton";

export const metadata: Metadata = {
  title: "Commercial Property for Sale, Rent & Lease in India | TheVrindaGroup",
  description:
    "Explore verified commercial properties across India including offices, shops, showrooms, warehouses and other commercial spaces for sale, rent and lease.",
  alternates: {
    canonical: "https://thevrindagroup.com/commercial",
  },
  openGraph: {
    title: "Commercial Property for Sale, Rent & Lease in India | TheVrindaGroup",
    description: "Verified commercial properties for sale, rent and lease across India.",
    url: "https://thevrindagroup.com/commercial",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Commercial Property for Sale, Rent & Lease in India | TheVrindaGroup",
    description: "Verified commercial properties for sale, rent and lease across India.",
  },
};

export default function CommercialPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 bg-bg-light min-h-screen">
          <Container>
            <PropertySkeleton viewMode="grid" count={6} />
          </Container>
        </div>
      }
    >
      <CommercialPageContent />
    </Suspense>
  );
}

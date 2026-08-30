import { Metadata } from "next";
import { Suspense } from "react";
import { RentPageContent } from "@/components/rent/RentPageContent";
import { Container } from "@/components/ui";
import { PropertySkeleton } from "@/components/marketplace/PropertySkeleton";

export const metadata: Metadata = {
  title: "Properties for Rent in India | Verified Rental Homes | TheVrindaGroup",
  description:
    "Find verified apartments, houses, villas and other residential properties for rent across India with TheVrindaGroup. Explore rental homes with direct owner contact and zero brokerage.",
  alternates: {
    canonical: "https://thevrindagroup.com/rent",
  },
  openGraph: {
    title: "Properties for Rent in India | TheVrindaGroup",
    description: "Verified residential properties for rent across India.",
    url: "https://thevrindagroup.com/rent",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Properties for Rent in India | TheVrindaGroup",
    description: "Verified residential properties for rent across India.",
  },
};

export default function RentPage() {
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
      <RentPageContent />
    </Suspense>
  );
}

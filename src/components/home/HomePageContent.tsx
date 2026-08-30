"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ListingType } from "@/types/property";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { BuyingJourney } from "@/components/home/BuyingJourney";
import { SellingJourney } from "@/components/home/SellingJourney";
import { WhyVrindaGroup } from "@/components/home/WhyVrindaGroup";
import { TopCitiesAndProjects } from "@/components/home/TopCitiesAndProjects";
import { FinalCTA } from "@/components/home/FinalCTA";

export function HomePageContent() {
  const router = useRouter();

  const handleHeroSearchSubmit = (filters: {
    listingType: ListingType;
    location: string;
    propertyType: string;
    budget: string;
    bhk: string;
  }) => {
    const params = new URLSearchParams();
    if (filters.location.trim()) params.set("city", filters.location.trim());
    if (filters.propertyType && filters.propertyType !== "all") params.set("type", filters.propertyType);
    if (filters.bhk && filters.bhk !== "any") params.set("bhk", filters.bhk);

    if (filters.listingType === "rent") {
      router.push(`/rent?${params.toString()}`);
    } else if (filters.listingType === "commercial") {
      router.push(`/commercial?${params.toString()}`);
    } else {
      router.push(`/buy?${params.toString()}`);
    }
  };

  const handleSelectCity = (cityName: string) => {
    router.push(`/buy?city=${encodeURIComponent(cityName)}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-text-primary selection:bg-accent-gold/30 selection:text-dark-navy">
      {/* 1. Full-Width Immersive Trust Hero Section with Integrated Search & Trust Strip (100svh) */}
      <HeroSection onSearchSubmit={handleHeroSearchSubmit} />

      {/* 2. Live Featured & Verified Properties */}
      <FeaturedProperties />

      {/* 5. Step-by-Step Buying Journey */}
      <BuyingJourney />

      {/* 6. Step-by-Step Selling Journey (Zero Brokerage) */}
      <SellingJourney />

      {/* 7. Why Choose TheVrindaGroup (Value Pillars) */}
      <WhyVrindaGroup />

      {/* 8. Top Metropolitan Cities */}
      <TopCitiesAndProjects onSelectCity={handleSelectCity} />

      {/* 9. High-Conversion Final CTA Section */}
      <FinalCTA />
    </div>
  );
}

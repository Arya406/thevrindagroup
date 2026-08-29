// ==============================================================================
// TheVrindaGroup - Hero Floating Search Card Component
// Compact, high-efficiency tabbed search (Buy, Rent, Commercial)
// ==============================================================================

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building, IndianRupee, BedDouble, ChevronDown } from "lucide-react";
import { ListingType } from "@/types/property";

export interface HeroSearchCardProps {
  onSearchSubmit?: (filters: {
    listingType: ListingType;
    location: string;
    propertyType: string;
    budget: string;
    bhk: string;
  }) => void;
}

const POPULAR_CITIES = [
  "Bangalore",
  "Mumbai",
  "Delhi-NCR",
  "Pune",
  "Hyderabad",
  "Chennai",
];

const RESIDENTIAL_PROPERTY_TYPES = [
  { value: "all", label: "All Property Types" },
  { value: "apartment", label: "Apartment / Flat" },
  { value: "villa", label: "Independent House / Villa" },
  { value: "plot", label: "Plot / Land" },
  { value: "penthouse", label: "Luxury Penthouse" },
];

const COMMERCIAL_PROPERTY_TYPES = [
  { value: "all", label: "All Commercial Types" },
  { value: "office", label: "Commercial Office" },
  { value: "shop", label: "Retail Shop" },
  { value: "showroom", label: "Commercial Showroom" },
  { value: "warehouse", label: "Warehouse / Industrial" },
];

const BUDGET_OPTIONS_BUY = [
  { value: "any", label: "Any Budget" },
  { value: "under-50l", label: "Under ₹ 50 Lacs" },
  { value: "50l-1cr", label: "₹ 50 Lacs - ₹ 1.00 Cr" },
  { value: "1cr-2.5cr", label: "₹ 1.00 Cr - ₹ 2.50 Cr" },
  { value: "2.5cr-5cr", label: "₹ 2.50 Cr - ₹ 5.00 Cr" },
  { value: "above-5cr", label: "₹ 5.00 Cr+" },
];

const BUDGET_OPTIONS_RENT = [
  { value: "any", label: "Any Rent Budget" },
  { value: "under-20k", label: "Under ₹ 20,000 / mo" },
  { value: "20k-40k", label: "₹ 20,000 - ₹ 40,000 / mo" },
  { value: "40k-75k", label: "₹ 40,000 - ₹ 75,000 / mo" },
  { value: "above-75k", label: "₹ 75,000+ / mo" },
];

const BHK_OPTIONS = [
  { value: "any", label: "Any BHK" },
  { value: "1", label: "1 BHK" },
  { value: "2", label: "2 BHK" },
  { value: "3", label: "3 BHK" },
  { value: "4", label: "4 BHK" },
  { value: "5+", label: "5+ BHK" },
];

export function HeroSearchCard({ onSearchSubmit }: HeroSearchCardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ListingType>("buy");
  const [locationQuery, setLocationQuery] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [budget, setBudget] = useState("any");
  const [bhk, setBhk] = useState("any");

  const budgetOptions = activeTab === "rent" ? BUDGET_OPTIONS_RENT : BUDGET_OPTIONS_BUY;
  const propertyTypeOptions =
    activeTab === "commercial" ? COMMERCIAL_PROPERTY_TYPES : RESIDENTIAL_PROPERTY_TYPES;

  const handleCitySelect = (city: string) => {
    setLocationQuery(city);
  };

  const handleTabChange = (tab: ListingType) => {
    setActiveTab(tab);
    setPropertyType("all");
    setBudget("any");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (onSearchSubmit) {
      onSearchSubmit({
        listingType: activeTab,
        location: locationQuery,
        propertyType,
        budget,
        bhk,
      });
      return;
    }

    // Build URL query parameters
    const params = new URLSearchParams();
    if (locationQuery.trim()) params.set("city", locationQuery.trim());
    if (propertyType !== "all") params.set("type", propertyType);
    if (bhk !== "any") params.set("bhk", bhk);

    if (activeTab === "rent") {
      router.push(`/rent?${params.toString()}`);
    } else if (activeTab === "commercial") {
      router.push(`/commercial?${params.toString()}`);
    } else {
      router.push(`/buy?${params.toString()}`);
    }
  };

  return (
    <div id="search-card" className="w-full rounded-xl sm:rounded-2xl bg-white/98 backdrop-blur-md border border-border-default shadow-soft-xl p-3 sm:p-4 lg:p-4.5 text-left font-sans transition-all">
      {/* Top Tabs: Buy Property | Rent / Lease | Commercial */}
      <div className="flex items-center gap-1 p-0.5 sm:p-1 rounded-lg bg-bg-light border border-border-subtle w-fit mb-2 sm:mb-2.5">
        <button
          type="button"
          onClick={() => handleTabChange("buy")}
          className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-bold transition-all duration-150 cursor-pointer ${
            activeTab === "buy"
              ? "bg-dark-navy text-accent-gold shadow-soft-xs"
              : "text-text-secondary hover:text-dark-navy hover:bg-white/60"
          }`}
        >
          Buy Property
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("rent")}
          className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-bold transition-all duration-150 cursor-pointer ${
            activeTab === "rent"
              ? "bg-dark-navy text-accent-gold shadow-soft-xs"
              : "text-text-secondary hover:text-dark-navy hover:bg-white/60"
          }`}
        >
          Rent / Lease
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("commercial")}
          className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-bold transition-all duration-150 cursor-pointer ${
            activeTab === "commercial"
              ? "bg-dark-navy text-accent-gold shadow-soft-xs"
              : "text-text-secondary hover:text-dark-navy hover:bg-white/60"
          }`}
        >
          Commercial
        </button>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSearch} className="space-y-2 sm:space-y-2.5">
        {/* Main Grid: Location, Property Type, Budget, BHK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
          {/* 1. Location / City / Landmark */}
          <div className="space-y-1">
            <label className="block text-[10px] sm:text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Location / City / Landmark
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-accent-gold" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="City, locality, or landmark..."
                className="w-full rounded-lg border border-border-default bg-bg-light/60 hover:bg-white pl-9 pr-3 py-1.5 sm:py-2 text-xs font-medium text-text-primary placeholder:text-text-muted focus:border-dark-navy focus:bg-white focus:outline-none focus:ring-1 focus:ring-dark-navy transition-all"
              />
            </div>
          </div>

          {/* 2. Property Type */}
          <div className="space-y-1">
            <label className="block text-[10px] sm:text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Property Type
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-accent-gold" />
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full rounded-lg border border-border-default bg-bg-light/60 hover:bg-white pl-9 pr-7 py-1.5 sm:py-2 text-xs font-medium text-text-primary focus:border-dark-navy focus:bg-white focus:outline-none focus:ring-1 focus:ring-dark-navy transition-all appearance-none cursor-pointer"
              >
                {propertyTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            </div>
          </div>

          {/* 3. Budget */}
          <div className="space-y-1">
            <label className="block text-[10px] sm:text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Budget Range
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-accent-gold" />
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full rounded-lg border border-border-default bg-bg-light/60 hover:bg-white pl-9 pr-7 py-1.5 sm:py-2 text-xs font-medium text-text-primary focus:border-dark-navy focus:bg-white focus:outline-none focus:ring-1 focus:ring-dark-navy transition-all appearance-none cursor-pointer"
              >
                {budgetOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            </div>
          </div>

          {/* 4. BHK Configuration (Residential) or Primary Search CTA */}
          {activeTab !== "commercial" ? (
            <div className="space-y-1">
              <label className="block text-[10px] sm:text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                BHK Configuration
              </label>
              <div className="relative">
                <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-accent-gold" />
                <select
                  value={bhk}
                  onChange={(e) => setBhk(e.target.value)}
                  className="w-full rounded-lg border border-border-default bg-bg-light/60 hover:bg-white pl-9 pr-7 py-1.5 sm:py-2 text-xs font-medium text-text-primary focus:border-dark-navy focus:bg-white focus:outline-none focus:ring-1 focus:ring-dark-navy transition-all appearance-none cursor-pointer"
                >
                  {BHK_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
              </div>
            </div>
          ) : (
            <div className="space-y-1 flex flex-col justify-end">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent-gold hover:bg-accent-gold-hover text-dark-navy font-bold text-xs sm:text-sm py-1.5 sm:py-2 px-4 shadow-soft-xs transition-all duration-150 active:scale-[0.99] cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 shrink-0" />
                <span>Search Commercial</span>
              </button>
            </div>
          )}
        </div>

        {/* Popular Cities Pills & Action Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-border-default/60">
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-semibold text-text-secondary mr-0.5">Popular:</span>
            {POPULAR_CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleCitySelect(c)}
                className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
                  locationQuery.toLowerCase() === c.toLowerCase()
                    ? "bg-dark-navy text-accent-gold shadow-soft-xs"
                    : "bg-bg-light text-text-secondary hover:bg-border-default/60 hover:text-dark-navy"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {activeTab !== "commercial" && (
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent-gold hover:bg-accent-gold-hover text-dark-navy font-bold text-xs sm:text-sm px-5 py-1.5 sm:py-2 shadow-soft-xs transition-all duration-150 active:scale-[0.99] cursor-pointer shrink-0"
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span>Search Properties</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

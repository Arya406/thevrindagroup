"use client";

import React, { useState } from "react";
import { Search, MapPin, Building, IndianRupee, BedDouble, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui";
import { ListingType } from "@/types/property";

export interface HeroSearchProps {
  onSearch?: (filters: {
    listingType: ListingType;
    location: string;
    propertyType: string;
    budget: string;
    bhk: string;
  }) => void;
  onSelectCity?: (cityName: string) => void;
  selectedCity?: string;
}

const POPULAR_CITIES = [
  "Mumbai",
  "Bangalore",
  "Delhi NCR",
  "Hyderabad",
  "Pune",
  "Chennai",
];

const PROPERTY_TYPES = [
  { value: "all", label: "All Property Types" },
  { value: "apartment", label: "Apartment / Flat" },
  { value: "villa", label: "Independent House / Villa" },
  { value: "plot", label: "Residential Plot / Land" },
  { value: "penthouse", label: "Luxury Penthouse" },
  { value: "commercial-office", label: "Commercial Office Space" },
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

export function HeroSearch({
  onSearch,
  onSelectCity,
  selectedCity = "",
}: HeroSearchProps) {
  const [activeTab, setActiveTab] = useState<ListingType>("buy");
  const [locationQuery, setLocationQuery] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [budget, setBudget] = useState("any");
  const [bhk, setBhk] = useState("any");

  const budgetOptions =
    activeTab === "rent" ? BUDGET_OPTIONS_RENT : BUDGET_OPTIONS_BUY;

  const handleCityClick = (city: string) => {
    setLocationQuery(city);
    if (onSelectCity) onSelectCity(city);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({
        listingType: activeTab,
        location: locationQuery,
        propertyType,
        budget,
        bhk,
      });
    }
  };

  return (
    <div className="w-full space-y-4 font-sans">
      {/* Cohesive Search Card Container */}
      <div className="rounded-2xl bg-white border border-border-default shadow-soft-lg p-4 sm:p-6 space-y-4">
        {/* Top Listing Type Tabs (Buy, Rent, Commercial) */}
        <div className="flex items-center gap-1.5 sm:gap-2 border-b border-border-subtle pb-3.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("buy")}
            className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "buy"
                ? "bg-primary-navy text-white shadow-soft-xs"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-light"
            }`}
          >
            Buy Property
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rent")}
            className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "rent"
                ? "bg-primary-navy text-white shadow-soft-xs"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-light"
            }`}
          >
            Rent / Lease
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("commercial")}
            className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "commercial"
                ? "bg-primary-navy text-white shadow-soft-xs"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-light"
            }`}
          >
            Commercial
          </button>
        </div>

        {/* Search Controls Form */}
        <form onSubmit={handleSearchSubmit} className="space-y-3.5">
          {/* Row 1: Location Search Input */}
          <div className="relative">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Location / City / Landmark
            </label>
            <div className="relative flex items-center">
              <MapPin className="absolute left-3.5 h-4 w-4 text-accent-gold-hover pointer-events-none shrink-0" />
              <input
                type="text"
                placeholder="City, locality, or landmark (e.g. Bandra, Whitefield)"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full h-11 sm:h-12 pl-10 pr-4 rounded-xl border border-border-default bg-bg-light/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 focus:outline-none transition-all shadow-soft-xs"
              />
            </div>
          </div>

          {/* Row 2: Property Type, Budget & BHK in 3 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Property Type */}
            <div className="relative">
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Property Type
              </label>
              <div className="relative flex items-center">
                <Building className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none shrink-0" />
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full h-11 sm:h-12 pl-10 pr-8 appearance-none rounded-xl border border-border-default bg-bg-light/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-text-primary focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 focus:outline-none transition-all shadow-soft-xs cursor-pointer truncate"
                >
                  {PROPERTY_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 h-4 w-4 text-text-muted pointer-events-none" />
              </div>
            </div>

            {/* Budget */}
            <div className="relative">
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Budget
              </label>
              <div className="relative flex items-center">
                <IndianRupee className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none shrink-0" />
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full h-11 sm:h-12 pl-9 pr-8 appearance-none rounded-xl border border-border-default bg-bg-light/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-text-primary focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 focus:outline-none transition-all shadow-soft-xs cursor-pointer truncate"
                >
                  {budgetOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 h-4 w-4 text-text-muted pointer-events-none" />
              </div>
            </div>

            {/* BHK */}
            <div className="relative">
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                BHK Configuration
              </label>
              <div className="relative flex items-center">
                <BedDouble className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none shrink-0" />
                <select
                  value={bhk}
                  onChange={(e) => setBhk(e.target.value)}
                  className="w-full h-11 sm:h-12 pl-10 pr-8 appearance-none rounded-xl border border-border-default bg-bg-light/50 hover:bg-white focus:bg-white text-xs sm:text-sm text-text-primary focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 focus:outline-none transition-all shadow-soft-xs cursor-pointer"
                >
                  {BHK_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 h-4 w-4 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 3: Centered Primary Search CTA Button */}
          <div className="pt-1">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-11 sm:h-12 text-sm sm:text-base font-bold shadow-soft-md rounded-xl hover:shadow-soft-lg active:scale-[0.99] transition-all"
              leftIcon={<Search className="w-4 h-4" />}
            >
              Search Properties
            </Button>
          </div>
        </form>
      </div>

      {/* Popular City Filter Pills */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
        <span className="text-xs font-bold text-text-secondary flex items-center gap-1.5 shrink-0">
          <MapPin className="w-3.5 h-3.5 text-accent-gold-hover" />
          Search by City:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {POPULAR_CITIES.map((city) => {
            const isSelected =
              selectedCity === city ||
              locationQuery.toLowerCase().includes(city.toLowerCase());
            return (
              <button
                key={city}
                type="button"
                onClick={() => handleCityClick(city)}
                className={`text-xs px-3 py-1 rounded-full transition-all cursor-pointer select-none font-semibold ${
                  isSelected
                    ? "bg-primary-navy text-white shadow-soft-xs border border-primary-navy"
                    : "bg-white hover:bg-bg-light text-text-secondary hover:text-primary-navy border border-border-default hover:border-accent-gold/40 shadow-soft-xs"
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HeroSearch;

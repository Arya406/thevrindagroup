"use client";

import React, { useState } from "react";
import { Search, MapPin, Building, IndianRupee, ChevronDown, Sofa } from "lucide-react";
import { Button } from "@/components/ui";

export interface RentSearchBarProps {
  location: string;
  onLocationChange: (loc: string) => void;
  propertyType: string;
  onPropertyTypeChange: (type: string) => void;
  rentBudget: string;
  onRentBudgetChange: (budget: string) => void;
  bhk: string;
  onBhkChange: (bhk: string) => void;
  furnishing: string;
  onFurnishingChange: (furnish: string) => void;
  onSearchSubmit: () => void;
  className?: string;
}

const RENTAL_PROPERTY_TYPES = [
  { value: "all", label: "All Rental Types" },
  { value: "apartment", label: "Apartment / Flat" },
  { value: "independent-house", label: "Independent House" },
  { value: "villa", label: "Villa / Bungalow" },
  { value: "studio", label: "Studio Apartment" },
  { value: "pg", label: "PG / Co-living" },
];

const RENT_BUDGET_OPTIONS = [
  { value: "any", label: "Any Rent" },
  { value: "under-15k", label: "< ₹ 15,000 / mo" },
  { value: "15k-30k", label: "₹ 15,000 - ₹ 30,000 / mo" },
  { value: "30k-50k", label: "₹ 30,000 - ₹ 50,000 / mo" },
  { value: "50k-75k", label: "₹ 50,000 - ₹ 75,000 / mo" },
  { value: "above-75k", label: "₹ 75,000+ / mo" },
];

const BHK_OPTIONS = [
  { value: "any", label: "Any BHK" },
  { value: "1 RK", label: "1 RK" },
  { value: "1 BHK", label: "1 BHK" },
  { value: "2 BHK", label: "2 BHK" },
  { value: "3 BHK", label: "3 BHK" },
  { value: "4 BHK", label: "4 BHK" },
  { value: "5+ BHK", label: "5+ BHK" },
];

const FURNISHING_OPTIONS = [
  { value: "all", label: "Any Furnishing" },
  { value: "Fully Furnished", label: "Fully Furnished" },
  { value: "Semi Furnished", label: "Semi Furnished" },
  { value: "Unfurnished", label: "Unfurnished" },
];

export function RentSearchBar({
  location,
  onLocationChange,
  propertyType,
  onPropertyTypeChange,
  rentBudget,
  onRentBudgetChange,
  bhk,
  onBhkChange,
  furnishing,
  onFurnishingChange,
  onSearchSubmit,
  className = "",
}: RentSearchBarProps) {
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);

  const popularSuggestions = [
    "Bangalore",
    "Whitefield, Bangalore",
    "HSR Layout, Bangalore",
    "Koramangala, Bangalore",
    "Indiranagar, Bangalore",
    "Mumbai",
    "Powai, Mumbai",
    "Andheri East, Mumbai",
    "Lower Parel, Mumbai",
    "Gurugram (Golf Course Road)",
    "HITEC City, Hyderabad",
    "Kharadi, Pune",
    "Hinjawadi, Pune",
    "OMR, Chennai",
  ];

  const filteredSuggestions = popularSuggestions.filter((s) =>
    s.toLowerCase().includes(location.toLowerCase())
  );

  return (
    <div
      className={`rounded-2xl border border-border-default bg-white p-3.5 sm:p-4 shadow-soft ${className}`}
    >
      {/* Main Search Controls */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setIsSuggestOpen(false);
          onSearchSubmit();
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center"
      >
        {/* 1. Location Autocomplete */}
        <div className="sm:col-span-2 lg:col-span-3.5 relative">
          <div className="relative flex items-center">
            <MapPin className="absolute left-3.5 h-4 w-4 text-accent-gold pointer-events-none" />
            <input
              type="text"
              placeholder="City, locality, or landmark..."
              value={location}
              onChange={(e) => {
                onLocationChange(e.target.value);
                setIsSuggestOpen(true);
              }}
              onFocus={() => setIsSuggestOpen(true)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary placeholder:text-text-muted focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 focus:outline-none transition-all shadow-soft-xs"
            />
          </div>

          {isSuggestOpen && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white rounded-lg border border-border-default shadow-soft-lg py-1 max-h-48 overflow-y-auto">
              {filteredSuggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => {
                    onLocationChange(sug);
                    setIsSuggestOpen(false);
                    onSearchSubmit();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-medium text-text-primary hover:bg-bg-light flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                  <span className="truncate">{sug}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Property Type */}
        <div className="sm:col-span-1 lg:col-span-2.5 relative">
          <div className="relative flex items-center">
            <Building className="absolute left-3 h-3.5 w-3.5 text-text-muted pointer-events-none" />
            <select
              value={propertyType}
              onChange={(e) => {
                onPropertyTypeChange(e.target.value);
                onSearchSubmit();
              }}
              className="w-full h-10 pl-8 pr-7 appearance-none rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none transition-all shadow-soft-xs cursor-pointer"
            >
              {RENTAL_PROPERTY_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 h-3.5 w-3.5 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* 3. Monthly Rent Budget */}
        <div className="sm:col-span-1 lg:col-span-2 relative">
          <div className="relative flex items-center">
            <IndianRupee className="absolute left-3 h-3.5 w-3.5 text-text-muted pointer-events-none" />
            <select
              value={rentBudget}
              onChange={(e) => {
                onRentBudgetChange(e.target.value);
                onSearchSubmit();
              }}
              className="w-full h-10 pl-7 pr-6 appearance-none rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none transition-all shadow-soft-xs cursor-pointer"
            >
              {RENT_BUDGET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* 4. BHK */}
        <div className="sm:col-span-1 lg:col-span-1.5 relative">
          <div className="relative flex items-center">
            <select
              value={bhk}
              onChange={(e) => {
                onBhkChange(e.target.value);
                onSearchSubmit();
              }}
              className="w-full h-10 px-2.5 pr-6 appearance-none rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none transition-all shadow-soft-xs cursor-pointer"
            >
              {BHK_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* 5. Furnishing */}
        <div className="sm:col-span-1 lg:col-span-1.5 relative">
          <div className="relative flex items-center">
            <Sofa className="absolute left-2.5 h-3.5 w-3.5 text-text-muted pointer-events-none" />
            <select
              value={furnishing}
              onChange={(e) => {
                onFurnishingChange(e.target.value);
                onSearchSubmit();
              }}
              className="w-full h-10 pl-7 pr-6 appearance-none rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none transition-all shadow-soft-xs cursor-pointer"
            >
              {FURNISHING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 h-3.5 w-3.5 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* 6. Search Button */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Button
            type="submit"
            variant="primary"
            className="w-full h-10 text-xs font-bold shadow-soft-sm"
            leftIcon={<Search className="w-3.5 h-3.5" />}
          >
            Search
          </Button>
        </div>
      </form>
    </div>
  );
}

export default RentSearchBar;

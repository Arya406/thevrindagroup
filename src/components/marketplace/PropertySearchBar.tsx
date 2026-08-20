"use client";

import React, { useState } from "react";
import { Search, MapPin, Building, IndianRupee, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui";
import { ListingType } from "@/types/property";

export interface PropertySearchBarProps {
  listingType: ListingType;
  onListingTypeChange: (type: ListingType) => void;
  location: string;
  onLocationChange: (loc: string) => void;
  propertyType: string;
  onPropertyTypeChange: (type: string) => void;
  budget: string;
  onBudgetChange: (budget: string) => void;
  bhk: string;
  onBhkChange: (bhk: string) => void;
  onSearchSubmit: () => void;
  className?: string;
}

const PROPERTY_TYPES = [
  { value: "all", label: "All Property Types" },
  { value: "apartment", label: "Apartment / Flat" },
  { value: "villa", label: "Independent House / Villa" },
  { value: "plot", label: "Plot / Land" },
  { value: "penthouse", label: "Penthouse" },
  { value: "commercial-office", label: "Commercial Office" },
];

const BUDGET_OPTIONS_BUY = [
  { value: "any", label: "Any Budget" },
  { value: "under-50l", label: "Under ₹ 50 L" },
  { value: "50l-1cr", label: "₹ 50 L - ₹ 1 Cr" },
  { value: "1cr-2.5cr", label: "₹ 1 Cr - ₹ 2.5 Cr" },
  { value: "2.5cr-5cr", label: "₹ 2.5 Cr - ₹ 5 Cr" },
  { value: "above-5cr", label: "₹ 5 Cr+" },
];

const BUDGET_OPTIONS_RENT = [
  { value: "any", label: "Any Budget" },
  { value: "under-20k", label: "Under ₹ 20K" },
  { value: "20k-40k", label: "₹ 20K - ₹ 40K" },
  { value: "40k-75k", label: "₹ 40K - ₹ 75K" },
  { value: "above-75k", label: "₹ 75K+" },
];

const BHK_OPTIONS = [
  { value: "any", label: "Any BHK" },
  { value: "1", label: "1 BHK" },
  { value: "2", label: "2 BHK" },
  { value: "3", label: "3 BHK" },
  { value: "4", label: "4 BHK" },
  { value: "5+", label: "5+ BHK" },
];

export function PropertySearchBar({
  listingType,
  onListingTypeChange,
  location,
  onLocationChange,
  propertyType,
  onPropertyTypeChange,
  budget,
  onBudgetChange,
  bhk,
  onBhkChange,
  onSearchSubmit,
  className = "",
}: PropertySearchBarProps) {
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const budgetOptions =
    listingType === "rent" ? BUDGET_OPTIONS_RENT : BUDGET_OPTIONS_BUY;

  const popularSuggestions = [
    "Bangalore",
    "Whitefield, Bangalore",
    "Mumbai",
    "Lower Parel, Mumbai",
    "Bandra West, Mumbai",
    "Delhi NCR",
    "Gurugram (Golf Course Road)",
    "Hyderabad (HITEC City)",
    "Pune (Hinjawadi)",
    "Chennai (OMR)",
  ];

  const filteredSuggestions = popularSuggestions.filter((s) =>
    s.toLowerCase().includes(location.toLowerCase())
  );

  return (
    <div
      className={`rounded-2xl border border-border-default bg-white p-3 sm:p-4 shadow-soft space-y-3 ${className}`}
    >
      {/* Top Tabs */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => onListingTypeChange("buy")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              listingType === "buy"
                ? "bg-primary-navy text-white shadow-soft-xs"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-light"
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => onListingTypeChange("rent")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              listingType === "rent"
                ? "bg-primary-navy text-white shadow-soft-xs"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-light"
            }`}
          >
            Rent
          </button>
          <button
            type="button"
            onClick={() => onListingTypeChange("commercial")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              listingType === "commercial"
                ? "bg-primary-navy text-white shadow-soft-xs"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-light"
            }`}
          >
            Commercial
          </button>
        </div>

        <span className="text-[11px] font-semibold text-success-green hidden sm:inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-success-green animate-pulse" />
          100% RERA Verified Listings
        </span>
      </div>

      {/* Main Search Controls Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setIsSuggestOpen(false);
          onSearchSubmit();
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center"
      >
        {/* 1. Location Input with Autocomplete */}
        <div className="sm:col-span-2 lg:col-span-4 relative">
          <div className="relative flex items-center">
            <MapPin className="absolute left-3.5 h-4 w-4 text-accent-gold pointer-events-none" />
            <input
              type="text"
              placeholder="City, Locality, or Project name..."
              value={location}
              onChange={(e) => {
                onLocationChange(e.target.value);
                setIsSuggestOpen(true);
              }}
              onFocus={() => setIsSuggestOpen(true)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary placeholder:text-text-muted focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 focus:outline-none transition-all shadow-soft-xs"
            />
          </div>

          {/* Autocomplete Suggestions Dropdown */}
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
        <div className="sm:col-span-1 lg:col-span-3 relative">
          <div className="relative flex items-center">
            <Building className="absolute left-3 h-3.5 w-3.5 text-text-muted pointer-events-none" />
            <select
              value={propertyType}
              onChange={(e) => {
                onPropertyTypeChange(e.target.value);
                onSearchSubmit();
              }}
              className="w-full h-10 pl-8 pr-7 appearance-none rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 focus:outline-none transition-all shadow-soft-xs cursor-pointer"
            >
              {PROPERTY_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 h-3.5 w-3.5 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* 3. Budget */}
        <div className="sm:col-span-1 lg:col-span-2 relative">
          <div className="relative flex items-center">
            <IndianRupee className="absolute left-3 h-3.5 w-3.5 text-text-muted pointer-events-none" />
            <select
              value={budget}
              onChange={(e) => {
                onBudgetChange(e.target.value);
                onSearchSubmit();
              }}
              className="w-full h-10 pl-7 pr-6 appearance-none rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 focus:outline-none transition-all shadow-soft-xs cursor-pointer"
            >
              {budgetOptions.map((opt) => (
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
              className="w-full h-10 px-2.5 pr-6 appearance-none rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 focus:outline-none transition-all shadow-soft-xs cursor-pointer"
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

        {/* 5. Search Button */}
        <div className="sm:col-span-1 lg:col-span-1.5">
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

export default PropertySearchBar;

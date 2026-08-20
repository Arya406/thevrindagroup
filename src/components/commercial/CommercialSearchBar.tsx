"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Building2,
  ChevronDown,
  Maximize2,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui";

export interface CommercialSearchBarProps {
  location: string;
  onLocationChange: (loc: string) => void;
  propertyType: string;
  onPropertyTypeChange: (type: string) => void;
  transactionType: string;
  onTransactionTypeChange: (txn: string) => void;
  areaRange: string;
  onAreaRangeChange: (area: string) => void;
  priceBudget: string;
  onPriceBudgetChange: (budget: string) => void;
  onSearchSubmit: () => void;
  className?: string;
}

const COMMERCIAL_PROPERTY_TYPES = [
  { value: "all", label: "All Commercial Types" },
  { value: "office", label: "Office Space" },
  { value: "shop", label: "Shop" },
  { value: "showroom", label: "Showroom" },
  { value: "warehouse", label: "Warehouse / Logistics" },
  { value: "industrial", label: "Industrial Building" },
  { value: "coworking", label: "Co-working Space" },
  { value: "plot", label: "Commercial Plot" },
  { value: "retail", label: "Retail Space" },
  { value: "restaurant", label: "Restaurant / F&B Space" },
];

const AREA_RANGE_OPTIONS = [
  { value: "any", label: "Any Area" },
  { value: "under-1000", label: "< 1,000 sq.ft" },
  { value: "1000-3000", label: "1,000 - 3,000 sq.ft" },
  { value: "3000-7000", label: "3,000 - 7,000 sq.ft" },
  { value: "7000-15000", label: "7,000 - 15,000 sq.ft" },
  { value: "above-15000", label: "15,000+ sq.ft" },
];

const PRICE_BUDGET_OPTIONS = [
  { value: "any", label: "Any Budget" },
  { value: "under-1l", label: "< ₹ 1 Lakh / mo" },
  { value: "1l-3l", label: "₹ 1L - ₹ 3L / mo" },
  { value: "3l-7l", label: "₹ 3L - ₹ 7L / mo" },
  { value: "7l-15l", label: "₹ 7L - ₹ 15L / mo" },
  { value: "above-15l", label: "₹ 15L+ / mo" },
  { value: "under-5cr", label: "< ₹ 5 Cr (Buy)" },
  { value: "5cr-10cr", label: "₹ 5 Cr - ₹ 10 Cr (Buy)" },
  { value: "above-10cr", label: "₹ 10 Cr+ (Buy)" },
];

export function CommercialSearchBar({
  location,
  onLocationChange,
  propertyType,
  onPropertyTypeChange,
  transactionType,
  onTransactionTypeChange,
  areaRange,
  onAreaRangeChange,
  priceBudget,
  onPriceBudgetChange,
  onSearchSubmit,
  className = "",
}: CommercialSearchBarProps) {
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);

  const commercialSuggestions = [
    "Outer Ring Road, Bangalore",
    "Whitefield, Bangalore",
    "Electronic City, Bangalore",
    "Koramangala, Bangalore",
    "Indiranagar, Bangalore",
    "Hebbal, Bangalore",
    "BKC (Bandra Kurla Complex), Mumbai",
    "Lower Parel, Mumbai",
    "Andheri East, Mumbai",
    "DLF Cyber City, Gurugram",
    "Golf Course Road, Gurugram",
    "HITEC City, Hyderabad",
    "Financial District, Gachibowli, Hyderabad",
    "Kharadi, Pune",
    "Hinjawadi, Pune",
    "OMR, Chennai",
    "Guindy, Chennai",
  ];

  const filteredSuggestions = commercialSuggestions.filter((s) =>
    s.toLowerCase().includes(location.toLowerCase())
  );

  return (
    <div
      className={`rounded-2xl border border-border-default bg-white p-3.5 sm:p-4 shadow-soft space-y-3.5 ${className}`}
    >
      {/* Top Tabs: Buy | Rent | Commercial (Active) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-2.5">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/buy"
            className="px-3.5 py-1.5 text-xs font-bold rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-light transition-all cursor-pointer"
          >
            Buy
          </Link>
          <Link
            href="/rent"
            className="px-3.5 py-1.5 text-xs font-bold rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-light transition-all cursor-pointer"
          >
            Rent
          </Link>
          <div className="px-3.5 py-1.5 text-xs font-bold rounded-md bg-primary-navy text-white shadow-soft-xs cursor-default flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-accent-gold" />
            Commercial
          </div>
        </div>

        {/* Commercial Segmented Sub-control: For Lease | For Rent | For Sale | Co-working */}
        <div className="flex items-center p-1 bg-bg-light rounded-lg border border-border-default text-xs font-semibold">
          {[
            { id: "all", label: "All Modes" },
            { id: "lease", label: "For Lease" },
            { id: "rent", label: "For Rent" },
            { id: "sale", label: "For Sale" },
            { id: "coworking", label: "Co-working" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                onTransactionTypeChange(tab.id);
                onSearchSubmit();
              }}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                transactionType === tab.id
                  ? "bg-white text-primary-navy font-bold shadow-soft-xs"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Commercial Search Form */}
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
              placeholder="Search city, business district or landmark..."
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
            <Briefcase className="absolute left-3 h-3.5 w-3.5 text-text-muted pointer-events-none" />
            <select
              value={propertyType}
              onChange={(e) => {
                onPropertyTypeChange(e.target.value);
                onSearchSubmit();
              }}
              className="w-full h-10 pl-8 pr-7 appearance-none rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none transition-all shadow-soft-xs cursor-pointer"
            >
              {COMMERCIAL_PROPERTY_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 h-3.5 w-3.5 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* 3. Area Range */}
        <div className="sm:col-span-1 lg:col-span-2.5 relative">
          <div className="relative flex items-center">
            <Maximize2 className="absolute left-3 h-3.5 w-3.5 text-text-muted pointer-events-none" />
            <select
              value={areaRange}
              onChange={(e) => {
                onAreaRangeChange(e.target.value);
                onSearchSubmit();
              }}
              className="w-full h-10 pl-8 pr-7 appearance-none rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none transition-all shadow-soft-xs cursor-pointer"
            >
              {AREA_RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 h-3.5 w-3.5 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* 4. Budget */}
        <div className="sm:col-span-1 lg:col-span-2 relative">
          <div className="relative flex items-center">
            <select
              value={priceBudget}
              onChange={(e) => {
                onPriceBudgetChange(e.target.value);
                onSearchSubmit();
              }}
              className="w-full h-10 px-3 pr-7 appearance-none rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none transition-all shadow-soft-xs cursor-pointer"
            >
              {PRICE_BUDGET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 h-3.5 w-3.5 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* 5. Search CTA */}
        <div className="sm:col-span-2 lg:col-span-1.5">
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

export default CommercialSearchBar;

"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  RotateCcw,
  Check,
} from "lucide-react";

export interface FilterState {
  city: string;
  propertyTypes: string[];
  bhkList: string[];
  budgetRange: string;
  minPrice?: number;
  maxPrice?: number;
  possessionStatus: string[];
  sellerTypes: string[];
  isReraOnly: boolean;
  furnishingStatus: string[];
  amenities: string[];
}

export interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onClearAll: () => void;
  className?: string;
}

export function FilterSidebar({
  filters,
  onFilterChange,
  onClearAll,
  className = "",
}: FilterSidebarProps) {
  // Collapsible section states
  const [openSections, setOpenSections] = useState({
    budget: true,
    bhk: true,
    propertyType: true,
    possession: true,
    sellerType: true,
    furnishing: false,
    amenities: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBhkToggle = (val: string) => {
    const updated = filters.bhkList.includes(val)
      ? filters.bhkList.filter((b) => b !== val)
      : [...filters.bhkList, val];
    onFilterChange({ ...filters, bhkList: updated });
  };

  const handleTypeToggle = (val: string) => {
    const updated = filters.propertyTypes.includes(val)
      ? filters.propertyTypes.filter((t) => t !== val)
      : [...filters.propertyTypes, val];
    onFilterChange({ ...filters, propertyTypes: updated });
  };

  const handlePossessionToggle = (val: string) => {
    const updated = filters.possessionStatus.includes(val)
      ? filters.possessionStatus.filter((p) => p !== val)
      : [...filters.possessionStatus, val];
    onFilterChange({ ...filters, possessionStatus: updated });
  };

  const handleSellerToggle = (val: string) => {
    const updated = filters.sellerTypes.includes(val)
      ? filters.sellerTypes.filter((s) => s !== val)
      : [...filters.sellerTypes, val];
    onFilterChange({ ...filters, sellerTypes: updated });
  };

  const handleFurnishingToggle = (val: string) => {
    const updated = filters.furnishingStatus.includes(val)
      ? filters.furnishingStatus.filter((f) => f !== val)
      : [...filters.furnishingStatus, val];
    onFilterChange({ ...filters, furnishingStatus: updated });
  };

  const handleAmenityToggle = (val: string) => {
    const updated = filters.amenities.includes(val)
      ? filters.amenities.filter((a) => a !== val)
      : [...filters.amenities, val];
    onFilterChange({ ...filters, amenities: updated });
  };

  return (
    <aside
      className={`w-full bg-white rounded-xl border border-border-default shadow-soft p-4 sm:p-5 space-y-5 text-text-primary ${className}`}
      aria-label="Property search filters"
    >
      {/* Top Header & Clear All */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <h3 className="text-sm font-bold text-primary-navy uppercase tracking-wider">
          Filter Properties
        </h3>
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-bold text-accent-gold-hover hover:text-dark-navy flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Clear All
        </button>
      </div>

      {/* 1. RERA Verified Only Quick Toggle */}
      <div className="p-3 rounded-lg bg-success-green-light/60 border border-success-green-border/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-success-green shrink-0" />
          <span className="text-xs font-bold text-success-green">
            RERA Verified Only
          </span>
        </div>
        <input
          type="checkbox"
          checked={filters.isReraOnly}
          onChange={(e) =>
            onFilterChange({ ...filters, isReraOnly: e.target.checked })
          }
          className="w-4 h-4 text-success-green rounded accent-success-green cursor-pointer"
        />
      </div>

      {/* 2. Budget / Price Section */}
      <div className="border-b border-border-subtle pb-4 space-y-2.5">
        <button
          type="button"
          onClick={() => toggleSection("budget")}
          className="w-full flex items-center justify-between text-xs font-bold text-text-primary hover:text-primary-navy cursor-pointer"
        >
          <span>Budget / Price Range</span>
          {openSections.budget ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>

        {openSections.budget && (
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "any", label: "Any Budget" },
                { id: "under-50l", label: "< ₹50 Lacs" },
                { id: "50l-1cr", label: "₹50L - ₹1 Cr" },
                { id: "1cr-2.5cr", label: "₹1Cr - ₹2.5Cr" },
                { id: "2.5cr-5cr", label: "₹2.5Cr - ₹5Cr" },
                { id: "above-5cr", label: "> ₹5 Cr" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onFilterChange({ ...filters, budgetRange: opt.id })
                  }
                  className={`px-2 py-1.5 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                    filters.budgetRange === opt.id
                      ? "bg-primary-navy text-white border-primary-navy shadow-soft-xs"
                      : "bg-bg-light text-text-secondary border-border-default hover:bg-white hover:border-border-dark"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. BHK Configuration */}
      <div className="border-b border-border-subtle pb-4 space-y-2.5">
        <button
          type="button"
          onClick={() => toggleSection("bhk")}
          className="w-full flex items-center justify-between text-xs font-bold text-text-primary hover:text-primary-navy cursor-pointer"
        >
          <span>BHK Configuration</span>
          {openSections.bhk ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>

        {openSections.bhk && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {["1", "2", "3", "4", "5+"].map((bhk) => {
              const isSelected = filters.bhkList.includes(bhk);
              return (
                <button
                  key={bhk}
                  type="button"
                  onClick={() => handleBhkToggle(bhk)}
                  className={`flex-1 min-w-[50px] py-1.5 rounded text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    isSelected
                      ? "bg-accent-gold text-dark-navy border-accent-gold shadow-soft-xs"
                      : "bg-white text-text-primary border-border-default hover:bg-bg-light"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  {bhk} BHK
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Property Type */}
      <div className="border-b border-border-subtle pb-4 space-y-2.5">
        <button
          type="button"
          onClick={() => toggleSection("propertyType")}
          className="w-full flex items-center justify-between text-xs font-bold text-text-primary hover:text-primary-navy cursor-pointer"
        >
          <span>Property Type</span>
          {openSections.propertyType ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>

        {openSections.propertyType && (
          <div className="space-y-1.5 pt-1">
            {[
              { id: "apartment", label: "Apartment / Flat" },
              { id: "villa", label: "Independent House / Villa" },
              { id: "penthouse", label: "Luxury Penthouse" },
              { id: "plot", label: "Residential Plot" },
              { id: "commercial-office", label: "Commercial Office" },
            ].map((type) => (
              <label
                key={type.id}
                className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={filters.propertyTypes.includes(type.id)}
                  onChange={() => handleTypeToggle(type.id)}
                  className="rounded border-border-default accent-primary-navy cursor-pointer"
                />
                <span>{type.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 5. Possession Status */}
      <div className="border-b border-border-subtle pb-4 space-y-2.5">
        <button
          type="button"
          onClick={() => toggleSection("possession")}
          className="w-full flex items-center justify-between text-xs font-bold text-text-primary hover:text-primary-navy cursor-pointer"
        >
          <span>Possession Status</span>
          {openSections.possession ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>

        {openSections.possession && (
          <div className="space-y-1.5 pt-1">
            {["Ready to Move", "Under Construction"].map((pos) => (
              <label
                key={pos}
                className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={filters.possessionStatus.includes(pos)}
                  onChange={() => handlePossessionToggle(pos)}
                  className="rounded border-border-default accent-primary-navy cursor-pointer"
                />
                <span>{pos}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 6. Listed By (Owner / Agent) */}
      <div className="border-b border-border-subtle pb-4 space-y-2.5">
        <button
          type="button"
          onClick={() => toggleSection("sellerType")}
          className="w-full flex items-center justify-between text-xs font-bold text-text-primary hover:text-primary-navy cursor-pointer"
        >
          <span>Listed By</span>
          {openSections.sellerType ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>

        {openSections.sellerType && (
          <div className="space-y-1.5 pt-1">
            {[
              { id: "owner", label: "Direct Owner (Zero Brokerage)" },
              { id: "agent", label: "Certified Partner / Agent" },
            ].map((seller) => (
              <label
                key={seller.id}
                className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={filters.sellerTypes.includes(seller.id)}
                  onChange={() => handleSellerToggle(seller.id)}
                  className="rounded border-border-default accent-primary-navy cursor-pointer"
                />
                <span>{seller.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 7. Furnishing Status */}
      <div className="border-b border-border-subtle pb-4 space-y-2.5">
        <button
          type="button"
          onClick={() => toggleSection("furnishing")}
          className="w-full flex items-center justify-between text-xs font-bold text-text-primary hover:text-primary-navy cursor-pointer"
        >
          <span>Furnishing</span>
          {openSections.furnishing ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>

        {openSections.furnishing && (
          <div className="space-y-1.5 pt-1">
            {["Furnished", "Semi-Furnished", "Unfurnished"].map((furnish) => (
              <label
                key={furnish}
                className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={filters.furnishingStatus.includes(furnish)}
                  onChange={() => handleFurnishingToggle(furnish)}
                  className="rounded border-border-default accent-primary-navy cursor-pointer"
                />
                <span>{furnish}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 8. Amenities */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => toggleSection("amenities")}
          className="w-full flex items-center justify-between text-xs font-bold text-text-primary hover:text-primary-navy cursor-pointer"
        >
          <span>Amenities</span>
          {openSections.amenities ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>

        {openSections.amenities && (
          <div className="grid grid-cols-1 gap-1.5 pt-1">
            {[
              "Parking",
              "Swimming Pool",
              "Gym",
              "Security",
              "Power Backup",
              "Lift",
              "Clubhouse",
            ].map((amenity) => (
              <label
                key={amenity}
                className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="rounded border-border-default accent-primary-navy cursor-pointer"
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

export default FilterSidebar;

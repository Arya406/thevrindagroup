"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  ShieldCheck,
} from "lucide-react";
import { RentalFilters } from "@/types/rental";

export interface RentFiltersProps {
  filters: RentalFilters;
  onFilterChange: (filters: RentalFilters) => void;
  onClearAll: () => void;
  className?: string;
}

export function RentFilters({
  filters,
  onFilterChange,
  onClearAll,
  className = "",
}: RentFiltersProps) {
  const [openSections, setOpenSections] = useState({
    rent: true,
    bhk: true,
    propertyType: true,
    furnishing: true,
    tenantPref: true,
    availability: false,
    amenities: false,
    ownerType: false,
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

  const handleFurnishingToggle = (val: string) => {
    const updated = filters.furnishingList.includes(val)
      ? filters.furnishingList.filter((f) => f !== val)
      : [...filters.furnishingList, val];
    onFilterChange({ ...filters, furnishingList: updated });
  };

  const handleTenantPrefToggle = (val: string) => {
    const updated = filters.tenantPreferences.includes(val)
      ? filters.tenantPreferences.filter((t) => t !== val)
      : [...filters.tenantPreferences, val];
    onFilterChange({ ...filters, tenantPreferences: updated });
  };

  const handleAvailabilityToggle = (val: string) => {
    const updated = filters.availabilityList.includes(val)
      ? filters.availabilityList.filter((a) => a !== val)
      : [...filters.availabilityList, val];
    onFilterChange({ ...filters, availabilityList: updated });
  };

  const handleAmenityToggle = (val: string) => {
    const updated = filters.amenities.includes(val)
      ? filters.amenities.filter((a) => a !== val)
      : [...filters.amenities, val];
    onFilterChange({ ...filters, amenities: updated });
  };

  const handleSellerToggle = (val: string) => {
    const updated = filters.sellerTypes.includes(val)
      ? filters.sellerTypes.filter((s) => s !== val)
      : [...filters.sellerTypes, val];
    onFilterChange({ ...filters, sellerTypes: updated });
  };

  return (
    <aside
      className={`w-full bg-white rounded-xl border border-border-default shadow-soft p-4 sm:p-5 space-y-5 text-text-primary ${className}`}
      aria-label="Rental property filters"
    >
      {/* Header & Clear All */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <h3 className="text-sm font-bold text-primary-navy uppercase tracking-wider">
          Filter Rentals
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

      {/* 1. Verified Owner / Zero Brokerage Quick Toggle */}
      <div className="p-3 rounded-lg bg-success-green-light/60 border border-success-green-border/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-success-green shrink-0" />
          <span className="text-xs font-bold text-success-green">
            Direct Owner / Zero Brokerage
          </span>
        </div>
        <input
          type="checkbox"
          checked={filters.isOwnerOnly}
          onChange={(e) =>
            onFilterChange({ ...filters, isOwnerOnly: e.target.checked })
          }
          className="w-4 h-4 text-success-green rounded accent-success-green cursor-pointer"
        />
      </div>

      {/* 2. Monthly Rent Range */}
      <div className="border-b border-border-subtle pb-4 space-y-2.5">
        <button
          type="button"
          onClick={() => toggleSection("rent")}
          className="w-full flex items-center justify-between text-xs font-bold text-text-primary hover:text-primary-navy cursor-pointer"
        >
          <span>Monthly Rent Budget</span>
          {openSections.rent ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>

        {openSections.rent && (
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: "any", label: "Any Rent" },
                { id: "under-15k", label: "< ₹15,000" },
                { id: "15k-30k", label: "₹15K - ₹30K" },
                { id: "30k-50k", label: "₹30K - ₹50K" },
                { id: "50k-75k", label: "₹50K - ₹75K" },
                { id: "above-75k", label: "> ₹75,000" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onFilterChange({ ...filters, rentRange: opt.id })
                  }
                  className={`px-2 py-1.5 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                    filters.rentRange === opt.id
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
            {["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"].map(
              (bhk) => {
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
                    {bhk}
                  </button>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* 4. Furnishing Status */}
      <div className="border-b border-border-subtle pb-4 space-y-2.5">
        <button
          type="button"
          onClick={() => toggleSection("furnishing")}
          className="w-full flex items-center justify-between text-xs font-bold text-text-primary hover:text-primary-navy cursor-pointer"
        >
          <span>Furnishing Status</span>
          {openSections.furnishing ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>

        {openSections.furnishing && (
          <div className="space-y-1.5 pt-1">
            {["Fully Furnished", "Semi Furnished", "Unfurnished"].map(
              (furnish) => (
                <label
                  key={furnish}
                  className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={filters.furnishingList.includes(furnish)}
                    onChange={() => handleFurnishingToggle(furnish)}
                    className="rounded border-border-default accent-primary-navy cursor-pointer"
                  />
                  <span>{furnish}</span>
                </label>
              )
            )}
          </div>
        )}
      </div>

      {/* 5. Tenant Preference */}
      <div className="border-b border-border-subtle pb-4 space-y-2.5">
        <button
          type="button"
          onClick={() => toggleSection("tenantPref")}
          className="w-full flex items-center justify-between text-xs font-bold text-text-primary hover:text-primary-navy cursor-pointer"
        >
          <span>Tenant Preference</span>
          {openSections.tenantPref ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>

        {openSections.tenantPref && (
          <div className="space-y-1.5 pt-1">
            {[
              "Family",
              "Working Professional",
              "Bachelor",
              "Student",
            ].map((pref) => (
              <label
                key={pref}
                className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={filters.tenantPreferences.includes(pref)}
                  onChange={() => handleTenantPrefToggle(pref)}
                  className="rounded border-border-default accent-primary-navy cursor-pointer"
                />
                <span>{pref}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 6. Property Type */}
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
              { id: "independent-house", label: "Independent House" },
              { id: "villa", label: "Villa / Bungalow" },
              { id: "studio", label: "Studio Apartment" },
              { id: "pg", label: "PG / Co-living" },
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

      {/* 7. Availability */}
      <div className="border-b border-border-subtle pb-4 space-y-2.5">
        <button
          type="button"
          onClick={() => toggleSection("availability")}
          className="w-full flex items-center justify-between text-xs font-bold text-text-primary hover:text-primary-navy cursor-pointer"
        >
          <span>Availability</span>
          {openSections.availability ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>

        {openSections.availability && (
          <div className="space-y-1.5 pt-1">
            {[
              "Immediately Available",
              "Within 15 Days",
              "Within 30 Days",
            ].map((avail) => (
              <label
                key={avail}
                className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={filters.availabilityList.includes(avail)}
                  onChange={() => handleAvailabilityToggle(avail)}
                  className="rounded border-border-default accent-primary-navy cursor-pointer"
                />
                <span>{avail}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 8. Amenities */}
      <div className="border-b border-border-subtle pb-4 space-y-2.5">
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
              "Gym",
              "Swimming Pool",
              "Security",
              "Power Backup",
              "Lift",
              "Balcony",
              "Club House",
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

      {/* 9. Listed By (Owner / Agent / Developer) */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => toggleSection("ownerType")}
          className="w-full flex items-center justify-between text-xs font-bold text-text-primary hover:text-primary-navy cursor-pointer"
        >
          <span>Owner / Listed By</span>
          {openSections.ownerType ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>

        {openSections.ownerType && (
          <div className="space-y-1.5 pt-1">
            {[
              { id: "owner", label: "Direct Owner" },
              { id: "agent", label: "Certified Partner / Agent" },
              { id: "developer", label: "Builder / Developer" },
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
    </aside>
  );
}

export default RentFilters;

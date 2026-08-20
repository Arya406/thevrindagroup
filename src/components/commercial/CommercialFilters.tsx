"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { CommercialFilters } from "@/types/commercial";

export interface CommercialFiltersProps {
  filters: CommercialFilters;
  onFilterChange: (filters: CommercialFilters) => void;
  onClearAll: () => void;
  className?: string;
}

export function CommercialFiltersView({
  filters,
  onFilterChange,
  onClearAll,
  className = "",
}: CommercialFiltersProps) {
  const [openSections, setOpenSections] = useState({
    transaction: true,
    propertyType: true,
    area: true,
    budget: true,
    furnishing: true,
    status: false,
    floor: false,
    parking: false,
    amenities: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
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

  const handleStatusToggle = (val: string) => {
    const updated = filters.possessionStatus.includes(val)
      ? filters.possessionStatus.filter((s) => s !== val)
      : [...filters.possessionStatus, val];
    onFilterChange({ ...filters, possessionStatus: updated });
  };

  const handleFloorToggle = (val: string) => {
    const updated = filters.floorLevels.includes(val)
      ? filters.floorLevels.filter((fl) => fl !== val)
      : [...filters.floorLevels, val];
    onFilterChange({ ...filters, floorLevels: updated });
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
      aria-label="Commercial property filters"
    >
      {/* Header & Clear All */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <h3 className="text-sm font-bold text-primary-navy uppercase tracking-wider">
          Filter Commercial
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

      {/* 1. RERA Verified Only Toggle */}
      <div className="p-3 rounded-lg bg-success-green-light/60 border border-success-green-border/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-success-green shrink-0" />
          <span className="text-xs font-bold text-success-green">
            RERA Verified Assets Only
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

      {/* 2. Transaction Mode */}
      <div className="border-b border-border-subtle pb-4 space-y-2.5">
        <button
          type="button"
          onClick={() => toggleSection("transaction")}
          className="w-full flex items-center justify-between text-xs font-bold text-text-primary hover:text-primary-navy cursor-pointer"
        >
          <span>Transaction Type</span>
          {openSections.transaction ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>

        {openSections.transaction && (
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {[
              { id: "all", label: "All Modes" },
              { id: "lease", label: "For Lease" },
              { id: "rent", label: "For Rent" },
              { id: "sale", label: "For Sale" },
              { id: "coworking", label: "Co-working" },
            ].map((txn) => (
              <button
                key={txn.id}
                type="button"
                onClick={() =>
                  onFilterChange({ ...filters, transactionType: txn.id })
                }
                className={`px-2 py-1.5 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                  filters.transactionType === txn.id
                    ? "bg-primary-navy text-white border-primary-navy shadow-soft-xs"
                    : "bg-bg-light text-text-secondary border-border-default hover:bg-white"
                }`}
              >
                {txn.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Property Type */}
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
              { id: "office", label: "Office Space" },
              { id: "shop", label: "Shop" },
              { id: "showroom", label: "Showroom" },
              { id: "warehouse", label: "Warehouse / Logistics" },
              { id: "industrial", label: "Industrial Building" },
              { id: "coworking", label: "Co-working Space" },
              { id: "plot", label: "Commercial Plot" },
              { id: "retail", label: "Retail Space" },
              { id: "restaurant", label: "Restaurant / F&B Space" },
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

      {/* 4. Area Range */}
      <div className="border-b border-border-subtle pb-4 space-y-2.5">
        <button
          type="button"
          onClick={() => toggleSection("area")}
          className="w-full flex items-center justify-between text-xs font-bold text-text-primary hover:text-primary-navy cursor-pointer"
        >
          <span>Carpet Area Range</span>
          {openSections.area ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>

        {openSections.area && (
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {[
              { id: "any", label: "Any Area" },
              { id: "under-1000", label: "< 1,000 sq.ft" },
              { id: "1000-3000", label: "1K - 3K sq.ft" },
              { id: "3000-7000", label: "3K - 7K sq.ft" },
              { id: "7000-15000", label: "7K - 15K sq.ft" },
              { id: "above-15000", label: "15,000+ sq.ft" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  onFilterChange({ ...filters, areaRange: opt.id })
                }
                className={`px-2 py-1.5 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                  filters.areaRange === opt.id
                    ? "bg-primary-navy text-white border-primary-navy shadow-soft-xs"
                    : "bg-bg-light text-text-secondary border-border-default hover:bg-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 5. Furnishing Status */}
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
            {[
              "Fully Furnished",
              "Semi Furnished",
              "Warm Shell",
              "Bare Shell",
              "Unfurnished",
            ].map((furnish) => (
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
            ))}
          </div>
        )}
      </div>

      {/* 6. Possession Status */}
      <div className="border-b border-border-subtle pb-4 space-y-2.5">
        <button
          type="button"
          onClick={() => toggleSection("status")}
          className="w-full flex items-center justify-between text-xs font-bold text-text-primary hover:text-primary-navy cursor-pointer"
        >
          <span>Possession Status</span>
          {openSections.status ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>

        {openSections.status && (
          <div className="space-y-1.5 pt-1">
            {["Ready to Move", "Under Construction", "Immediate"].map(
              (status) => (
                <label
                  key={status}
                  className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={filters.possessionStatus.includes(status)}
                    onChange={() => handleStatusToggle(status)}
                    className="rounded border-border-default accent-primary-navy cursor-pointer"
                  />
                  <span>{status}</span>
                </label>
              )
            )}
          </div>
        )}
      </div>

      {/* 7. Floor Level */}
      <div className="border-b border-border-subtle pb-4 space-y-2.5">
        <button
          type="button"
          onClick={() => toggleSection("floor")}
          className="w-full flex items-center justify-between text-xs font-bold text-text-primary hover:text-primary-navy cursor-pointer"
        >
          <span>Floor Level</span>
          {openSections.floor ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>

        {openSections.floor && (
          <div className="space-y-1.5 pt-1">
            {["Ground Floor", "Lower Ground", "1st–5th", "6th–10th", "11+"].map(
              (fl) => (
                <label
                  key={fl}
                  className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={filters.floorLevels.includes(fl)}
                    onChange={() => handleFloorToggle(fl)}
                    className="rounded border-border-default accent-primary-navy cursor-pointer"
                  />
                  <span>{fl}</span>
                </label>
              )
            )}
          </div>
        )}
      </div>

      {/* 8. Corporate Amenities */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => toggleSection("amenities")}
          className="w-full flex items-center justify-between text-xs font-bold text-text-primary hover:text-primary-navy cursor-pointer"
        >
          <span>Enterprise Amenities</span>
          {openSections.amenities ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>

        {openSections.amenities && (
          <div className="grid grid-cols-1 gap-1.5 pt-1">
            {[
              "100% Power Backup",
              "Central Air Conditioning",
              "High-speed Passenger Lifts",
              "24x7 Multi-tier Security",
              "CCTV Surveillance",
              "Grand Reception Lobby",
              "Cafeteria & Food Court",
              "Visitor Car Parking",
              "Fire Safety & Sprinklers",
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

export default CommercialFiltersView;

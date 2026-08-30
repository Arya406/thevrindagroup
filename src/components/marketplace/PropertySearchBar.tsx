"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  MapPin,
  Building,
  IndianRupee,
  ChevronDown,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui";
import {
  getAllStates,
  getDistrictsByState,
} from "@/data/location/canonicalLocations";

export interface PropertySearchBarProps {
  listingType?: string;
  selectedState: string;
  onStateChange: (state: string) => void;
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  location?: string;
  onLocationChange?: (loc: string) => void;
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

interface SearchLocationSelectProps {
  id: string;
  placeholder: string;
  searchPlaceholder: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  disabledPlaceholder?: string;
  allOptionLabel?: string;
}

function SearchLocationSelect({
  id,
  placeholder,
  searchPlaceholder,
  options,
  value,
  onChange,
  disabled = false,
  disabledPlaceholder = "Select State First",
  allOptionLabel = "All",
}: SearchLocationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, searchQuery]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            setSearchQuery("");
          }
        }}
        className={`w-full h-10 pl-8 pr-7 text-left flex items-center justify-between rounded-lg border text-xs font-medium transition-all shadow-soft-xs ${
          disabled
            ? "bg-bg-light/60 border-border-subtle text-text-muted cursor-not-allowed"
            : isOpen
            ? "bg-white border-accent-gold ring-2 ring-accent-gold/20 text-text-primary"
            : "bg-white border-border-default hover:border-accent-gold/60 text-text-primary"
        }`}
      >
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-accent-gold pointer-events-none">
          <MapPin className="h-3.5 w-3.5" />
        </span>
        <span className={value ? "text-text-primary font-semibold truncate" : "text-text-muted truncate"}>
          {disabled ? disabledPlaceholder : value || placeholder}
        </span>
        <ChevronDown
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted transition-transform duration-200 ${
            isOpen ? "rotate-180 text-accent-gold" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-xl border border-border-default shadow-soft-xl py-1.5 min-w-[180px] max-h-60 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 pb-1.5 border-b border-border-subtle">
            <div className="relative flex items-center">
              <Search className="absolute left-2 w-3 h-3 text-text-muted pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-7 pl-6 pr-6 text-xs bg-bg-light rounded-md border border-border-default focus:border-accent-gold focus:outline-none text-text-primary placeholder:text-text-muted"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1.5 text-text-muted hover:text-text-primary"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto pt-1">
            {allOptionLabel && (
              <button
                type="button"
                onClick={() => handleSelect("")}
                className={`w-full px-3 py-1.5 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                  !value
                    ? "bg-accent-gold/10 text-primary-navy font-bold"
                    : "text-text-secondary hover:bg-bg-light"
                }`}
              >
                <span>{allOptionLabel}</span>
                {!value && <Check className="w-3 h-3 text-accent-gold shrink-0" />}
              </button>
            )}

            {filteredOptions.length === 0 ? (
              <div className="py-2.5 px-3 text-center text-xs text-text-muted">
                No matching location
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = value === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-accent-gold/10 text-primary-navy font-bold"
                        : "text-text-primary hover:bg-bg-light"
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && <Check className="w-3 h-3 text-accent-gold shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PropertySearchBar({
  listingType = "buy",
  selectedState,
  onStateChange,
  selectedDistrict,
  onDistrictChange,
  propertyType,
  onPropertyTypeChange,
  budget,
  onBudgetChange,
  bhk,
  onBhkChange,
  onSearchSubmit,
  className = "",
}: PropertySearchBarProps) {
  const budgetOptions =
    listingType === "rent" ? BUDGET_OPTIONS_RENT : BUDGET_OPTIONS_BUY;

  const stateOptions = useMemo(
    () => [...getAllStates()].sort((a, b) => a.localeCompare(b)),
    []
  );

  const districtOptions = useMemo(() => {
    if (!selectedState) return [];
    return [...getDistrictsByState(selectedState)].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [selectedState]);

  return (
    <div
      className={`rounded-2xl border border-border-default bg-white p-3.5 sm:p-4 shadow-soft ${className}`}
    >
      {/* Main Search Controls Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearchSubmit();
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center"
      >
        {/* 1. State Selector */}
        <div className="sm:col-span-1 lg:col-span-2.5">
          <SearchLocationSelect
            id="buy-search-state"
            placeholder="Select State"
            searchPlaceholder="Search State / UT..."
            allOptionLabel="All States"
            options={stateOptions}
            value={selectedState}
            onChange={(st) => {
              onStateChange(st);
              onDistrictChange(""); // State change immediately clears district
            }}
          />
        </div>

        {/* 2. District Selector (State Dependent) */}
        <div className="sm:col-span-1 lg:col-span-2.5">
          <SearchLocationSelect
            id="buy-search-district"
            placeholder="Select District"
            searchPlaceholder="Search District..."
            disabledPlaceholder="Select State First"
            allOptionLabel="All Districts"
            options={districtOptions}
            value={selectedDistrict}
            onChange={onDistrictChange}
            disabled={!selectedState}
          />
        </div>

        {/* 3. Property Type */}
        <div className="sm:col-span-1 lg:col-span-2.5 relative">
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

        {/* 4. Budget */}
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

        {/* 5. BHK */}
        <div className="sm:col-span-1 lg:col-span-1 relative">
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

        {/* 6. Search Button */}
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

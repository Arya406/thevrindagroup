// ==============================================================================
// TheVrindaGroup - Hero Floating Search Card Component
// Compact, high-efficiency tabbed search (Buy, Rent, Commercial)
// Enhanced with Canonical State / District Autocomplete (Phase 6)
// ==============================================================================

"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Building,
  IndianRupee,
  BedDouble,
  ChevronDown,
  X,
} from "lucide-react";
import { ListingType } from "@/types/property";
import {
  searchLocations,
  LocationSearchResult,
} from "@/data/location/canonicalLocations";

const emptySubscribe = () => () => {};

export interface HeroSearchCardProps {
  onSearchSubmit?: (filters: {
    listingType: ListingType;
    location: string;
    propertyType: string;
    budget: string;
    bhk: string;
    state?: string;
    district?: string;
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
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [activeTab, setActiveTab] = useState<ListingType>("buy");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationSearchResult | null>(null);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [propertyType, setPropertyType] = useState("all");
  const [budget, setBudget] = useState("any");
  const [bhk, setBhk] = useState("any");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const budgetOptions = activeTab === "rent" ? BUDGET_OPTIONS_RENT : BUDGET_OPTIONS_BUY;
  const propertyTypeOptions =
    activeTab === "commercial" ? COMMERCIAL_PROPERTY_TYPES : RESIDENTIAL_PROPERTY_TYPES;

  const suggestions = useMemo(() => {
    if (!locationQuery || !locationQuery.trim()) return [];
    return searchLocations(locationQuery, 6);
  }, [locationQuery]);

  const updateDropdownPosition = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();

    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      setIsSuggestionsOpen(false);
      return;
    }

    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedHeight = 240;
    const showAbove = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

    const top = showAbove
      ? Math.max(8, rect.top - estimatedHeight - 6)
      : rect.bottom + 6;

    setDropdownStyle({
      position: "fixed",
      top: `${top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      maxHeight: showAbove
        ? `${Math.min(240, rect.top - 16)}px`
        : `${Math.min(240, spaceBelow - 16)}px`,
      zIndex: 100,
    });
  }, []);

  useEffect(() => {
    if (!isSuggestionsOpen || suggestions.length === 0) return;

    updateDropdownPosition();

    const handlePositionSync = () => {
      updateDropdownPosition();
    };

    window.addEventListener("resize", handlePositionSync);
    window.addEventListener("scroll", handlePositionSync, { passive: true, capture: true });

    return () => {
      window.removeEventListener("resize", handlePositionSync);
      window.removeEventListener("scroll", handlePositionSync, { capture: true });
    };
  }, [isSuggestionsOpen, suggestions.length, updateDropdownPosition]);

  useEffect(() => {
    if (!isSuggestionsOpen) return;

    const handlePointerDown = (event: PointerEvent | MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const isInsideInput = inputRef.current && inputRef.current.contains(target);
      const isInsideDropdown = dropdownRef.current && dropdownRef.current.contains(target);

      if (!isInsideInput && !isInsideDropdown) {
        setIsSuggestionsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isSuggestionsOpen]);

  const handleSelectLocation = (loc: LocationSearchResult) => {
    setSelectedLocation(loc);
    setLocationQuery(loc.label);
    setIsSuggestionsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocationQuery(val);
    setSelectedLocation(null);
    setHighlightedIndex(-1);
    setIsSuggestionsOpen(val.trim().length > 0);
  };

  const handleClearLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocationQuery("");
    setSelectedLocation(null);
    setIsSuggestionsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSuggestionsOpen || suggestions.length === 0) {
      if (e.key === "ArrowDown" && locationQuery.trim().length > 0) {
        setIsSuggestionsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectLocation(suggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsSuggestionsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleCitySelect = (city: string) => {
    const matched = searchLocations(city, 5);
    const exact = matched.find(
      (m) =>
        m.label.toLowerCase() === city.toLowerCase() ||
        m.state.toLowerCase() === city.toLowerCase() ||
        m.district?.toLowerCase() === city.toLowerCase()
    );

    if (exact) {
      setSelectedLocation(exact);
      setLocationQuery(exact.label);
    } else {
      setSelectedLocation(null);
      setLocationQuery(city);
    }
    setIsSuggestionsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleTabChange = (tab: ListingType) => {
    setActiveTab(tab);
    setPropertyType("all");
    setBudget("any");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuggestionsOpen(false);

    if (onSearchSubmit) {
      onSearchSubmit({
        listingType: activeTab,
        location: locationQuery,
        propertyType,
        budget,
        bhk,
        ...(selectedLocation?.state ? { state: selectedLocation.state } : {}),
        ...(selectedLocation?.district ? { district: selectedLocation.district } : {}),
      });
      return;
    }

    const params = new URLSearchParams();

    if (selectedLocation) {
      if (selectedLocation.state) {
        params.set("state", selectedLocation.state);
      }
      if (selectedLocation.district) {
        params.set("district", selectedLocation.district);
      }
    } else if (locationQuery.trim()) {
      params.set("search", locationQuery.trim());
    }

    if (propertyType !== "all") {
      params.set("type", propertyType);
      params.set("propertyType", propertyType);
    }
    if (bhk !== "any") params.set("bhk", bhk);
    if (budget !== "any") params.set("budget", budget);

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

      <form onSubmit={handleSearch} className="space-y-2 sm:space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
          <div className="space-y-1 relative">
            <label
              htmlFor="home-location-input"
              className="block text-[10px] sm:text-[11px] font-bold text-text-secondary uppercase tracking-wider"
            >
              Location / City / Landmark
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-accent-gold pointer-events-none" />
              <input
                id="home-location-input"
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={isSuggestionsOpen && suggestions.length > 0}
                aria-haspopup="listbox"
                aria-controls="home-location-suggestions"
                value={locationQuery}
                onChange={handleLocationChange}
                onFocus={() => {
                  if (locationQuery.trim().length > 0 && suggestions.length > 0) {
                    setIsSuggestionsOpen(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="City, district or state..."
                autoComplete="off"
                className="w-full rounded-lg border border-border-default bg-bg-light/60 hover:bg-white pl-9 pr-8 py-1.5 sm:py-2 text-xs font-medium text-text-primary placeholder:text-text-muted focus:border-dark-navy focus:bg-white focus:outline-none focus:ring-1 focus:ring-dark-navy transition-all"
              />
              {locationQuery.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-dark-navy transition-colors p-0.5 rounded-full hover:bg-bg-light"
                  aria-label="Clear location"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] sm:text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Property Type
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-accent-gold pointer-events-none" />
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

          <div className="space-y-1">
            <label className="block text-[10px] sm:text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Budget Range
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-accent-gold pointer-events-none" />
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

          {activeTab !== "commercial" ? (
            <div className="space-y-1">
              <label className="block text-[10px] sm:text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                BHK Configuration
              </label>
              <div className="relative">
                <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-accent-gold pointer-events-none" />
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

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-border-default/60">
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            <span className="text-[10px] sm:text-[11px] font-semibold text-text-secondary mr-0.5">Popular:</span>
            {POPULAR_CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleCitySelect(c)}
                className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
                  locationQuery.toLowerCase() === c.toLowerCase() ||
                  (selectedLocation?.district?.toLowerCase() === c.toLowerCase()) ||
                  (selectedLocation?.state?.toLowerCase() === c.toLowerCase())
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

      {isMounted &&
        isSuggestionsOpen &&
        suggestions.length > 0 &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            role="listbox"
            id="home-location-suggestions"
            style={dropdownStyle}
            className="rounded-xl bg-white border border-border-default shadow-soft-2xl overflow-hidden py-1 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
          >
            {suggestions.map((item, index) => {
              const isHighlighted = highlightedIndex === index;
              const isState = item.type === "STATE";

              return (
                <button
                  key={`${item.state}-${item.district || "state"}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isHighlighted}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleSelectLocation(item);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectLocation(item);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer border-b last:border-b-0 border-border-subtle/40 ${
                    isHighlighted
                      ? "bg-bg-light text-dark-navy"
                      : "hover:bg-bg-light/60 text-text-primary"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isHighlighted ? "text-dark-navy" : "text-accent-gold"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1.5 truncate">
                        <span className="text-xs font-semibold text-dark-navy">
                          {isState ? item.state : item.district}
                        </span>
                        {!isState && (
                          <span className="text-[11px] text-text-secondary">
                            {item.state}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-text-muted">
                        {isState ? "State / Union Territory" : `District · ${item.state}`}
                      </p>
                    </div>
                  </div>

                  <span className="text-[9px] font-medium text-text-muted uppercase tracking-wider shrink-0">
                    {isState ? "State" : "District"}
                  </span>
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}

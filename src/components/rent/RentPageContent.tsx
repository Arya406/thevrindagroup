"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Container, Button } from "@/components/ui";
import { RentDiscovery } from "@/components/rent/RentDiscovery";
import { RentSearchBar } from "@/components/rent/RentSearchBar";
import { RentFilters } from "@/components/rent/RentFilters";
import { MobileRentFilterModal } from "@/components/rent/MobileRentFilterModal";
import { ActiveFilters, ActiveFilterItem } from "@/components/marketplace/ActiveFilters";
import { RentPropertyCard } from "@/components/rent/RentPropertyCard";
import { RentPropertyListCard } from "@/components/rent/RentPropertyListCard";
import { SortDropdown, SortOption } from "@/components/marketplace/SortDropdown";
import { EmptyResults } from "@/components/marketplace/EmptyResults";
import { PropertySkeleton } from "@/components/marketplace/PropertySkeleton";
import { RentalFilters, RentalProperty } from "@/types/rental";
import { PropertyApiService, mapPropertyToRentalProperty } from "@/lib/services/property-api";
import { isValidStateDistrict } from "@/data/location/canonicalLocations";

const INITIAL_RENTAL_FILTERS: RentalFilters = {
  city: "All",
  locality: "",
  rentRange: "any",
  bhkList: [],
  propertyTypes: [],
  furnishingList: [],
  tenantPreferences: [],
  availabilityList: [],
  amenities: [],
  sellerTypes: [],
  isReraOnly: false,
  isOwnerOnly: false,
};

const ITEMS_PER_PAGE = 9;

export function RentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read URL query params
  const stateParam = searchParams.get("state") || "";
  const districtParam = searchParams.get("district") || "";
  const cityParam = searchParams.get("city") || "";
  const searchParam = searchParams.get("search") || "";
  const bhkParam = searchParams.get("bhk") || "any";
  const propertyTypeParam = searchParams.get("propertyType") || "all";
  const rentBudgetParam = searchParams.get("rentBudget") || "any";
  const furnishingParam = searchParams.get("furnishing") || "all";
  const sortParam = (searchParams.get("sort") as SortOption) || "recommended";

  // Validate state/district combination on load
  const isDistrictValid =
    stateParam && districtParam
      ? isValidStateDistrict(stateParam, districtParam)
      : true;
  const initialDistrict = isDistrictValid ? districtParam : "";

  // Search Bar Local State
  const [selectedState, setSelectedState] = useState(stateParam);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [locationQuery, setLocationQuery] = useState(searchParam || (cityParam && !stateParam ? cityParam : ""));
  const [propertyType, setPropertyType] = useState(propertyTypeParam);
  const [rentBudget, setRentBudget] = useState(rentBudgetParam);
  const [bhk, setBhk] = useState(bhkParam);
  const [furnishing, setFurnishing] = useState(furnishingParam);

  // Advanced Filters State
  const [filters, setFilters] = useState<RentalFilters>(() => ({
    ...INITIAL_RENTAL_FILTERS,
    city: cityParam || "All",
    bhkList: bhkParam !== "any" ? [bhkParam] : [],
    propertyTypes: propertyTypeParam !== "all" ? [propertyTypeParam] : [],
    furnishingList: furnishingParam !== "all" ? [furnishingParam] : [],
    rentRange: rentBudgetParam,
  }));

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState<SortOption>(sortParam);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Backend Live State
  const [rentals, setRentals] = useState<RentalProperty[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Sync state to URL params cleanly
  const syncToUrl = useCallback(
    (updatedParams: {
      state?: string;
      district?: string;
      city?: string;
      search?: string;
      bhk?: string;
      propertyType?: string;
      rentBudget?: string;
      furnishing?: string;
      sort?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updatedParams.state !== undefined) {
        if (updatedParams.state) {
          params.set("state", updatedParams.state);
          params.delete("city"); // Canonical state takes precedence over legacy city
        } else {
          params.delete("state");
        }
      }
      if (updatedParams.district !== undefined) {
        if (updatedParams.district) {
          params.set("district", updatedParams.district);
          params.delete("city"); // Canonical district takes precedence over legacy city
        } else {
          params.delete("district");
        }
      }
      if (updatedParams.city !== undefined) {
        if (updatedParams.city && !params.has("state") && !params.has("district")) {
          params.set("city", updatedParams.city);
        } else {
          params.delete("city");
        }
      }
      if (updatedParams.search !== undefined) {
        if (updatedParams.search) params.set("search", updatedParams.search);
        else params.delete("search");
      }
      if (updatedParams.bhk !== undefined) {
        if (updatedParams.bhk && updatedParams.bhk !== "any")
          params.set("bhk", updatedParams.bhk);
        else params.delete("bhk");
      }
      if (updatedParams.propertyType !== undefined) {
        if (updatedParams.propertyType && updatedParams.propertyType !== "all")
          params.set("propertyType", updatedParams.propertyType);
        else params.delete("propertyType");
      }
      if (updatedParams.rentBudget !== undefined) {
        if (updatedParams.rentBudget && updatedParams.rentBudget !== "any")
          params.set("rentBudget", updatedParams.rentBudget);
        else params.delete("rentBudget");
      }
      if (updatedParams.furnishing !== undefined) {
        if (updatedParams.furnishing && updatedParams.furnishing !== "all")
          params.set("furnishing", updatedParams.furnishing);
        else params.delete("furnishing");
      }
      if (updatedParams.sort !== undefined) {
        if (updatedParams.sort && updatedParams.sort !== "recommended")
          params.set("sort", updatedParams.sort);
        else params.delete("sort");
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  useEffect(() => {
    let isMounted = true;

    const effectiveBudget =
      filters.rentRange !== "any" ? filters.rentRange : rentBudget;
    const effectiveBhk =
      filters.bhkList.length > 0 ? filters.bhkList[0] : bhk;
    const effectivePropertyType =
      filters.propertyTypes.length > 0 ? filters.propertyTypes[0] : propertyType;
    const effectiveFurnishing =
      filters.furnishingList.length > 0 ? filters.furnishingList[0] : furnishing;

    const isDistValid =
      selectedState && selectedDistrict
        ? isValidStateDistrict(selectedState, selectedDistrict)
        : true;
    const activeDistrict = isDistValid ? selectedDistrict : undefined;

    PropertyApiService.getProperties({
      listingType: "RENT",
      state: selectedState || undefined,
      district: activeDistrict || undefined,
      city: !selectedState && !selectedDistrict && filters.city !== "All" ? filters.city : undefined,
      search: locationQuery.trim() || undefined,
      budget: effectiveBudget !== "any" ? effectiveBudget : undefined,
      bhk: effectiveBhk !== "any" ? effectiveBhk : undefined,
      propertyType: effectivePropertyType !== "all" ? effectivePropertyType : undefined,
      furnishingStatus: effectiveFurnishing !== "all" ? effectiveFurnishing : undefined,
      sort:
        sortOption === "price-asc"
          ? "PRICE_LOW_TO_HIGH"
          : sortOption === "price-desc"
          ? "PRICE_HIGH_TO_LOW"
          : "NEWEST",
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    })
      .then((res) => {
        if (isMounted) {
          const mapped = (res.properties || []).map(mapPropertyToRentalProperty);
          setRentals(mapped);
          setTotalCount(res.pagination.total);
          setTotalPages(res.pagination.totalPages);
          setFetchError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg =
            err instanceof Error ? err.message : "Failed to load rental properties from server.";
          setFetchError(msg);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    selectedState,
    selectedDistrict,
    locationQuery,
    propertyType,
    rentBudget,
    bhk,
    furnishing,
    filters,
    sortOption,
    currentPage,
  ]);

  const handleRetry = () => {
    setIsLoading(true);
    setFetchError(null);

    const effectiveBudget =
      filters.rentRange !== "any" ? filters.rentRange : rentBudget;
    const effectiveBhk =
      filters.bhkList.length > 0 ? filters.bhkList[0] : bhk;
    const effectivePropertyType =
      filters.propertyTypes.length > 0 ? filters.propertyTypes[0] : propertyType;
    const effectiveFurnishing =
      filters.furnishingList.length > 0 ? filters.furnishingList[0] : furnishing;

    PropertyApiService.getProperties({
      listingType: "RENT",
      state: selectedState || undefined,
      district: selectedDistrict || undefined,
      search: locationQuery.trim() || undefined,
      city: !selectedState && !selectedDistrict && filters.city !== "All" ? filters.city : undefined,
      budget: effectiveBudget !== "any" ? effectiveBudget : undefined,
      bhk: effectiveBhk !== "any" ? effectiveBhk : undefined,
      propertyType: effectivePropertyType !== "all" ? effectivePropertyType : undefined,
      furnishingStatus: effectiveFurnishing !== "all" ? effectiveFurnishing : undefined,
      sort:
        sortOption === "price-asc"
          ? "PRICE_LOW_TO_HIGH"
          : sortOption === "price-desc"
          ? "PRICE_HIGH_TO_LOW"
          : "NEWEST",
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    })
      .then((res) => {
        const mapped = (res.properties || []).map(mapPropertyToRentalProperty);
        setRentals(mapped);
        setTotalCount(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Failed to load rental properties from server.";
        setFetchError(msg);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleCitySelect = (cityName: string) => {
    setLocationQuery(cityName);
    setSelectedState("");
    setSelectedDistrict("");
    setFilters((prev) => ({ ...prev, city: cityName }));
    syncToUrl({ city: cityName, state: "", district: "" });
    const listingsSection = document.getElementById("rental-results");
    if (listingsSection) {
      listingsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Construct Active Filter Chips
  const activeFilterList: ActiveFilterItem[] = useMemo(() => {
    const list: ActiveFilterItem[] = [];

    // Canonical location chips
    if (selectedState && selectedDistrict) {
      list.push({
        id: "loc-state-district",
        label: `Location: ${selectedDistrict}, ${selectedState}`,
        category: "location",
        onRemove: () => {
          setSelectedState("");
          setSelectedDistrict("");
          syncToUrl({ state: "", district: "", city: "" });
        },
      });
    } else if (selectedState) {
      list.push({
        id: "loc-state",
        label: `Location: ${selectedState}`,
        category: "location",
        onRemove: () => {
          setSelectedState("");
          setSelectedDistrict("");
          syncToUrl({ state: "", district: "", city: "" });
        },
      });
    } else if (locationQuery) {
      list.push({
        id: "loc-query",
        label: `Search: ${locationQuery}`,
        category: "location",
        onRemove: () => {
          setLocationQuery("");
          syncToUrl({ city: "", search: "" });
        },
      });
    }

    if (bhk !== "any") {
      list.push({
        id: "bhk-bar",
        label: bhk,
        category: "bhk",
        onRemove: () => {
          setBhk("any");
          syncToUrl({ bhk: "any" });
        },
      });
    }

    filters.bhkList.forEach((b) => {
      list.push({
        id: `bhk-${b}`,
        label: b,
        category: "bhk",
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            bhkList: prev.bhkList.filter((x) => x !== b),
          })),
      });
    });

    if (furnishing !== "all") {
      list.push({
        id: "furnish-bar",
        label: furnishing,
        category: "furnishing",
        onRemove: () => {
          setFurnishing("all");
          syncToUrl({ furnishing: "all" });
        },
      });
    }

    filters.furnishingList.forEach((f) => {
      list.push({
        id: `furn-${f}`,
        label: f,
        category: "furnishing",
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            furnishingList: prev.furnishingList.filter((x) => x !== f),
          })),
      });
    });

    if (filters.rentRange !== "any") {
      list.push({
        id: "rent-range",
        label: `Rent: ${filters.rentRange}`,
        category: "rentRange",
        onRemove: () => {
          setFilters((prev) => ({ ...prev, rentRange: "any" }));
          syncToUrl({ rentBudget: "any" });
        },
      });
    }

    if (filters.isOwnerOnly) {
      list.push({
        id: "owner-only",
        label: "Direct Owner Only",
        category: "owner",
        onRemove: () =>
          setFilters((prev) => ({ ...prev, isOwnerOnly: false })),
      });
    }

    filters.tenantPreferences.forEach((tp) => {
      list.push({
        id: `tp-${tp}`,
        label: `Tenant: ${tp}`,
        category: "tenant",
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            tenantPreferences: prev.tenantPreferences.filter((x) => x !== tp),
          })),
      });
    });

    return list;
  }, [selectedState, selectedDistrict, locationQuery, bhk, furnishing, filters, syncToUrl]);

  const handleClearAll = () => {
    setSelectedState("");
    setSelectedDistrict("");
    setLocationQuery("");
    setPropertyType("all");
    setRentBudget("any");
    setBhk("any");
    setFurnishing("all");
    setFilters(INITIAL_RENTAL_FILTERS);
    setCurrentPage(1);
    router.replace(pathname, { scroll: false });
  };

  const handleSearchSubmit = () => {
    setCurrentPage(1);
    syncToUrl({
      state: selectedState,
      district: selectedDistrict,
      search: locationQuery,
      bhk,
      propertyType,
      rentBudget,
      furnishing,
    });
  };

  return (
    <div className="py-6 sm:py-8 bg-bg-light min-h-screen font-sans text-text-primary">
      <Container className="space-y-6">
        {/* Breadcrumbs */}
        <nav
          className="flex items-center gap-2 text-xs text-text-secondary"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-primary-navy transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-primary-navy">
            Properties For Rent
          </span>
          {selectedState && (
            <>
              <span>/</span>
              <span className="text-text-muted">
                {selectedDistrict ? `${selectedDistrict}, ${selectedState}` : selectedState}
              </span>
            </>
          )}
          {!selectedState && locationQuery && (
            <>
              <span>/</span>
              <span className="text-text-muted">{locationQuery}</span>
            </>
          )}
        </nav>

        {/* 1. Top City Rental Discovery Section */}
        <RentDiscovery
          onSelectCity={handleCitySelect}
          selectedCity={locationQuery}
        />

        {/* 2. Top Rent Search Bar */}
        <div id="rental-results">
          <RentSearchBar
            selectedState={selectedState}
            onStateChange={(st) => {
              setSelectedState(st);
              setSelectedDistrict("");
              syncToUrl({ state: st, district: "" });
              setCurrentPage(1);
            }}
            selectedDistrict={selectedDistrict}
            onDistrictChange={(dist) => {
              setSelectedDistrict(dist);
              syncToUrl({ district: dist });
              setCurrentPage(1);
            }}
            propertyType={propertyType}
            onPropertyTypeChange={(p) => {
              setPropertyType(p);
              syncToUrl({ propertyType: p });
            }}
            rentBudget={rentBudget}
            onRentBudgetChange={(b) => {
              setRentBudget(b);
              syncToUrl({ rentBudget: b });
            }}
            bhk={bhk}
            onBhkChange={(b) => {
              setBhk(b);
              syncToUrl({ bhk: b });
            }}
            furnishing={furnishing}
            onFurnishingChange={(f) => {
              setFurnishing(f);
              syncToUrl({ furnishing: f });
            }}
            onSearchSubmit={handleSearchSubmit}
          />
        </div>

        {/* Error Banner */}
        {fetchError && (
          <div className="rounded-xl bg-error-red-light/80 border border-error-red/30 p-4 text-xs text-error-red flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{fetchError}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-xs h-8"
            >
              Retry
            </Button>
          </div>
        )}

        {/* 3. Main Content: Filter Sidebar + Rental Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Desktop Sticky Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24">
            <RentFilters
              filters={filters}
              onFilterChange={(f) => {
                setFilters(f);
                setCurrentPage(1);
              }}
              onClearAll={handleClearAll}
            />
          </div>

          {/* RIGHT: Results Area (9 cols) */}
          <div className="lg:col-span-9 space-y-4">
            {/* Header: Title, Count, Sort, View Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-border-default shadow-soft-xs">
              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-navy text-white text-xs font-bold shadow-soft-xs cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                {activeFilterList.length > 0 && (
                  <span className="ml-1 rounded-full bg-accent-gold text-dark-navy px-1.5 py-0.2 text-[10px] font-bold">
                    {activeFilterList.length}
                  </span>
                )}
              </button>

              {/* Title & Count */}
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-lg font-bold text-primary-navy">
                  {locationQuery
                    ? `Properties for Rent in ${locationQuery}`
                    : "Properties for Rent in India"}
                </h1>
                <p className="text-xs text-text-secondary">
                  Showing{" "}
                  <strong className="text-primary-navy font-bold">
                    {totalCount}
                  </strong>{" "}
                  Properties for Rent
                </p>
              </div>

              {/* Sort & View Switcher */}
              <div className="flex items-center gap-3 ml-auto">
                <SortDropdown
                  value={sortOption}
                  onChange={(s) => {
                    setSortOption(s);
                    syncToUrl({ sort: s });
                  }}
                />

                {/* Grid / List View Toggle */}
                <div className="hidden sm:flex items-center border border-border-default rounded-lg p-0.5 bg-bg-light">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-white text-primary-navy shadow-soft-xs"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                    aria-label="Grid View"
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      viewMode === "list"
                        ? "bg-white text-primary-navy shadow-soft-xs"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                    aria-label="List View"
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Chips */}
            <ActiveFilters
              filters={activeFilterList}
              totalCount={totalCount}
              onClearAll={handleClearAll}
            />

            {/* Results Grid / List */}
            {isLoading ? (
              <PropertySkeleton viewMode={viewMode} count={ITEMS_PER_PAGE} />
            ) : rentals.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
                    {rentals.map((rental) => (
                      <RentPropertyCard key={rental.id} property={rental} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rentals.map((rental) => (
                      <RentPropertyListCard key={rental.id} property={rental} />
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border-default pt-6 text-xs">
                    <p className="text-text-secondary">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                      {Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        totalCount
                      )}{" "}
                      of {totalCount} Rentals
                    </p>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="px-2.5 py-1.5 rounded-lg border border-border-default bg-white font-semibold text-text-primary hover:bg-bg-light disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Previous
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                              currentPage === page
                                ? "bg-primary-navy text-white"
                                : "border border-border-default bg-white text-text-primary hover:bg-bg-light"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-border-default bg-white font-semibold text-text-primary hover:bg-bg-light disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyResults onClearFilters={handleClearAll} />
            )}
          </div>
        </div>
      </Container>

      {/* Mobile Filters Modal */}
      <MobileRentFilterModal
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        filters={filters}
        onFilterChange={(f) => {
          setFilters(f);
          setCurrentPage(1);
        }}
        onClearAll={handleClearAll}
        matchingCount={totalCount}
      />
    </div>
  );
}

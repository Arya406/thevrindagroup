"use client";

import React, { useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Container } from "@/components/ui";
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
import { MOCK_RENTALS } from "@/data/mockRentals";
import { MOCK_PROPERTIES } from "@/data/mockProperties";
import { RentalFilters, TenantPreference } from "@/types/rental";

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

const ITEMS_PER_PAGE = 8;

function RentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read URL query params
  const cityParam = searchParams.get("city") || "";
  const bhkParam = searchParams.get("bhk") || "any";
  const propertyTypeParam = searchParams.get("propertyType") || "all";
  const rentBudgetParam = searchParams.get("rentBudget") || "any";
  const furnishingParam = searchParams.get("furnishing") || "all";
  const sortParam = (searchParams.get("sort") as SortOption) || "recommended";

  // Search Bar Local State
  const [locationQuery, setLocationQuery] = useState(cityParam);
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
  const [isLoading, setIsLoading] = useState(false);

  // Sync state to URL params cleanly
  const syncToUrl = useCallback(
    (updatedParams: {
      city?: string;
      bhk?: string;
      propertyType?: string;
      rentBudget?: string;
      furnishing?: string;
      sort?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updatedParams.city !== undefined) {
        if (updatedParams.city) params.set("city", updatedParams.city);
        else params.delete("city");
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

  const handleCitySelect = (cityName: string) => {
    setLocationQuery(cityName);
    setFilters((prev) => ({ ...prev, city: cityName }));
    syncToUrl({ city: cityName });
    const listingsSection = document.getElementById("rental-results");
    if (listingsSection) {
      listingsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Filter and Sort Processing
  const filteredRentals = useMemo(() => {
    return MOCK_RENTALS.filter((p) => {
      // 1. Location
      if (locationQuery) {
        const query = locationQuery.toLowerCase();
        const matchesLoc =
          p.city.toLowerCase().includes(query) ||
          p.locality.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query) ||
          p.title.toLowerCase().includes(query);
        if (!matchesLoc) return false;
      }

      // 2. Property Type
      if (propertyType !== "all" && p.propertyType !== propertyType) return false;
      if (
        filters.propertyTypes.length > 0 &&
        !filters.propertyTypes.includes(p.propertyType)
      ) {
        return false;
      }

      // 3. BHK
      if (bhk !== "any" && p.bhk !== bhk) return false;
      if (filters.bhkList.length > 0 && !filters.bhkList.includes(p.bhk)) {
        return false;
      }

      // 4. Furnishing
      if (furnishing !== "all" && p.furnishingStatus !== furnishing) return false;
      if (
        filters.furnishingList.length > 0 &&
        !filters.furnishingList.includes(p.furnishingStatus)
      ) {
        return false;
      }

      // 5. Monthly Rent Budget
      const effectiveBudget =
        filters.rentRange !== "any" ? filters.rentRange : rentBudget;
      if (effectiveBudget === "under-15k" && p.monthlyRent > 15000) return false;
      if (
        effectiveBudget === "15k-30k" &&
        (p.monthlyRent < 15000 || p.monthlyRent > 30000)
      )
        return false;
      if (
        effectiveBudget === "30k-50k" &&
        (p.monthlyRent < 30000 || p.monthlyRent > 50000)
      )
        return false;
      if (
        effectiveBudget === "50k-75k" &&
        (p.monthlyRent < 50000 || p.monthlyRent > 75000)
      )
        return false;
      if (effectiveBudget === "above-75k" && p.monthlyRent < 75000) return false;

      // 6. Direct Owner Only
      if (filters.isOwnerOnly && p.sellerType !== "owner") return false;

      // 7. Tenant Preference
      if (filters.tenantPreferences.length > 0) {
        const matchesPref = filters.tenantPreferences.some((tp) =>
          p.tenantPreference.includes(tp as TenantPreference)
        );
        if (!matchesPref) return false;
      }

      // 8. Availability
      if (
        filters.availabilityList.length > 0 &&
        !filters.availabilityList.includes(p.availability)
      ) {
        return false;
      }

      // 9. Amenities
      if (filters.amenities.length > 0) {
        const hasAll = filters.amenities.every((a) => p.amenities.includes(a));
        if (!hasAll) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOption === "newest") {
        return b.id.localeCompare(a.id);
      }
      if (sortOption === "price-asc") {
        return a.monthlyRent - b.monthlyRent;
      }
      if (sortOption === "price-desc") {
        return b.monthlyRent - a.monthlyRent;
      }
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [
    locationQuery,
    propertyType,
    rentBudget,
    bhk,
    furnishing,
    filters,
    sortOption,
  ]);

  // Construct Active Filter Chips
  const activeFilterList: ActiveFilterItem[] = useMemo(() => {
    const list: ActiveFilterItem[] = [];

    if (locationQuery) {
      list.push({
        id: "loc",
        label: `Location: ${locationQuery}`,
        category: "location",
        onRemove: () => {
          setLocationQuery("");
          syncToUrl({ city: "" });
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
  }, [locationQuery, bhk, furnishing, filters, syncToUrl]);

  const handleClearAll = () => {
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
    setIsLoading(true);
    setCurrentPage(1);
    syncToUrl({
      city: locationQuery,
      bhk,
      propertyType,
      rentBudget,
      furnishing,
    });
    setTimeout(() => setIsLoading(false), 200);
  };

  // Pagination Slice
  const totalPages = Math.ceil(filteredRentals.length / ITEMS_PER_PAGE) || 1;
  const paginatedRentals = filteredRentals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
            Rental Properties in India
          </span>
          {locationQuery && (
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
            location={locationQuery}
            onLocationChange={setLocationQuery}
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

        {/* 3. Main Content: Filter Sidebar + Rental Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Desktop Sticky Filter Sidebar (3 cols ~ 280-320px) */}
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
                <h1 className="text-base font-bold text-primary-navy">
                  {locationQuery
                    ? `Flats & Houses for Rent in ${locationQuery}`
                    : "Verified Rental Properties & Flats in India"}
                </h1>
                <p className="text-xs text-text-secondary">
                  <strong className="text-primary-navy font-bold">
                    {filteredRentals.length}
                  </strong>{" "}
                  rental listings found with zero brokerage options
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
              totalCount={filteredRentals.length}
              onClearAll={handleClearAll}
            />

            {/* Results Grid / List */}
            {isLoading ? (
              <PropertySkeleton viewMode={viewMode} count={ITEMS_PER_PAGE} />
            ) : filteredRentals.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
                    {paginatedRentals.map((rental) => (
                      <RentPropertyCard key={rental.id} property={rental} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedRentals.map((rental) => (
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
                        filteredRentals.length
                      )}{" "}
                      of {filteredRentals.length} Rentals
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
                            className={`w-8 h-8 rounded-lg font-bold transition-all cursor-pointer ${
                              currentPage === page
                                ? "bg-primary-navy text-white shadow-soft-xs"
                                : "bg-white text-text-primary border border-border-default hover:bg-bg-light"
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
              <EmptyResults
                onClearFilters={handleClearAll}
                recommendedProperties={MOCK_PROPERTIES.slice(0, 3)}
              />
            )}
          </div>
        </div>

        {/* Mobile Rental Filter Modal */}
        <MobileRentFilterModal
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
          filters={filters}
          onFilterChange={(f) => {
            setFilters(f);
            setCurrentPage(1);
          }}
          onClearAll={handleClearAll}
          matchingCount={filteredRentals.length}
        />
      </Container>
    </div>
  );
}

export default function RentPage() {
  return (
    <Suspense fallback={<PropertySkeleton count={6} />}>
      <RentPageContent />
    </Suspense>
  );
}

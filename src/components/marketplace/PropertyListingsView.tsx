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
import { PropertySearchBar } from "@/components/marketplace/PropertySearchBar";
import { FilterSidebar, FilterState } from "@/components/marketplace/FilterSidebar";
import { MobileFilterModal } from "@/components/marketplace/MobileFilterModal";
import { ActiveFilters, ActiveFilterItem } from "@/components/marketplace/ActiveFilters";
import { PropertyCard } from "@/components/marketplace/PropertyCard";
import { PropertyListCard } from "@/components/marketplace/PropertyListCard";
import { SortDropdown, SortOption } from "@/components/marketplace/SortDropdown";
import { EmptyResults } from "@/components/marketplace/EmptyResults";
import { PropertySkeleton } from "@/components/marketplace/PropertySkeleton";
import { MOCK_PROPERTIES } from "@/data/mockProperties";
import { ListingType } from "@/types/property";

export interface PropertyListingsViewProps {
  defaultListingType?: ListingType;
}

const INITIAL_FILTERS: FilterState = {
  city: "All",
  propertyTypes: [],
  bhkList: [],
  budgetRange: "any",
  possessionStatus: [],
  sellerTypes: [],
  isReraOnly: false,
  furnishingStatus: [],
  amenities: [],
};

const ITEMS_PER_PAGE = 8;

function ListingsViewContent({ defaultListingType = "buy" }: PropertyListingsViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read URL query params
  const typeParam = (searchParams.get("type") as ListingType) || defaultListingType;
  const cityParam = searchParams.get("city") || "";
  const bhkParam = searchParams.get("bhk") || "any";
  const propertyTypeParam = searchParams.get("propertyType") || "all";
  const budgetParam = searchParams.get("budget") || "any";
  const sortParam = (searchParams.get("sort") as SortOption) || "recommended";

  // Local state
  const [listingType, setListingType] = useState<ListingType>(typeParam);
  const [locationQuery, setLocationQuery] = useState(cityParam);
  const [propertyType, setPropertyType] = useState(propertyTypeParam);
  const [budget, setBudget] = useState(budgetParam);
  const [bhk, setBhk] = useState(bhkParam);

  const [filters, setFilters] = useState<FilterState>(() => ({
    ...INITIAL_FILTERS,
    bhkList: bhkParam !== "any" ? [bhkParam] : [],
    propertyTypes: propertyTypeParam !== "all" ? [propertyTypeParam] : [],
    budgetRange: budgetParam,
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
      budget?: string;
      sort?: string;
      type?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updatedParams.city !== undefined) {
        if (updatedParams.city) params.set("city", updatedParams.city);
        else params.delete("city");
      }
      if (updatedParams.bhk !== undefined) {
        if (updatedParams.bhk && updatedParams.bhk !== "any") params.set("bhk", updatedParams.bhk);
        else params.delete("bhk");
      }
      if (updatedParams.propertyType !== undefined) {
        if (updatedParams.propertyType && updatedParams.propertyType !== "all")
          params.set("propertyType", updatedParams.propertyType);
        else params.delete("propertyType");
      }
      if (updatedParams.budget !== undefined) {
        if (updatedParams.budget && updatedParams.budget !== "any") params.set("budget", updatedParams.budget);
        else params.delete("budget");
      }
      if (updatedParams.sort !== undefined) {
        if (updatedParams.sort && updatedParams.sort !== "recommended") params.set("sort", updatedParams.sort);
        else params.delete("sort");
      }
      if (updatedParams.type !== undefined) {
        if (updatedParams.type) params.set("type", updatedParams.type);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  // Filter and Sort Processing
  const filteredProperties = useMemo(() => {
    return MOCK_PROPERTIES.filter((p) => {
      // 1. Listing Type
      if (listingType !== "buy" && p.listingType !== listingType) return false;

      // 2. Location
      if (locationQuery) {
        const query = locationQuery.toLowerCase();
        const matchesLoc =
          p.city.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query) ||
          p.title.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query);
        if (!matchesLoc) return false;
      }

      // 3. Property Type from searchbar or sidebar
      if (propertyType !== "all" && p.propertyType !== propertyType) return false;
      if (
        filters.propertyTypes.length > 0 &&
        !filters.propertyTypes.includes(p.propertyType)
      ) {
        return false;
      }

      // 4. BHK from searchbar or sidebar
      if (bhk !== "any" && String(p.bhk) !== bhk) return false;
      if (
        filters.bhkList.length > 0 &&
        !filters.bhkList.includes(String(p.bhk))
      ) {
        return false;
      }

      // 5. Budget Range
      const effectiveBudget =
        filters.budgetRange !== "any" ? filters.budgetRange : budget;
      if (effectiveBudget === "under-50l" && p.priceNumeric > 5000000) return false;
      if (
        effectiveBudget === "50l-1cr" &&
        (p.priceNumeric < 5000000 || p.priceNumeric > 10000000)
      )
        return false;
      if (
        effectiveBudget === "1cr-2.5cr" &&
        (p.priceNumeric < 10000000 || p.priceNumeric > 25000000)
      )
        return false;
      if (
        effectiveBudget === "2.5cr-5cr" &&
        (p.priceNumeric < 25000000 || p.priceNumeric > 50000000)
      )
        return false;
      if (effectiveBudget === "above-5cr" && p.priceNumeric < 50000000)
        return false;

      // 6. RERA Verified Only
      if (filters.isReraOnly && !p.isReraVerified) return false;

      // 7. Possession Status
      if (
        filters.possessionStatus.length > 0 &&
        !filters.possessionStatus.includes(p.possessionStatus)
      ) {
        return false;
      }

      // 8. Listed By (Seller Type)
      if (
        filters.sellerTypes.length > 0 &&
        !filters.sellerTypes.includes(p.sellerType)
      ) {
        return false;
      }

      // 9. Furnishing
      if (
        filters.furnishingStatus.length > 0 &&
        !filters.furnishingStatus.includes(p.furnishingStatus)
      ) {
        return false;
      }

      // 10. Amenities
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every((a) =>
          p.amenities.includes(a)
        );
        if (!hasAllAmenities) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOption === "newest") {
        return b.id.localeCompare(a.id);
      }
      if (sortOption === "price-asc") {
        return a.priceNumeric - b.priceNumeric;
      }
      if (sortOption === "price-desc") {
        return b.priceNumeric - a.priceNumeric;
      }
      if (sortOption === "area-asc") {
        const aArea = parseInt(a.carpetArea.replace(/[^0-9]/g, "")) || 0;
        const bArea = parseInt(b.carpetArea.replace(/[^0-9]/g, "")) || 0;
        return aArea - bArea;
      }
      if (sortOption === "area-desc") {
        const aArea = parseInt(a.carpetArea.replace(/[^0-9]/g, "")) || 0;
        const bArea = parseInt(b.carpetArea.replace(/[^0-9]/g, "")) || 0;
        return bArea - aArea;
      }
      // recommended default
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [
    listingType,
    locationQuery,
    propertyType,
    budget,
    bhk,
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

    if (propertyType !== "all") {
      list.push({
        id: "propType",
        label: `Type: ${propertyType}`,
        category: "type",
        onRemove: () => {
          setPropertyType("all");
          syncToUrl({ propertyType: "all" });
        },
      });
    }

    filters.propertyTypes.forEach((t) => {
      list.push({
        id: `type-${t}`,
        label: t,
        category: "propertyType",
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            propertyTypes: prev.propertyTypes.filter((x) => x !== t),
          })),
      });
    });

    if (bhk !== "any") {
      list.push({
        id: "bhk-bar",
        label: `${bhk} BHK`,
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
        label: `${b} BHK`,
        category: "bhk",
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            bhkList: prev.bhkList.filter((x) => x !== b),
          })),
      });
    });

    if (filters.budgetRange !== "any") {
      list.push({
        id: "budget-range",
        label: `Budget: ${filters.budgetRange}`,
        category: "budget",
        onRemove: () => {
          setFilters((prev) => ({ ...prev, budgetRange: "any" }));
          syncToUrl({ budget: "any" });
        },
      });
    }

    if (filters.isReraOnly) {
      list.push({
        id: "rera",
        label: "RERA Verified Only",
        category: "rera",
        onRemove: () => setFilters((prev) => ({ ...prev, isReraOnly: false })),
      });
    }

    filters.possessionStatus.forEach((pos) => {
      list.push({
        id: `pos-${pos}`,
        label: pos,
        category: "possession",
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            possessionStatus: prev.possessionStatus.filter((x) => x !== pos),
          })),
      });
    });

    filters.sellerTypes.forEach((sel) => {
      list.push({
        id: `seller-${sel}`,
        label: sel === "owner" ? "Direct Owner" : "Certified Agent",
        category: "seller",
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            sellerTypes: prev.sellerTypes.filter((x) => x !== sel),
          })),
      });
    });

    filters.amenities.forEach((amenity) => {
      list.push({
        id: `amenity-${amenity}`,
        label: amenity,
        category: "amenities",
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            amenities: prev.amenities.filter((x) => x !== amenity),
          })),
      });
    });

    return list;
  }, [locationQuery, propertyType, bhk, filters, syncToUrl]);

  const handleClearAll = () => {
    setLocationQuery("");
    setPropertyType("all");
    setBudget("any");
    setBhk("any");
    setFilters(INITIAL_FILTERS);
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
      budget,
      type: listingType,
    });
    setTimeout(() => setIsLoading(false), 200);
  };

  // Pagination Slice
  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE) || 1;
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="py-6 sm:py-8 bg-bg-light min-h-screen font-sans text-text-primary">
      <Container className="space-y-6">
        {/* Breadcrumb Bar */}
        <nav
          className="flex items-center gap-2 text-xs text-text-secondary"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-primary-navy transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-primary-navy capitalize">
            {listingType === "buy"
              ? "Properties for Sale"
              : listingType === "rent"
              ? "Properties for Rent"
              : "Commercial Properties"}
          </span>
          {locationQuery && (
            <>
              <span>/</span>
              <span className="text-text-muted">{locationQuery}</span>
            </>
          )}
        </nav>

        {/* Top Search Bar */}
        <PropertySearchBar
          listingType={listingType}
          onListingTypeChange={(t) => {
            setListingType(t);
            syncToUrl({ type: t });
            handleSearchSubmit();
          }}
          location={locationQuery}
          onLocationChange={setLocationQuery}
          propertyType={propertyType}
          onPropertyTypeChange={(p) => {
            setPropertyType(p);
            syncToUrl({ propertyType: p });
          }}
          budget={budget}
          onBudgetChange={(b) => {
            setBudget(b);
            syncToUrl({ budget: b });
          }}
          bhk={bhk}
          onBhkChange={(b) => {
            setBhk(b);
            syncToUrl({ bhk: b });
          }}
          onSearchSubmit={handleSearchSubmit}
        />

        {/* Main Content: Sidebar + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Desktop Filter Sidebar (3 cols ~ 280-320px) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24">
            <FilterSidebar
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
            {/* Results Header Bar: Controls, Sort, View Toggle */}
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

              {/* Title & Count Display */}
              <div className="hidden sm:block">
                <h1 className="text-base font-bold text-primary-navy">
                  {locationQuery
                    ? `Properties in ${locationQuery}`
                    : listingType === "buy"
                    ? "Verified Properties for Sale in India"
                    : listingType === "rent"
                    ? "Verified Rental Properties in India"
                    : "Commercial Spaces for Lease & Sale"}
                </h1>
                <p className="text-xs text-text-secondary">
                  <strong className="text-primary-navy font-bold">{filteredProperties.length}</strong> listings found with 100% verified seller details
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
              totalCount={filteredProperties.length}
              onClearAll={handleClearAll}
            />

            {/* Properties Result Grid / List */}
            {isLoading ? (
              <PropertySkeleton viewMode={viewMode} count={ITEMS_PER_PAGE} />
            ) : filteredProperties.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
                    {paginatedProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedProperties.map((property) => (
                      <PropertyListCard
                        key={property.id}
                        property={property}
                      />
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
                        filteredProperties.length
                      )}{" "}
                      of {filteredProperties.length} Properties
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

        {/* Mobile Filter Modal / Drawer */}
        <MobileFilterModal
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
          filters={filters}
          onFilterChange={(f) => {
            setFilters(f);
            setCurrentPage(1);
          }}
          onClearAll={handleClearAll}
          matchingCount={filteredProperties.length}
        />
      </Container>
    </div>
  );
}

export function PropertyListingsView(props: PropertyListingsViewProps) {
  return (
    <Suspense fallback={<PropertySkeleton count={6} />}>
      <ListingsViewContent {...props} />
    </Suspense>
  );
}

export default PropertyListingsView;

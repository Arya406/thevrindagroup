"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { Container, Button } from "@/components/ui";
import { PropertySearchBar } from "@/components/marketplace/PropertySearchBar";
import { FilterSidebar, FilterState } from "@/components/marketplace/FilterSidebar";
import { MobileFilterModal } from "@/components/marketplace/MobileFilterModal";
import { ActiveFilters, ActiveFilterItem } from "@/components/marketplace/ActiveFilters";
import { PropertyCard } from "@/components/marketplace/PropertyCard";
import { PropertyListCard } from "@/components/marketplace/PropertyListCard";
import { SortDropdown, SortOption } from "@/components/marketplace/SortDropdown";
import { EmptyResults } from "@/components/marketplace/EmptyResults";
import { PropertySkeleton } from "@/components/marketplace/PropertySkeleton";
import { Property, ListingType } from "@/types/property";
import { PropertyApiService, BackendPagination } from "@/lib/services/property-api";

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

const ITEMS_PER_PAGE = 9;

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
  const listingType: ListingType = typeParam;
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

  // Backend Data State
  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<BackendPagination>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

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

  // Real Backend Data Fetcher Effect with unmount safety
  useEffect(() => {
    let isMounted = true;
    const fetchListings = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const activePropertyType =
          propertyType !== "all"
            ? propertyType
            : filters.propertyTypes.length > 0
            ? filters.propertyTypes[0]
            : undefined;

        const activeBhk =
          bhk !== "any"
            ? bhk
            : filters.bhkList.length > 0
            ? filters.bhkList[0]
            : undefined;

        const activeBudget =
          filters.budgetRange !== "any" ? filters.budgetRange : budget;

        const res = await PropertyApiService.getProperties({
          search: locationQuery || undefined,
          listingType,
          propertyType: activePropertyType,
          city: filters.city !== "All" ? filters.city : undefined,
          budget: activeBudget,
          bhk: activeBhk,
          furnishingStatus: filters.furnishingStatus[0] || undefined,
          sort: sortOption,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });

        if (isMounted) {
          setProperties(res.properties);
          setPagination(res.pagination);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg =
            err instanceof Error
              ? err.message
              : "Failed to connect to property server. Please ensure the backend is running.";
          setFetchError(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchListings();

    return () => {
      isMounted = false;
    };
  }, [
    listingType,
    locationQuery,
    propertyType,
    budget,
    bhk,
    filters,
    sortOption,
    currentPage,
  ]);

  const handleManualRetry = () => {
    setCurrentPage(1);
    setIsLoading(true);
    setFetchError(null);
    PropertyApiService.getProperties({
      search: locationQuery || undefined,
      listingType,
      sort: sortOption,
      page: 1,
      limit: ITEMS_PER_PAGE,
    })
      .then((res) => {
        setProperties(res.properties);
        setPagination(res.pagination);
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to connect to property server. Please ensure the backend is running.";
        setFetchError(msg);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

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
    setCurrentPage(1);
    syncToUrl({
      city: locationQuery,
      bhk,
      propertyType,
      budget,
      type: listingType,
    });
  };

  const totalPages = pagination.totalPages || 1;

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
          <span className="font-semibold text-primary-navy">
            Properties For Sale
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
          location={locationQuery}
          onLocationChange={setLocationQuery}
          propertyType={propertyType}
          onPropertyTypeChange={(p) => {
            setPropertyType(p);
            syncToUrl({ propertyType: p });
            setCurrentPage(1);
          }}
          budget={budget}
          onBudgetChange={(b) => {
            setBudget(b);
            syncToUrl({ budget: b });
            setCurrentPage(1);
          }}
          bhk={bhk}
          onBhkChange={(b) => {
            setBhk(b);
            syncToUrl({ bhk: b });
            setCurrentPage(1);
          }}
          onSearchSubmit={handleSearchSubmit}
        />

        {/* Main Content: Sidebar + Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Desktop Filter Sidebar */}
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

          {/* RIGHT: Results Area */}
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
                <h1 className="text-base sm:text-lg font-bold text-primary-navy">
                  {locationQuery
                    ? `Properties for Sale in ${locationQuery}`
                    : "Properties for Sale in India"}
                </h1>
                <p className="text-xs text-text-secondary">
                  Showing <strong className="text-primary-navy font-bold">{pagination.total}</strong> Properties for Sale
                </p>
              </div>

              {/* Sort & View Switcher */}
              <div className="flex items-center gap-3 ml-auto">
                <SortDropdown
                  value={sortOption}
                  onChange={(s) => {
                    setSortOption(s);
                    syncToUrl({ sort: s });
                    setCurrentPage(1);
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
              totalCount={pagination.total}
              onClearAll={handleClearAll}
            />

            {/* Error State with Retry */}
            {fetchError && !isLoading && (
              <div className="p-6 rounded-2xl bg-error-red-light/40 border border-error-red/20 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-error-red/10 text-error-red flex items-center justify-center mx-auto">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-primary-navy">Unable to Load Properties</h3>
                <p className="text-xs text-text-secondary max-w-md mx-auto">{fetchError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualRetry}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  className="mx-auto text-xs"
                >
                  Retry Connection
                </Button>
              </div>
            )}

            {/* Properties Result Grid / List */}
            {isLoading ? (
              <PropertySkeleton viewMode={viewMode} count={ITEMS_PER_PAGE} />
            ) : !fetchError && properties.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
                    {properties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {properties.map((property) => (
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
                      {Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)}{" "}
                      of {pagination.total} Properties
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
            ) : !fetchError ? (
              <EmptyResults
                onClearFilters={handleClearAll}
              />
            ) : null}
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
          matchingCount={pagination.total}
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

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
  RefreshCw,
} from "lucide-react";
import { Container, Button } from "@/components/ui";
import { CommercialDiscovery } from "@/components/commercial/CommercialDiscovery";
import { CommercialSearchBar } from "@/components/commercial/CommercialSearchBar";
import { CommercialFiltersView } from "@/components/commercial/CommercialFilters";
import { MobileCommercialFilterModal } from "@/components/commercial/MobileCommercialFilterModal";
import { ActiveFilters, ActiveFilterItem } from "@/components/marketplace/ActiveFilters";
import { CommercialPropertyCard } from "@/components/commercial/CommercialPropertyCard";
import { CommercialPropertyListCard } from "@/components/commercial/CommercialPropertyListCard";
import { CoworkingSection } from "@/components/commercial/CoworkingSection";
import { SortDropdown, SortOption } from "@/components/marketplace/SortDropdown";
import { EmptyResults } from "@/components/marketplace/EmptyResults";
import { PropertySkeleton } from "@/components/marketplace/PropertySkeleton";
import { CommercialFilters, CommercialProperty } from "@/types/commercial";
import { PropertyApiService, mapPropertyToCommercialProperty } from "@/lib/services/property-api";

const INITIAL_COMMERCIAL_FILTERS: CommercialFilters = {
  city: "All",
  locality: "",
  businessDistrict: "",
  transactionType: "all",
  propertyTypes: [],
  areaRange: "any",
  priceRange: "any",
  possessionStatus: [],
  furnishingList: [],
  floorLevels: [],
  parkingList: [],
  amenities: [],
  isReraOnly: false,
};

const ITEMS_PER_PAGE = 6;

function CommercialPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read URL params
  const cityParam = searchParams.get("city") || "";
  const propertyTypeParam = searchParams.get("propertyType") || "all";
  const transactionParam = searchParams.get("transaction") || "all";
  const areaRangeParam = searchParams.get("areaRange") || "any";
  const priceBudgetParam = searchParams.get("priceBudget") || "any";
  const sortParam = (searchParams.get("sort") as SortOption) || "recommended";

  // Local Search State
  const [locationQuery, setLocationQuery] = useState(cityParam);
  const [propertyType, setPropertyType] = useState(propertyTypeParam);
  const [transactionType, setTransactionType] = useState(transactionParam);
  const [areaRange, setAreaRange] = useState(areaRangeParam);
  const [priceBudget, setPriceBudget] = useState(priceBudgetParam);

  // Filters State
  const [filters, setFilters] = useState<CommercialFilters>(() => ({
    ...INITIAL_COMMERCIAL_FILTERS,
    city: cityParam || "All",
    transactionType: transactionParam,
    propertyTypes: propertyTypeParam !== "all" ? [propertyTypeParam] : [],
    areaRange: areaRangeParam,
    priceRange: priceBudgetParam,
  }));

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState<SortOption>(sortParam);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Live Backend State
  const [commercialProperties, setCommercialProperties] = useState<CommercialProperty[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Sync to URL
  const syncToUrl = useCallback(
    (updatedParams: {
      city?: string;
      propertyType?: string;
      transaction?: string;
      areaRange?: string;
      priceBudget?: string;
      sort?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updatedParams.city !== undefined) {
        if (updatedParams.city) params.set("city", updatedParams.city);
        else params.delete("city");
      }
      if (updatedParams.propertyType !== undefined) {
        if (updatedParams.propertyType && updatedParams.propertyType !== "all")
          params.set("propertyType", updatedParams.propertyType);
        else params.delete("propertyType");
      }
      if (updatedParams.transaction !== undefined) {
        if (updatedParams.transaction && updatedParams.transaction !== "all")
          params.set("transaction", updatedParams.transaction);
        else params.delete("transaction");
      }
      if (updatedParams.areaRange !== undefined) {
        if (updatedParams.areaRange && updatedParams.areaRange !== "any")
          params.set("areaRange", updatedParams.areaRange);
        else params.delete("areaRange");
      }
      if (updatedParams.priceBudget !== undefined) {
        if (updatedParams.priceBudget && updatedParams.priceBudget !== "any")
          params.set("priceBudget", updatedParams.priceBudget);
        else params.delete("priceBudget");
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

    const effectiveTransaction =
      filters.transactionType !== "all" ? filters.transactionType : transactionType;
    let listingTypeParam: "SALE" | "RENT" | "LEASE" | undefined = undefined;
    if (effectiveTransaction === "sale") listingTypeParam = "SALE";
    else if (effectiveTransaction === "lease" || effectiveTransaction === "rent")
      listingTypeParam = "LEASE";

    const effectivePropertyType =
      filters.propertyTypes.length > 0 ? filters.propertyTypes[0] : propertyType;
    const effectiveBudget =
      filters.priceRange !== "any" ? filters.priceRange : priceBudget;
    const effectiveArea =
      filters.areaRange !== "any" ? filters.areaRange : areaRange;

    PropertyApiService.getProperties({
      listingType: listingTypeParam,
      propertyType: effectivePropertyType !== "all" ? effectivePropertyType : undefined,
      city: filters.city !== "All" ? filters.city : undefined,
      search: locationQuery.trim() || undefined,
      budget: effectiveBudget !== "any" ? effectiveBudget : undefined,
      areaRange: effectiveArea !== "any" ? effectiveArea : undefined,
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
          const mapped = (res.properties || []).map(mapPropertyToCommercialProperty);
          setCommercialProperties(mapped);
          setTotalCount(res.pagination.total);
          setTotalPages(res.pagination.totalPages);
          setFetchError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg =
            err instanceof Error
              ? err.message
              : "Failed to load commercial properties from server.";
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
    locationQuery,
    propertyType,
    transactionType,
    areaRange,
    priceBudget,
    filters,
    sortOption,
    currentPage,
  ]);

  const handleRetry = () => {
    setIsLoading(true);
    setFetchError(null);

    const effectiveTransaction =
      filters.transactionType !== "all" ? filters.transactionType : transactionType;
    let listingTypeParam: "SALE" | "RENT" | "LEASE" | undefined = undefined;
    if (effectiveTransaction === "sale") listingTypeParam = "SALE";
    else if (effectiveTransaction === "lease" || effectiveTransaction === "rent")
      listingTypeParam = "LEASE";

    const effectivePropertyType =
      filters.propertyTypes.length > 0 ? filters.propertyTypes[0] : propertyType;
    const effectiveBudget =
      filters.priceRange !== "any" ? filters.priceRange : priceBudget;
    const effectiveArea =
      filters.areaRange !== "any" ? filters.areaRange : areaRange;

    PropertyApiService.getProperties({
      listingType: listingTypeParam,
      propertyType: effectivePropertyType !== "all" ? effectivePropertyType : undefined,
      city: filters.city !== "All" ? filters.city : undefined,
      search: locationQuery.trim() || undefined,
      budget: effectiveBudget !== "any" ? effectiveBudget : undefined,
      areaRange: effectiveArea !== "any" ? effectiveArea : undefined,
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
        const mapped = (res.properties || []).map(mapPropertyToCommercialProperty);
        setCommercialProperties(mapped);
        setTotalCount(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to load commercial properties from server.";
        setFetchError(msg);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSelectType = (selectedType: string) => {
    setPropertyType(selectedType);
    setFilters((prev) => ({ ...prev, propertyTypes: [selectedType] }));
    syncToUrl({ propertyType: selectedType });
    const resultsElement = document.getElementById("commercial-results");
    if (resultsElement) resultsElement.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectLocation = (loc: string) => {
    setLocationQuery(loc);
    setFilters((prev) => ({ ...prev, city: loc }));
    syncToUrl({ city: loc });
    const resultsElement = document.getElementById("commercial-results");
    if (resultsElement) resultsElement.scrollIntoView({ behavior: "smooth" });
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

    if (transactionType !== "all") {
      list.push({
        id: "trx-bar",
        label: `Type: ${transactionType.toUpperCase()}`,
        category: "transaction",
        onRemove: () => {
          setTransactionType("all");
          syncToUrl({ transaction: "all" });
        },
      });
    }

    filters.propertyTypes.forEach((pt) => {
      list.push({
        id: `pt-${pt}`,
        label: pt.toUpperCase(),
        category: "propertyType",
        onRemove: () =>
          setFilters((prev) => ({
            ...prev,
            propertyTypes: prev.propertyTypes.filter((x) => x !== pt),
          })),
      });
    });

    if (filters.areaRange !== "any") {
      list.push({
        id: "area-range",
        label: `Area: ${filters.areaRange}`,
        category: "area",
        onRemove: () => {
          setFilters((prev) => ({ ...prev, areaRange: "any" }));
          syncToUrl({ areaRange: "any" });
        },
      });
    }

    if (filters.priceRange !== "any") {
      list.push({
        id: "price-range",
        label: `Budget: ${filters.priceRange}`,
        category: "price",
        onRemove: () => {
          setFilters((prev) => ({ ...prev, priceRange: "any" }));
          syncToUrl({ priceBudget: "any" });
        },
      });
    }

    return list;
  }, [locationQuery, transactionType, filters, syncToUrl]);

  const handleClearAll = () => {
    setLocationQuery("");
    setPropertyType("all");
    setTransactionType("all");
    setAreaRange("any");
    setPriceBudget("any");
    setFilters(INITIAL_COMMERCIAL_FILTERS);
    setCurrentPage(1);
    router.replace(pathname, { scroll: false });
  };

  const handleSearchSubmit = () => {
    setCurrentPage(1);
    syncToUrl({
      city: locationQuery,
      propertyType,
      transaction: transactionType,
      areaRange,
      priceBudget,
    });
  };

  return (
    <div className="py-6 sm:py-8 bg-bg-light min-h-screen font-sans text-text-primary">
      <Container className="space-y-8">
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
            Commercial Properties
          </span>
          {locationQuery && (
            <>
              <span>/</span>
              <span className="text-text-muted">{locationQuery}</span>
            </>
          )}
        </nav>

        {/* 1. Top Commercial Discovery & Highlights Section */}
        <CommercialDiscovery
          onSelectType={handleSelectType}
          onSelectLocation={handleSelectLocation}
          selectedType={propertyType}
          selectedLocation={locationQuery}
        />

        {/* 2. Top Commercial Search Header */}
        <div id="commercial-results">
          <CommercialSearchBar
            location={locationQuery}
            onLocationChange={setLocationQuery}
            propertyType={propertyType}
            onPropertyTypeChange={(p) => {
              setPropertyType(p);
              syncToUrl({ propertyType: p });
            }}
            transactionType={transactionType}
            onTransactionTypeChange={(t) => {
              setTransactionType(t);
              syncToUrl({ transaction: t });
            }}
            areaRange={areaRange}
            onAreaRangeChange={(a) => {
              setAreaRange(a);
              syncToUrl({ areaRange: a });
            }}
            priceBudget={priceBudget}
            onPriceBudgetChange={(b) => {
              setPriceBudget(b);
              syncToUrl({ priceBudget: b });
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

        {/* 3. Main Content: Commercial Filter Sidebar + Listings Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Sticky Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24">
            <CommercialFiltersView
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
            {/* Header with Title, Count, Sort, View Toggle */}
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

              {/* Title & Matching Count */}
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-lg font-bold text-primary-navy">
                  {locationQuery
                    ? `Commercial Properties in ${locationQuery}`
                    : "Commercial Properties in India"}
                </h1>
                <p className="text-xs text-text-secondary">
                  Showing{" "}
                  <strong className="text-primary-navy font-bold">
                    {totalCount}
                  </strong>{" "}
                  Commercial Properties
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
            ) : commercialProperties.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
                    {commercialProperties.map((property) => (
                      <CommercialPropertyCard
                        key={property.id}
                        property={property}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {commercialProperties.map((property) => (
                      <CommercialPropertyListCard
                        key={property.id}
                        property={property}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border-default pt-6 text-xs">
                    <p className="text-text-secondary">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                      {Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        totalCount
                      )}{" "}
                      of {totalCount} Properties
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

        {/* 4. Coworking Highlights Section */}
        <CoworkingSection />
      </Container>

      {/* Mobile Filters Modal */}
      <MobileCommercialFilterModal
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

export default function CommercialPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 bg-bg-light min-h-screen">
          <Container>
            <PropertySkeleton viewMode="grid" count={6} />
          </Container>
        </div>
      }
    >
      <CommercialPageContent />
    </Suspense>
  );
}

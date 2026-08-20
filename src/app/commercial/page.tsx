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
import { CommercialDiscovery } from "@/components/commercial/CommercialDiscovery";
import { CommercialSearchBar } from "@/components/commercial/CommercialSearchBar";
import { CommercialFiltersView } from "@/components/commercial/CommercialFilters";
import { MobileCommercialFilterModal } from "@/components/commercial/MobileCommercialFilterModal";
import { ActiveFilters, ActiveFilterItem } from "@/components/marketplace/ActiveFilters";
import { CommercialPropertyCard } from "@/components/commercial/CommercialPropertyCard";
import { CommercialPropertyListCard } from "@/components/commercial/CommercialPropertyListCard";
import { CoworkingSection } from "@/components/commercial/CoworkingSection";
import { CommercialProjectsSection } from "@/components/commercial/CommercialProjectsSection";
import { SortDropdown, SortOption } from "@/components/marketplace/SortDropdown";
import { EmptyResults } from "@/components/marketplace/EmptyResults";
import { PropertySkeleton } from "@/components/marketplace/PropertySkeleton";
import { MOCK_COMMERCIAL_PROPERTIES } from "@/data/mockCommercial";
import { MOCK_PROPERTIES } from "@/data/mockProperties";
import { CommercialFilters } from "@/types/commercial";

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
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSelectType = (selectedType: string) => {
    setPropertyType(selectedType);
    setFilters((prev) => ({ ...prev, propertyTypes: [selectedType] }));
    syncToUrl({ propertyType: selectedType });
    const resultsElement = document.getElementById("commercial-results");
    if (resultsElement) resultsElement.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectLocation = (loc: string) => {
    setLocationQuery(loc);
    setFilters((prev) => ({ ...prev, locality: loc }));
    syncToUrl({ city: loc });
    const resultsElement = document.getElementById("commercial-results");
    if (resultsElement) resultsElement.scrollIntoView({ behavior: "smooth" });
  };

  // Filter & Sort Logic
  const filteredCommercial = useMemo(() => {
    return MOCK_COMMERCIAL_PROPERTIES.filter((p) => {
      // 1. Location
      if (locationQuery) {
        const query = locationQuery.toLowerCase();
        const matchesLoc =
          p.city.toLowerCase().includes(query) ||
          p.locality.toLowerCase().includes(query) ||
          p.businessDistrict.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query) ||
          p.title.toLowerCase().includes(query);
        if (!matchesLoc) return false;
      }

      // 2. Transaction Type
      const activeTxn =
        filters.transactionType !== "all"
          ? filters.transactionType
          : transactionType;
      if (activeTxn !== "all" && p.transactionType !== activeTxn) {
        return false;
      }

      // 3. Property Type
      if (propertyType !== "all" && p.propertyType !== propertyType) return false;
      if (
        filters.propertyTypes.length > 0 &&
        !filters.propertyTypes.includes(p.propertyType)
      ) {
        return false;
      }

      // 4. Area Range
      const effectiveArea =
        filters.areaRange !== "any" ? filters.areaRange : areaRange;
      if (effectiveArea === "under-1000" && p.areaNumeric > 1000) return false;
      if (
        effectiveArea === "1000-3000" &&
        (p.areaNumeric < 1000 || p.areaNumeric > 3000)
      )
        return false;
      if (
        effectiveArea === "3000-7000" &&
        (p.areaNumeric < 3000 || p.areaNumeric > 7000)
      )
        return false;
      if (
        effectiveArea === "7000-15000" &&
        (p.areaNumeric < 7000 || p.areaNumeric > 15000)
      )
        return false;
      if (effectiveArea === "above-15000" && p.areaNumeric < 15000)
        return false;

      // 5. Furnishing
      if (
        filters.furnishingList.length > 0 &&
        !filters.furnishingList.includes(p.furnishingStatus)
      ) {
        return false;
      }

      // 6. Possession Status
      if (
        filters.possessionStatus.length > 0 &&
        !filters.possessionStatus.includes(p.possessionStatus)
      ) {
        return false;
      }

      // 7. RERA Only
      if (filters.isReraOnly && !p.isReraVerified) return false;

      // 8. Amenities
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
        return a.priceNumeric - b.priceNumeric;
      }
      if (sortOption === "price-desc") {
        return b.priceNumeric - a.priceNumeric;
      }
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [
    locationQuery,
    propertyType,
    transactionType,
    areaRange,
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

    if (transactionType !== "all") {
      list.push({
        id: "txn",
        label: `Transaction: ${transactionType.toUpperCase()}`,
        category: "transaction",
        onRemove: () => {
          setTransactionType("all");
          setFilters((p) => ({ ...p, transactionType: "all" }));
          syncToUrl({ transaction: "all" });
        },
      });
    }

    if (propertyType !== "all") {
      list.push({
        id: "pt",
        label: `Type: ${propertyType}`,
        category: "propertyType",
        onRemove: () => {
          setPropertyType("all");
          setFilters((p) => ({ ...p, propertyTypes: [] }));
          syncToUrl({ propertyType: "all" });
        },
      });
    }

    filters.propertyTypes.forEach((pt) => {
      if (!list.find((x) => x.id === `pt-${pt}`)) {
        list.push({
          id: `pt-${pt}`,
          label: pt,
          category: "propertyType",
          onRemove: () =>
            setFilters((p) => ({
              ...p,
              propertyTypes: p.propertyTypes.filter((x) => x !== pt),
            })),
        });
      }
    });

    if (areaRange !== "any") {
      list.push({
        id: "area",
        label: `Area: ${areaRange}`,
        category: "area",
        onRemove: () => {
          setAreaRange("any");
          setFilters((p) => ({ ...p, areaRange: "any" }));
          syncToUrl({ areaRange: "any" });
        },
      });
    }

    if (filters.isReraOnly) {
      list.push({
        id: "rera",
        label: "RERA Verified Only",
        category: "verification",
        onRemove: () => setFilters((p) => ({ ...p, isReraOnly: false })),
      });
    }

    filters.furnishingList.forEach((fn) => {
      list.push({
        id: `furn-${fn}`,
        label: fn,
        category: "furnishing",
        onRemove: () =>
          setFilters((p) => ({
            ...p,
            furnishingList: p.furnishingList.filter((x) => x !== fn),
          })),
      });
    });

    return list;
  }, [locationQuery, transactionType, propertyType, areaRange, filters, syncToUrl]);

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
    setIsLoading(true);
    setCurrentPage(1);
    syncToUrl({
      city: locationQuery,
      propertyType,
      transaction: transactionType,
      areaRange,
      priceBudget,
    });
    setTimeout(() => setIsLoading(false), 200);
  };

  const totalPages = Math.ceil(filteredCommercial.length / ITEMS_PER_PAGE) || 1;
  const paginatedCommercial = filteredCommercial.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="py-6 sm:py-8 bg-bg-light min-h-screen font-sans text-text-primary">
      <Container className="space-y-8">
        {/* Breadcrumb Navigation */}
        <nav
          className="flex items-center gap-2 text-xs text-text-secondary"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-primary-navy transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-primary-navy">
            Commercial Properties & Office Spaces
          </span>
          {locationQuery && (
            <>
              <span>/</span>
              <span className="text-text-muted">{locationQuery}</span>
            </>
          )}
        </nav>

        {/* 1. Commercial Asset Class Discovery & Business Hubs */}
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
                <h1 className="text-base font-bold text-primary-navy">
                  {locationQuery
                    ? `Commercial Real Estate in ${locationQuery}`
                    : "Verified Commercial Properties, Offices & Retail Spaces"}
                </h1>
                <p className="text-xs text-text-secondary">
                  <strong className="text-primary-navy font-bold">
                    {filteredCommercial.length}
                  </strong>{" "}
                  commercial spaces verified with enterprise compliance
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
              totalCount={filteredCommercial.length}
              onClearAll={handleClearAll}
            />

            {/* Results Grid / List */}
            {isLoading ? (
              <PropertySkeleton viewMode={viewMode} count={ITEMS_PER_PAGE} />
            ) : filteredCommercial.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
                    {paginatedCommercial.map((property) => (
                      <CommercialPropertyCard
                        key={property.id}
                        property={property}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedCommercial.map((property) => (
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
                        filteredCommercial.length
                      )}{" "}
                      of {filteredCommercial.length} Properties
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

        {/* 4. Flexible Co-working & Enterprise Workspaces Section */}
        <CoworkingSection />

        {/* 5. Featured Master-Planned Commercial Campuses */}
        <CommercialProjectsSection />

        {/* Mobile Filter Drawer */}
        <MobileCommercialFilterModal
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
          filters={filters}
          onFilterChange={(f) => {
            setFilters(f);
            setCurrentPage(1);
          }}
          onClearAll={handleClearAll}
          matchingCount={filteredCommercial.length}
        />
      </Container>
    </div>
  );
}

export default function CommercialPage() {
  return (
    <Suspense fallback={<PropertySkeleton count={6} />}>
      <CommercialPageContent />
    </Suspense>
  );
}

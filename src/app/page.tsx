"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  Lock,
  Clock,
  MapPin,
  PlusCircle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Container, Button } from "@/components/ui";
import { HeroSearch } from "@/components/marketplace/HeroSearch";
import { PropertyCard } from "@/components/marketplace/PropertyCard";
import { ProjectCard } from "@/components/marketplace/ProjectCard";
import { CityCard } from "@/components/marketplace/CityCard";
import { MOCK_PROJECTS } from "@/data/mockProjects";
import { MOCK_CITIES } from "@/data/mockCities";
import { ListingType, Property } from "@/types/property";
import { PropertyApiService } from "@/lib/services/property-api";

const RECOMMENDED_BADGES = [
  "High Rental Yield",
  "Top Rated Locality",
  "Best Price / sq.ft",
  "Prime Connectivity",
];

export default function HomePage() {
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>("All");
  const [propertyCategory, setPropertyCategory] = useState<string>("all");
  const [activeListingType, setActiveListingType] = useState<ListingType>("buy");
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    PropertyApiService.searchProperties({ limit: 24 })
      .then((res) => {
        if (isMounted) {
          setAllProperties(res.properties || []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAllProperties([]);
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
  }, []);

  // Filter properties based on active filters
  const filteredProperties = allProperties.filter((p) => {
    const matchesListing =
      activeListingType === "buy" ? true : p.listingType === activeListingType;

    const matchesCity =
      selectedCityFilter === "All" ||
      p.city.toLowerCase().includes(selectedCityFilter.toLowerCase()) ||
      p.location.toLowerCase().includes(selectedCityFilter.toLowerCase());

    const matchesCategory =
      propertyCategory === "all" ||
      (propertyCategory === "apartment" && p.propertyType === "apartment") ||
      (propertyCategory === "villa" && p.propertyType === "villa") ||
      (propertyCategory === "penthouse" && p.propertyType === "penthouse") ||
      (propertyCategory === "ready" && p.possessionStatus === "Ready to Move");

    return matchesListing && matchesCity && matchesCategory;
  });

  const handleHeroSearch = (filters: {
    listingType: ListingType;
    location: string;
    propertyType: string;
    budget: string;
    bhk: string;
  }) => {
    setActiveListingType(filters.listingType);
    if (filters.location) {
      setSelectedCityFilter(filters.location);
    }
    const section = document.getElementById("featured-properties");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCitySelect = (cityName: string) => {
    setSelectedCityFilter(cityName);
    const section = document.getElementById("featured-properties");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-light font-sans text-text-primary selection:bg-accent-gold/30 selection:text-primary-navy">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (SEARCH & VERIFIED PROPERTY SHOWCASE) */}
      {/* ========================================================================= */}
      <section className="relative w-full bg-gradient-to-b from-bg-subtle via-white to-bg-light border-b border-border-default/70 pt-8 pb-12 sm:pt-12 sm:pb-16 lg:py-16 overflow-hidden font-sans">
        {/* Subtle Decorative Ambient Accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-accent-gold/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 rounded-full bg-primary-navy/5 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#D9A441_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <Container className="relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Search & Discovery Controls */}
            <div className="lg:col-span-7 space-y-5 text-left">
              {/* Trust Assurance Pill */}
              <div className="flex items-center">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-accent-gold-light text-[#9E6E18] border border-accent-gold-muted shadow-soft-xs">
                  <ShieldCheck className="w-4 h-4 text-accent-gold-hover shrink-0" />
                  100% RERA Verified Properties • Zero Brokerage Option
                </span>
              </div>

              {/* Headlines */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-navy tracking-tight leading-[1.15]">
                  Find Your Next <span className="text-[#B3801C]">Verified Home</span> in India
                </h1>
                <p className="text-sm sm:text-base text-text-secondary max-w-xl leading-relaxed">
                  Search verified apartments, villas, and commercial spaces across India’s top metropolitan cities with complete legal title transparency.
                </p>
              </div>

              {/* Interactive Search Card */}
              <div className="pt-1">
                <HeroSearch
                  onSearch={handleHeroSearch}
                  onSelectCity={handleCitySelect}
                  selectedCity={selectedCityFilter === "All" ? "" : selectedCityFilter}
                />
              </div>

              {/* Quick Real Estate Metrics Bar */}
              <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border-subtle text-text-secondary">
                <div className="space-y-0.5">
                  <span className="text-lg sm:text-xl font-extrabold text-primary-navy tracking-tight block">
                    85,000+
                  </span>
                  <p className="text-[11px] sm:text-xs text-text-muted">Verified Listings</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-lg sm:text-xl font-extrabold text-[#B3801C] tracking-tight block">
                    100%
                  </span>
                  <p className="text-[11px] sm:text-xs text-text-muted">RERA Documented</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-lg sm:text-xl font-extrabold text-primary-navy tracking-tight block">
                    0%
                  </span>
                  <p className="text-[11px] sm:text-xs text-text-muted">Brokerage for Owners</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-lg sm:text-xl font-extrabold text-primary-navy tracking-tight block">
                    6+
                  </span>
                  <p className="text-[11px] sm:text-xs text-text-muted">Major Metro Hubs</p>
                </div>
              </div>
            </div>

            {/* Right Column: Featured Verified Property Visual Card */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="w-full max-w-md lg:max-w-none space-y-3">
                <div className="relative rounded-3xl overflow-hidden border border-border-default bg-white shadow-soft-xl group transition-all duration-300 hover:shadow-soft-2xl">
                  {/* High Quality Photograph */}
                  <div className="relative h-[320px] sm:h-[380px] lg:h-[430px] w-full overflow-hidden bg-slate-100">
                    <Image
                      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                      alt="Luxury Verified Indian Real Estate Residence"
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Top-Left Verified Badge */}
                    <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-primary-navy text-xs font-bold shadow-soft border border-success-green/30">
                      <ShieldCheck className="w-4 h-4 text-success-green shrink-0" />
                      <span>✓ RERA VERIFIED</span>
                    </div>

                    {/* Top-Right Showcase Pill */}
                    <div className="absolute top-4 right-4 z-10 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-navy/90 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20 shadow-soft-xs">
                      <Sparkles className="w-3 h-3 text-accent-gold shrink-0" />
                      <span>Featured Showcase</span>
                    </div>

                    {/* Bottom Gradient Overlay (Behind Text Only) */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark-navy/95 via-dark-navy/75 to-transparent pt-16 pb-5 px-5 text-white space-y-2 z-10">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                          ₹ 3.85 Cr
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-accent-gold/25 text-accent-gold text-[11px] font-bold border border-accent-gold/40 backdrop-blur-xs">
                          Ready to Move
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1 group-hover:text-accent-gold transition-colors">
                        Lodha Bellissimo Luxury Residences
                      </h3>

                      <p className="text-xs text-white/85 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                        <span>Lower Parel, Mumbai • 3 BHK • 1,680 sq.ft</span>
                      </p>

                      <div className="pt-1.5 flex items-center justify-between border-t border-white/15 text-[11px]">
                        <span className="text-white/70">Verified Legal Title Deed</span>
                        <Link
                          href="/buy?city=Mumbai"
                          className="font-bold text-accent-gold hover:text-white transition-colors inline-flex items-center gap-1"
                        >
                          Explore Mumbai Properties →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trust Guarantee Strip under image card */}
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-text-secondary px-2">
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success-green shrink-0" />
                    <span>RERA Clear</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success-green shrink-0" />
                    <span>Zero Brokerage</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success-green shrink-0" />
                    <span>Instant Visit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* 2. FEATURED PROPERTIES */}
      {/* ========================================================================= */}
      <section id="featured-properties" className="py-16 md:py-20 bg-bg-light">
        <Container className="space-y-8">
          {/* Section Header with Category Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-default pb-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-gold-hover mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Handpicked & Verified
              </div>
              <h2 className="heading-section text-primary-navy">
                Featured Properties {selectedCityFilter !== "All" && `in ${selectedCityFilter}`}
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Direct owner and verified partner listings with government RERA registration.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPropertyCategory("all");
                  setSelectedCityFilter("All");
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  propertyCategory === "all" && selectedCityFilter === "All"
                    ? "bg-primary-navy text-white shadow-soft-xs"
                    : "bg-white text-text-secondary hover:text-text-primary border border-border-default hover:border-border-dark"
                }`}
              >
                All ({allProperties.length})
              </button>

              <button
                type="button"
                onClick={() => setPropertyCategory("apartment")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  propertyCategory === "apartment"
                    ? "bg-primary-navy text-white shadow-soft-xs"
                    : "bg-white text-text-secondary hover:text-text-primary border border-border-default hover:border-border-dark"
                }`}
              >
                Apartments
              </button>

              <button
                type="button"
                onClick={() => setPropertyCategory("villa")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  propertyCategory === "villa"
                    ? "bg-primary-navy text-white shadow-soft-xs"
                    : "bg-white text-text-secondary hover:text-text-primary border border-border-default hover:border-border-dark"
                }`}
              >
                Luxury Villas
              </button>

              <button
                type="button"
                onClick={() => setPropertyCategory("ready")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  propertyCategory === "ready"
                    ? "bg-primary-navy text-white shadow-soft-xs"
                    : "bg-white text-text-secondary hover:text-text-primary border border-border-default hover:border-border-dark"
                }`}
              >
                Ready to Move
              </button>
            </div>
          </div>

          {/* Properties Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-bg-light animate-pulse rounded-2xl border border-border-default" />
              ))}
            </div>
          ) : filteredProperties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {/* Link to Full Search & Discovery */}
              <div className="pt-4 flex justify-center">
                <Link
                  href={`/properties${
                    selectedCityFilter !== "All"
                      ? `?city=${encodeURIComponent(selectedCityFilter)}`
                      : ""
                  }`}
                >
                  <Button
                    variant="outline"
                    size="md"
                    className="font-bold text-xs shadow-soft-xs hover:border-primary-navy"
                  >
                    Explore All Properties with Advanced Filters &rarr;
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="py-16 text-center bg-white rounded-xl border border-border-default p-8 space-y-3">
              <Building2 className="w-10 h-10 text-text-muted mx-auto" />
              <h3 className="heading-card">No properties match your current filter</h3>
              <p className="text-xs text-text-secondary">
                Try selecting a different city or category to discover active verified listings.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCityFilter("All");
                  setPropertyCategory("all");
                }}
                className="mt-2 text-xs"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* 3. POST PROPERTY PROMOTIONAL BANNER */}
      {/* ========================================================================= */}
      <section className="py-12 bg-primary-navy text-white">
        <Container>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-gradient-to-r from-primary-navy-dark via-primary-navy to-primary-navy-light p-8 md:p-12 rounded-2xl border border-accent-gold/20 shadow-soft-lg">
            <div className="space-y-3 max-w-xl text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-gold/20 text-accent-gold text-xs font-bold uppercase tracking-wider border border-accent-gold/30">
                <Sparkles className="w-3.5 h-3.5" />
                Zero Brokerage for Direct Owners
              </span>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                Sell or Rent Your Property Faster
              </h2>
              <p className="text-sm text-text-muted">
                List your residential or commercial asset on TheVrindaGroup. Reach verified buyers and corporate tenants directly with zero commission.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <Link href="/post-property">
                <Button
                  variant="primary"
                  size="lg"
                  className="font-bold text-xs uppercase tracking-wider shadow-soft flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post Property Free
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* 4. EXPLORE TOP REAL ESTATE HUBS */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-20 bg-bg-light">
        <Container className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border-default pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent-gold-hover">
                Prime Urban Markets
              </span>
              <h2 className="heading-section text-primary-navy">
                Explore Real Estate by City
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Discover verified homes in high-growth corridors across major Indian metros.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {MOCK_CITIES.map((city) => (
              <CityCard
                key={city.id}
                city={city}
                onSelectCity={(cityName: string) => {
                  setSelectedCityFilter(cityName);
                  const el = document.getElementById("featured-properties");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* 4B. UPCOMING LUXURY PROJECTS */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-20 bg-white border-t border-border-default">
        <Container className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border-default pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent-gold-hover">
                New Launches &amp; Master-Planned Communities
              </span>
              <h2 className="heading-section text-primary-navy">
                Upcoming Luxury Projects
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Gated enclaves and integrated townships from Tier-1 builders with RERA approval.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {MOCK_PROJECTS.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* 5. RECOMMENDED PROPERTIES SECTION (Differentiated Value Focus) */}
      {/* ========================================================================= */}
      {allProperties.length > 0 && (
        <section className="py-16 md:py-20 bg-white border-t border-border-default">
          <Container className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border-default pb-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-success-green mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  High Demand &amp; Verified Value
                </div>
                <h2 className="heading-section text-primary-navy">
                  Recommended by TheVrindaGroup
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Popular homes selected for exceptional value, prime connectivity, and verified deeds.
                </p>
              </div>
              <span className="text-xs text-text-muted hidden sm:inline-block">
                Updated daily based on buyer inquiries
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {allProperties.slice(0, 4).map((property, idx) => (
                <PropertyCard
                  key={`rec-${property.id}`}
                  property={property}
                  badgeHighlight={RECOMMENDED_BADGES[idx % RECOMMENDED_BADGES.length]}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. WHY THEVRINDAGROUP (4 TRUST CARDS) */}
      {/* ========================================================================= */}
      <section id="why-thevrindagroup" className="py-16 md:py-20 bg-bg-light border-t border-border-default">
        <Container className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-gold-hover">
              Built on Trust & Transparency
            </span>
            <h2 className="heading-section text-primary-navy">
              Why TheVrindaGroup is India’s Preferred Marketplace
            </h2>
            <p className="text-sm text-text-secondary">
              We eliminate fake listings, spam calls, and hidden charges with our 4-pillar trust framework.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* Card 1 */}
            <div className="flex flex-col h-full rounded-xl border border-border-default bg-white p-6 shadow-soft hover:shadow-soft-md transition-all duration-200 space-y-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success-green-light text-success-green border border-success-green-border">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="heading-card text-text-primary">
                RERA Verified Properties
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed mt-auto">
                Every listed property undergoes strict validation against state RERA
                databases for title clearance and construction approvals.
              </p>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col h-full rounded-xl border border-border-default bg-white p-6 shadow-soft hover:shadow-soft-md transition-all duration-200 space-y-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-gold-light text-accent-gold-hover border border-accent-gold-muted">
                <Lock className="h-6 w-6" />
                <Lock className="h-6 w-6 hidden" />
              </div>
              <h3 className="heading-card text-text-primary">
                Direct Owner Contact
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed mt-auto">
                Connect directly with property owners and authorized developers without paying unfair broker commissions.
              </p>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col h-full rounded-xl border border-border-default bg-white p-6 shadow-soft hover:shadow-soft-md transition-all duration-200 space-y-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-navy/10 text-primary-navy border border-primary-navy/15">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="heading-card text-text-primary">
                Instant Site Visits
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed mt-auto">
                Schedule verified on-site inspections at your convenient date and time with accompanied assistance.
              </p>
            </div>

            {/* Card 4 */}
            <div className="flex flex-col h-full rounded-xl border border-border-default bg-white p-6 shadow-soft hover:shadow-soft-md transition-all duration-200 space-y-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="heading-card text-text-primary">
                Zero Hidden Charges
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed mt-auto">
                Complete transparency on carpet area, stamp duty, maintenance charges, and legal documentation.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* 7. OWNER POST PROPERTY CTA BANNER */}
      {/* ========================================================================= */}
      <section
        id="owner-cta"
        className="py-16 md:py-20 relative bg-primary-navy overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C59B27_1px,transparent_1px)] [background-size:16px_16px]" />

        <Container className="relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 rounded-2xl bg-primary-navy/70 border border-white/10 p-8 sm:p-12 shadow-soft-lg backdrop-blur-md">
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent-gold/20 text-accent-gold border border-accent-gold/30">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                Zero Brokerage for Property Owners
              </span>
              <h2 className="heading-page text-white tracking-tight">
                Are You a Property Owner?
              </h2>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                List your property on TheVrindaGroup and connect with genuine buyers and
                tenants across India. Get verified inquiries directly without middleman cuts.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-white/90">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                  <span className="font-semibold">100% Free Listing</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                  <span className="font-semibold">Verified Tenant Profiles</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent-gold shrink-0" />
                  <span className="font-semibold">Instant Callbacks</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <Link href="/post-property" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<PlusCircle className="w-5 h-5" />}
                  className="w-full sm:w-auto text-base font-bold shadow-soft-md h-12 px-7"
                >
                  Post Property FREE
                </Button>
              </Link>
              <p className="text-[11px] text-white/60 text-center">
                Takes less than 2 minutes • No hidden fees
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

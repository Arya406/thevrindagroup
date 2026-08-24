// ==============================================================================
// TheVrindaGroup - Featured Properties Component
// Live dynamic property grid connected to backend property service
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Building2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PropertyCard } from "@/components/marketplace/PropertyCard";
import { Property } from "@/types/property";
import { PropertyApiService } from "@/lib/services/property-api";

export function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;
    PropertyApiService.searchProperties({ limit: 12 })
      .then((res) => {
        if (isMounted) {
          setProperties(res.properties || []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProperties([]);
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

  const filtered = properties.filter((p) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "apartment") return p.propertyType === "apartment";
    if (selectedCategory === "villa") return p.propertyType === "villa";
    if (selectedCategory === "commercial")
      return (
        p.listingType === "commercial" ||
        p.propertyType === "commercial-office" ||
        p.propertyType === "retail-shop"
      );
    return true;
  });

  return (
    <section id="featured-properties" className="w-full bg-bg-light py-16 sm:py-24 border-b border-border-default font-sans">
      <Container>
        {/* Section Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-gold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Listings</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-heading text-dark-navy tracking-tight">
              Featured Properties in India
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
              Handpicked, verified listings with transparent pricing and zero brokerage.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white border border-border-default shadow-soft-xs">
            {[
              { id: "all", label: "All Properties" },
              { id: "apartment", label: "Apartments" },
              { id: "villa", label: "Villas & Houses" },
              { id: "commercial", label: "Commercial" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? "bg-dark-navy text-accent-gold shadow-soft-xs"
                    : "text-text-secondary hover:text-dark-navy hover:bg-bg-light"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-border-default bg-white p-4 space-y-4 animate-pulse"
              >
                <div className="w-full aspect-[4/3] rounded-xl bg-bg-light" />
                <div className="h-4 bg-bg-light rounded w-3/4" />
                <div className="h-3 bg-bg-light rounded w-1/2" />
                <div className="h-6 bg-bg-light rounded w-1/3 pt-2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filtered.length === 0 && (
          <div className="rounded-2xl border border-border-default bg-white p-12 text-center max-w-lg mx-auto shadow-soft-xs">
            <div className="w-12 h-12 rounded-full bg-bg-light text-text-muted flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-dark-navy mb-1">No Properties Found</h3>
            <p className="text-xs text-text-secondary mb-4">
              There are currently no properties matching the selected category.
            </p>
            <Link
              href="/post-property"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-dark-navy bg-accent-gold px-4 py-2 rounded-lg hover:bg-accent-gold-hover transition-colors"
            >
              List the First Property
            </Link>
          </div>
        )}

        {/* Properties Grid */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.slice(0, 6).map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/buy"
            className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-bg-light text-dark-navy border border-border-default font-bold text-sm px-6 py-3 shadow-soft-xs hover:shadow-soft-md transition-all group"
          >
            <span>Explore All Verified Properties</span>
            <ArrowRight className="w-4 h-4 text-accent-gold group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </Container>
    </section>
  );
}

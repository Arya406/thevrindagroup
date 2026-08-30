"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Building2,
  ArrowRight,
  ShieldCheck,
  Search,
  PlusCircle,
  Home,
} from "lucide-react";
import { Container, Button, Card } from "@/components/ui";
import { PropertyCard } from "@/components/marketplace/PropertyCard";
import { CommercialPropertyCard } from "@/components/commercial/CommercialPropertyCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateBreadcrumbJsonLd } from "@/lib/seo/structured-data";
import { toLocationSlug } from "@/lib/seo/location-slugs";
import { Property } from "@/types/property";
import { CanonicalState } from "@/data/location/canonicalLocations";
import { mapPropertyToCommercialProperty } from "@/lib/services/property-api";

export interface LocationLandingViewProps {
  transactionType: "buy" | "rent" | "commercial";
  state: CanonicalState;
  district: string | null;
  properties: Property[];
  activeDistricts?: string[];
  totalCount: number;
}

export function LocationLandingView({
  transactionType,
  state,
  district,
  properties,
  activeDistricts = [],
  totalCount,
}: LocationLandingViewProps) {
  const stateSlug = toLocationSlug(state.name);
  const districtSlug = district ? toLocationSlug(district) : null;

  // Base paths based on transactionType
  const basePath =
    transactionType === "rent"
      ? "/property-for-rent"
      : transactionType === "commercial"
      ? "/commercial-property"
      : "/property-for-sale";

  const marketPath =
    transactionType === "rent"
      ? "/rent"
      : transactionType === "commercial"
      ? "/commercial"
      : "/buy";

  const categoryLabel =
    transactionType === "rent"
      ? "Properties for Rent"
      : transactionType === "commercial"
      ? "Commercial Properties"
      : "Properties for Sale";

  const locationTitle = district
    ? `${district}, ${state.name}`
    : state.name;

  const h1Title = `${categoryLabel} in ${locationTitle}`;

  // Breadcrumbs data
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: categoryLabel, url: marketPath },
    {
      name: state.name,
      url: `${basePath}/${stateSlug}`,
    },
    ...(district && districtSlug
      ? [
          {
            name: district,
            url: `${basePath}/${stateSlug}/${districtSlug}`,
          },
        ]
      : []),
  ];

  return (
    <div className="py-6 sm:py-8 bg-bg-light min-h-screen font-sans text-text-primary">
      {/* Schema.org Breadcrumb JSON-LD */}
      <JsonLd
        id="location-breadcrumb-schema"
        data={generateBreadcrumbJsonLd(breadcrumbItems)}
      />

      <Container className="space-y-8">
        {/* Visible Crawlable Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-xs text-text-secondary flex flex-wrap items-center gap-1.5">
          <Link href="/" className="hover:text-primary-navy transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-text-muted" />
            Home
          </Link>
          <span className="text-text-muted">/</span>
          <Link href={marketPath} className="hover:text-primary-navy transition-colors">
            {categoryLabel}
          </Link>
          <span className="text-text-muted">/</span>
          {district ? (
            <>
              <Link href={`${basePath}/${stateSlug}`} className="hover:text-primary-navy transition-colors">
                {state.name}
              </Link>
              <span className="text-text-muted">/</span>
              <span className="font-semibold text-primary-navy">{district}</span>
            </>
          ) : (
            <span className="font-semibold text-primary-navy">{state.name}</span>
          )}
        </nav>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl border border-border-default p-6 sm:p-8 shadow-soft-xs space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-navy text-accent-gold">
              <Building2 className="w-3.5 h-3.5" />
              {transactionType === "rent"
                ? "Rental Hub"
                : transactionType === "commercial"
                ? "Commercial Hub"
                : "Residential Sale"}
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-bg-light border border-border-subtle text-text-secondary">
              <MapPin className="w-3.5 h-3.5 text-accent-gold" />
              {district ? `District: ${district}` : `${state.type === "UT" ? "Union Territory" : "State"}: ${state.name}`}
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-success-green bg-success-green-light border border-success-green/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Verified Listings
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary-navy tracking-tight">
              {h1Title}
            </h1>

            <p className="text-xs sm:text-sm text-text-secondary max-w-3xl leading-relaxed">
              Explore verified {categoryLabel.toLowerCase()} in {locationTitle}. Browse verified apartments, independent houses, villas, and commercial spaces listed directly by owners and certified agents on TheVrindaGroup.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border-subtle text-xs text-text-secondary">
            <div>
              <strong className="text-primary-navy font-bold text-sm">
                {totalCount}
              </strong>{" "}
              {totalCount === 1 ? "Property Available" : "Properties Available"}
            </div>
            <span className="text-border-default">•</span>
            <div>Zero Brokerage on Direct Owner Properties</div>
            <span className="text-border-default">•</span>
            <div>RERA Compliance Verified</div>
          </div>
        </div>

        {/* Property Grid or Empty State */}
        {properties.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-primary-navy">
                Featured & Verified Listings in {district || state.name}
              </h2>
              <span className="text-xs font-semibold text-accent-gold">
                Showing {properties.length} of {totalCount}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {transactionType === "commercial"
                ? properties.map((p) => (
                    <CommercialPropertyCard
                      key={p.id}
                      property={mapPropertyToCommercialProperty(p)}
                    />
                  ))
                : properties.map((p) => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
            </div>

            {totalCount > properties.length && (
              <div className="text-center pt-6">
                <Link
                  href={`${marketPath}?state=${encodeURIComponent(state.name)}${
                    district ? `&district=${encodeURIComponent(district)}` : ""
                  }`}
                >
                  <Button variant="outline" className="text-xs font-bold">
                    View All {totalCount} Properties in Marketplace &rarr;
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Elegant Empty State with Helpful Navigation */
          <Card className="p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto border border-border-default">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-primary-navy">
                No active {categoryLabel.toLowerCase()} currently in {locationTitle}
              </h2>
              <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                We are actively expanding our verified listings in this region. You can post your own property here with zero brokerage or browse available listings across the state.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/post-property">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<PlusCircle className="w-4 h-4" />}
                  className="text-xs font-bold"
                >
                  Post Property in {district || state.name}
                </Button>
              </Link>

              {district ? (
                <Link href={`${basePath}/${stateSlug}`}>
                  <Button variant="outline" size="sm" className="text-xs font-bold">
                    Browse All in {state.name}
                  </Button>
                </Link>
              ) : (
                <Link href={marketPath}>
                  <Button variant="outline" size="sm" className="text-xs font-bold">
                    Browse National Marketplace
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        )}

        {/* Active Districts Hub (Only on State Pages & Only with Published Inventory) */}
        {!district && activeDistricts.length > 0 && (
          <div className="bg-white rounded-2xl border border-border-default p-6 sm:p-8 space-y-4">
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-primary-navy flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent-gold" />
                Districts with Active {categoryLabel} in {state.name}
              </h2>
              <p className="text-xs text-text-secondary">
                Explore local real estate inventory across active districts in {state.name}.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {activeDistricts.map((distName) => {
                const distSlug = toLocationSlug(distName);
                return (
                  <Link
                    key={distName}
                    href={`${basePath}/${stateSlug}/${distSlug}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-bg-light hover:bg-slate-100/80 border border-border-subtle hover:border-accent-gold/40 text-xs font-medium text-text-primary transition-all group"
                  >
                    <span className="group-hover:text-primary-navy font-semibold truncate">
                      {distName}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent-gold transition-transform group-hover:translate-x-0.5 shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* District Backlink Card (Only on District Pages) */}
        {district && (
          <div className="bg-white rounded-xl border border-border-default p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-primary-navy">
                Looking for more options in {state.name}?
              </h3>
              <p className="text-xs text-text-secondary">
                Explore all verified {categoryLabel.toLowerCase()} listed across {state.name}.
              </p>
            </div>

            <Link href={`${basePath}/${stateSlug}`}>
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-bold hover:border-primary-navy shrink-0"
              >
                View {state.name} Directory &rarr;
              </Button>
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}

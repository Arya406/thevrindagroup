"use client";

import React from "react";
import { Building2, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { Property } from "@/types/property";
import { PropertyCard } from "./PropertyCard";

export interface EmptyResultsProps {
  onClearFilters: () => void;
  recommendedProperties?: Property[];
}

export function EmptyResults({
  onClearFilters,
  recommendedProperties = [],
}: EmptyResultsProps) {
  return (
    <div className="space-y-10 py-6">
      {/* Empty State Banner Card */}
      <div className="rounded-2xl border border-border-default bg-white p-8 sm:p-12 text-center shadow-soft space-y-4 max-w-2xl mx-auto">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-light text-primary-navy mx-auto border border-border-default">
          <Building2 className="h-7 w-7 text-accent-gold" />
        </div>

        <div className="space-y-1.5">
          <h3 className="heading-section text-primary-navy">
            No Properties Found Matching Your Criteria
          </h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            We couldn’t find exact matches for your combined filters. Try broadening
            your budget range, selecting all BHKs, or resetting filters.
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={onClearFilters}
            leftIcon={<RotateCcw className="w-4 h-4" />}
            className="font-bold shadow-soft-xs"
          >
            Reset All Filters
          </Button>
        </div>
      </div>

      {/* Suggested Alternative Listings */}
      {recommendedProperties.length > 0 && (
        <div className="space-y-6">
          <div className="border-b border-border-default pb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-gold-hover mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Alternative Recommendations
            </div>
            <h4 className="text-xl font-bold text-primary-navy">
              Popular Verified Properties You Might Like
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedProperties.slice(0, 3).map((property) => (
              <PropertyCard key={`alt-${property.id}`} property={property} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmptyResults;

// ==============================================================================
// TheVrindaGroup - Rent Coming Soon Component
// Invariant: RENT MUST NEVER OPEN THE SELL FORM.
// ==============================================================================

"use client";

import React from "react";
import Link from "next/link";
import { Clock, ArrowLeft, Building2, Tag, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui";

interface RentComingSoonProps {
  onBack: () => void;
  onSelectSell: () => void;
}

export function RentComingSoon({ onBack, onSelectSell }: RentComingSoonProps) {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 animate-in fade-in duration-200">
      <div className="rounded-3xl border border-border-default bg-white p-8 sm:p-10 shadow-soft text-center space-y-6">
        {/* Back navigation button */}
        <div className="flex items-center justify-start">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary-navy transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Options</span>
          </button>
        </div>

        {/* Status Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600">
          <Clock className="h-8 w-8" />
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20 text-xs font-bold uppercase tracking-wide">
            <span>RENTAL MARKETPLACE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy tracking-tight">
            Rent Listing is Coming Soon
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            We are actively preparing our dedicated rental listing flow. Soon you will be able to list residential flats, houses, and commercial spaces for rent with verified tenants and zero brokerage.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
          <div className="p-3.5 rounded-2xl bg-bg-light/80 border border-border-subtle flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-primary-navy">Verified Tenants</h4>
              <p className="text-[11px] text-text-muted mt-0.5">
                Pre-screened profiles and direct tenant leads.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-bg-light/80 border border-border-subtle flex items-start gap-3">
            <Building2 className="w-4 h-4 text-primary-navy shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-primary-navy">Zero Brokerage</h4>
              <p className="text-[11px] text-text-muted mt-0.5">
                List 100% free with complete owner autonomy.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={onBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="w-full sm:w-auto text-xs font-bold"
          >
            Back to Options
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onSelectSell}
            leftIcon={<Tag className="w-4 h-4" />}
            className="w-full sm:w-auto text-xs font-extrabold shadow-soft-xs"
          >
            List a Property for Sale
          </Button>

          <Link href="/rent" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              leftIcon={<Search className="w-4 h-4" />}
              className="w-full sm:w-auto text-xs font-bold border-border-default"
            >
              Browse Rentals
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

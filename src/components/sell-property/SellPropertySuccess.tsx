// ==============================================================================
// TheVrindaGroup - Sell Property Success / Verification Pending Component
// ==============================================================================

"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Building2, MapPin, Tag, ArrowRight, PlusCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui";
import { SubmittedPropertyResult } from "@/types/sellProperty";

interface SellPropertySuccessProps {
  property: SubmittedPropertyResult;
  onReset: () => void;
}

export function SellPropertySuccess({ property, onReset }: SellPropertySuccessProps) {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      <div className="rounded-2xl border border-border-default bg-white p-6 sm:p-10 shadow-soft text-center">
        {/* Success Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-dark-navy tracking-tight">
          Property Submitted
        </h1>

        {/* Status Badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1 text-xs font-semibold text-amber-800">
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>Verification Pending</span>
        </div>

        {/* Reference Code Box */}
        <div className="mt-6 rounded-xl bg-bg-light border border-border-default/60 p-4 text-left sm:text-center">
          <div className="text-xs font-medium text-text-muted uppercase tracking-wider">
            Property Reference ID
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-dark-navy mt-1 tracking-wide select-all">
            {property.referenceCode}
          </div>
        </div>

        {/* Summary Card */}
        <div className="mt-6 rounded-xl border border-border-default p-4 sm:p-5 text-left bg-white shadow-soft-xs space-y-3">
          <div className="font-semibold text-dark-navy text-base leading-snug">
            {property.title}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border-default text-xs text-text-secondary">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-accent-gold shrink-0" />
              <span className="capitalize">{property.subtype} ({property.category})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-accent-gold shrink-0" />
              <span className="truncate">{property.locality}, {property.city}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-accent-gold shrink-0" />
              <span className="font-semibold text-dark-navy">{property.price}</span>
            </div>
          </div>
        </div>

        {/* Informative message */}
        <div className="mt-6 rounded-xl bg-blue-50/70 border border-blue-100 p-4 text-left text-xs sm:text-sm text-blue-900 leading-relaxed flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-950">What happens next?</p>
            <p className="mt-1 text-blue-800">
              Your property has been submitted to TheVrindaGroup. Our team will contact you shortly to verify the details and help complete your listing.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/account/properties" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full justify-center gap-2">
              <span>View My Properties</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={onReset}
            className="w-full sm:w-auto justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-accent-gold" />
            <span>Submit Another Property</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// TheVrindaGroup - Transaction Intent Selector (Sell vs. Rent Entry Selection)
// ==============================================================================

"use client";

import React from "react";
import { Tag, Key, ArrowRight, Sparkles, Clock, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui";

interface TransactionIntentSelectorProps {
  onSelectIntent: (intent: "sell" | "rent") => void;
}

export function TransactionIntentSelector({ onSelectIntent }: TransactionIntentSelectorProps) {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent-gold/15 text-accent-gold-hover border border-accent-gold/25 text-xs font-extrabold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>LIST YOUR PROPERTY • THEVRINDAGROUP</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-primary-navy tracking-tight">
          What do you want to do?
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-lg mx-auto">
          Choose whether you want to sell your property or list it for rent to verified buyers and tenants across India.
        </p>
      </div>

      {/* 2-Option Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* OPTION 1: SELL PROPERTY */}
        <div
          onClick={() => onSelectIntent("sell")}
          className="group relative rounded-3xl border-2 border-border-default hover:border-primary-navy bg-white p-7 sm:p-8 shadow-soft hover:shadow-soft-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-primary-navy text-white flex items-center justify-center shadow-soft-sm group-hover:scale-105 transition-transform">
                <Tag className="w-7 h-7 text-accent-gold" />
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Quick Listing Active</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-primary-navy group-hover:text-accent-gold-hover transition-colors">
                Sell Property
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                List residential apartments, standalone houses, villas, plots/land, or commercial properties for sale. Connect directly with verified buyers.
              </p>
            </div>

            <div className="pt-2 border-t border-border-subtle flex flex-wrap gap-2 text-[11px] text-text-muted">
              <span className="bg-bg-light px-2.5 py-1 rounded-lg font-medium text-primary-navy">
                Residential
              </span>
              <span className="bg-bg-light px-2.5 py-1 rounded-lg font-medium text-primary-navy">
                Plot / Land
              </span>
              <span className="bg-bg-light px-2.5 py-1 rounded-lg font-medium text-primary-navy">
                Commercial
              </span>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-border-subtle">
            <Button
              variant="primary"
              size="md"
              onClick={() => onSelectIntent("sell")}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full text-xs font-bold shadow-soft-xs"
            >
              List for Sale
            </Button>
          </div>
        </div>

        {/* OPTION 2: RENT PROPERTY */}
        <div
          onClick={() => onSelectIntent("rent")}
          className="group relative rounded-3xl border-2 border-border-default hover:border-accent-gold bg-white p-7 sm:p-8 shadow-soft hover:shadow-soft-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center shadow-soft-sm group-hover:scale-105 transition-transform">
                <Key className="w-7 h-7 text-amber-600" />
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-700">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Coming Soon</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-primary-navy group-hover:text-accent-gold-hover transition-colors">
                Rent Property
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                List flats, independent homes, or commercial spaces for rent or lease. Find verified tenants with zero platform brokerage.
              </p>
            </div>

            <div className="pt-2 border-t border-border-subtle flex flex-wrap gap-2 text-[11px] text-text-muted">
              <span className="bg-bg-light px-2.5 py-1 rounded-lg font-medium text-text-secondary">
                Residential Rentals
              </span>
              <span className="bg-bg-light px-2.5 py-1 rounded-lg font-medium text-text-secondary">
                Commercial Lease
              </span>
            </div>
          </div>

          <div className="pt-6 mt-4 border-t border-border-subtle">
            <Button
              variant="outline"
              size="md"
              onClick={() => onSelectIntent("rent")}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full text-xs font-bold border-border-default hover:border-primary-navy"
            >
              List for Rent
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Trust Note */}
      <div className="rounded-2xl bg-primary-navy/5 border border-primary-navy/10 p-4 text-center text-xs text-text-secondary flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-accent-gold shrink-0" />
        <span>
          100% Free property listing with zero hidden charges. Manage your listings anytime from My Account.
        </span>
      </div>
    </div>
  );
}

// ==============================================================================
// TheVrindaGroup - Final Call To Action Component
// Trust-centered conversion section leading to buying and direct selling flows
// ==============================================================================

import React from "react";
import Link from "next/link";
import { ArrowRight, PlusCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";

export function FinalCTA() {
  return (
    <section className="relative w-full bg-dark-navy text-white py-16 sm:py-24 font-sans overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-accent-gold/10 blur-[120px] pointer-events-none" />

      <Container className="relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-accent-gold/40 px-4 py-1.5 shadow-soft-sm">
            <Sparkles className="w-4 h-4 text-accent-gold shrink-0" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Start Your Real Estate Journey Today
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-5xl font-black font-heading text-white tracking-tight leading-tight">
            Ready to make your next move?
          </h2>

          {/* Supporting Text */}
          <p className="text-base sm:text-xl text-white/80 font-medium max-w-xl mx-auto leading-relaxed">
            Buy your dream property or sell to the right buyer with verified confidence and zero brokerage.
          </p>

          {/* Two CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {/* Primary: Find a Property */}
            <Link
              href="/buy"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-accent-gold hover:bg-accent-gold-hover text-dark-navy font-bold text-base px-8 py-4 shadow-soft-md transition-all duration-150 active:scale-[0.99]"
            >
              <span>Find a Property</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Link>

            {/* Secondary: Sell Your Property -> /post-property */}
            <Link
              href="/post-property"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md font-bold text-base px-8 py-4 shadow-soft-xs transition-all duration-150 active:scale-[0.99]"
            >
              <PlusCircle className="w-4 h-4 text-accent-gold shrink-0" />
              <span>Sell Your Property</span>
              <span className="rounded bg-accent-gold px-1.5 py-0.5 text-[10px] font-black uppercase text-dark-navy ml-1">
                FREE
              </span>
            </Link>
          </div>

          {/* Trust Footnote */}
          <div className="flex items-center justify-center gap-6 pt-4 text-xs font-semibold text-white/60">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-accent-gold" />
              100% Verified Listings
            </span>
            <span className="text-white/30">•</span>
            <span>Zero Brokerage Option</span>
            <span className="text-white/30">•</span>
            <span>Direct Owner Contact</span>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ==============================================================================
// TheVrindaGroup - Hero Section Component
// Viewport-Fit & No-Scroll Above-the-Fold Landing Experience (100svh)
// ==============================================================================

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, PlusCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { HeroSearchCard, HeroSearchCardProps } from "./HeroSearchCard";
import { CompactTrustStrip } from "./CompactTrustStrip";

export interface HeroSectionProps {
  onSearchSubmit?: HeroSearchCardProps["onSearchSubmit"];
}

export function HeroSection({ onSearchSubmit }: HeroSectionProps) {
  const router = useRouter();

  const scrollToSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("search-card");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      router.push("/buy");
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-dark-navy font-sans min-h-[calc(100svh-64px)] lg:h-[calc(100svh-64px)] flex flex-col justify-between select-none">
      {/* Background Image: Indian Couple Key Handover Trust Scene */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src="/hero-trust-banner.jpg"
          alt="Happy Indian couple receiving dream home keys from real estate advisor"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center sm:object-[center_28%]"
        />
        {/* Cinematic Dual-Tone Dark Navy Gradient Overlay for Crystal Clear Typography */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-navy/95 via-dark-navy/85 to-dark-navy/60 backdrop-brightness-[0.88]" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-navy via-transparent to-dark-navy/35" />
      </div>

      {/* Hero Foreground Content - Vertically Centered */}
      <Container className="relative z-10 flex-1 flex flex-col justify-center py-2.5 sm:py-3.5 lg:py-4">
        <div className="max-w-4xl space-y-2 sm:space-y-2.5 lg:space-y-3">
          {/* Trust Pill Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-accent-gold/40 px-2.5 sm:px-3 py-0.5 shadow-soft-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-gold shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold tracking-wide text-white uppercase">
              100% VERIFIED LISTINGS <span className="text-accent-gold mx-1">•</span> ZERO BROKERAGE
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-[clamp(1.6rem,2.5vw,2.4rem)] xl:text-[clamp(1.85rem,3vw,2.75rem)] font-black font-heading text-white tracking-tight leading-[1.08]">
            BUY WITH <span className="text-accent-gold">CONFIDENCE.</span>{" "}
            SELL WITH <span className="text-accent-gold">TRUST.</span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-xs sm:text-sm lg:text-[13px] text-white/85 font-medium leading-snug max-w-xl">
            Verified properties. Genuine owners. Transparent deals. The better way to buy or sell real estate in India.
          </p>

          {/* Primary & Secondary Hero CTAs + Trust Points Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 pt-0.5">
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={scrollToSearch}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent-gold hover:bg-accent-gold-hover text-dark-navy font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 shadow-soft-xs transition-all duration-150 active:scale-[0.99] cursor-pointer shrink-0"
              >
                <span>Find a Property</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>

              <Link
                href="/post-property"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md font-bold text-xs sm:text-sm px-4 sm:px-4.5 py-2 shadow-soft-xs transition-all duration-150 active:scale-[0.99] shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                <span>Sell Your Property</span>
                <span className="rounded bg-accent-gold px-1 py-0.2 text-[9px] font-black uppercase text-dark-navy ml-0.5">
                  FREE
                </span>
              </Link>
            </div>

            {/* Inline Live Highlights */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-white/80 text-[10px] sm:text-xs font-medium border-t sm:border-t-0 sm:border-l border-white/15 pt-1.5 sm:pt-0 sm:pl-3">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                <span>Direct Owner Contacts</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                <span>Zero Middleman Markup</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                <span>RERA Verified Listings</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Card */}
        <div className="mt-2.5 sm:mt-3 lg:mt-3.5">
          <HeroSearchCard onSearchSubmit={onSearchSubmit} />
        </div>
      </Container>

      {/* Bottom Anchored Trust Benefits Strip */}
      <CompactTrustStrip />
    </section>
  );
}

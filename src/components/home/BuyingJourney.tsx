// ==============================================================================
// TheVrindaGroup - Buying Journey Component
// 5-Step Horizontal Flow showing how simple and transparent buying is
// ==============================================================================

import React from "react";
import Link from "next/link";
import { Search, GitCompare, MessageSquare, CalendarCheck, Home, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

const BUYING_STEPS = [
  {
    step: "01",
    icon: Search,
    title: "Search",
    subtitle: "Find the right property",
    description: "Explore 100% verified listings with advanced locality, budget, and BHK filters.",
  },
  {
    step: "02",
    icon: GitCompare,
    title: "Compare",
    subtitle: "Shortlist the best options",
    description: "Compare price per sq.ft, carpet area, amenities, and location advantages side by side.",
  },
  {
    step: "03",
    icon: MessageSquare,
    title: "Connect",
    subtitle: "Direct owner connection",
    description: "Connect directly with verified property owners or official project representatives.",
  },
  {
    step: "04",
    icon: CalendarCheck,
    title: "Visit",
    subtitle: "Schedule a guided visit",
    description: "Book on-site or virtual property walkthroughs at your preferred date and time.",
  },
  {
    step: "05",
    icon: Home,
    title: "Buy",
    subtitle: "Make a confident decision",
    description: "Close your deal with verified legal documentation, transparent pricing, and zero surprises.",
  },
];

export function BuyingJourney() {
  return (
    <section className="w-full bg-white py-14 sm:py-20 border-b border-border-default font-sans">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-gold uppercase tracking-widest">
              Buyer Experience
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-dark-navy tracking-tight">
              Buying a Property is Simple
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
              A transparent, step-by-step path to your dream home without middlemen confusion.
            </p>
          </div>

          <Link
            href="/buy"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-dark-navy hover:text-accent-gold transition-colors group shrink-0"
          >
            <span>Explore Buying Marketplace</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 5-Step Horizontal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {BUYING_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="relative rounded-2xl border border-border-default bg-white p-5 sm:p-6 shadow-soft-xs hover:shadow-soft-md hover:border-accent-gold/50 transition-all duration-200 flex flex-col justify-between group"
              >
                {/* Step Number Top Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black font-mono text-accent-gold bg-accent-gold/10 px-2.5 py-1 rounded-lg">
                    STEP {item.step}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-dark-navy text-accent-gold flex items-center justify-center group-hover:bg-accent-gold group-hover:text-dark-navy transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold font-heading text-dark-navy">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-accent-gold-hover">
                    {item.subtitle}
                  </p>
                  <p className="text-xs text-text-secondary leading-relaxed pt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

// ==============================================================================
// TheVrindaGroup - Platform Statistics Component
// Trust-centered statistics communicating platform reliability across India
// ==============================================================================

import React from "react";
import { ShieldCheck, Award, MapPin, Headphones } from "lucide-react";
import { Container } from "@/components/ui/Container";

const STATS = [
  {
    icon: ShieldCheck,
    value: "100%",
    label: "Verified Listings",
    description: "Every property goes through internal verification before public display.",
  },
  {
    icon: Award,
    value: "0%",
    label: "Hidden Brokerage",
    description: "Direct owner connections with zero hidden commission or markup.",
  },
  {
    icon: MapPin,
    value: "8+",
    label: "Top Metro Cities",
    description: "Active prime inventory in Bangalore, Mumbai, Delhi-NCR, Hyderabad & more.",
  },
  {
    icon: Headphones,
    value: "24/7",
    label: "Verification Support",
    description: "Dedicated real estate advisory and owner support at every stage.",
  },
];

export function PlatformStats() {
  return (
    <section className="w-full bg-bg-light py-12 sm:py-16 border-b border-border-default font-sans">
      <Container>
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-2">
          <span className="text-xs font-bold text-accent-gold uppercase tracking-widest">
            Platform Metrics
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-dark-navy tracking-tight">
            Trusted by Thousands of Families Across India
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
            Built on absolute transparency, verified listings, and direct owner relationships.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {STATS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-2xl border border-border-default bg-white p-6 text-center shadow-soft-xs hover:shadow-soft-md hover:border-accent-gold/40 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-dark-navy/5 text-dark-navy flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-accent-gold" />
                </div>
                <p className="text-3xl sm:text-4xl font-black font-heading text-dark-navy tracking-tight mb-1">
                  {item.value}
                </p>
                <p className="text-sm font-bold text-dark-navy mb-2">
                  {item.label}
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

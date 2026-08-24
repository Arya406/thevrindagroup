// ==============================================================================
// TheVrindaGroup - Trust Benefits Bar Component
// 4-Column Luxury Trust Strip highlighting the core platform pillars
// ==============================================================================

import React from "react";
import { ShieldCheck, UserCheck, Percent, FileCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";

const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: "VERIFIED PROPERTIES",
    description: "Every listing verified for your peace of mind.",
    badge: "100% Verified",
  },
  {
    icon: UserCheck,
    title: "GENUINE OWNERS",
    description: "Connect directly with verified property owners.",
    badge: "Direct Contact",
  },
  {
    icon: Percent,
    title: "ZERO BROKERAGE",
    description: "No hidden charges. What you see is what you get.",
    badge: "₹0 Commission",
  },
  {
    icon: FileCheck,
    title: "TRANSPARENT DEALS",
    description: "Clear pricing and complete transparency in every transaction.",
    badge: "Clear Titles",
  },
];

export function TrustBenefitsBar() {
  return (
    <section className="relative z-20 w-full bg-white border-b border-border-default shadow-soft-xs py-8 sm:py-10 font-sans">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {TRUST_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="group relative flex items-start gap-4 p-4 rounded-2xl border border-border-subtle bg-bg-light/40 hover:bg-white hover:border-accent-gold/40 hover:shadow-soft-md transition-all duration-200"
              >
                {/* Gold/Navy Icon Circle */}
                <div className="w-12 h-12 rounded-xl bg-dark-navy text-accent-gold group-hover:bg-accent-gold group-hover:text-dark-navy flex items-center justify-center shrink-0 shadow-soft-xs transition-colors duration-200">
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs sm:text-sm font-black font-heading text-dark-navy tracking-wider uppercase">
                      {pillar.title}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                    {pillar.description}
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

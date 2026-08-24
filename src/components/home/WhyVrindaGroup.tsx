// ==============================================================================
// TheVrindaGroup - Why Choose TheVrindaGroup Component
// 4 Strong Value Cards communicating platform integrity, trust, and transparency
// ==============================================================================

import React from "react";
import { ShieldCheck, UserCheck, Percent, FileCheck, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";

const VALUE_CARDS = [
  {
    icon: ShieldCheck,
    title: "Verified Properties",
    tagline: "100% Inspection & Title Check",
    description:
      "Every listing submitted is carefully moderated by our property desk. We confirm ownership details, genuine property images, and accurate pricing before public discovery.",
    points: [
      "Rigorous listing verification",
      "Authentic photographs & floor plans",
      "Accurate carpet area & specifications",
    ],
  },
  {
    icon: UserCheck,
    title: "Genuine Owners",
    tagline: "Direct Seller Relationships",
    description:
      "Connect directly with property owners and accredited developer desks. Say goodbye to middlemen confusion, redundant agent chains, and unsolicited calls.",
    points: [
      "Direct owner-to-buyer contact",
      "Account-verified phone numbers",
      "Zero unwanted third-party spam",
    ],
  },
  {
    icon: Percent,
    title: "Zero Brokerage",
    tagline: "Transparent ₹0 Commission",
    description:
      "Keep 100% of your property value. Direct seller listings carry zero brokerage fees, saving buyers and sellers lakhs in transaction costs.",
    points: [
      "Free listing submission for sellers",
      "Zero commission for direct buyers",
      "Complete pricing clarity",
    ],
  },
  {
    icon: FileCheck,
    title: "Transparent Deals",
    tagline: "Fair & Legal Confidence",
    description:
      "Experience real estate transactions grounded in clear documentation, transparent price negotiations, and complete legal peace of mind from inquiry to handover.",
    points: [
      "Clear legal status & approvals",
      "Fair, market-aligned pricing",
      "Dedicated transaction guidance",
    ],
  },
];

export function WhyVrindaGroup() {
  return (
    <section id="why-thevrindagroup" className="w-full bg-white py-16 sm:py-24 border-b border-border-default font-sans">
      <Container>
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-gold uppercase tracking-widest">
            The Vrinda Advantage
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold font-heading text-dark-navy tracking-tight">
            Why Choose TheVrindaGroup?
          </h2>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-medium">
            We make real estate simple, transparent and trustworthy for buyers and sellers across India.
          </p>
        </div>

        {/* 4 Value Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {VALUE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="rounded-2xl border border-border-default bg-white p-7 sm:p-8 shadow-soft-xs hover:shadow-soft-lg hover:border-accent-gold/40 transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Icon & Title Row */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-dark-navy text-accent-gold group-hover:bg-accent-gold group-hover:text-dark-navy flex items-center justify-center shrink-0 shadow-soft-xs transition-colors duration-200">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold font-heading text-dark-navy">
                        {card.title}
                      </h3>
                      <p className="text-xs font-bold text-accent-gold">
                        {card.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Body Text */}
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                    {card.description}
                  </p>
                </div>

                {/* Bullet Points */}
                <div className="mt-6 pt-5 border-t border-border-subtle space-y-2">
                  {card.points.map((pt) => (
                    <div key={pt} className="flex items-center gap-2 text-xs font-semibold text-dark-navy">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

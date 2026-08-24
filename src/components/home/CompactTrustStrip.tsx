// ==============================================================================
// TheVrindaGroup - Compact Trust Benefits Strip Component
// Compact 3-column trust banner (~60-75px height on desktop)
// ==============================================================================

import React from "react";
import Image from "next/image";
import { FileCheck2, Handshake, Percent } from "lucide-react";
import { Container } from "@/components/ui/Container";

const TRUST_BENEFITS = [
  {
    icon: FileCheck2,
    title: "Full Paperwork & Registry Support",
    subtitle: "Guidance throughout documentation",
  },
  {
    icon: Handshake,
    title: "Talk Directly to Genuine Buyers",
    subtitle: "Connect without intermediaries",
  },
  {
    icon: Percent,
    title: "No Broker Commission",
    subtitle: "Transparent property transactions",
  },
];

export function CompactTrustStrip() {
  return (
    <div className="relative w-full overflow-hidden bg-dark-navy/95 border-t border-white/10 shadow-soft-sm font-sans select-none">
      {/* Subtle Background Texture & Dark Navy Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-15">
        <Image
          src="/hero-trust-banner.jpg"
          alt="TheVrindaGroup Trust Backdrop"
          fill
          sizes="100vw"
          className="object-cover object-center brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-navy via-dark-navy/95 to-dark-navy" />
      </div>

      {/* Gold Ambient Accent Top Border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-gold/40 to-transparent" />

      {/* Content Container */}
      <Container className="relative z-10 py-2 sm:py-2.5 lg:py-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          {TRUST_BENEFITS.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className={`flex items-center gap-2.5 sm:gap-3 py-1.5 sm:py-1 ${
                  idx === 0
                    ? "sm:pr-3 lg:pr-5"
                    : idx === 1
                    ? "sm:px-3 lg:px-5"
                    : "sm:pl-3 lg:pl-5"
                }`}
              >
                {/* Compact Gold Accent Icon Box */}
                <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg bg-white/5 border border-accent-gold/30 text-accent-gold flex items-center justify-center shrink-0 shadow-soft-xs">
                  <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>

                {/* Text Content */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-[13px] font-bold text-white tracking-tight leading-tight truncate sm:whitespace-normal">
                    {benefit.title}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-white/70 leading-tight mt-0.5 truncate sm:whitespace-normal">
                    {benefit.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}

// ==============================================================================
// TheVrindaGroup - Selling Journey Component
// 5-Step Flow showcasing the frictionless zero-brokerage seller workflow
// ==============================================================================

import React from "react";
import Link from "next/link";
import { PlusCircle, ShieldCheck, Eye, PhoneCall, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";

const SELLING_STEPS = [
  {
    step: "01",
    icon: PlusCircle,
    title: "List",
    subtitle: "List your property for free",
    description: "Fill our single-page form in under 2 minutes. Add location, expected price, and optional photos.",
  },
  {
    step: "02",
    icon: ShieldCheck,
    title: "Verify",
    subtitle: "Get your listing verified",
    description: "Our dedicated verification team reviews details and links your account contact securely.",
  },
  {
    step: "03",
    icon: Eye,
    title: "Get Discovered",
    subtitle: "Reach genuine buyers",
    description: "Your listing goes live to thousands of high-intent active homebuyers and investors.",
  },
  {
    step: "04",
    icon: PhoneCall,
    title: "Connect",
    subtitle: "Direct buyer inquiries",
    description: "Receive verified buyer inquiries and schedule site visits directly on your terms.",
  },
  {
    step: "05",
    icon: CheckCircle2,
    title: "Close",
    subtitle: "Close with confidence",
    description: "Finalize your deal with zero brokerage commission, total pricing control, and peace of mind.",
  },
];

export function SellingJourney() {
  return (
    <section className="w-full bg-dark-navy text-white py-14 sm:py-20 border-b border-border-default font-sans relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-accent-gold/5 blur-3xl pointer-events-none" />
      <div className="absolute -left-32 -bottom-32 w-96 h-96 rounded-full bg-accent-gold/5 blur-3xl pointer-events-none" />

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-gold uppercase tracking-widest">
              Seller Experience • Zero Brokerage
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-white tracking-tight">
              Selling a Property is Easy
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
              List your property in under 2 minutes and connect with serious, verified buyers directly.
            </p>
          </div>

          <Link
            href="/post-property"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-gold hover:bg-accent-gold-hover text-dark-navy font-bold text-sm sm:text-base px-6 py-3 shadow-soft-sm transition-all duration-150 active:scale-[0.99] shrink-0"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Sell Your Property</span>
            <span className="rounded bg-dark-navy/20 px-1.5 py-0.5 text-[10px] font-black uppercase text-dark-navy ml-1">
              FREE
            </span>
          </Link>
        </div>

        {/* 5-Step Horizontal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {SELLING_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 sm:p-6 shadow-soft-xs hover:border-accent-gold/60 hover:bg-white/10 transition-all duration-200 flex flex-col justify-between group"
              >
                {/* Step Number Top Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black font-mono text-accent-gold bg-accent-gold/15 px-2.5 py-1 rounded-lg">
                    STEP {item.step}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-accent-gold text-dark-navy flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold font-heading text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-accent-gold">
                    {item.subtitle}
                  </p>
                  <p className="text-xs text-white/70 leading-relaxed pt-1">
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

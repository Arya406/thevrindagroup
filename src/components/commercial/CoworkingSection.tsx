"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { MOCK_COWORKING_OPTIONS } from "@/data/mockCommercial";
import { CoworkingSpaceOption } from "@/types/commercial";

export interface CoworkingSectionProps {
  onSelectOption?: (option: CoworkingSpaceOption) => void;
  className?: string;
}

export function CoworkingSection({
  onSelectOption,
  className = "",
}: CoworkingSectionProps) {
  const [selectedOption, setSelectedOption] = useState<CoworkingSpaceOption | null>(
    null
  );

  return (
    <div
      className={`rounded-2xl border border-border-default bg-white p-5 sm:p-7 shadow-soft space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border-subtle pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-accent-gold-hover uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-accent-gold" />
            <span>Agile Managed Workspaces</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-primary-navy mt-1">
            Flexible Workspace for Modern Businesses
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Instant move-in enterprise offices, dedicated desks, and virtual registrations across India.
          </p>
        </div>

        <span className="text-xs font-bold text-success-green bg-success-green-light px-3 py-1 rounded-full border border-success-green-border shrink-0">
          Zero Capex • Flexible Monthly Tenures
        </span>
      </div>

      {/* Grid of 5 Workspace Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
        {MOCK_COWORKING_OPTIONS.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col justify-between rounded-xl border border-border-default bg-bg-light/50 p-4 hover:bg-white hover:border-accent-gold hover:shadow-soft-md transition-all duration-200"
          >
            <div className="space-y-3">
              {/* Image thumbnail */}
              <div className="relative aspect-16/10 rounded-lg overflow-hidden bg-slate-200">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Title & Capacity */}
              <div>
                <span className="text-[10px] font-bold text-accent-gold-hover uppercase tracking-wider">
                  {item.type}
                </span>
                <h3 className="text-sm font-bold text-primary-navy leading-tight">
                  {item.title}
                </h3>
                <p className="text-[11px] text-text-muted mt-0.5">
                  {item.capacity}
                </p>
              </div>

              {/* Pricing */}
              <div className="pt-2 border-t border-border-subtle">
                <span className="text-[10px] text-text-muted block">Starting at</span>
                <div className="flex items-baseline gap-1">
                  <strong className="text-base font-bold text-primary-navy">
                    {item.startingPrice}
                  </strong>
                  <span className="text-[10px] text-text-secondary">
                    {item.pricingPeriod}
                  </span>
                </div>
              </div>

              {/* Amenities list */}
              <div className="space-y-1 pt-1">
                {item.amenities.slice(0, 3).map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-[11px] text-text-secondary"
                  >
                    <CheckCircle2 className="w-3 h-3 text-success-green shrink-0" />
                    <span className="truncate">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-4 mt-2 border-t border-border-subtle">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onSelectOption) onSelectOption(item);
                  else setSelectedOption(item);
                }}
                className="w-full text-xs font-semibold group-hover:bg-primary-navy group-hover:text-white group-hover:border-primary-navy transition-all"
              >
                Explore Workspace &rarr;
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal if directly clicked */}
      {selectedOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-navy/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-soft-xl border border-border-default space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-primary-navy">
              {selectedOption.title} Inquiry
            </h3>
            <p className="text-xs text-text-secondary">
              Flexible seating available in Bangalore (ORR, Koramangala), Mumbai (BKC, Powai), Gurugram (CyberHub), and Hyderabad (HITEC City).
            </p>
            <div className="p-3 rounded-lg bg-bg-light text-xs space-y-1">
              <p>
                <strong>Tier:</strong> {selectedOption.type}
              </p>
              <p>
                <strong>Capacity:</strong> {selectedOption.capacity}
              </p>
              <p>
                <strong>Base Rate:</strong> {selectedOption.startingPrice} {selectedOption.pricingPeriod}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedOption(null)}
                className="w-1/2 text-xs"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  alert("Our corporate workspace advisor will contact you within 15 minutes.");
                  setSelectedOption(null);
                }}
                className="w-1/2 text-xs font-bold"
              >
                Get Custom Quote
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoworkingSection;

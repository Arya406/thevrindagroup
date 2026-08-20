"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  MapPin,
  Maximize2,
  Building2,
  Car,
  PhoneCall,
  Briefcase,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button, ReraBadge, OwnerBadge, AgentBadge } from "@/components/ui";
import { CommercialProperty } from "@/types/commercial";
import { useAuth } from "@/lib/auth/auth-context";
import { CommercialEnquiryModal } from "./CommercialEnquiryModal";

export interface CommercialPropertyCardProps {
  property: CommercialProperty;
  className?: string;
}

export function CommercialPropertyCard({
  property,
  className = "",
}: CommercialPropertyCardProps) {
  const { requireAuth } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isFavorite) {
      const allowed = requireAuth({
        title: "Sign in to save commercial properties",
        message: "Create an account to track your shortlisted commercial assets.",
        onAuthenticated: () => setIsFavorite(true),
      });
      if (!allowed) return;
    }
    setIsFavorite((prev) => !prev);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const allowed = requireAuth({
      title: "Sign in to connect with asset manager",
      message: "Sign in to receive verified floor plans, CAM sheets, and corporate walkthroughs.",
      onAuthenticated: () => setIsEnquiryOpen(true),
    });
    if (!allowed) return;
    setIsEnquiryOpen(true);
  };

  return (
    <>
      <div
        className={`group flex flex-col justify-between rounded-xl border border-border-default bg-white text-text-primary shadow-soft hover:shadow-soft-md hover:border-border-dark hover:-translate-y-1 transition-all duration-200 overflow-hidden h-full ${className}`}
      >
        {/* Top: Image & Badges */}
        <div>
          <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
            <Image
              src={property.image}
              alt={property.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Badges Overlay */}
            <div className="absolute top-2.5 left-2.5 right-12 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
              {property.isReraVerified && <ReraBadge size="sm" />}
              {property.sellerType === "owner" ? (
                <OwnerBadge size="sm" />
              ) : property.sellerType === "developer" ? (
                <span className="inline-flex items-center gap-1 rounded bg-[#0F1B3D]/90 text-[#F5C469] text-[10px] font-bold px-2 py-0.5 border border-[#D9A441]/40 backdrop-blur-xs">
                  <Building2 className="w-3 h-3" />
                  BUILDER ASSET
                </span>
              ) : (
                <AgentBadge size="sm" />
              )}
            </div>

            {/* Favorite Heart Button */}
            <button
              type="button"
              onClick={toggleFavorite}
              className="absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs text-text-secondary hover:text-error-red hover:bg-white shadow-soft-xs transition-colors cursor-pointer"
              aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
            >
              <Heart
                className={`h-4 w-4 transition-transform active:scale-125 ${
                  isFavorite
                    ? "fill-error-red text-error-red scale-110"
                    : "text-text-secondary"
                }`}
              />
            </button>

            {/* Bottom Overlay with Transaction & Status */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark-navy/85 via-dark-navy/25 to-transparent p-3 pt-6 flex items-end justify-between pointer-events-none">
              <span className="text-[11px] font-bold text-white/95 uppercase tracking-wide bg-accent-gold-hover/90 backdrop-blur-xs px-2 py-0.5 rounded">
                {property.transactionType === "lease"
                  ? "For Lease"
                  : property.transactionType === "rent"
                  ? "For Rent"
                  : property.transactionType === "sale"
                  ? "For Sale"
                  : "Co-working"}
              </span>
              <span className="text-[11px] font-medium text-white/95 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded">
                {property.possessionStatus}
              </span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 space-y-3">
            {/* Price & Yield / Deposit */}
            <div className="flex items-baseline justify-between border-b border-border-subtle pb-2.5">
              <div>
                <span className="text-xl font-bold text-primary-navy tracking-tight">
                  {property.priceFormatted}
                </span>
              </div>
              <div className="text-right">
                {property.estimatedRentalYield ? (
                  <span className="text-[11px] font-bold text-success-green block flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" /> Yield: {property.estimatedRentalYield}
                  </span>
                ) : (
                  <span className="text-[11px] text-text-muted block">
                    {property.securityDeposit || "Standard Commercial Terms"}
                  </span>
                )}
              </div>
            </div>

            {/* Title & Location */}
            <div>
              <Link
                href={`/commercial/property/${property.id}`}
                title={property.title}
                className="text-sm font-bold text-primary-navy hover:text-accent-gold-hover transition-colors line-clamp-1 block"
              >
                {property.title}
              </Link>
              <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                <span className="truncate">{property.location}</span>
              </p>
            </div>

            {/* Commercial Specs Grid */}
            <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-lg bg-bg-light border border-border-subtle text-xs text-text-secondary">
              <div className="flex items-center gap-1.5 truncate">
                <Maximize2 className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                <span className="font-medium truncate">{property.carpetArea}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Layers className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                <span className="font-medium truncate">{property.floor}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Briefcase className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                <span className="font-medium truncate">{property.furnishingStatus}</span>
              </div>
            </div>

            {/* Parking & Seller */}
            <div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
              <span className="flex items-center gap-1 truncate max-w-[140px]">
                <Car className="w-3 h-3 text-text-muted" />
                <span className="truncate">{property.parking}</span>
              </span>
              <span className="truncate">
                Listed by: <strong className="text-text-primary font-medium">{property.sellerName}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Card Actions Footer */}
        <div className="p-4 pt-0 grid grid-cols-2 gap-2 border-t border-border-subtle/50 mt-1 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleContactClick}
            leftIcon={<PhoneCall className="w-3.5 h-3.5 text-success-green" />}
            className="w-full text-xs font-semibold h-9"
          >
            Enquire
          </Button>

          <Link href={`/commercial/property/${property.id}`} className="w-full">
            <Button
              variant="primary"
              size="sm"
              className="w-full text-xs font-bold h-9 shadow-soft-xs"
            >
              View Details
            </Button>
          </Link>
        </div>
      </div>

      {/* Commercial Enquiry Modal */}
      <CommercialEnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        property={property}
      />
    </>
  );
}

export default CommercialPropertyCard;

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
  ShieldCheck,
} from "lucide-react";
import { Button, ReraBadge, OwnerBadge, AgentBadge } from "@/components/ui";
import { CommercialProperty } from "@/types/commercial";
import { CommercialEnquiryModal } from "./CommercialEnquiryModal";

export interface CommercialPropertyListCardProps {
  property: CommercialProperty;
  className?: string;
}

export function CommercialPropertyListCard({
  property,
  className = "",
}: CommercialPropertyListCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite((prev) => !prev);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEnquiryOpen(true);
  };

  return (
    <>
      <div
        className={`group flex flex-col sm:flex-row rounded-xl border border-border-default bg-white text-text-primary shadow-soft hover:shadow-soft-md hover:border-border-dark hover:-translate-y-0.5 transition-all duration-200 overflow-hidden ${className}`}
      >
        {/* Left: Image Container */}
        <div className="relative aspect-16/10 sm:aspect-auto sm:w-72 md:w-80 shrink-0 overflow-hidden bg-slate-100 min-h-[200px]">
          <Image
            src={property.image}
            alt={property.title}
            fill
            sizes="(max-width: 640px) 100vw, 320px"
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

          {/* Bottom Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark-navy/85 via-dark-navy/25 to-transparent p-3 pt-6 flex items-end justify-between pointer-events-none">
            <span className="text-xs font-medium text-white/90 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-accent-gold" />
              {property.city}
            </span>
            <span className="text-[11px] font-semibold text-white/95 uppercase bg-accent-gold-hover/90 backdrop-blur-xs px-2 py-0.5 rounded">
              {property.transactionType === "lease"
                ? "Lease"
                : property.transactionType === "rent"
                ? "Rent"
                : property.transactionType === "sale"
                ? "Sale"
                : "Co-working"}
            </span>
          </div>
        </div>

        {/* Middle: Details & Specs */}
        <div className="flex flex-col flex-1 p-4 sm:p-5 justify-between space-y-3">
          <div className="space-y-2">
            <div>
              <Link
                href={`/commercial/property/${property.id}`}
                title={property.title}
                className="text-base font-bold text-primary-navy hover:text-accent-gold-hover transition-colors line-clamp-1 block"
              >
                {property.title}
              </Link>
              <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
                <span className="truncate">{property.location}</span>
              </p>
            </div>

            {/* Commercial Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 border-y border-border-subtle text-xs text-text-secondary">
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
              <div className="flex items-center gap-1.5 truncate">
                <Car className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                <span className="font-medium truncate">{property.parking}</span>
              </div>
            </div>

            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
              {property.description}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-border-subtle/60">
            <span className="text-text-muted flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-success-green" />
              Offered by: <strong className="text-text-primary font-medium">{property.sellerName}</strong>
            </span>
            <span className="text-[11px] text-text-muted">{property.postedDate}</span>
          </div>
        </div>

        {/* Right: Price, Yield & Actions */}
        <div className="flex sm:flex-col justify-between sm:justify-center items-center sm:items-end p-4 sm:p-5 sm:border-l border-border-subtle bg-bg-light/50 sm:w-56 shrink-0 space-y-3">
          <div className="text-left sm:text-right">
            <span className="text-xs text-text-muted block">
              {property.transactionType === "sale" ? "Total Price" : "Commercial Rent"}
            </span>
            <span className="text-2xl font-bold text-primary-navy tracking-tight block">
              {property.priceFormatted}
            </span>
            {property.estimatedRentalYield ? (
              <span className="text-xs font-bold text-success-green flex items-center gap-1 sm:justify-end">
                <Sparkles className="w-3 h-3" /> Yield: {property.estimatedRentalYield}
              </span>
            ) : (
              <span className="text-[11px] text-text-muted block">
                {property.securityDeposit || "Standard Terms"}
              </span>
            )}
            {property.maintenanceCharges && (
              <span className="text-[10px] text-text-muted">
                + {property.maintenanceCharges}
              </span>
            )}
          </div>

          <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto">
            <Link href={`/commercial/property/${property.id}`} className="w-full">
              <Button variant="primary" size="sm" className="w-full text-xs font-bold h-9">
                View Details
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleContactClick}
              leftIcon={<PhoneCall className="w-3.5 h-3.5 text-success-green" />}
              className="w-full text-xs font-semibold h-9"
            >
              Enquire
            </Button>
          </div>
        </div>
      </div>

      {/* Commercial Contact Modal */}
      <CommercialEnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        property={property}
      />
    </>
  );
}

export default CommercialPropertyListCard;

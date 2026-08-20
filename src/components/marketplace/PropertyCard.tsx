"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Maximize, BedDouble, Bath, PhoneCall } from "lucide-react";
import { Button, ReraBadge, OwnerBadge, AgentBadge, NewBadge } from "@/components/ui";
import { Property } from "@/types/property";
import { useAuth } from "@/lib/auth/auth-context";
import { ContactModal } from "./ContactModal";

export interface PropertyCardProps {
  property: Property;
  className?: string;
  badgeHighlight?: string;
}

export function PropertyCard({
  property,
  className = "",
  badgeHighlight,
}: PropertyCardProps) {
  const { requireAuth } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isFavorite) {
      const allowed = requireAuth({
        title: "Sign in to save properties",
        message: "Create an account to keep your favourite properties in one place.",
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
      title: "Sign in to contact seller",
      message: "Sign in to connect directly with verified property owners and channel partners.",
      onAuthenticated: () => setIsContactOpen(true),
    });
    if (!allowed) return;
    setIsContactOpen(true);
  };

  return (
    <>
      <div
        className={`group flex flex-col h-full rounded-xl border border-border-default bg-white text-text-primary shadow-soft hover:shadow-soft-md hover:border-border-dark hover:-translate-y-1 transition-all duration-200 overflow-hidden ${className}`}
      >
        {/* Top Image Container with Uniform 16:10 Ratio */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100 shrink-0">
          <Image
            src={property.image}
            alt={property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Top Badges Overlay - Clean, Non-overlapping wrap */}
          <div className="absolute top-2.5 left-2.5 right-12 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
            {property.isReraVerified && <ReraBadge size="sm" />}
            {property.isNew && <NewBadge size="sm" />}
            {badgeHighlight ? (
              <span className="rounded bg-accent-gold-light text-[#9E6E18] border border-accent-gold-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                {badgeHighlight}
              </span>
            ) : property.sellerType === "owner" ? (
              <OwnerBadge size="sm" />
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

          {/* Bottom Gradient overlay with Locality & Ready Status */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark-navy/85 via-dark-navy/30 to-transparent p-3 pt-6 flex items-end justify-between pointer-events-none">
            <span className="text-xs font-medium text-white/95 flex items-center gap-1 truncate max-w-[65%]">
              <MapPin className="w-3 h-3 text-accent-gold shrink-0" />
              <span className="truncate">{property.city}</span>
            </span>
            <span className="text-[11px] font-medium text-white/90 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded shrink-0">
              {property.possessionStatus}
            </span>
          </div>
        </div>

        {/* Card Content Body */}
        <div className="flex flex-col flex-1 p-4 justify-between space-y-3">
          {/* Top block */}
          <div className="space-y-2.5">
            {/* Price & BHK Tag */}
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xl font-bold text-primary-navy tracking-tight truncate">
                {property.price}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-bg-light text-text-secondary border border-border-subtle shrink-0">
                {property.bhk} BHK
              </span>
            </div>

            {/* Property Title & Location */}
            <div>
              <Link
                href={`/property/${property.id}`}
                title={property.title}
                className="line-clamp-1 text-sm font-bold text-text-primary hover:text-accent-gold-hover transition-colors block"
              >
                {property.title}
              </Link>
              <p
                title={property.location}
                className="line-clamp-1 text-xs text-text-secondary mt-0.5 flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5 shrink-0 text-text-muted" />
                <span className="truncate">{property.location}</span>
              </p>
            </div>

            {/* Key Property Specs (Area, Bed, Bath) */}
            <div className="grid grid-cols-3 gap-1.5 py-2 border-y border-border-subtle text-xs text-text-secondary">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <Maximize className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                <span className="font-medium truncate">{property.carpetArea}</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-hidden">
                <BedDouble className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                <span className="font-medium truncate">{property.bhk} Beds</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-hidden">
                <Bath className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                <span className="font-medium truncate">{property.bathrooms} Baths</span>
              </div>
            </div>

            {/* Seller info line - Fixed height */}
            <div className="flex items-center justify-between text-xs h-5">
              <span className="text-text-muted truncate max-w-[180px]">
                By: <strong className="text-text-primary font-medium">{property.sellerName}</strong>
              </span>
              <span className="text-[11px] text-text-muted shrink-0">{property.postedDate}</span>
            </div>
          </div>

          {/* Action Buttons: Contact & View Details */}
          <div className="grid grid-cols-2 gap-2 pt-2 mt-auto border-t border-border-subtle/50">
            <Button
              variant="outline"
              size="sm"
              onClick={handleContactClick}
              leftIcon={<PhoneCall className="w-3.5 h-3.5 text-success-green" />}
              className="text-xs font-semibold h-9"
            >
              Contact
            </Button>
            <Link href={`/property/${property.id}`} className="w-full">
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs font-bold h-9"
              >
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Zero Brokerage Direct Contact Modal */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        property={property}
      />
    </>
  );
}

export default PropertyCard;

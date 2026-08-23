"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  MapPin,
  Maximize,
  BedDouble,
  PhoneCall,
  Sofa,
} from "lucide-react";
import { Button, ReraBadge, OwnerBadge, AgentBadge } from "@/components/ui";
import { RentalProperty } from "@/types/rental";
import { useAuth } from "@/lib/auth/auth-context";
import { RentEnquiryModal } from "./RentEnquiryModal";
import { FavoriteApiService } from "@/lib/services/favorite-api";

export interface RentPropertyCardProps {
  property: RentalProperty;
  className?: string;
}

export function RentPropertyCard({
  property,
  className = "",
}: RentPropertyCardProps) {
  const { isAuthenticated, requireAuth } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFav, setIsTogglingFav] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const executeToggleFavorite = async () => {
    if (isTogglingFav) return;
    setIsTogglingFav(true);
    const nextState = !isFavorite;
    setIsFavorite(nextState);

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(property.id);
    if (isUuid) {
      try {
        await FavoriteApiService.toggleFavorite(property.id, !nextState);
      } catch {
        setIsFavorite(!nextState);
      } finally {
        setIsTogglingFav(false);
      }
    } else {
      setIsTogglingFav(false);
    }
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      const allowed = requireAuth({
        title: "Sign in to save rental properties",
        message: "Create an account to save and compare your shortlisted rentals.",
        onAuthenticated: () => executeToggleFavorite(),
      });
      if (allowed) {
        executeToggleFavorite();
      }
      return;
    }
    executeToggleFavorite();
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const allowed = requireAuth({
      title: "Sign in to contact landlord",
      message: "Sign in to connect directly with the property owner or listing agent.",
      onAuthenticated: () => setIsEnquiryOpen(true),
    });
    if (!allowed) return;
    setIsEnquiryOpen(true);
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

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 right-12 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
            {property.isReraVerified && <ReraBadge size="sm" />}
            {property.sellerType === "owner" ? (
              <OwnerBadge size="sm" />
            ) : (
              <AgentBadge size="sm" />
            )}
          </div>

          {/* Favorite Heart Button */}
          <button
            type="button"
            onClick={toggleFavorite}
            disabled={isTogglingFav}
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

          {/* Bottom Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark-navy/85 via-dark-navy/30 to-transparent p-3 pt-6 flex items-end justify-between pointer-events-none">
            <div className="flex items-center gap-1 text-white text-xs font-semibold drop-shadow-sm">
              <MapPin className="h-3.5 w-3.5 text-accent-gold shrink-0" />
              <span className="truncate max-w-[150px]">
                {property.locality}, {property.city}
              </span>
            </div>
            {property.availability && (
              <span className="rounded bg-white/20 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                {property.availability}
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-col flex-1 p-4 justify-between space-y-3">
          <div className="space-y-1.5">
            {/* Price & Deposit Row */}
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-primary-navy tracking-tight">
                  {property.formattedRent}
                </span>
                <span className="text-xs text-text-muted">/ month</span>
              </div>
              <span className="text-[11px] font-semibold text-text-muted">
                Dep: {property.securityDeposit}
              </span>
            </div>

            {/* Title */}
            <h3 className="line-clamp-2 text-sm font-bold text-text-primary group-hover:text-accent-gold-hover transition-colors leading-snug">
              <Link href={`/property/${property.id}`} className="focus:outline-none">
                {property.title}
              </Link>
            </h3>
          </div>

          {/* Key Specs Pills Grid */}
          <div className="grid grid-cols-3 gap-2 border-y border-border-subtle py-2.5 text-xs text-text-secondary">
            <div className="flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5 text-text-muted shrink-0" />
              <span className="font-semibold text-text-primary truncate">{property.bhk}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sofa className="h-3.5 w-3.5 text-text-muted shrink-0" />
              <span className="font-semibold text-text-primary truncate">{property.furnishingStatus}</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-1">
              <Maximize className="h-3.5 w-3.5 text-text-muted shrink-0" />
              <span className="font-semibold text-text-primary truncate">{property.carpetArea}</span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleContactClick}
              leftIcon={<PhoneCall className="h-3.5 w-3.5 text-accent-gold" />}
              className="w-full text-xs font-semibold h-9"
            >
              Enquire
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

      {/* Direct Contact Modal */}
      <RentEnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        property={property}
      />
    </>
  );
}

export default RentPropertyCard;

"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  MapPin,
  Maximize,
  BedDouble,
  Bath,
  PhoneCall,
  Compass,
  Building,
  Building2,
} from "lucide-react";
import { Button, OwnerBadge, AgentBadge, NewBadge } from "@/components/ui";
import { Property } from "@/types/property";
import { useAuth } from "@/lib/auth/auth-context";
import { ContactModal } from "./ContactModal";
import { FavoriteApiService } from "@/lib/services/favorite-api";

export interface PropertyListCardProps {
  property: Property;
  className?: string;
}

export function PropertyListCard({ property, className = "" }: PropertyListCardProps) {
  const { isAuthenticated, requireAuth } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFav, setIsTogglingFav] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

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
        title: "Sign in to save properties",
        message: "Create an account to keep your favourite properties in one place.",
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
        className={`group flex flex-col sm:flex-row rounded-xl border border-border-default bg-white text-text-primary shadow-soft hover:shadow-soft-md hover:border-border-dark hover:-translate-y-0.5 transition-all duration-200 overflow-hidden ${className}`}
      >
        {/* Left: Image Container (Fixed Width on Desktop) */}
        <div className="relative aspect-16/10 sm:aspect-auto sm:w-72 md:w-80 shrink-0 overflow-hidden bg-slate-100 min-h-[200px]">
          {property.image ? (
            <Image
              src={property.image}
              alt={property.title}
              fill
              sizes="(max-width: 640px) 100vw, 320px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center select-none">
              <Building2 className="w-8 h-8 opacity-40 mb-1" />
              <span className="text-[11px] font-medium tracking-wide">No photos</span>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 right-12 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
            {property.isNew && <NewBadge size="sm" />}
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
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark-navy/85 via-dark-navy/30 to-transparent p-2.5 pt-6 flex items-end justify-between pointer-events-none">
            {property.possessionStatus && (
              <span className="rounded bg-white/20 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                {property.possessionStatus}
              </span>
            )}
          </div>
        </div>

        {/* Right: Content Section */}
        <div className="flex flex-col flex-1 p-4 justify-between space-y-3">
          <div className="space-y-1.5">
            {/* Top row: Price */}
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xl font-black text-primary-navy tracking-tight">
                {property.price}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-text-primary group-hover:text-accent-gold-hover transition-colors leading-snug">
              <Link href={`/property/${property.id}`} className="focus:outline-none">
                {property.title}
              </Link>
            </h3>

            {/* Location */}
            <div className="flex items-center gap-1 text-text-secondary text-xs">
              <MapPin className="h-3.5 w-3.5 text-accent-gold shrink-0" />
              <span>{property.location}</span>
            </div>
          </div>

          {/* Spec Badges Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border-subtle py-2.5 text-xs text-text-secondary">
            {property.bhk && (
              <div className="flex items-center gap-1.5">
                <BedDouble className="h-3.5 w-3.5 text-text-muted shrink-0" />
                <span className="font-semibold text-text-primary">{property.bhk} BHK</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1.5">
                <Bath className="h-3.5 w-3.5 text-text-muted shrink-0" />
                <span className="font-semibold text-text-primary">{property.bathrooms} Bath</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Maximize className="h-3.5 w-3.5 text-text-muted shrink-0" />
              <span className="font-semibold text-text-primary">{property.carpetArea}</span>
            </div>
            {property.facing && (
              <div className="flex items-center gap-1.5 hidden md:flex">
                <Compass className="h-3.5 w-3.5 text-text-muted shrink-0" />
                <span>{property.facing} Facing</span>
              </div>
            )}
            {property.floor && (
              <div className="flex items-center gap-1.5 hidden md:flex">
                <Building className="h-3.5 w-3.5 text-text-muted shrink-0" />
                <span>{property.floor}</span>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="text-[11px] text-text-muted hidden sm:block">
              {property.sellerType === "owner" ? (
                <span className="text-success-green font-semibold">Zero Brokerage</span>
              ) : (
                <span>Verified Channel Partner</span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleContactClick}
                leftIcon={<PhoneCall className="h-3.5 w-3.5 text-accent-gold" />}
                className="w-1/2 sm:w-auto text-xs font-semibold h-9"
              >
                Contact
              </Button>
              <Link href={`/property/${property.id}`} className="w-1/2 sm:w-auto">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full sm:w-auto text-xs font-bold h-9"
                >
                  View Details
                </Button>
              </Link>
            </div>
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

export default PropertyListCard;

// ==============================================================================
// TheVrindaGroup - RENT Quick Listing Preview Modal
// Zero-Default Rule: Renders ONLY populated information
// ==============================================================================

"use client";

import React from "react";
import Image from "next/image";
import {
  X,
  MapPin,
  BedDouble,
  Bath,
  Sofa,
  Maximize,
  CheckCircle2,
  Car,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui";
import {
  RentQuickListingFormState,
} from "@/types/rentQuickListing";
import {
  generateDeterministicRentTitle,
  formatRentPricePreview,
  formatRentAreaUnitLabel,
} from "@/lib/services/rent-quick-listing-helper";

interface RentQuickListingPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: RentQuickListingFormState;
  onConfirmSubmit: () => void;
  isSubmitting: boolean;
}

export function RentQuickListingPreviewModal({
  isOpen,
  onClose,
  form,
  onConfirmSubmit,
  isSubmitting,
}: RentQuickListingPreviewModalProps) {
  if (!isOpen) return null;

  const displayTitle =
    form.isTitleManuallyEdited && form.title.trim()
      ? form.title.trim()
      : generateDeterministicRentTitle(form);

  const formattedRent = formatRentPricePreview(form.monthlyRent);
  const unitLabel = formatRentAreaUnitLabel(form.areaUnit);

  const hasArea = Boolean(form.builtUpArea?.trim());
  const hasBedrooms = Boolean(form.bhk || form.houseRooms);
  const bedroomText = form.bhk ? `${form.bhk} BHK` : form.houseRooms ? `${form.houseRooms} Rooms` : "";

  const hasBathrooms = Boolean(form.bathrooms || form.roomBathroom);
  const bathroomText = form.bathrooms
    ? `${form.bathrooms} Baths`
    : form.roomBathroom === "private"
    ? "Private Bathroom"
    : form.roomBathroom === "shared"
    ? "Shared Bathroom"
    : "";

  const hasFurnishing = Boolean(form.furnishingStatus);
  const furnishingLabel =
    form.furnishingStatus === "FULLY_FURNISHED"
      ? "Fully Furnished"
      : form.furnishingStatus === "SEMI_FURNISHED"
      ? "Semi-Furnished"
      : form.furnishingStatus === "UNFURNISHED"
      ? "Unfurnished"
      : "";

  const hasParking = Boolean(form.villaParking);
  const parkingLabel =
    form.villaParking === "available"
      ? "Parking Available"
      : form.villaParking === "not-available"
      ? "No Parking"
      : "";

  const hasFloor = Boolean(form.houseFloor);
  const hasAmenities = form.amenities && form.amenities.length > 0;
  const hasDescription = Boolean(form.description?.trim());
  const hasPhotos = form.photos && form.photos.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-dark-navy/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white border border-border-default shadow-soft-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-light/60">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent-gold-hover bg-accent-gold/10 px-2 py-0.5 rounded-md">
              Listing Preview
            </span>
            <h2 className="text-base font-bold text-primary-navy mt-0.5">
              Review Your Rental Listing
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-slate-100 transition-colors"
            aria-label="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Cover Photo Carousel / Grid if any */}
          {hasPhotos ? (
            <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden bg-slate-900 border border-border-subtle">
              <Image
                src={form.photos[0].previewUrl}
                alt={displayTitle}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute top-3 right-3 bg-dark-navy/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                {form.photos.length} {form.photos.length === 1 ? "Photo" : "Photos"}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3 text-amber-900 text-xs">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Zero Photos Added:</strong> You can add verified property photos anytime from your dashboard after creating the listing.
              </span>
            </div>
          )}

          {/* Pricing & Title */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-2xl font-black text-primary-navy tracking-tight">
                {formattedRent || "₹0 / mo"}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-success-green/10 text-success-green">
                For Rent (Zero Brokerage)
              </span>
            </div>
            <h1 className="text-lg font-bold text-text-primary leading-snug">
              {displayTitle}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <MapPin className="w-3.5 h-3.5 text-accent-gold shrink-0" />
              <span>
                {[
                  form.location.locality,
                  form.location.city,
                  form.location.state,
                ]
                  .filter(Boolean)
                  .join(", ") || "Kota, Rajasthan"}
              </span>
            </div>
          </div>

          {/* Key Specs Pills Grid (Only populated values) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-bg-light border border-border-subtle text-xs">
            {hasBedrooms && (
              <div className="flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-accent-gold shrink-0" />
                <div>
                  <span className="text-[10px] text-text-muted block">Rooms / BHK</span>
                  <strong className="text-text-primary">{bedroomText}</strong>
                </div>
              </div>
            )}
            {hasBathrooms && (
              <div className="flex items-center gap-2">
                <Bath className="w-4 h-4 text-accent-gold shrink-0" />
                <div>
                  <span className="text-[10px] text-text-muted block">Bathrooms</span>
                  <strong className="text-text-primary">{bathroomText}</strong>
                </div>
              </div>
            )}
            {hasFloor && (
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent-gold shrink-0" />
                <div>
                  <span className="text-[10px] text-text-muted block">Floor Level</span>
                  <strong className="text-text-primary">{form.houseFloor}</strong>
                </div>
              </div>
            )}
            {hasFurnishing && (
              <div className="flex items-center gap-2">
                <Sofa className="w-4 h-4 text-accent-gold shrink-0" />
                <div>
                  <span className="text-[10px] text-text-muted block">Furnishing</span>
                  <strong className="text-text-primary">{furnishingLabel}</strong>
                </div>
              </div>
            )}
            {hasParking && (
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-accent-gold shrink-0" />
                <div>
                  <span className="text-[10px] text-text-muted block">Parking</span>
                  <strong className="text-text-primary">{parkingLabel}</strong>
                </div>
              </div>
            )}
            {hasArea && (
              <div className="flex items-center gap-2">
                <Maximize className="w-4 h-4 text-accent-gold shrink-0" />
                <div>
                  <span className="text-[10px] text-text-muted block">Built-up Area</span>
                  <strong className="text-text-primary">
                    {Number(form.builtUpArea).toLocaleString("en-IN")} {unitLabel}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* Amenities (Only if selected) */}
          {hasAmenities && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-primary-navy uppercase tracking-wider">
                Amenities & Features ({form.amenities.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {form.amenities.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-border-default text-xs font-medium text-text-primary shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-success-green" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description (Only if entered) */}
          {hasDescription && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-primary-navy uppercase tracking-wider">
                Description
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line p-3.5 rounded-xl bg-slate-50 border border-border-subtle">
                {form.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-subtle bg-bg-light/60">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs font-semibold"
          >
            Back & Edit
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onConfirmSubmit}
            disabled={isSubmitting}
            className="text-xs font-bold shadow-md shadow-accent-gold/20"
          >
            {isSubmitting ? "Submitting Listing..." : "Confirm & Submit Listing"}
          </Button>
        </div>
      </div>
    </div>
  );
}

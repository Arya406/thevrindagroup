// ==============================================================================
// TheVrindaGroup - SELL Quick Listing Mandatory Preview Modal
// Renders STRICTLY populated data without artificial defaults or fake values
// ==============================================================================

"use client";

import React from "react";
import Image from "next/image";
import {
  X,
  MapPin,
  CheckCircle2,
  Compass,
  Layers,
  Maximize2,
  BedDouble,
  Bath,
  Armchair,
  UserCheck,
  ArrowRight,
  Edit3,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui";
import { QuickListingFormState } from "@/types/sellQuickListing";
import {
  formatIndianPricePreview,
  formatAreaUnitLabel,
  generateDeterministicTitle,
} from "@/lib/services/sell-quick-listing-helper";
import { useAuth } from "@/lib/auth/auth-context";

export interface QuickListingPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: QuickListingFormState;
  onConfirmSubmit: () => void;
  isSubmitting: boolean;
}

export function QuickListingPreviewModal({
  isOpen,
  onClose,
  form,
  onConfirmSubmit,
  isSubmitting,
}: QuickListingPreviewModalProps) {
  const { currentUser } = useAuth();

  if (!isOpen) return null;

  const displayTitle = form.isTitleManuallyEdited && form.title.trim()
    ? form.title.trim()
    : generateDeterministicTitle(form);

  const formattedPrice = formatIndianPricePreview(form.askingPrice);
  const unitLabel = formatAreaUnitLabel(form.areaUnit);

  const hasArea = Boolean(form.area?.trim() || form.plotArea?.trim() || form.carpetArea?.trim() || form.builtUpArea?.trim());
  const displayArea = form.area?.trim() || form.plotArea?.trim() || form.carpetArea?.trim() || form.builtUpArea?.trim();

  const hasBedrooms = Boolean(form.bhk || form.houseRooms);
  const bedroomText = form.bhk ? `${form.bhk} BHK` : form.houseRooms ? `${form.houseRooms} Rooms` : "";

  const hasBathrooms = Boolean(form.bathrooms);
  const hasFurnishing = Boolean(form.furnishingStatus);
  const furnishingLabel =
    form.furnishingStatus === "FULLY_FURNISHED"
      ? "Fully Furnished"
      : form.furnishingStatus === "SEMI_FURNISHED"
      ? "Semi-Furnished"
      : form.furnishingStatus === "UNFURNISHED"
      ? "Unfurnished"
      : "";

  const hasFacing = Boolean(form.facing);
  const hasFloor = Boolean(form.propertyFloor || form.totalFloors || form.buildingFloors);
  const hasPlotDimensions = Boolean(form.plotWidth || form.plotLength || form.roadWidth);
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
            <h2 className="text-base sm:text-lg font-bold text-primary-navy mt-1">
              Review Before Submission
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-text-muted hover:text-primary-navy hover:bg-bg-light transition-colors cursor-pointer"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Hero Card */}
          <div className="rounded-2xl border border-border-default bg-slate-50/50 p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-text-muted capitalize">
                  {form.category} • {form.subtype.replace("-", " ")}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-primary-navy leading-snug">
                  {displayTitle}
                </h3>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-text-muted font-medium block">Asking Price</span>
                <span className="text-lg sm:text-xl font-extrabold text-primary-navy text-accent-gold-hover">
                  {formattedPrice || "Price upon request"}
                </span>
              </div>
            </div>

            {/* Location Line */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary pt-1">
              <MapPin className="w-4 h-4 text-accent-gold shrink-0" />
              <span>
                {[form.location.locality, form.location.city, form.location.state]
                  .filter(Boolean)
                  .join(", ")}
                {form.location.pincode ? ` - ${form.location.pincode}` : ""}
              </span>
            </div>
            {form.location.address && (
              <p className="text-xs text-text-muted pl-5 italic">
                {form.location.address}
              </p>
            )}
          </div>

          {/* Key Specifications Grid (ONLY POPULATED ITEMS) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Key Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* Area (Only if provided) */}
              {hasArea && (
                <div className="p-3 rounded-xl border border-border-subtle bg-white flex items-center gap-2.5">
                  <Maximize2 className="w-4 h-4 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted block">Area</span>
                    <span className="text-xs font-bold text-primary-navy">
                      {Number(displayArea).toLocaleString("en-IN")} {unitLabel}
                    </span>
                  </div>
                </div>
              )}

              {/* Bedrooms / Rooms (Only if provided) */}
              {hasBedrooms && (
                <div className="p-3 rounded-xl border border-border-subtle bg-white flex items-center gap-2.5">
                  <BedDouble className="w-4 h-4 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted block">Rooms / BHK</span>
                    <span className="text-xs font-bold text-primary-navy">{bedroomText}</span>
                  </div>
                </div>
              )}

              {/* Bathrooms (Only if provided) */}
              {hasBathrooms && (
                <div className="p-3 rounded-xl border border-border-subtle bg-white flex items-center gap-2.5">
                  <Bath className="w-4 h-4 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted block">Bathrooms</span>
                    <span className="text-xs font-bold text-primary-navy">
                      {form.bathrooms} Bathrooms
                    </span>
                  </div>
                </div>
              )}

              {/* Furnishing (Only if provided) */}
              {hasFurnishing && (
                <div className="p-3 rounded-xl border border-border-subtle bg-white flex items-center gap-2.5">
                  <Armchair className="w-4 h-4 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted block">Furnishing</span>
                    <span className="text-xs font-bold text-primary-navy">{furnishingLabel}</span>
                  </div>
                </div>
              )}

              {/* Facing (Only if provided) */}
              {hasFacing && (
                <div className="p-3 rounded-xl border border-border-subtle bg-white flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted block">Facing</span>
                    <span className="text-xs font-bold text-primary-navy">{form.facing}</span>
                  </div>
                </div>
              )}

              {/* Floors (Only if provided) */}
              {hasFloor && (
                <div className="p-3 rounded-xl border border-border-subtle bg-white flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted block">Floor Details</span>
                    <span className="text-xs font-bold text-primary-navy">
                      {form.propertyFloor && form.totalFloors
                        ? `Floor ${form.propertyFloor} of ${form.totalFloors}`
                        : form.buildingFloors
                        ? `${form.buildingFloors} Floors`
                        : form.propertyFloor
                        ? `Floor ${form.propertyFloor}`
                        : `${form.totalFloors} Floors Total`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Plot Dimensions (Only if Plot & provided) */}
          {hasPlotDimensions && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Plot Dimensions
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-primary-navy">
                {form.plotWidth && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-border-subtle">
                    <span className="text-[10px] text-text-muted block">Width</span>
                    <span className="font-semibold">{form.plotWidth} ft</span>
                  </div>
                )}
                {form.plotLength && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-border-subtle">
                    <span className="text-[10px] text-text-muted block">Length</span>
                    <span className="font-semibold">{form.plotLength} ft</span>
                  </div>
                )}
                {form.roadWidth && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-border-subtle">
                    <span className="text-[10px] text-text-muted block">Road Width</span>
                    <span className="font-semibold">{form.roadWidth} ft</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Amenities (Only if selected) */}
          {hasAmenities && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Amenities & Features
              </h4>
              <div className="flex flex-wrap gap-2">
                {form.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description (Only if provided) */}
          {hasDescription && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Property Description
              </h4>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed p-3.5 rounded-xl bg-slate-50 border border-border-subtle">
                {form.description}
              </p>
            </div>
          )}

          {/* Photos (Only if uploaded) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Property Photos
            </h4>
            {hasPhotos ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {form.photos.map((photo, idx) => (
                  <div
                    key={photo.id || idx}
                    className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-border-subtle shadow-soft-xs"
                  >
                    <Image
                      src={photo.previewUrl}
                      alt={`Photo ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-dashed border-border-default bg-slate-50/50 flex items-center gap-2.5 text-xs text-text-muted">
                <ImageIcon className="w-4 h-4 opacity-50" />
                <span>No photos uploaded (optional — you can upload photos later from My Properties)</span>
              </div>
            )}
          </div>

          {/* Verified Seller Contact Info Box */}
          <div className="rounded-2xl border border-primary-navy/20 bg-primary-navy/[0.03] p-4 space-y-2">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary-navy shrink-0" />
              <span className="text-xs font-bold text-primary-navy">
                Verified Seller Contact Information
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-text-secondary pt-1">
              <div>
                <span className="text-[10px] text-text-muted block">Name</span>
                <span className="font-semibold text-primary-navy">
                  {currentUser?.name || "Verified Owner"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted block">Phone</span>
                <span className="font-semibold text-primary-navy">
                  {currentUser?.phone || "Connected on Profile"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted block">Email</span>
                <span className="font-semibold text-primary-navy truncate block">
                  {currentUser?.email || "Connected on Profile"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-border-default bg-bg-light/80 gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
            leftIcon={<Edit3 className="w-4 h-4" />}
            className="text-xs font-semibold"
          >
            Edit Details
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onConfirmSubmit}
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="text-xs font-bold shadow-soft-sm"
          >
            {isSubmitting ? "Submitting..." : "Submit Listing"}
          </Button>
        </div>
      </div>
    </div>
  );
}

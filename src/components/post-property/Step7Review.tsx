"use client";

import React from "react";
import Image from "next/image";
import { Edit3, MapPin, FileCheck } from "lucide-react";
import { Button } from "@/components/ui";
import { PropertyListingDraft } from "@/types/postProperty";

export interface Step7ReviewProps {
  draft: PropertyListingDraft;
  onEditStep: (step: number) => void;
  onConfirmChange: (confirmed: boolean) => void;
  onPublish: () => void;
  onSaveDraft: () => void;
  isPublishing?: boolean;
}

export function Step7Review({
  draft,
  onEditStep,
  onConfirmChange,
  onPublish,
  onSaveDraft,
  isPublishing = false,
}: Step7ReviewProps) {
  const isResidential = draft.category === "residential";

  const formattedPrice = draft.transaction === "sale"
    ? draft.pricing.expectedPrice
      ? `₹ ${parseInt(draft.pricing.expectedPrice).toLocaleString("en-IN")}`
      : "Price on Request"
    : draft.pricing.monthlyRent
    ? `₹ ${parseInt(draft.pricing.monthlyRent).toLocaleString("en-IN")} / month`
    : "Rent on Request";

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-primary-navy">
          Review Your Listing
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
          Please verify all property details before publishing your listing on TheVrindaGroup.
        </p>
      </div>

      {/* 1. Property Overview Section */}
      <div className="rounded-xl border border-border-default bg-white p-4 sm:p-5 shadow-soft space-y-3">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
          <span className="text-xs font-bold text-primary-navy uppercase tracking-wider">
            1. Property Overview
          </span>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="text-xs font-semibold text-accent-gold-hover hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-text-muted block">Transaction</span>
            <strong className="text-primary-navy font-bold uppercase">
              For {draft.transaction}
            </strong>
          </div>
          <div>
            <span className="text-text-muted block">Category</span>
            <strong className="text-primary-navy font-bold uppercase">
              {draft.category}
            </strong>
          </div>
          <div>
            <span className="text-text-muted block">Property Type</span>
            <strong className="text-primary-navy font-bold capitalize">
              {isResidential ? draft.residentialType : draft.commercialType}
            </strong>
          </div>
          <div>
            <span className="text-text-muted block">Listed As</span>
            <strong className="text-primary-navy font-bold capitalize">
              {draft.ownerType}
            </strong>
          </div>
        </div>
      </div>

      {/* 2. Location Section */}
      <div className="rounded-xl border border-border-default bg-white p-4 sm:p-5 shadow-soft space-y-3">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
          <span className="text-xs font-bold text-primary-navy uppercase tracking-wider">
            2. Location Details
          </span>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="text-xs font-semibold text-accent-gold-hover hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        <div className="space-y-1 text-xs">
          <p className="font-bold text-primary-navy flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-accent-gold shrink-0" />
            {draft.location.projectSociety || "Unnamed Project"}, {draft.location.locality}, {draft.location.city}
          </p>
          <p className="text-text-secondary pl-5">
            {draft.location.address || "Street address specified"}
          </p>
        </div>
      </div>

      {/* 3. Specifications Section */}
      <div className="rounded-xl border border-border-default bg-white p-4 sm:p-5 shadow-soft space-y-3">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
          <span className="text-xs font-bold text-primary-navy uppercase tracking-wider">
            3. Specifications & Areas
          </span>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="text-xs font-semibold text-accent-gold-hover hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        {isResidential ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-text-muted block">Configuration</span>
              <strong className="text-primary-navy font-bold">
                {draft.residentialDetails.bhk} BHK, {draft.residentialDetails.bathrooms} Baths
              </strong>
            </div>
            <div>
              <span className="text-text-muted block">Carpet Area</span>
              <strong className="text-primary-navy font-bold">
                {draft.residentialDetails.carpetArea} sq.ft
              </strong>
            </div>
            <div>
              <span className="text-text-muted block">Floor Level</span>
              <strong className="text-primary-navy font-bold">
                {draft.residentialDetails.floor} (of {draft.residentialDetails.totalFloors || "N/A"})
              </strong>
            </div>
            <div>
              <span className="text-text-muted block">Furnishing</span>
              <strong className="text-primary-navy font-bold">
                {draft.residentialDetails.furnishing}
              </strong>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-text-muted block">Carpet Area</span>
              <strong className="text-primary-navy font-bold">
                {draft.commercialDetails.carpetArea} sq.ft
              </strong>
            </div>
            <div>
              <span className="text-text-muted block">Floor Level</span>
              <strong className="text-primary-navy font-bold">
                {draft.commercialDetails.floor}
              </strong>
            </div>
            <div>
              <span className="text-text-muted block">Fit-out Status</span>
              <strong className="text-primary-navy font-bold">
                {draft.commercialDetails.furnishing}
              </strong>
            </div>
            <div>
              <span className="text-text-muted block">Parking Bays</span>
              <strong className="text-primary-navy font-bold">
                {draft.commercialDetails.parking || "Reserved"}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* 4. Photos Gallery Section */}
      <div className="rounded-xl border border-border-default bg-white p-4 sm:p-5 shadow-soft space-y-3">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
          <span className="text-xs font-bold text-primary-navy uppercase tracking-wider">
            4. Photos ({draft.photos.length})
          </span>
          <button
            type="button"
            onClick={() => onEditStep(4)}
            className="text-xs font-semibold text-accent-gold-hover hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        {draft.photos.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {draft.photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-16/10 rounded-lg overflow-hidden border border-border-subtle bg-slate-100"
              >
                <Image
                  src={photo.url}
                  alt="Property thumbnail"
                  fill
                  sizes="15vw"
                  className="object-cover"
                />
                {photo.isCover && (
                  <div className="absolute top-1 left-1 bg-accent-gold text-dark-navy text-[8px] font-extrabold px-1.5 py-0.2 rounded shadow-soft-xs">
                    COVER
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-error-red font-medium">
            No photos added. (Add at least 1 photo before publishing)
          </p>
        )}
      </div>

      {/* 5. Pricing Section */}
      <div className="rounded-xl border border-border-default bg-white p-4 sm:p-5 shadow-soft space-y-3">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
          <span className="text-xs font-bold text-primary-navy uppercase tracking-wider">
            5. Pricing & Terms
          </span>
          <button
            type="button"
            onClick={() => onEditStep(5)}
            className="text-xs font-semibold text-accent-gold-hover hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-text-muted block">
              {draft.transaction === "sale" ? "Expected Asking Price" : "Monthly Rent"}
            </span>
            <strong className="text-base font-bold text-primary-navy">
              {formattedPrice}
            </strong>
          </div>
          {draft.pricing.securityDeposit && (
            <div>
              <span className="text-text-muted block">Security Deposit</span>
              <strong className="text-sm font-bold text-primary-navy">
                ₹ {parseInt(draft.pricing.securityDeposit).toLocaleString("en-IN")}
              </strong>
            </div>
          )}
          {draft.pricing.maintenanceCharges && (
            <div>
              <span className="text-text-muted block">Maintenance</span>
              <strong className="text-sm font-bold text-primary-navy">
                ₹ {parseInt(draft.pricing.maintenanceCharges).toLocaleString("en-IN")} / mo
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* 6. Amenities & Description */}
      <div className="rounded-xl border border-border-default bg-white p-4 sm:p-5 shadow-soft space-y-3">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
          <span className="text-xs font-bold text-primary-navy uppercase tracking-wider">
            6. Amenities & Description
          </span>
          <button
            type="button"
            onClick={() => onEditStep(6)}
            className="text-xs font-semibold text-accent-gold-hover hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {draft.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {draft.amenities.map((am) => (
                <span
                  key={am}
                  className="px-2 py-1 rounded bg-bg-light border border-border-subtle text-text-primary text-[11px] font-medium"
                >
                  ✓ {am}
                </span>
              ))}
            </div>
          )}

          {draft.description && (
            <p className="text-text-secondary leading-relaxed bg-bg-light p-3 rounded-lg border border-border-subtle">
              {draft.description}
            </p>
          )}
        </div>
      </div>

      {/* Accuracy Confirmation Checkbox */}
      <div className="p-4 rounded-xl bg-accent-gold-light/40 border border-accent-gold-muted flex items-start gap-3">
        <input
          id="confirm-accuracy"
          type="checkbox"
          checked={draft.isConfirmed}
          onChange={(e) => onConfirmChange(e.target.checked)}
          className="w-4 h-4 mt-0.5 rounded border-border-default accent-primary-navy cursor-pointer"
        />
        <label
          htmlFor="confirm-accuracy"
          className="text-xs text-text-primary leading-relaxed cursor-pointer select-none"
        >
          <strong>Legal Confirmation:</strong> I hereby confirm that I am the authorized owner/representative of this property, and the pricing, photographs, and legal details provided are authentic and accurate according to RERA standards.
        </label>
      </div>

      {/* Bottom Publish & Save Draft Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onSaveDraft}
          className="w-full sm:w-1/3 text-xs font-bold"
        >
          Save as Draft
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onPublish}
          disabled={!draft.isConfirmed || draft.photos.length === 0}
          isLoading={isPublishing}
          leftIcon={<FileCheck className="w-5 h-5" />}
          className="w-full sm:w-2/3 text-sm sm:text-base font-bold shadow-soft-md h-12"
        >
          Publish Property Listing
        </Button>
      </div>
    </div>
  );
}

export default Step7Review;

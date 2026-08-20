"use client";

import React from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { PropertyCategory } from "@/types/postProperty";

export interface Step6AmenitiesDescriptionProps {
  category: PropertyCategory;
  amenities: string[];
  onAmenitiesChange: (amenities: string[]) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  error?: string;
}

const RESIDENTIAL_AMENITIES = [
  "Reserved Parking",
  "High-speed Lift",
  "Fitness Gym",
  "Swimming Pool",
  "24x7 Multi-tier Security",
  "100% Power Backup",
  "Club House",
  "Children's Play Area",
  "Landscaped Garden",
  "Private Balcony",
  "CCTV Surveillance",
  "Visitor Car Parking",
];

const COMMERCIAL_AMENITIES = [
  "Reserved Car Parking",
  "High-speed Passenger Lifts",
  "Grand Reception Lobby",
  "Executive Conference Room",
  "Wet / Dry Pantry",
  "100% DG Power Backup",
  "CCTV Surveillance",
  "24x7 Campus Security",
  "Central Air Conditioning",
  "Fire Safety & Sprinklers",
  "Visitor Car Parking",
  "High-Speed Fiber Internet",
];

export function Step6AmenitiesDescription({
  category,
  amenities,
  onAmenitiesChange,
  description,
  onDescriptionChange,
  error,
}: Step6AmenitiesDescriptionProps) {
  const amenityList =
    category === "residential" ? RESIDENTIAL_AMENITIES : COMMERCIAL_AMENITIES;

  const toggleAmenity = (name: string) => {
    if (amenities.includes(name)) {
      onAmenitiesChange(amenities.filter((a) => a !== name));
    } else {
      onAmenitiesChange([...amenities, name]);
    }
  };

  const selectAll = () => {
    onAmenitiesChange([...amenityList]);
  };

  const clearAll = () => {
    onAmenitiesChange([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-primary-navy">
          Select Amenities & Describe Your Property
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
          Highlight key society features and provide a compelling overview for buyers and tenants.
        </p>
      </div>

      {/* 1. Amenities Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
            Select Society & Building Amenities ({amenities.length} Selected)
          </label>
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={selectAll}
              className="text-accent-gold-hover hover:underline font-semibold cursor-pointer"
            >
              Select All
            </button>
            <span className="text-text-muted">•</span>
            <button
              type="button"
              onClick={clearAll}
              className="text-text-muted hover:text-text-primary font-semibold cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {amenityList.map((amenity) => {
            const isSelected = amenities.includes(amenity);
            return (
              <div
                key={amenity}
                onClick={() => toggleAmenity(amenity)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-2 select-none ${
                  isSelected
                    ? "bg-primary-navy text-white border-primary-navy shadow-soft-xs font-semibold"
                    : "bg-white text-text-primary border-border-default hover:bg-bg-light hover:border-border-dark"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                    isSelected ? "text-accent-gold" : "text-text-muted"
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      isSelected ? "fill-accent-gold text-dark-navy" : ""
                    }`}
                  />
                </div>
                <span className="text-xs truncate">{amenity}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Description Textarea */}
      <div className="space-y-2 pt-2 border-t border-border-subtle">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
            Describe Your Property *
          </label>
          <span
            className={`text-xs font-semibold ${
              description.length > 900 ? "text-error-red" : "text-text-muted"
            }`}
          >
            {description.length} / 1000 characters
          </span>
        </div>

        <textarea
          rows={5}
          maxLength={1000}
          placeholder="Tell buyers or tenants what makes this property special (e.g. well-ventilated corner unit, premium Italian marble, modular kitchen with chimney, walking distance to metro station, 24x7 security)..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className={`w-full p-3.5 rounded-xl border text-xs text-text-primary focus:border-accent-gold focus:outline-none resize-none font-sans leading-relaxed shadow-soft-xs ${
            error ? "border-error-red bg-error-red-light/20" : "border-border-default bg-white"
          }`}
        />

        {error && (
          <p className="text-xs text-error-red font-semibold">{error}</p>
        )}

        {/* Helpful Writing Tips */}
        <div className="p-3 rounded-xl bg-bg-light border border-border-subtle text-xs text-text-secondary space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-primary-navy">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
            Writing Tips for Better Inquiries
          </div>
          <p className="text-[11px] leading-relaxed">
            Mention the floor orientation, natural ventilation, quality of woodwork/fixtures, proximity to IT corridors/metro, and whether parking is included in the price.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Step6AmenitiesDescription;

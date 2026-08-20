"use client";

import React from "react";
import { MapPin, ShieldCheck, Navigation } from "lucide-react";
import { Input } from "@/components/ui";
import { ListingLocation } from "@/types/postProperty";

export interface Step2LocationProps {
  location: ListingLocation;
  onChange: (location: ListingLocation) => void;
  errors?: Record<string, string>;
}

const POPULAR_CITIES = [
  "Bangalore",
  "Mumbai",
  "Delhi NCR",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
];

export function Step2Location({
  location,
  onChange,
  errors = {},
}: Step2LocationProps) {
  const updateField = (field: keyof ListingLocation, value: string) => {
    onChange({ ...location, [field]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-primary-navy">
          Where is your property located?
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
          An accurate location helps verified buyers and tenants find your listing faster.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* 1. City & Locality */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              City *
            </label>
            <div className="relative flex items-center">
              <MapPin className="absolute left-3 h-3.5 w-3.5 text-accent-gold pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Bangalore"
                value={location.city}
                onChange={(e) => updateField("city", e.target.value)}
                className={`w-full h-10 pl-8 pr-3 rounded-lg border text-xs font-medium focus:border-accent-gold focus:outline-none transition-all shadow-soft-xs ${
                  errors.city ? "border-error-red bg-error-red-light/30" : "border-border-default bg-white"
                }`}
              />
            </div>
            {errors.city && (
              <p className="text-[11px] text-error-red font-medium mt-1">{errors.city}</p>
            )}

            {/* Quick City Chips */}
            <div className="flex flex-wrap gap-1 mt-2">
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateField("city", c)}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    location.city === c
                      ? "bg-primary-navy text-white border-primary-navy"
                      : "bg-bg-light text-text-secondary border-border-subtle hover:bg-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Locality / Neighborhood *
            </label>
            <Input
              placeholder="e.g. Whitefield, HSR Layout, Bandra West"
              value={location.locality}
              onChange={(e) => updateField("locality", e.target.value)}
              error={errors.locality}
            />
          </div>
        </div>

        {/* 2. Project / Society Name & Landmark */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Project / Society / Building Name *
            </label>
            <Input
              placeholder="e.g. Prestige Tech Park / Sobha Dream Acres"
              value={location.projectSociety}
              onChange={(e) => updateField("projectSociety", e.target.value)}
              error={errors.projectSociety}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Popular Landmark (Optional)
            </label>
            <Input
              placeholder="e.g. Opposite Phoenix Marketcity / Near Metro"
              value={location.landmark}
              onChange={(e) => updateField("landmark", e.target.value)}
            />
          </div>
        </div>

        {/* 3. Exact Address */}
        <div>
          <label className="text-xs font-semibold text-text-secondary block mb-1">
            Complete Street Address *
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Flat 402, Tower B, Prestige Shantiniketan, ITPL Main Road, Bengaluru 560066"
            value={location.address}
            onChange={(e) => updateField("address", e.target.value)}
            className={`w-full p-2.5 rounded-lg border text-xs text-text-primary focus:border-accent-gold focus:outline-none resize-none font-sans ${
              errors.address ? "border-error-red bg-error-red-light/30" : "border-border-default bg-white"
            }`}
          />
          {errors.address && (
            <p className="text-[11px] text-error-red font-medium mt-1">{errors.address}</p>
          )}
        </div>

        {/* 4. Interactive Map Position Placeholder */}
        <div className="rounded-xl border border-border-default bg-slate-50 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary-navy flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-accent-gold" />
              Pin Exact Location on Map (Approximate GPS)
            </span>
            <span className="text-[10px] font-semibold text-success-green bg-success-green-light px-2 py-0.5 rounded border border-success-green-border">
              GPS Calibrated
            </span>
          </div>

          <div className="h-32 w-full rounded-lg bg-slate-200 border border-dashed border-border-dark flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
            {/* Visual Grid Pattern */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#0F1B3D_1px,transparent_1px)] [background-size:16px_16px]" />
            <MapPin className="w-8 h-8 text-accent-gold drop-shadow-md relative z-10 animate-bounce" />
            <p className="text-xs font-semibold text-primary-navy relative z-10 mt-1">
              {location.locality ? `${location.locality}, ${location.city}` : "Drag and drop pin to set exact coordinates"}
            </p>
            <span className="text-[10px] text-text-muted relative z-10">
              Latitude: 12.9716° N • Longitude: 77.5946° E
            </span>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-3.5 rounded-xl bg-bg-light border border-border-subtle flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-success-green shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary leading-relaxed">
            <strong className="text-text-primary">Privacy Protected:</strong> Your exact flat/door number and building wing will remain strictly confidential and will only be shared with verified buyers after your manual authorization.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Step2Location;

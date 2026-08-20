"use client";

import React from "react";
import { Maximize2 } from "lucide-react";
import { Input } from "@/components/ui";
import {
  PropertyCategory,
  ResidentialDetails,
  CommercialDetails,
} from "@/types/postProperty";

export interface Step3PropertyDetailsProps {
  category: PropertyCategory;
  residentialDetails: ResidentialDetails;
  onResidentialChange: (details: ResidentialDetails) => void;
  commercialDetails: CommercialDetails;
  onCommercialChange: (details: CommercialDetails) => void;
  errors?: Record<string, string>;
}

type CommercialFeatureKey =
  | "hasConferenceRoom"
  | "hasReception"
  | "hasPantry"
  | "hasPowerBackup"
  | "hasCentralAc"
  | "hasFireSafety";

const COMMERCIAL_FEATURE_LIST: { key: CommercialFeatureKey; label: string }[] = [
  { key: "hasConferenceRoom", label: "Conference Room" },
  { key: "hasReception", label: "Dedicated Reception" },
  { key: "hasPantry", label: "Wet / Dry Pantry" },
  { key: "hasPowerBackup", label: "100% DG Power Backup" },
  { key: "hasCentralAc", label: "Central VRV AC" },
  { key: "hasFireSafety", label: "Fire Safety & Sprinklers" },
];

export function Step3PropertyDetails({
  category,
  residentialDetails,
  onResidentialChange,
  commercialDetails,
  onCommercialChange,
  errors = {},
}: Step3PropertyDetailsProps) {
  const updateResField = <K extends keyof ResidentialDetails>(
    field: K,
    val: ResidentialDetails[K]
  ) => {
    onResidentialChange({ ...residentialDetails, [field]: val });
  };

  const updateCommField = <K extends keyof CommercialDetails>(
    field: K,
    val: CommercialDetails[K]
  ) => {
    onCommercialChange({ ...commercialDetails, [field]: val });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-primary-navy">
          Enter Property Details & Specifications
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
          {category === "residential"
            ? "Provide room configurations, area dimensions, and furnishing specifications."
            : "Specify commercial area floor plate, parking provisions, and fitout readiness."}
        </p>
      </div>

      {category === "residential" ? (
        /* RESIDENTIAL SPECIFICATIONS FORM */
        <div className="space-y-5">
          {/* 1. BHK Configuration */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary block">
              BHK Configuration *
            </label>
            <div className="flex flex-wrap gap-2">
              {["1", "2", "3", "4", "5+"].map((bhk) => {
                const isSelected = residentialDetails.bhk === bhk;
                return (
                  <button
                    key={bhk}
                    type="button"
                    onClick={() => updateResField("bhk", bhk)}
                    className={`flex-1 min-w-[60px] py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary-navy text-white border-primary-navy shadow-soft-xs"
                        : "bg-white text-text-primary border-border-default hover:bg-bg-light"
                    }`}
                  >
                    {bhk} BHK
                  </button>
                );
              })}
            </div>
            {errors.bhk && (
              <p className="text-[11px] text-error-red font-medium">{errors.bhk}</p>
            )}
          </div>

          {/* 2. Bathrooms & Balconies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary block">
                Number of Bathrooms *
              </label>
              <div className="flex gap-2">
                {["1", "2", "3", "4+"].map((bath) => (
                  <button
                    key={bath}
                    type="button"
                    onClick={() => updateResField("bathrooms", bath)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      residentialDetails.bathrooms === bath
                        ? "bg-accent-gold text-dark-navy border-accent-gold shadow-soft-xs"
                        : "bg-white text-text-primary border-border-default hover:bg-bg-light"
                    }`}
                  >
                    {bath}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary block">
                Number of Balconies
              </label>
              <div className="flex gap-2">
                {["0", "1", "2", "3+"].map((bal) => (
                  <button
                    key={bal}
                    type="button"
                    onClick={() => updateResField("balconies", bal)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      residentialDetails.balconies === bal
                        ? "bg-primary-navy text-white border-primary-navy shadow-soft-xs"
                        : "bg-white text-text-primary border-border-default hover:bg-bg-light"
                    }`}
                  >
                    {bal}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Carpet Area & Super Built-up Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Carpet Area (sq.ft) *
              </label>
              <div className="relative flex items-center">
                <Maximize2 className="absolute left-3 h-3.5 w-3.5 text-accent-gold pointer-events-none" />
                <input
                  type="number"
                  placeholder="e.g. 1450"
                  value={residentialDetails.carpetArea}
                  onChange={(e) => updateResField("carpetArea", e.target.value)}
                  className={`w-full h-10 pl-8 pr-3 rounded-lg border text-xs font-medium focus:border-accent-gold focus:outline-none transition-all shadow-soft-xs ${
                    errors.carpetArea ? "border-error-red bg-error-red-light/30" : "border-border-default bg-white"
                  }`}
                />
              </div>
              {errors.carpetArea && (
                <p className="text-[11px] text-error-red font-medium mt-1">
                  {errors.carpetArea}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Super Built-up Area (sq.ft)
              </label>
              <Input
                type="number"
                placeholder="e.g. 1820"
                value={residentialDetails.builtUpArea || ""}
                onChange={(e) => updateResField("builtUpArea", e.target.value)}
              />
            </div>
          </div>

          {/* 4. Floor & Total Floors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Floor Level *
              </label>
              <Input
                placeholder="e.g. 4th Floor / Ground Floor"
                value={residentialDetails.floor}
                onChange={(e) => updateResField("floor", e.target.value)}
                error={errors.floor}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Total Floors in Building
              </label>
              <Input
                type="number"
                placeholder="e.g. 14"
                value={residentialDetails.totalFloors}
                onChange={(e) => updateResField("totalFloors", e.target.value)}
              />
            </div>
          </div>

          {/* 5. Furnishing & Facing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Furnishing Status *
              </label>
              <select
                value={residentialDetails.furnishing}
                onChange={(e) => updateResField("furnishing", e.target.value as ResidentialDetails["furnishing"])}
                className="w-full h-10 px-3 rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none cursor-pointer"
              >
                <option value="Fully Furnished">Fully Furnished</option>
                <option value="Semi Furnished">Semi Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Main Door Facing
              </label>
              <select
                value={residentialDetails.facing}
                onChange={(e) => updateResField("facing", e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none cursor-pointer"
              >
                <option value="East">East Facing</option>
                <option value="North">North Facing</option>
                <option value="North-East">North-East Facing</option>
                <option value="West">West Facing</option>
                <option value="South">South Facing</option>
                <option value="South-East">South-East Facing</option>
              </select>
            </div>
          </div>

          {/* 6. Parking & Possession */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Car Parking Provision
              </label>
              <select
                value={residentialDetails.parking}
                onChange={(e) => updateResField("parking", e.target.value as ResidentialDetails["parking"])}
                className="w-full h-10 px-3 rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none cursor-pointer"
              >
                <option value="1 Covered">1 Covered Basement</option>
                <option value="2 Covered">2 Covered Stilt</option>
                <option value="1 Open">1 Open Parking</option>
                <option value="2+ Covered">2+ Covered</option>
                <option value="None">No Parking</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Possession Timeline
              </label>
              <select
                value={residentialDetails.possessionStatus}
                onChange={(e) => updateResField("possessionStatus", e.target.value as ResidentialDetails["possessionStatus"])}
                className="w-full h-10 px-3 rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none cursor-pointer"
              >
                <option value="Ready to Move">Ready to Move</option>
                <option value="Under Construction">Under Construction</option>
                <option value="New Launch">New Launch</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        /* COMMERCIAL SPECIFICATIONS FORM */
        <div className="space-y-5">
          {/* 1. Commercial Areas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Carpet Area (sq.ft) *
              </label>
              <div className="relative flex items-center">
                <Maximize2 className="absolute left-3 h-3.5 w-3.5 text-accent-gold pointer-events-none" />
                <input
                  type="number"
                  placeholder="e.g. 4500"
                  value={commercialDetails.carpetArea}
                  onChange={(e) => updateCommField("carpetArea", e.target.value)}
                  className={`w-full h-10 pl-8 pr-3 rounded-lg border text-xs font-medium focus:border-accent-gold focus:outline-none transition-all shadow-soft-xs ${
                    errors.carpetArea ? "border-error-red bg-error-red-light/30" : "border-border-default bg-white"
                  }`}
                />
              </div>
              {errors.carpetArea && (
                <p className="text-[11px] text-error-red font-medium mt-1">
                  {errors.carpetArea}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Super Built-up Area (sq.ft)
              </label>
              <Input
                type="number"
                placeholder="e.g. 5200"
                value={commercialDetails.builtUpArea || ""}
                onChange={(e) => updateCommField("builtUpArea", e.target.value)}
              />
            </div>
          </div>

          {/* 2. Floor & Parking */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Floor Level *
              </label>
              <Input
                placeholder="e.g. 6th Floor (Block B)"
                value={commercialDetails.floor}
                onChange={(e) => updateCommField("floor", e.target.value)}
                error={errors.floor}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Total Building Floors
              </label>
              <Input
                placeholder="e.g. 18 Floors"
                value={commercialDetails.totalFloors}
                onChange={(e) => updateCommField("totalFloors", e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Reserved Car Parking
              </label>
              <Input
                placeholder="e.g. 8 Dedicated Bays"
                value={commercialDetails.parking}
                onChange={(e) => updateCommField("parking", e.target.value)}
              />
            </div>
          </div>

          {/* 3. Furnishing & Possession */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Fit-out / Furnishing Status
              </label>
              <select
                value={commercialDetails.furnishing}
                onChange={(e) => updateCommField("furnishing", e.target.value as CommercialDetails["furnishing"])}
                className="w-full h-10 px-3 rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none cursor-pointer"
              >
                <option value="Fully Furnished">Fully Furnished (Plug & Play)</option>
                <option value="Semi Furnished">Semi Furnished</option>
                <option value="Warm Shell">Warm Shell</option>
                <option value="Bare Shell">Bare Shell</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Possession Readiness
              </label>
              <select
                value={commercialDetails.possessionStatus}
                onChange={(e) => updateCommField("possessionStatus", e.target.value as CommercialDetails["possessionStatus"])}
                className="w-full h-10 px-3 rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none cursor-pointer"
              >
                <option value="Ready to Move">Ready to Move</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Immediate">Immediate Handover</option>
              </select>
            </div>
          </div>

          {/* 4. Enterprise Facilities Checkboxes */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-text-secondary block">
              Core Enterprise Provisions Included:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {COMMERCIAL_FEATURE_LIST.map((feat) => {
                const isChecked = Boolean(commercialDetails[feat.key]);
                return (
                  <label
                    key={feat.key}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                      isChecked
                        ? "bg-primary-navy text-white border-primary-navy font-semibold"
                        : "bg-white text-text-secondary border-border-default hover:bg-bg-light"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => updateCommField(feat.key, e.target.checked)}
                      className="rounded accent-accent-gold cursor-pointer"
                    />
                    <span>{feat.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Step3PropertyDetails;

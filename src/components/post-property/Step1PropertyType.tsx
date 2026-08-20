"use client";

import React from "react";
import {
  Building,
  Home,
  Store,
  Warehouse,
  Briefcase,
  Layers,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import {
  PostTransactionType,
  PropertyCategory,
  ResidentialType,
  CommercialType,
} from "@/types/postProperty";

export interface Step1PropertyTypeProps {
  transaction: PostTransactionType;
  onTransactionChange: (txn: PostTransactionType) => void;
  category: PropertyCategory;
  onCategoryChange: (cat: PropertyCategory) => void;
  residentialType: ResidentialType;
  onResidentialTypeChange: (type: ResidentialType) => void;
  commercialType: CommercialType;
  onCommercialTypeChange: (type: CommercialType) => void;
}

const RESIDENTIAL_TYPES = [
  {
    id: "apartment" as ResidentialType,
    title: "Apartment / Flat",
    subtitle: "High-rise or gated community",
    icon: Building,
  },
  {
    id: "villa" as ResidentialType,
    title: "Independent Villa",
    subtitle: "Gated luxury villa or bungalow",
    icon: Home,
  },
  {
    id: "independent-house" as ResidentialType,
    title: "Independent House",
    subtitle: "Standalone residential building",
    icon: Home,
  },
  {
    id: "builder-floor" as ResidentialType,
    title: "Builder Floor",
    subtitle: "Independent low-rise floor",
    icon: Layers,
  },
  {
    id: "studio" as ResidentialType,
    title: "Studio / 1 RK",
    subtitle: "Compact individual flat",
    icon: Building,
  },
  {
    id: "plot" as ResidentialType,
    title: "Residential Plot",
    subtitle: "Approved residential land",
    icon: MapPin,
  },
];

const COMMERCIAL_TYPES = [
  {
    id: "office" as CommercialType,
    title: "Office Space",
    subtitle: "Furnished or bare-shell corporate floor",
    icon: Briefcase,
  },
  {
    id: "shop" as CommercialType,
    title: "Commercial Shop",
    subtitle: "Retail shop in shopping arcade",
    icon: Store,
  },
  {
    id: "showroom" as CommercialType,
    title: "Commercial Showroom",
    subtitle: "High-footfall frontage space",
    icon: Store,
  },
  {
    id: "warehouse" as CommercialType,
    title: "Warehouse / Logistics",
    subtitle: "Industrial PEB storage hub",
    icon: Warehouse,
  },
  {
    id: "coworking" as CommercialType,
    title: "Co-working / Flex Desk",
    subtitle: "Managed seats or private cabin",
    icon: Briefcase,
  },
  {
    id: "retail" as CommercialType,
    title: "Retail Space",
    subtitle: "Mall / high-street retail outlet",
    icon: Store,
  },
  {
    id: "industrial" as CommercialType,
    title: "Industrial Building",
    subtitle: "Factory or manufacturing unit",
    icon: Warehouse,
  },
  {
    id: "plot" as CommercialType,
    title: "Commercial Plot",
    subtitle: "Commercial-zoned land parcel",
    icon: MapPin,
  },
];

export function Step1PropertyType({
  transaction,
  onTransactionChange,
  category,
  onCategoryChange,
  residentialType,
  onResidentialTypeChange,
  commercialType,
  onCommercialTypeChange,
}: Step1PropertyTypeProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-primary-navy">
          What are you looking to list?
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
          Select transaction model, property category, and building configuration.
        </p>
      </div>

      {/* 1. Transaction Type: For Sale vs For Rent */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
          Transaction Model *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "sale" as PostTransactionType, label: "FOR SALE", desc: "Selling outright to buyers" },
            { id: "rent" as PostTransactionType, label: "FOR RENT / LEASE", desc: "Renting to tenants or businesses" },
          ].map((item) => {
            const isSelected = transaction === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onTransactionChange(item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-primary-navy text-white border-primary-navy shadow-soft-sm"
                    : "bg-white text-text-primary border-border-default hover:bg-bg-light"
                }`}
              >
                <div>
                  <span className="text-xs sm:text-sm font-bold block">{item.label}</span>
                  <span className={`text-[11px] block mt-0.5 ${isSelected ? "text-white/80" : "text-text-muted"}`}>
                    {item.desc}
                  </span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected
                      ? "border-accent-gold bg-accent-gold text-dark-navy"
                      : "border-border-default"
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-4 h-4 fill-dark-navy text-accent-gold" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Category: Residential vs Commercial */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
          Property Category *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "residential" as PropertyCategory, label: "RESIDENTIAL", desc: "Homes, flats, villas & plots" },
            { id: "commercial" as PropertyCategory, label: "COMMERCIAL", desc: "Offices, shops, showrooms & warehouses" },
          ].map((item) => {
            const isSelected = category === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onCategoryChange(item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-white border-accent-gold ring-2 ring-accent-gold/30 shadow-soft-sm text-primary-navy"
                    : "bg-white text-text-primary border-border-default hover:bg-bg-light"
                }`}
              >
                <div>
                  <span className="text-xs sm:text-sm font-bold block">{item.label}</span>
                  <span className="text-[11px] text-text-muted block mt-0.5">{item.desc}</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected
                      ? "border-accent-gold bg-accent-gold text-dark-navy"
                      : "border-border-default"
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-4 h-4 fill-dark-navy text-accent-gold" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Specific Property Type Grid */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
          Select Property Type *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {category === "residential"
            ? RESIDENTIAL_TYPES.map((type) => {
                const isSelected = residentialType === type.id;
                const Icon = type.icon;
                return (
                  <div
                    key={type.id}
                    onClick={() => onResidentialTypeChange(type.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? "bg-white border-accent-gold ring-2 ring-accent-gold/20 shadow-soft-sm"
                        : "bg-white border-border-default hover:border-border-dark hover:bg-bg-light"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-primary-navy text-accent-gold"
                          : "bg-bg-light text-text-secondary"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <strong className="text-xs font-bold text-primary-navy block truncate">
                        {type.title}
                      </strong>
                      <span className="text-[10px] text-text-muted block truncate">
                        {type.subtitle}
                      </span>
                    </div>
                  </div>
                );
              })
            : COMMERCIAL_TYPES.map((type) => {
                const isSelected = commercialType === type.id;
                const Icon = type.icon;
                return (
                  <div
                    key={type.id}
                    onClick={() => onCommercialTypeChange(type.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? "bg-white border-accent-gold ring-2 ring-accent-gold/20 shadow-soft-sm"
                        : "bg-white border-border-default hover:border-border-dark hover:bg-bg-light"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-primary-navy text-accent-gold"
                          : "bg-bg-light text-text-secondary"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <strong className="text-xs font-bold text-primary-navy block truncate">
                        {type.title}
                      </strong>
                      <span className="text-[10px] text-text-muted block truncate">
                        {type.subtitle}
                      </span>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}

export default Step1PropertyType;

"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Building2, MapPin } from "lucide-react";

export interface CommercialDiscoveryProps {
  onSelectType: (type: string) => void;
  onSelectLocation: (loc: string) => void;
  selectedType?: string;
  selectedLocation?: string;
}

const COMMERCIAL_TYPES = [
  {
    id: "office",
    title: "Office Space",
    tagline: "Grade-A IT & Corporate Towers",
    description: "Plug-and-play furnished offices and bare-shell floors in top tech corridors.",
    hubs: "ORR, BKC, Cyber City, HITEC City",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "showroom",
    title: "Shop & Showroom",
    tagline: "High-Street & Retail Frontage",
    description: "Prime ground-floor high-footfall retail spaces for luxury & consumer brands.",
    hubs: "Indiranagar, Lower Parel, South Ex",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "warehouse",
    title: "Warehouse & Logistics",
    tagline: "Industrial Grade-A PEB Parks",
    description: "FM2 flooring, 12m apex height, multi-dock fulfillment centers.",
    hubs: "Bhiwandi, Nelamangala, Manesar",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "coworking",
    title: "Co-working & Flex",
    tagline: "Enterprise Agile Workspaces",
    description: "Managed offices, private cabins, and flexible desk solutions.",
    hubs: "Koramangala, Powai, CyberHub",
    image:
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80",
  },
];

const COMMERCIAL_LOCATION_CLUSTERS = [
  {
    city: "Bangalore",
    hubs: [
      "Outer Ring Road",
      "Whitefield",
      "Electronic City",
      "Koramangala",
      "Indiranagar",
      "Hebbal",
    ],
  },
  {
    city: "Mumbai",
    hubs: ["BKC", "Lower Parel", "Andheri East", "Powai", "Thane"],
  },
  {
    city: "Delhi NCR",
    hubs: ["DLF Cyber City", "Golf Course Road", "Gurugram", "Noida", "Greater Noida"],
  },
  {
    city: "Hyderabad",
    hubs: ["HITEC City", "Gachibowli", "Financial District", "Kondapur"],
  },
  {
    city: "Pune",
    hubs: ["Kharadi", "Hinjawadi", "Baner", "Viman Nagar"],
  },
  {
    city: "Chennai",
    hubs: ["OMR", "Guindy", "T Nagar", "Mount Road"],
  },
];

export function CommercialDiscovery({
  onSelectType,
  onSelectLocation,
  selectedType,
  selectedLocation,
}: CommercialDiscoveryProps) {
  return (
    <div className="space-y-8">
      {/* 1. Commercial Categories Grid */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-accent-gold-hover uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-accent-gold" />
              <span>Commercial Asset Classes</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-primary-navy mt-0.5">
              Explore Spaces by Business Requirement
            </h2>
          </div>
          <span className="text-xs text-text-muted hidden sm:inline-block">
            Verified corporate listings
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COMMERCIAL_TYPES.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <div
                key={type.id}
                onClick={() => onSelectType(type.id)}
                className={`group relative rounded-xl border bg-white overflow-hidden shadow-soft hover:shadow-soft-md transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-accent-gold ring-2 ring-accent-gold/20"
                    : "border-border-default hover:border-border-dark"
                }`}
              >
                {/* Image */}
                <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={type.image}
                    alt={type.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/80 via-dark-navy/20 to-transparent p-3 flex items-end">
                    <span className="text-[11px] font-semibold text-white/95">
                      {type.tagline}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-primary-navy group-hover:text-accent-gold-hover transition-colors">
                      {type.title}
                    </h3>
                    <p className="text-[11px] text-text-secondary line-clamp-2 mt-1 leading-relaxed">
                      {type.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
                    <span className="text-[10px] font-medium text-text-muted truncate max-w-[140px]">
                      {type.hubs}
                    </span>
                    <span className="text-xs font-bold text-accent-gold-hover flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Explore <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Popular Commercial Business Districts */}
      <div className="rounded-2xl bg-white border border-border-default p-4 sm:p-5 shadow-soft space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-accent-gold shrink-0" />
          <h3 className="text-sm sm:text-base font-bold text-primary-navy">
            Prime Commercial Corridors & Business Districts
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {COMMERCIAL_LOCATION_CLUSTERS.map((cluster) => (
            <div
              key={cluster.city}
              className="p-3 rounded-xl bg-bg-light/80 border border-border-subtle space-y-2"
            >
              <span className="text-xs font-bold text-primary-navy block border-b border-border-default pb-1">
                {cluster.city}
              </span>
              <div className="flex flex-wrap gap-1">
                {cluster.hubs.map((hub) => {
                  const isSelected = selectedLocation?.toLowerCase() === hub.toLowerCase();
                  return (
                    <button
                      key={hub}
                      type="button"
                      onClick={() => onSelectLocation(hub)}
                      className={`text-[11px] px-2 py-0.5 rounded transition-colors text-left cursor-pointer ${
                        isSelected
                          ? "bg-primary-navy text-white font-bold"
                          : "text-text-secondary hover:text-text-primary hover:bg-white"
                      }`}
                    >
                      • {hub}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CommercialDiscovery;

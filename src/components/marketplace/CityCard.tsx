"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight, Building2 } from "lucide-react";
import { CityInfo } from "@/types/property";

export interface CityCardProps {
  city: CityInfo;
  onSelectCity?: (cityName: string) => void;
  className?: string;
}

export function CityCard({ city, onSelectCity, className = "" }: CityCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onSelectCity) {
      e.preventDefault();
      onSelectCity(city.name);
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectCity?.(city.name);
        }
      }}
      className={`group relative overflow-hidden rounded-xl border border-border-default bg-dark-navy text-white shadow-soft hover:shadow-soft-md hover:-translate-y-1 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold ${className}`}
      aria-label={`Explore properties in ${city.name}`}
    >
      {/* Background City Image with Consistent 4:3 Ratio */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-900">
        <Image
          src={city.image}
          alt={`${city.name} real estate & architecture`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 brightness-95"
        />

        {/* Gradient Overlays for Strong Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/95 via-dark-navy/40 to-transparent" />
        <div className="absolute inset-0 bg-primary-navy/15 group-hover:bg-transparent transition-colors duration-300" />
      </div>

      {/* Top Property Count Badge */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/95 backdrop-blur-xs px-2.5 py-1 text-xs font-bold text-primary-navy shadow-soft-xs">
          <Building2 className="w-3.5 h-3.5 text-accent-gold shrink-0" />
          {city.propertyCount}
        </span>
      </div>

      {/* Top Right Arrow Indicator */}
      <div className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 backdrop-blur-xs text-white group-hover:bg-accent-gold group-hover:text-dark-navy transition-all duration-200">
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>

      {/* Bottom Information */}
      <div className="absolute inset-x-0 bottom-0 p-4 z-10 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-accent-gold transition-colors">
            {city.name}
          </h3>
          <span className="text-[11px] font-medium text-white/60">{city.state}</span>
        </div>
        <p className="text-xs text-white/75 line-clamp-1">
          {city.popularLocalities.slice(0, 4).join(" • ")}
        </p>
        <div className="pt-1 flex items-center text-xs font-semibold text-accent-gold group-hover:underline">
          Explore Properties &rarr;
        </div>
      </div>
    </div>
  );
}

export default CityCard;

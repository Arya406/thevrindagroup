"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

export interface RentCityInfo {
  name: string;
  image: string;
  localities: string;
  rentRange: string;
  totalProperties: string;
}

const RENTAL_CITIES: RentCityInfo[] = [
  {
    name: "Bangalore",
    image:
      "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80",
    localities: "Whitefield, HSR, Koramangala, Indiranagar",
    rentRange: "₹ 18,000 - ₹ 85,000 / mo",
    totalProperties: "2,450+ Rentals",
  },
  {
    name: "Mumbai",
    image:
      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80",
    localities: "Powai, Andheri, Lower Parel, Bandra",
    rentRange: "₹ 25,000 - ₹ 1.50L+ / mo",
    totalProperties: "3,120+ Rentals",
  },
  {
    name: "Delhi NCR",
    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
    localities: "Golf Course Rd, Cyber City, Noida, Dwarka",
    rentRange: "₹ 15,000 - ₹ 80,000 / mo",
    totalProperties: "1,980+ Rentals",
  },
  {
    name: "Hyderabad",
    image:
      "https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=800&q=80",
    localities: "HITEC City, Gachibowli, Kondapur, Madhapur",
    rentRange: "₹ 15,000 - ₹ 60,000 / mo",
    totalProperties: "1,450+ Rentals",
  },
  {
    name: "Pune",
    image:
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80",
    localities: "Hinjawadi, Kharadi, Baner, Wakad",
    rentRange: "₹ 14,000 - ₹ 55,000 / mo",
    totalProperties: "1,200+ Rentals",
  },
  {
    name: "Chennai",
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    localities: "OMR, Sholinganallur, Anna Nagar, Velachery",
    rentRange: "₹ 14,000 - ₹ 50,000 / mo",
    totalProperties: "890+ Rentals",
  },
];

export interface RentDiscoveryProps {
  onSelectCity: (cityName: string) => void;
  selectedCity?: string;
}

export function RentDiscovery({
  onSelectCity,
  selectedCity = "",
}: RentDiscoveryProps) {
  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-gold-hover mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            Top Rental Destinations
          </div>
          <h2 className="text-lg font-bold text-primary-navy">
            Find Your Perfect Rental by City
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {RENTAL_CITIES.map((city) => {
          const isSelected =
            selectedCity.toLowerCase() === city.name.toLowerCase();
          return (
            <button
              key={city.name}
              type="button"
              onClick={() => onSelectCity(city.name)}
              className={`group text-left rounded-xl border bg-white overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "border-accent-gold ring-2 ring-accent-gold/30 shadow-soft-sm scale-[1.02]"
                  : "border-border-default hover:border-border-dark hover:shadow-soft"
              }`}
            >
              <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/80 via-dark-navy/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-2 left-2.5 right-2.5 text-white pointer-events-none">
                  <span className="text-xs font-bold block">{city.name}</span>
                  <span className="text-[10px] text-white/80 block">
                    {city.totalProperties}
                  </span>
                </div>
              </div>

              <div className="p-2.5 space-y-1">
                <p className="text-[11px] font-semibold text-primary-navy truncate">
                  {city.rentRange}
                </p>
                <p className="text-[10px] text-text-muted truncate">
                  {city.localities}
                </p>
                <div className="pt-1 flex items-center gap-1 text-[11px] font-bold text-accent-gold-hover group-hover:text-dark-navy transition-colors">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RentDiscovery;

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Building2, MapPin, Maximize2, ArrowRight } from "lucide-react";
import { Button, ReraBadge } from "@/components/ui";

interface CommercialProject {
  id: string;
  name: string;
  developer: string;
  location: string;
  city: string;
  types: string;
  areaRange: string;
  startingPrice: string;
  possession: string;
  isReraVerified: boolean;
  image: string;
}

const FEATURED_COMMERCIAL_PROJECTS: CommercialProject[] = [
  {
    id: "proj-c1",
    name: "Embassy TechVillage Corporate Hub",
    developer: "Embassy Group",
    location: "Outer Ring Road, Bangalore",
    city: "Bangalore",
    types: "Grade-A IT SEZ & Corporate Towers",
    areaRange: "5,000 - 1,20,000 sq.ft",
    startingPrice: "₹ 85 / sq.ft / mo",
    possession: "Ready to Move",
    isReraVerified: true,
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "proj-c2",
    name: "Godrej Two Commercial Towers",
    developer: "Godrej Properties",
    location: "Vikhroli East, Mumbai",
    city: "Mumbai",
    types: "Corporate Headquarters & High Street",
    areaRange: "3,500 - 45,000 sq.ft",
    startingPrice: "₹ 140 / sq.ft / mo",
    possession: "Ready to Move",
    isReraVerified: true,
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "proj-c3",
    name: "DLF Downtown Horizon",
    developer: "DLF Limited",
    location: "Cyber City Phase 3, Gurugram",
    city: "Delhi NCR",
    types: "IT / Corporate Complex",
    areaRange: "8,000 - 80,000 sq.ft",
    startingPrice: "₹ 125 / sq.ft / mo",
    possession: "Under Construction (Q4 2026)",
    isReraVerified: true,
    image:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
  },
];

export function CommercialProjectsSection({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-accent-gold-hover uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-accent-gold" />
            <span>Master-Planned Developments</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-primary-navy mt-0.5">
            Featured Commercial Projects
          </h2>
        </div>
        <Link href="/commercial" className="text-xs font-bold text-accent-gold-hover hover:underline flex items-center gap-1">
          View All Enterprise Campuses <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {FEATURED_COMMERCIAL_PROJECTS.map((proj) => (
          <div
            key={proj.id}
            className="group flex flex-col justify-between rounded-xl border border-border-default bg-white shadow-soft hover:shadow-soft-md hover:border-border-dark overflow-hidden transition-all duration-200"
          >
            <div>
              {/* Image */}
              <div className="relative aspect-16/9 w-full overflow-hidden bg-slate-100">
                <Image
                  src={proj.image}
                  alt={proj.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 z-10">
                  {proj.isReraVerified && <ReraBadge size="sm" />}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark-navy/85 via-dark-navy/20 to-transparent p-3 flex items-end justify-between">
                  <span className="text-[11px] font-semibold text-white/95">
                    {proj.possession}
                  </span>
                  <span className="text-[11px] font-bold text-accent-gold">
                    {proj.startingPrice}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2.5">
                <div>
                  <span className="text-[11px] font-semibold text-text-muted block">
                    By {proj.developer}
                  </span>
                  <h3 className="text-sm font-bold text-primary-navy group-hover:text-accent-gold-hover transition-colors line-clamp-1">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                    <span className="truncate">{proj.location}</span>
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-bg-light border border-border-subtle text-xs space-y-1">
                  <p className="text-text-secondary truncate">
                    <strong>Types:</strong> {proj.types}
                  </p>
                  <p className="text-text-secondary flex items-center gap-1">
                    <Maximize2 className="w-3 h-3 text-accent-gold" />
                    <strong>Plates:</strong> {proj.areaRange}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="p-4 pt-0">
              <Link href={`/commercial?city=${proj.city}`} className="w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-semibold group-hover:border-primary-navy"
                >
                  Explore Project &rarr;
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommercialProjectsSection;

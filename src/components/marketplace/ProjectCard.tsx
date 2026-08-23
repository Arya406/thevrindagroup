"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui";
import { NewProject } from "@/types/property";

export interface ProjectCardProps {
  project: NewProject;
  className?: string;
}

export function ProjectCard({ project, className = "" }: ProjectCardProps) {
  return (
    <div
      className={`group flex flex-col sm:flex-row h-full rounded-2xl border border-border-default bg-white text-text-primary shadow-soft hover:shadow-soft-lg hover:border-border-dark hover:-translate-y-0.5 transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* 1. Project Image Container (Proportional 5/12 on tablet/desktop, full width on mobile) */}
      <div className="relative aspect-16/10 sm:aspect-auto sm:w-5/12 overflow-hidden bg-slate-100 min-h-[220px] sm:min-h-full shrink-0">
        <Image
          src={project.image}
          alt={project.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Project Tag / Badge (Anchored Top-Left) */}
        {project.tag && (
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span className="inline-flex items-center rounded-md bg-accent-gold px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-dark-navy shadow-soft-xs">
              {project.tag}
            </span>
          </div>
        )}

        {/* RERA Approved Badge (Pinned Bottom-Left) */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-dark-navy/85 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white shadow-soft-xs border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-success-green shrink-0" />
            RERA Approved
          </span>
        </div>
      </div>

      {/* 2. Structured Vertical Content Section (Predictable 6-block layout with fixed rhythm) */}
      <div className="flex flex-col flex-1 p-5 sm:p-6 min-w-0 justify-between">
        <div className="flex flex-col min-w-0">
          {/* Block 1: Developer Name & Starting Price (Fixed 24px height) */}
          <div className="flex items-center justify-between gap-2 h-6 mb-2 min-w-0">
            <span
              className="text-[11px] font-extrabold uppercase tracking-wider text-text-secondary truncate block flex-1"
              title={project.developer}
            >
              {project.developer}
            </span>
            {project.startingPrice && (
              <span className="text-xs font-extrabold text-accent-gold-hover bg-accent-gold-light px-2.5 py-0.5 rounded-md border border-accent-gold-muted shrink-0 whitespace-nowrap">
                {project.startingPrice} onwards
              </span>
            )}
          </div>

          {/* Block 2: Project Title (Fixed 48px / exactly 2-line reserved container) */}
          <div className="h-12 mb-1.5 flex items-start overflow-hidden">
            <h3
              className="text-base sm:text-lg font-bold text-primary-navy group-hover:text-accent-gold-hover transition-colors leading-6 line-clamp-2"
              title={project.name}
            >
              {project.name}
            </h3>
          </div>

          {/* Block 3: Location (Fixed 20px / 1-line reserved container) */}
          <div className="h-5 mb-3 flex items-center min-w-0">
            <p className="text-xs text-text-secondary flex items-center gap-1.5 w-full min-w-0">
              <MapPin className="w-3.5 h-3.5 text-accent-gold shrink-0" />
              <span className="truncate" title={`${project.location}, ${project.city}`}>
                {project.location}, {project.city}
              </span>
            </p>
          </div>

          {/* Block 4: Configuration & Possession Box (Fixed 60px height container) */}
          <div className="h-[60px] mb-3 px-3 py-2 rounded-xl bg-bg-light border border-border-subtle flex flex-col justify-center gap-1 overflow-hidden shrink-0">
            <div className="flex items-center justify-between text-xs gap-2 min-w-0">
              <span className="font-bold text-primary-navy truncate" title={project.propertyTypes}>
                {project.propertyTypes}
              </span>
              <span className="text-[11px] font-semibold text-text-muted shrink-0 whitespace-nowrap">
                Possession {project.possessionDate}
              </span>
            </div>
            {project.reraNumber && (
              <div
                className="text-[10px] text-text-muted truncate font-mono"
                title={`RERA: ${project.reraNumber}`}
              >
                RERA: {project.reraNumber}
              </div>
            )}
          </div>

          {/* Block 5: Description / Highlight (Fixed 36px / 2-line reserved container) */}
          <div className="h-9 mb-4 flex items-start overflow-hidden">
            <p
              className="text-xs text-text-secondary leading-[18px] line-clamp-2"
              title={project.highlight}
            >
              {project.highlight}
            </p>
          </div>
        </div>

        {/* Block 6: Action Button (Strictly bottom-pinned via mt-auto) */}
        <div className="mt-auto pt-1">
          <Link href="/properties" className="block w-full">
            <Button
              variant="primary"
              size="sm"
              className="w-full justify-between font-bold h-10 text-xs shadow-soft-xs hover:shadow-soft"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              <span>Explore Project &amp; Floor Plans</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;

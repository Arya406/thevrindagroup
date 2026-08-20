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
      className={`group flex flex-col md:flex-row h-full rounded-xl border border-border-default bg-white text-text-primary shadow-soft hover:shadow-soft-md hover:border-border-dark hover:-translate-y-1 transition-all duration-200 overflow-hidden ${className}`}
    >
      {/* Project Image Container */}
      <div className="relative aspect-16/10 md:aspect-auto md:w-5/12 overflow-hidden bg-slate-100 min-h-[200px] shrink-0">
        <Image
          src={project.image}
          alt={project.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 35vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Project Tag / Badge */}
        {project.tag && (
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span className="rounded bg-accent-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-dark-navy shadow-soft-xs">
              {project.tag}
            </span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1 rounded bg-black/60 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-medium text-white">
            <ShieldCheck className="w-3.5 h-3.5 text-success-green" />
            RERA Approved
          </span>
        </div>
      </div>

      {/* Project Details */}
      <div className="flex flex-col flex-1 p-5 justify-between space-y-3">
        <div className="space-y-2">
          {/* Developer & Starting Price */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              {project.developer}
            </span>
            <span className="text-xs font-bold text-accent-gold-hover bg-accent-gold-light px-2.5 py-0.5 rounded border border-accent-gold-muted shrink-0">
              {project.startingPrice} onwards
            </span>
          </div>

          {/* Project Name */}
          <h3 className="text-lg font-bold text-primary-navy group-hover:text-accent-gold-hover transition-colors leading-tight">
            {project.name}
          </h3>

          {/* Location */}
          <p className="text-xs text-text-secondary flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-accent-gold shrink-0" />
            <span className="truncate">
              {project.location}, {project.city}
            </span>
          </p>

          {/* Key Specs Line (Configuration · Possession) */}
          <div className="text-xs font-medium text-text-primary bg-bg-light px-3 py-2 rounded-lg border border-border-subtle flex flex-wrap items-center justify-between gap-1">
            <span className="font-semibold text-primary-navy">{project.propertyTypes}</span>
            <span className="text-text-secondary">· Possession {project.possessionDate}</span>
          </div>

          {/* Secondary Highlight */}
          <p className="text-[11px] text-text-secondary line-clamp-1">
            {project.highlight}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-1 mt-auto">
          <Link href={`/property/prop-1`} className="block">
            <Button
              variant="primary"
              size="sm"
              className="w-full justify-between font-bold h-9 text-xs"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              <span>Explore Project & Floor Plans</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;

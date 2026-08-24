// ==============================================================================
// TheVrindaGroup - Top Cities & New Projects Component
// Visual destination cards and premium new project showcases
// ==============================================================================

"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Building, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CityCard } from "@/components/marketplace/CityCard";
import { ProjectCard } from "@/components/marketplace/ProjectCard";
import { MOCK_CITIES } from "@/data/mockCities";
import { MOCK_PROJECTS } from "@/data/mockProjects";

export interface TopCitiesAndProjectsProps {
  onSelectCity?: (cityName: string) => void;
}

export function TopCitiesAndProjects({ onSelectCity }: TopCitiesAndProjectsProps) {
  const router = useRouter();

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. Explore Top Cities */}
      <section className="w-full bg-white py-16 border-b border-border-default font-sans">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-gold uppercase tracking-widest">
                <MapPin className="w-3.5 h-3.5" />
                <span>Prime Real Estate Hubs</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold font-heading text-dark-navy tracking-tight">
                Explore Properties by City
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Discover verified residential and commercial opportunities across India’s highest-growth cities.
              </p>
            </div>

            <Link
              href="/buy"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-dark-navy hover:text-accent-gold transition-colors group shrink-0"
            >
              <span>View All Cities</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_CITIES.slice(0, 6).map((city) => (
              <CityCard
                key={city.id}
                city={city}
                onSelectCity={(cityName: string) => {
                  if (onSelectCity) {
                    onSelectCity(cityName);
                  } else {
                    router.push(`/buy?city=${encodeURIComponent(cityName)}`);
                  }
                }}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* 2. Featured New Projects */}
      <section id="new-projects" className="w-full bg-bg-light py-16 border-b border-border-default font-sans">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-gold uppercase tracking-widest">
                <Building className="w-3.5 h-3.5" />
                <span>RERA Approved Developments</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold font-heading text-dark-navy tracking-tight">
                Upcoming & New Launch Projects
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Premium gated communities, luxury high-rises, and prime integrated townships.
              </p>
            </div>

            <Link
              href="/buy"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-dark-navy hover:text-accent-gold transition-colors group shrink-0"
            >
              <span>Explore All Projects</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PROJECTS.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}

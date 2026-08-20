"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, BedDouble, Maximize2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui";
import { EmptyState } from "./EmptyState";

interface SavedItem {
  id: string;
  title: string;
  location: string;
  price: string;
  bhk?: string;
  area: string;
  category: "buy" | "rent" | "commercial";
  image: string;
  postedAt: string;
  link: string;
}

const INITIAL_SAVED_ITEMS: SavedItem[] = [
  {
    id: "prop-1",
    title: "Sobha Windchimes 3 BHK Luxury Apartment",
    location: "Bannerghatta Road, Bangalore",
    price: "₹1.85 Cr",
    bhk: "3 BHK",
    area: "1,780 sq.ft",
    category: "buy",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    postedAt: "Saved 2 days ago",
    link: "/property/prop-1",
  },
  {
    id: "prop-3",
    title: "Brigade Gateway 2 BHK Furnished High-Floor Flat",
    location: "Malleshwaram, Bangalore",
    price: "₹55,000 / mo",
    bhk: "2 BHK",
    area: "1,220 sq.ft",
    category: "rent",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    postedAt: "Saved 4 days ago",
    link: "/property/prop-3",
  },
  {
    id: "comm-1",
    title: "Prestige Tech Park IV Grade-A Office Floor",
    location: "Outer Ring Road, Bangalore",
    price: "₹4.62 L / mo",
    area: "4,200 sq.ft",
    category: "commercial",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    postedAt: "Saved 1 week ago",
    link: "/commercial/property/comm-1",
  },
];

type SavedTabType = "ALL" | "buy" | "rent" | "commercial";

export function SavedPropertiesManager() {
  const [savedItems, setSavedItems] = useState<SavedItem[]>(INITIAL_SAVED_ITEMS);
  const [currentTab, setCurrentTab] = useState<SavedTabType>("ALL");

  const handleRemove = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredItems = savedItems.filter((item) => {
    if (currentTab === "ALL") return true;
    return item.category === currentTab;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-primary-navy tracking-tight">
            Saved Properties
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Your shortlisted properties across residential sales, rental homes, and commercial spaces.
          </p>
        </div>

        <Link href="/buy">
          <Button variant="outline" size="sm" className="text-xs font-semibold">
            Explore More Listings
          </Button>
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-border-default pb-1">
        {[
          { id: "ALL" as const, label: "All Saved" },
          { id: "buy" as const, label: "For Sale" },
          { id: "rent" as const, label: "For Rent" },
          { id: "commercial" as const, label: "Commercial" },
        ].map((tab) => {
          const isSelected = currentTab === tab.id;
          const count =
            tab.id === "ALL"
              ? savedItems.length
              : savedItems.filter((i) => i.category === tab.id).length;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-primary-navy text-primary-navy"
                  : "border-transparent text-text-secondary hover:text-primary-navy"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? "bg-primary-navy text-white"
                    : "bg-bg-light text-text-muted"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border-default bg-white overflow-hidden shadow-soft hover:shadow-soft-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Unsave Heart Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    title="Remove from saved"
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 hover:bg-white text-error-red shadow-soft-xs transition-colors cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-error-red" />
                  </button>

                  <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-dark-navy/80 text-white text-[10px] font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="text-base font-extrabold text-primary-navy">
                    {item.price}
                  </div>

                  <h3 className="text-xs font-bold text-text-primary line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="text-[11px] text-text-secondary flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-accent-gold shrink-0" />
                    {item.location}
                  </p>

                  <div className="flex items-center gap-3 pt-2 text-[11px] text-text-muted border-t border-border-subtle">
                    {item.bhk && (
                      <span className="flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5 text-text-muted" />
                        {item.bhk}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-text-muted" />
                      {item.area}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Link */}
              <div className="p-4 pt-0">
                <Link href={item.link} className="w-full block">
                  <Button
                    variant="outline"
                    size="sm"
                    rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    className="w-full text-xs font-semibold"
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="No saved properties yet"
          description="Save properties you like while searching across Buy, Rent, and Commercial marketplaces to compare them later."
          actionText="Explore Properties"
          actionHref="/buy"
        />
      )}
    </div>
  );
}

export default SavedPropertiesManager;

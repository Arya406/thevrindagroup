"use client";

import React from "react";
import { ArrowUpDown, ChevronDown } from "lucide-react";

export type SortOption =
  | "recommended"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "area-asc"
  | "area-desc";

export interface SortDropdownProps {
  value: SortOption;
  onChange: (sort: SortOption) => void;
  className?: string;
}

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "area-asc", label: "Area: Low to High" },
  { value: "area-desc", label: "Area: High to Low" },
];

export function SortDropdown({
  value,
  onChange,
  className = "",
}: SortDropdownProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <span className="text-xs font-semibold text-text-secondary mr-2 hidden sm:inline-flex items-center gap-1">
        <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
        Sort by:
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          className="appearance-none rounded-lg border border-border-default bg-white py-1.5 pl-3 pr-8 text-xs font-bold text-primary-navy shadow-soft-xs hover:border-border-dark focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 focus:outline-none transition-all cursor-pointer"
          aria-label="Sort properties"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
      </div>
    </div>
  );
}

export default SortDropdown;

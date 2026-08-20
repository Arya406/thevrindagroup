"use client";

import React from "react";
import { X, RotateCcw } from "lucide-react";

export interface ActiveFilterItem {
  id: string;
  label: string;
  category: string;
  onRemove: () => void;
}

export interface ActiveFiltersProps {
  filters: ActiveFilterItem[];
  totalCount: number;
  onClearAll: () => void;
  className?: string;
}

export function ActiveFilters({
  filters,
  totalCount,
  onClearAll,
  className = "",
}: ActiveFiltersProps) {
  if (filters.length === 0) {
    return (
      <div className={`flex items-center justify-between py-2 text-xs text-text-secondary ${className}`}>
        <span className="font-semibold text-text-primary">
          Showing <strong className="text-primary-navy font-bold">{totalCount}</strong> Verified Properties
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 py-1 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-text-secondary">
          Showing <strong className="text-primary-navy font-bold">{totalCount}</strong> Properties matching:
        </span>
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex items-center gap-1 text-xs font-bold text-accent-gold-hover hover:text-dark-navy hover:underline transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Clear All Filters
        </button>
      </div>

      {/* Active Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {filters.map((filter) => (
          <span
            key={filter.id}
            className="inline-flex items-center gap-1.5 rounded-md bg-white border border-border-default px-2.5 py-1 text-xs font-semibold text-text-primary shadow-soft-xs hover:border-border-dark transition-all"
          >
            <span>{filter.label}</span>
            <button
              type="button"
              onClick={filter.onRemove}
              className="p-0.5 rounded hover:bg-bg-light text-text-muted hover:text-error-red transition-colors cursor-pointer"
              aria-label={`Remove ${filter.label} filter`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

export default ActiveFilters;

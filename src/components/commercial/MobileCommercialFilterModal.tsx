"use client";

import React from "react";
import { X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";
import { CommercialFilters } from "@/types/commercial";
import { CommercialFiltersView } from "./CommercialFilters";

export interface MobileCommercialFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CommercialFilters;
  onFilterChange: (filters: CommercialFilters) => void;
  onClearAll: () => void;
  matchingCount: number;
}

export function MobileCommercialFilterModal({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearAll,
  matchingCount,
}: MobileCommercialFilterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-dark-navy/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200">
      <div className="flex flex-col h-[90vh] w-full bg-white rounded-t-2xl shadow-soft-lg overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-default bg-white shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-primary-navy">
              Filter Commercial Spaces
            </h3>
            <span className="rounded-full bg-accent-gold-light text-[#9E6E18] text-xs font-bold px-2 py-0.5 border border-accent-gold-muted">
              {matchingCount} Spaces
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-light transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <CommercialFiltersView
            filters={filters}
            onFilterChange={onFilterChange}
            onClearAll={onClearAll}
            className="border-0 shadow-none p-0"
          />
        </div>

        {/* Sticky Bottom Actions */}
        <div className="p-4 border-t border-border-default bg-white flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="md"
            onClick={onClearAll}
            leftIcon={<RotateCcw className="w-4 h-4" />}
            className="w-1/3 text-xs"
          >
            Clear All
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            className="w-2/3 text-xs font-bold shadow-soft-sm"
          >
            Show {matchingCount} Commercial Properties
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MobileCommercialFilterModal;

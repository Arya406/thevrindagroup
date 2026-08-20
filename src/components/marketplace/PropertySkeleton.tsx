"use client";

import React from "react";

export interface PropertySkeletonProps {
  viewMode?: "grid" | "list";
  count?: number;
}

export function PropertySkeleton({
  viewMode = "grid",
  count = 6,
}: PropertySkeletonProps) {
  const items = Array.from({ length: count });

  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {items.map((_, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row rounded-xl border border-border-default bg-white p-0 overflow-hidden animate-pulse shadow-soft"
          >
            <div className="bg-slate-200 aspect-16/10 sm:aspect-auto sm:w-72 md:w-80 min-h-[200px]" />
            <div className="flex-1 p-5 space-y-4">
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-3.5 bg-slate-200 rounded w-1/2" />
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="h-4 bg-slate-200 rounded" />
                <div className="h-4 bg-slate-200 rounded" />
                <div className="h-4 bg-slate-200 rounded" />
                <div className="h-4 bg-slate-200 rounded" />
              </div>
              <div className="h-3 bg-slate-200 rounded w-full" />
            </div>
            <div className="p-5 sm:w-48 bg-slate-50 flex sm:flex-col justify-between items-center sm:items-end gap-3">
              <div className="h-6 bg-slate-200 rounded w-24" />
              <div className="h-9 bg-slate-200 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-xl border border-border-default bg-white overflow-hidden animate-pulse shadow-soft space-y-3"
        >
          <div className="aspect-16/10 bg-slate-200 w-full" />
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-5 bg-slate-200 rounded w-24" />
              <div className="h-4 bg-slate-200 rounded w-14" />
            </div>
            <div className="h-4 bg-slate-200 rounded w-4/5" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="grid grid-cols-3 gap-2 py-2">
              <div className="h-3.5 bg-slate-200 rounded" />
              <div className="h-3.5 bg-slate-200 rounded" />
              <div className="h-3.5 bg-slate-200 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="h-8 bg-slate-200 rounded" />
              <div className="h-8 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PropertySkeleton;

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  CheckCircle2,
  Archive,
  Ban,
  X,
  ExternalLink,
} from "lucide-react";
import { AdminApiService } from "@/lib/services/admin-api";
import { formatIndianPrice } from "@/lib/services/property-api";
import { Property } from "@/types/property";
import { PropertyStatus } from "@/types/admin";

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    AdminApiService.getProperties({
      status: statusFilter !== "ALL" ? (statusFilter as PropertyStatus) : undefined,
      search: searchQuery.trim() || undefined,
      limit: 50,
    })
      .then((res) => {
        if (isMounted) {
          setProperties(res.properties);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load properties.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [statusFilter, searchQuery]);

  const refreshProperties = async () => {
    try {
      const res = await AdminApiService.getProperties({
        status: statusFilter !== "ALL" ? (statusFilter as PropertyStatus) : undefined,
        search: searchQuery.trim() || undefined,
        limit: 50,
      });
      setProperties(res.properties);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to refresh properties.");
    }
  };

  const handlePublish = async (p: Property) => {
    if (!confirm(`Are you sure you want to approve and publish listing "${p.title}" to the live marketplace?`)) return;
    try {
      await AdminApiService.publishProperty(p.id);
      setActionSuccess(`Property "${p.title}" approved and published to live marketplace.`);
      await refreshProperties();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to approve/publish property.");
    }
  };

  const handleUnpublish = async (p: Property) => {
    if (!confirm(`Are you sure you want to unpublish listing "${p.title}"? It will be moved to DRAFT status.`)) return;
    try {
      await AdminApiService.unpublishProperty(p.id);
      setActionSuccess(`Property "${p.title}" unpublished.`);
      await refreshProperties();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to unpublish property.");
    }
  };

  const handleArchive = async (p: Property) => {
    if (!confirm(`Are you sure you want to archive listing "${p.title}"?`)) return;
    try {
      await AdminApiService.archiveProperty(p.id);
      setActionSuccess(`Property "${p.title}" archived.`);
      await refreshProperties();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to archive property.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {actionSuccess && (
        <div className="p-4 bg-success-green-light border border-success-green/20 rounded-2xl text-success-green flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button type="button" onClick={() => setActionSuccess(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-error-red-light border border-error-red/20 rounded-2xl text-error-red text-xs">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-border-default shadow-soft-xs">
        <div>
          <h1 className="text-xl font-black text-primary-navy tracking-tight">Property Moderation &amp; Catalog</h1>
          <p className="text-xs text-text-secondary">
            Inspect live listings, approve pending submissions, unpublish non-compliant properties, and manage catalog lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {["ALL", "PUBLISHED", "DRAFT", "SOLD", "RENTED", "ARCHIVED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? "bg-primary-navy text-white shadow-soft-xs"
                  : "bg-bg-light text-text-secondary hover:text-primary-navy"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Property Table */}
      <div className="bg-white rounded-2xl border border-border-default shadow-soft-xs overflow-hidden space-y-4 p-4">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by title, city, or reference code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bg-light border border-border-default rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
          />
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-text-muted">Loading properties...</div>
        ) : properties.length === 0 ? (
          <div className="p-12 text-center text-text-muted space-y-2">
            <Building2 className="w-8 h-8 mx-auto text-accent-gold" />
            <p className="text-xs font-bold">No properties found in this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-light border-b border-border-default text-text-muted uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Property</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {properties.map((p) => {
                  const locationObj = typeof p.location === "object" && p.location !== null ? (p.location as { locality?: string; city?: string; address?: string }) : null;
                  const displayCity = locationObj?.city || p.city || "India";
                  const displayLocality = locationObj?.locality || (typeof p.location === "string" ? p.location : locationObj?.address || "");
                  const rawPrice = p.priceNumeric || (typeof p.price === "number" ? p.price : Number(p.price) || 0);
                  const formattedPrice = formatIndianPrice(rawPrice, p.listingType);
                  const currentStatus = p.status || (p.isApproved ? "PUBLISHED" : "DRAFT");

                  return (
                    <tr key={p.id} className="hover:bg-bg-light/60 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-primary-navy line-clamp-1">{p.title}</p>
                        <p className="text-[10px] text-text-muted">
                          Ref: {p.referenceCode || "N/A"} • {displayCity}{displayLocality ? ` • ${displayLocality}` : ""}
                        </p>
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold uppercase text-text-secondary">
                          {p.listingType} • {p.propertyType}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-primary-navy">
                        {formattedPrice}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            currentStatus === "PUBLISHED"
                              ? "bg-success-green/10 text-success-green"
                              : currentStatus === "ARCHIVED"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {currentStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/property/${p.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg border border-border-default text-text-secondary hover:text-primary-navy hover:bg-white transition-colors"
                            title="Preview Public Listing"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          {currentStatus === "DRAFT" && (
                            <button
                              type="button"
                              onClick={() => handlePublish(p)}
                              className="p-1.5 rounded-lg border border-success-green/30 bg-success-green/10 text-success-green hover:bg-success-green hover:text-white transition-colors"
                              title="Approve & Publish (Make Live)"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {currentStatus === "PUBLISHED" && (
                            <button
                              type="button"
                              onClick={() => handleUnpublish(p)}
                              className="p-1.5 rounded-lg border border-amber-600/30 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white transition-colors"
                              title="Unpublish (Return to Draft)"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {currentStatus !== "ARCHIVED" && (
                            <button
                              type="button"
                              onClick={() => handleArchive(p)}
                              className="p-1.5 rounded-lg border border-border-default text-gray-500 hover:bg-gray-200 transition-colors"
                              title="Archive Listing"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ==============================================================================
// TheVrindaGroup - Admin Property Moderation & Seller Verification Page
// ==============================================================================

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
  Phone,
  Mail,
  User,
  Eye,
  ShieldCheck,
  PhoneCall,
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
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

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
      if (selectedProperty?.id === p.id) {
        setSelectedProperty((prev) => (prev ? { ...prev, status: "PUBLISHED" } : null));
      }
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
      if (selectedProperty?.id === p.id) {
        setSelectedProperty((prev) => (prev ? { ...prev, status: "DRAFT" } : null));
      }
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
      if (selectedProperty?.id === p.id) {
        setSelectedProperty((prev) => (prev ? { ...prev, status: "ARCHIVED" } : null));
      }
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
          <h1 className="text-xl font-black text-primary-navy tracking-tight">Property Moderation &amp; Verification</h1>
          <p className="text-xs text-text-secondary">
            Inspect submissions, verify seller contact info, approve drafts, and manage live property catalog.
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
                  <th className="p-3">Seller Contact</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {properties.map((p) => {
                  const locationObj =
                    typeof p.location === "object" && p.location !== null
                      ? (p.location as { locality?: string; city?: string; address?: string })
                      : null;
                  const displayCity = locationObj?.city || p.city || "India";
                  const displayLocality =
                    locationObj?.locality || (typeof p.location === "string" ? p.location : locationObj?.address || "");
                  const rawPrice = p.priceNumeric || (typeof p.price === "number" ? p.price : Number(p.price) || 0);
                  const formattedPrice = formatIndianPrice(rawPrice, p.listingType);
                  const currentStatus = p.status || (p.isApproved ? "PUBLISHED" : "DRAFT");

                  // Seller Info resolved from owner relation
                  const sellerName = p.owner?.name || p.sellerName || "N/A";
                  const sellerEmail = p.owner?.email || "N/A";
                  const sellerPhone = p.owner?.phone || p.sellerPhone || null;

                  return (
                    <tr key={p.id} className="hover:bg-bg-light/60 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-primary-navy line-clamp-1">{p.title}</p>
                        <p className="text-[10px] text-text-muted">
                          Ref: {p.referenceCode || "N/A"} • {displayCity}
                          {displayLocality ? ` • ${displayLocality}` : ""}
                        </p>
                      </td>
                      <td className="p-3">
                        <div className="space-y-0.5">
                          <p className="font-bold text-dark-navy flex items-center gap-1">
                            <User className="w-3 h-3 text-accent-gold shrink-0" />
                            <span>{sellerName}</span>
                          </p>
                          {sellerPhone ? (
                            <div className="flex items-center gap-1.5 pt-0.5">
                              <span className="font-mono text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                                {sellerPhone}
                              </span>
                              <a
                                href={`tel:${sellerPhone}`}
                                className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100/80 hover:bg-emerald-200 px-1.5 py-0.5 rounded transition-colors"
                                title={`Call Seller: ${sellerPhone}`}
                              >
                                <PhoneCall className="w-2.5 h-2.5" />
                                <span>Call</span>
                              </a>
                            </div>
                          ) : (
                            <span className="text-[10px] text-text-muted italic">
                              Mobile number not available
                            </span>
                          )}
                          {sellerEmail !== "N/A" && (
                            <p className="text-[10px] text-text-muted truncate max-w-[140px]">
                              {sellerEmail}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold uppercase text-text-secondary">
                          {p.listingType} • {p.propertyType}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-primary-navy">{formattedPrice}</td>
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
                          <button
                            type="button"
                            onClick={() => setSelectedProperty(p)}
                            className="p-1.5 rounded-lg border border-border-default text-text-secondary hover:text-primary-navy hover:bg-white transition-colors"
                            title="Inspect Details & Seller Contact"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
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

      {/* Verification & Seller Details Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-navy/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-border-default p-6 shadow-soft-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border-default">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-accent-gold" />
                <h3 className="font-bold text-dark-navy text-base">Property Verification</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProperty(null)}
                className="p-1 text-text-muted hover:text-dark-navy rounded-lg hover:bg-bg-light"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Seller Information Card */}
            <div className="rounded-xl border border-border-default bg-bg-light/80 p-4 space-y-3">
              <div className="text-xs font-bold text-dark-navy uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-accent-gold" />
                <span>Seller Information</span>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-border-subtle">
                  <span className="text-text-muted">Name</span>
                  <span className="font-bold text-dark-navy">
                    {selectedProperty.owner?.name || selectedProperty.sellerName || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border-subtle">
                  <span className="text-text-muted flex items-center gap-1">
                    <Mail className="w-3 h-3 text-text-muted" />
                    <span>Email</span>
                  </span>
                  <span className="font-medium text-dark-navy">
                    {selectedProperty.owner?.email || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-text-muted flex items-center gap-1">
                    <Phone className="w-3 h-3 text-text-muted" />
                    <span>Mobile Number</span>
                  </span>
                  <div>
                    {selectedProperty.owner?.phone || selectedProperty.sellerPhone ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          {selectedProperty.owner?.phone || selectedProperty.sellerPhone}
                        </span>
                        <a
                          href={`tel:${selectedProperty.owner?.phone || selectedProperty.sellerPhone}`}
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-0.5 rounded text-xs font-bold transition-colors"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Call Seller</span>
                        </a>
                      </div>
                    ) : (
                      <span className="text-text-muted italic">Mobile number not available</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Property Summary */}
            <div className="rounded-xl border border-border-default p-4 space-y-2 text-xs">
              <div className="font-bold text-dark-navy text-sm leading-snug">
                {selectedProperty.title}
              </div>
              <p className="text-text-muted">
                Ref: {selectedProperty.referenceCode || "N/A"} • {selectedProperty.propertyType} •{" "}
                {selectedProperty.listingType}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-border-subtle font-bold">
                <span className="text-text-secondary">Expected Price</span>
                <span className="text-dark-navy text-sm">
                  {formatIndianPrice(
                    selectedProperty.priceNumeric || Number(selectedProperty.price) || 0,
                    selectedProperty.listingType
                  )}
                </span>
              </div>
            </div>

            {/* Moderation Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-default">
              {selectedProperty.status === "DRAFT" && (
                <button
                  type="button"
                  onClick={() => handlePublish(selectedProperty)}
                  className="px-4 py-2 bg-success-green hover:bg-success-green/90 text-white rounded-xl text-xs font-bold transition-all shadow-soft-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve &amp; Publish</span>
                </button>
              )}
              {selectedProperty.status === "PUBLISHED" && (
                <button
                  type="button"
                  onClick={() => handleUnpublish(selectedProperty)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-soft-xs flex items-center gap-1.5"
                >
                  <Ban className="w-4 h-4" />
                  <span>Unpublish</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedProperty(null)}
                className="px-4 py-2 bg-bg-light border border-border-default text-text-secondary hover:text-dark-navy rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

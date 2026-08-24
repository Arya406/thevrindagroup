"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  PlusCircle,
  Search,
  MoreVertical,
  Edit3,
  ExternalLink,
  PauseCircle,
  PlayCircle,
  CheckCircle,
  Trash2,
  AlertTriangle,
  MapPin,
  RefreshCw,
  AlertCircle,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui";
import { ManagedProperty, PropertyStatus } from "@/types/account";
import { EmptyState } from "./EmptyState";
import { useAuth } from "@/lib/auth/auth-context";
import { PropertyApiService } from "@/lib/services/property-api";
import { Property } from "@/types/property";

type TabType = "ALL" | "ACTIVE" | "PENDING" | "DRAFT" | "REJECTED" | "EXPIRED" | "CLOSED";

function mapPropertyToManaged(p: Property): ManagedProperty {
  let status: PropertyStatus = "DRAFT";
  if (p.status === "PUBLISHED" || p.isApproved) {
    status = "ACTIVE";
  } else if (p.status === "SOLD") {
    status = "SOLD";
  } else if (p.status === "RENTED") {
    status = "RENTED";
  } else if (p.status === "ARCHIVED") {
    status = "EXPIRED";
  } else if (p.status === "DRAFT") {
    status = "DRAFT";
  }

  const category =
    p.propertyType === "commercial-office" || p.propertyType === "retail-shop"
      ? "commercial"
      : "residential";

  const transactionType = p.listingType === "rent" ? "rent" : "sale";

  return {
    id: p.id,
    title: p.title,
    location: p.location || "Bangalore",
    city: p.city || "Bangalore",
    price: p.priceNumeric || 0,
    formattedPrice: p.price || "₹0",
    image: p.image || "",
    status,
    views: 0,
    enquiries: 0,
    saves: 0,
    visits: 0,
    postedAt: p.postedDate || "Recently",
    propertyType: p.propertyType,
    transactionType,
    category,
    bhk: p.bhk ? `${p.bhk} BHK` : undefined,
    carpetArea: p.carpetArea || "1,200 sq.ft",
  };
}

export function PropertiesManager() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [properties, setProperties] = useState<ManagedProperty[]>([]);
  const [currentTab, setCurrentTab] = useState<TabType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Modals & Action State
  const [deleteModalProp, setDeleteModalProp] = useState<ManagedProperty | null>(null);
  const [statusActionToast, setStatusActionToast] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      PropertyApiService.getMyProperties({ limit: 50 })
        .then((res) => {
          if (isMounted && res.properties) {
            setProperties(res.properties.map(mapPropertyToManaged));
          }
        })
        .catch((err: unknown) => {
          if (isMounted) {
            const msg =
              err instanceof Error ? err.message : "Failed to load your property listings.";
            setFetchError(msg);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleRetry = () => {
    setIsLoading(true);
    setFetchError(null);
    PropertyApiService.getMyProperties({ limit: 50 })
      .then((res) => {
        if (res.properties) {
          setProperties(res.properties.map(mapPropertyToManaged));
        }
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Failed to load your property listings.";
        setFetchError(msg);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const showToast = (msg: string) => {
    setStatusActionToast(msg);
    setTimeout(() => setStatusActionToast(null), 3500);
  };

  // Status Lifecycle Actions
  const handleTogglePublish = async (prop: ManagedProperty) => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    setActiveMenuId(null);

    try {
      if (prop.status === "ACTIVE") {
        await PropertyApiService.unpublishProperty(prop.id);
        setProperties((prev) =>
          prev.map((p) =>
            p.id === prop.id ? { ...p, status: "DRAFT" } : p
          )
        );
        showToast("Listing unpublished and moved to Drafts.");
      } else {
        await PropertyApiService.publishProperty(prop.id);
        setProperties((prev) =>
          prev.map((p) =>
            p.id === prop.id ? { ...p, status: "ACTIVE" } : p
          )
        );
        showToast("Listing published to marketplace successfully!");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Unable to update listing status.";
      showToast(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkSold = async (prop: ManagedProperty) => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    setActiveMenuId(null);

    try {
      await PropertyApiService.markSoldProperty(prop.id);
      setProperties((prev) =>
        prev.map((p) => (p.id === prop.id ? { ...p, status: "SOLD" } : p))
      );
      showToast("Property marked as Sold.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to mark as sold.";
      showToast(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkRented = async (prop: ManagedProperty) => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    setActiveMenuId(null);

    try {
      await PropertyApiService.markRentedProperty(prop.id);
      setProperties((prev) =>
        prev.map((p) => (p.id === prop.id ? { ...p, status: "RENTED" } : p))
      );
      showToast("Property marked as Rented.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to mark as rented.";
      showToast(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleArchive = async (prop: ManagedProperty) => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    setActiveMenuId(null);

    try {
      await PropertyApiService.archiveProperty(prop.id);
      setProperties((prev) =>
        prev.map((p) => (p.id === prop.id ? { ...p, status: "EXPIRED" } : p))
      );
      showToast("Property listing archived.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to archive listing.";
      showToast(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalProp || isActionLoading) return;
    setIsActionLoading(true);

    try {
      await PropertyApiService.deleteProperty(deleteModalProp.id);
      setProperties((prev) => prev.filter((p) => p.id !== deleteModalProp.id));
      showToast("Property listing deleted successfully.");
      setDeleteModalProp(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to delete property.";
      showToast(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Filter properties
  const filteredProperties = properties.filter((prop) => {
    if (currentTab === "ACTIVE" && prop.status !== "ACTIVE") return false;
    if (currentTab === "PENDING" && prop.status !== "PENDING") return false;
    if (currentTab === "DRAFT" && prop.status !== "DRAFT") return false;
    if (currentTab === "REJECTED" && prop.status !== "REJECTED") return false;
    if (currentTab === "EXPIRED" && prop.status !== "EXPIRED") return false;
    if (currentTab === "CLOSED" && prop.status !== "SOLD" && prop.status !== "RENTED") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        prop.title.toLowerCase().includes(q) ||
        prop.location.toLowerCase().includes(q) ||
        prop.propertyType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: PropertyStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success-green-light text-success-green border border-success-green-border">
            <span className="w-1.5 h-1.5 rounded-full bg-success-green animate-pulse" />
            ACTIVE
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent-gold-light text-[#9E6E18] border border-accent-gold-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
            PENDING REVIEW
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-bg-light text-text-secondary border border-border-default">
            DRAFT
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-error-red-light text-error-red border border-error-red/30">
            REJECTED
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            ARCHIVED
          </span>
        );
      case "SOLD":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            SOLD
          </span>
        );
      case "RENTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
            RENTED
          </span>
        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: "ALL" as TabType, label: "All Properties", count: properties.length },
    { id: "ACTIVE" as TabType, label: "Active", count: properties.filter((p) => p.status === "ACTIVE").length },
    { id: "DRAFT" as TabType, label: "Drafts", count: properties.filter((p) => p.status === "DRAFT").length },
    { id: "CLOSED" as TabType, label: "Sold / Rented", count: properties.filter((p) => p.status === "SOLD" || p.status === "RENTED").length },
    { id: "EXPIRED" as TabType, label: "Archived", count: properties.filter((p) => p.status === "EXPIRED").length },
  ];

  const showLoading = isAuthLoading || (isAuthenticated && isLoading);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {statusActionToast && (
        <div className="fixed top-20 right-6 z-50 rounded-xl bg-primary-navy text-white px-4 py-3 text-xs font-semibold shadow-soft-lg flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-accent-gold" />
          <span>{statusActionToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-primary-navy tracking-tight">
            My Properties
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Manage your listings, edit specifications, publish drafts, and track property lifecycle states.
          </p>
        </div>

        <Link href="/post-property">
          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            className="text-xs font-bold shadow-soft-xs"
          >
            Post New Property
          </Button>
        </Link>
      </div>

      {/* Error Banner */}
      {fetchError && (
        <div className="rounded-xl bg-error-red-light/80 border border-error-red/30 p-4 text-xs text-error-red flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs h-8"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Tabs & Search Bar */}
      <div className="space-y-4">
        {/* Tabs Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-border-default">
          {tabs.map((t) => {
            const isSelected = currentTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setCurrentTab(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "border-primary-navy text-primary-navy"
                    : "border-transparent text-text-secondary hover:text-primary-navy"
                }`}
              >
                <span>{t.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? "bg-primary-navy text-white"
                      : "bg-bg-light text-text-muted"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search properties by title, locality, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none shadow-soft-xs transition-all"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {showLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-border-default bg-white p-4 sm:p-5 shadow-soft animate-pulse flex flex-col md:flex-row gap-4 justify-between"
            >
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-xl bg-slate-200 shrink-0" />
                <div className="space-y-2 py-1">
                  <div className="h-4 bg-slate-200 rounded w-48" />
                  <div className="h-3 bg-slate-200 rounded w-32" />
                  <div className="h-4 bg-slate-200 rounded w-24" />
                </div>
              </div>
              <div className="h-8 bg-slate-200 rounded-lg w-28 self-end" />
            </div>
          ))}
        </div>
      ) : filteredProperties.length > 0 ? (
        /* Property Cards List */
        <div className="space-y-4">
          {filteredProperties.map((property) => {
            const publicUrl =
              property.category === "commercial"
                ? `/commercial/property/${property.id}`
                : `/property/${property.id}`;

            const isMenuOpen = activeMenuId === property.id;

            return (
              <div
                key={property.id}
                className="rounded-2xl border border-border-default bg-white p-4 sm:p-5 shadow-soft hover:shadow-soft-md transition-all flex flex-col md:flex-row gap-4 md:items-center justify-between relative"
              >
                {/* Left: Thumbnail & Core Info */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 border border-border-subtle shrink-0">
                    {property.image ? (
                      <Image
                        src={property.image}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 text-[10px] text-center p-1 select-none">
                        <Building2 className="w-5 h-5 opacity-40 mb-0.5" />
                        <span>No photo</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-primary-navy line-clamp-1">
                        {property.title}
                      </h3>
                      {getStatusBadge(property.status)}
                    </div>

                    <p className="text-xs text-text-secondary flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                      <span>
                        {property.location}, {property.city}
                      </span>
                    </p>

                    <div className="flex items-center gap-3 pt-0.5">
                      <strong className="text-sm font-extrabold text-primary-navy">
                        {property.formattedPrice}
                      </strong>
                      <span className="text-[11px] text-text-muted capitalize">
                        • {property.propertyType}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        • Posted {property.postedAt}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-border-subtle">
                  <Link href={publicUrl}>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                      className="text-xs h-8"
                    >
                      View Live
                    </Button>
                  </Link>

                  <Link href={`/post-property?edit=${property.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                      className="text-xs h-8"
                    >
                      Edit
                    </Button>
                  </Link>

                  {/* Options Dropdown Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(isMenuOpen ? null : property.id)}
                      className="p-1.5 rounded-lg border border-border-default hover:bg-bg-light text-text-secondary cursor-pointer transition-colors"
                      aria-label="More options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 top-10 w-48 rounded-xl bg-white border border-border-default shadow-soft-xl py-1.5 z-30 animate-in fade-in duration-150">
                        {/* Publish / Unpublish Toggle */}
                        {property.status === "ACTIVE" ? (
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(property)}
                            disabled={isActionLoading}
                            className="w-full px-3.5 py-2 text-left text-xs font-semibold text-text-primary hover:bg-bg-light flex items-center gap-2 cursor-pointer"
                          >
                            <PauseCircle className="w-3.5 h-3.5 text-accent-gold" />
                            Unpublish / Pause
                          </button>
                        ) : property.status === "DRAFT" ? (
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(property)}
                            disabled={isActionLoading}
                            className="w-full px-3.5 py-2 text-left text-xs font-semibold text-text-primary hover:bg-bg-light flex items-center gap-2 cursor-pointer"
                          >
                            <PlayCircle className="w-3.5 h-3.5 text-success-green" />
                            Publish Listing
                          </button>
                        ) : null}

                        {/* Sold / Rented Actions */}
                        {property.status === "ACTIVE" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleMarkSold(property)}
                              disabled={isActionLoading}
                              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-text-primary hover:bg-bg-light flex items-center gap-2 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                              Mark as Sold
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkRented(property)}
                              disabled={isActionLoading}
                              className="w-full px-3.5 py-2 text-left text-xs font-semibold text-text-primary hover:bg-bg-light flex items-center gap-2 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                              Mark as Rented
                            </button>
                          </>
                        )}

                        {/* Archive */}
                        {(property.status === "ACTIVE" || property.status === "DRAFT") && (
                          <button
                            type="button"
                            onClick={() => handleArchive(property)}
                            disabled={isActionLoading}
                            className="w-full px-3.5 py-2 text-left text-xs font-semibold text-text-primary hover:bg-bg-light flex items-center gap-2 cursor-pointer"
                          >
                            <Archive className="w-3.5 h-3.5 text-slate-500" />
                            Archive Listing
                          </button>
                        )}

                        <div className="h-px bg-border-subtle my-1" />

                        {/* Delete Action */}
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteModalProp(property);
                            setActiveMenuId(null);
                          }}
                          disabled={isActionLoading}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold text-error-red hover:bg-error-red-light flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Property
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title={`No ${currentTab === "ALL" ? "" : currentTab.toLowerCase()} properties found`}
          description={
            searchQuery
              ? "No property matches your search term. Try adjusting your search query."
              : "You have not listed any properties in this category yet. Click below to create your listing."
          }
          actionText="Post a Property"
          actionHref="/post-property"
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-navy/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white border border-border-default p-6 shadow-soft-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-error-red-light text-error-red flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-primary-navy">
                  Delete Property Listing?
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Are you sure you want to permanently delete &ldquo;{deleteModalProp.title}&rdquo;? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalProp(null)}
                disabled={isActionLoading}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteConfirm}
                isLoading={isActionLoading}
                className="text-xs bg-error-red hover:bg-error-red-hover text-white border-transparent"
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertiesManager;

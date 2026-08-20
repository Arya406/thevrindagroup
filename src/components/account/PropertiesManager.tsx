"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  PlusCircle,
  Search,
  Eye,
  Users,
  Heart,
  CalendarCheck,
  MoreVertical,
  Edit3,
  ExternalLink,
  PauseCircle,
  PlayCircle,
  CheckCircle,
  Trash2,
  AlertTriangle,
  MapPin,
  X,
} from "lucide-react";
import { Button } from "@/components/ui";
import { ManagedProperty, PropertyStatus } from "@/types/account";
import { MOCK_MANAGED_PROPERTIES } from "@/data/account/mockAccountData";
import { EmptyState } from "./EmptyState";

type TabType = "ALL" | "ACTIVE" | "PENDING" | "DRAFT" | "REJECTED" | "EXPIRED" | "CLOSED";

export function PropertiesManager() {
  const [properties, setProperties] = useState<ManagedProperty[]>(MOCK_MANAGED_PROPERTIES);
  const [currentTab, setCurrentTab] = useState<TabType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modals state
  const [deleteModalProp, setDeleteModalProp] = useState<ManagedProperty | null>(null);
  const [statusActionToast, setStatusActionToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setStatusActionToast(msg);
    setTimeout(() => setStatusActionToast(null), 3000);
  };

  // Filter properties
  const filteredProperties = properties.filter((prop) => {
    // Tab match
    if (currentTab === "ACTIVE" && prop.status !== "ACTIVE") return false;
    if (currentTab === "PENDING" && prop.status !== "PENDING") return false;
    if (currentTab === "DRAFT" && prop.status !== "DRAFT") return false;
    if (currentTab === "REJECTED" && prop.status !== "REJECTED") return false;
    if (currentTab === "EXPIRED" && prop.status !== "EXPIRED") return false;
    if (currentTab === "CLOSED" && prop.status !== "SOLD" && prop.status !== "RENTED") return false;

    // Search query match
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
            EXPIRED
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

  // Actions
  const handleTogglePause = (id: string) => {
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus = p.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
          showToast(`Listing ${nextStatus === "ACTIVE" ? "activated" : "paused"} successfully.`);
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
    setActiveMenuId(null);
  };

  const handleMarkSoldRented = (id: string, type: "SOLD" | "RENTED") => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: type } : p))
    );
    showToast(`Property marked as ${type}.`);
    setActiveMenuId(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteModalProp) return;
    setProperties((prev) => prev.filter((p) => p.id !== deleteModalProp.id));
    showToast("Property listing deleted.");
    setDeleteModalProp(null);
  };

  const tabs = [
    { id: "ALL" as TabType, label: "All Properties", count: properties.length },
    { id: "ACTIVE" as TabType, label: "Active", count: properties.filter((p) => p.status === "ACTIVE").length },
    { id: "PENDING" as TabType, label: "Pending", count: properties.filter((p) => p.status === "PENDING").length },
    { id: "DRAFT" as TabType, label: "Drafts", count: properties.filter((p) => p.status === "DRAFT").length },
    { id: "CLOSED" as TabType, label: "Sold / Rented", count: properties.filter((p) => p.status === "SOLD" || p.status === "RENTED").length },
  ];

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
            Manage your listings, edit descriptions, track visitor views, and monitor leads.
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

      {/* Property Cards List */}
      {filteredProperties.length > 0 ? (
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
                {/* Left: Thumbnail & Details */}
                <div className="flex gap-4 items-start sm:items-center min-w-0 flex-1">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-border-subtle bg-slate-100 shadow-soft-xs">
                    <Image
                      src={property.image}
                      alt={property.title}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5">
                      {getStatusBadge(property.status)}
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-primary-navy truncate">
                        {property.title}
                      </h3>
                    </div>

                    <p className="text-xs text-text-secondary flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                      {property.location}
                    </p>

                    <div className="flex flex-wrap items-center gap-2.5 pt-0.5 text-xs">
                      <strong className="text-sm font-extrabold text-primary-navy">
                        {property.formattedPrice}
                      </strong>
                      <span className="text-text-muted">•</span>
                      <span className="text-[11px] text-text-secondary font-medium">
                        {property.bhk ? `${property.bhk} • ` : ""}{property.carpetArea}
                      </span>
                      <span className="text-text-muted">•</span>
                      <span className="text-[10px] text-text-muted">
                        Posted on {property.postedAt}
                      </span>
                    </div>

                    {/* Performance Metric Counters */}
                    <div className="flex items-center gap-4 pt-2 text-[11px] text-text-secondary border-t border-border-subtle/70">
                      <span className="flex items-center gap-1 font-semibold text-primary-navy">
                        <Eye className="w-3.5 h-3.5 text-text-muted" />
                        {property.views} Views
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-primary-navy">
                        <Users className="w-3.5 h-3.5 text-text-muted" />
                        {property.enquiries} Enquiries
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-primary-navy">
                        <Heart className="w-3.5 h-3.5 text-text-muted" />
                        {property.saves} Saves
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-primary-navy">
                        <CalendarCheck className="w-3.5 h-3.5 text-text-muted" />
                        {property.visits} Visits
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Management Buttons */}
                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-border-subtle justify-end">
                  <Link href={publicUrl} target="_blank">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                      className="text-xs font-semibold"
                    >
                      View
                    </Button>
                  </Link>

                  <Link href={`/post-property?edit=${property.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                      className="text-xs font-semibold"
                    >
                      Edit
                    </Button>
                  </Link>

                  {/* More Dropdown Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(isMenuOpen ? null : property.id)}
                      className="p-2 rounded-lg border border-border-default hover:bg-bg-light text-text-secondary transition-colors cursor-pointer"
                      title="More actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 top-10 w-48 rounded-xl bg-white border border-border-default shadow-soft-lg z-30 p-1.5 space-y-1 animate-in fade-in duration-150">
                        <button
                          type="button"
                          onClick={() => handleTogglePause(property.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-primary hover:bg-bg-light rounded-lg transition-colors text-left cursor-pointer"
                        >
                          {property.status === "ACTIVE" ? (
                            <>
                              <PauseCircle className="w-3.5 h-3.5 text-[#9E6E18]" />
                              Pause Listing
                            </>
                          ) : (
                            <>
                              <PlayCircle className="w-3.5 h-3.5 text-success-green" />
                              Activate Listing
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleMarkSoldRented(
                              property.id,
                              property.transactionType === "sale" ? "SOLD" : "RENTED"
                            )
                          }
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-primary hover:bg-bg-light rounded-lg transition-colors text-left cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-primary-navy" />
                          Mark as {property.transactionType === "sale" ? "Sold" : "Rented"}
                        </button>

                        <div className="border-t border-border-subtle my-1" />

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteModalProp(property);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-error-red hover:bg-error-red-light rounded-lg transition-colors text-left cursor-pointer"
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
          title="No properties found"
          description={
            searchQuery
              ? "No listings match your search criteria. Try a different search keyword."
              : "You do not have any listings under this status category."
          }
          actionText="Post Property FREE"
          actionHref="/post-property"
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-navy/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white border border-border-default p-6 shadow-soft-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-error-red-light text-error-red flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalProp(null)}
                className="p-1 rounded-lg text-text-muted hover:bg-bg-light cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-primary-navy">
                Delete Property Listing?
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Are you sure you want to remove <strong className="text-text-primary">{deleteModalProp.title}</strong>? This action will remove the listing and its associated lead history.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-subtle">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalProp(null)}
                className="text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteConfirm}
                className="bg-error-red hover:bg-error-red/90 text-white text-xs font-bold"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertiesManager;

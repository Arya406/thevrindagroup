"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarCheck,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle,
  XCircle,
  RotateCcw,
  Calendar,
  Sparkles,
  X,
  RefreshCw,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui";
import { ScheduledVisit, VisitStatus } from "@/types/account";
import { EmptyState } from "./EmptyState";
import { useAuth } from "@/lib/auth/auth-context";
import {
  SiteVisitApiService,
  BackendSiteVisit,
  BackendSiteVisitStatus,
} from "@/lib/services/site-visit-api";

export interface EnhancedScheduledVisit extends ScheduledVisit {
  rawStatus: BackendSiteVisitStatus;
  scheduledAtIso: string;
  notes?: string;
}

function mapBackendVisitToScheduledVisit(v: BackendSiteVisit): EnhancedScheduledVisit {
  const isCompleted = v.status === "COMPLETED";
  const isCancelled =
    v.status === "CANCELLED_BY_BUYER" ||
    v.status === "CANCELLED_BY_OWNER" ||
    v.status === "NO_SHOW";
  const status: VisitStatus = isCompleted
    ? "COMPLETED"
    : isCancelled
    ? "CANCELLED"
    : "UPCOMING";

  const scheduledDate = new Date(v.scheduledAt);
  const dateFormatted = !isNaN(scheduledDate.getTime())
    ? scheduledDate.toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Upcoming Slot";

  const timeFormatted = !isNaN(scheduledDate.getTime())
    ? scheduledDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "11:00 AM";

  const propertyLocation = v.property.location
    ? `${v.property.location.locality}, ${v.property.location.city}`
    : "Bangalore";

  return {
    id: v.id,
    propertyId: v.propertyId,
    propertyTitle: v.property.title,
    propertyLocation,
    visitorName: v.buyer?.name || "Verified Buyer",
    visitorPhone: v.buyer?.phone || "+91 98765 43210",
    visitorEmail: v.buyer?.email || "buyer@thevrindagroup.com",
    date: dateFormatted,
    timeSlot: timeFormatted,
    status,
    rawStatus: v.status,
    scheduledAtIso: v.scheduledAt,
    notes: v.buyerNote || v.ownerNote || undefined,
  };
}

export function VisitsManager() {
  const { currentUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const isOwnerOrAgent =
    currentUser?.role === "OWNER" || currentUser?.role === "AGENT";

  const [visits, setVisits] = useState<EnhancedScheduledVisit[]>([]);
  const [currentTab, setCurrentTab] = useState<VisitStatus>("UPCOMING");
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [rescheduleVisit, setRescheduleVisit] = useState<EnhancedScheduledVisit | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState("11:00 AM - 12:00 PM");
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (isAuthenticated) {
      SiteVisitApiService.getMySiteVisits({ limit: 50, sort: "NEWEST" })
        .then((res) => {
          if (isMounted && res.siteVisits) {
            setVisits(res.siteVisits.map(mapBackendVisitToScheduledVisit));
          }
        })
        .catch((err: unknown) => {
          if (isMounted) {
            const msg =
              err instanceof Error ? err.message : "Failed to load scheduled visits.";
            setError(msg);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsFetching(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3500);
  };

  const handleRetry = () => {
    setIsFetching(true);
    setError(null);
    SiteVisitApiService.getMySiteVisits({ limit: 50, sort: "NEWEST" })
      .then((res) => {
        if (res.siteVisits) {
          setVisits(res.siteVisits.map(mapBackendVisitToScheduledVisit));
        }
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Failed to load scheduled visits.";
        setError(msg);
      })
      .finally(() => {
        setIsFetching(false);
      });
  };

  // Buyer Cancellation
  const handleBuyerCancel = async (visitId: string) => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    try {
      const updated = await SiteVisitApiService.cancelSiteVisitByBuyer(visitId, {
        buyerNote: "Cancelled by buyer via account dashboard",
      });
      setVisits((prev) =>
        prev.map((v) =>
          v.id === visitId ? mapBackendVisitToScheduledVisit(updated) : v
        )
      );
      showToast("Visit successfully cancelled.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to cancel visit.";
      showToast(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Owner / Agent Actions
  const handleConfirmVisit = async (visitId: string) => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    try {
      const updated = await SiteVisitApiService.confirmSiteVisit(visitId);
      setVisits((prev) =>
        prev.map((v) =>
          v.id === visitId ? mapBackendVisitToScheduledVisit(updated) : v
        )
      );
      showToast("Visit appointment confirmed!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to confirm visit.";
      showToast(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOwnerCancel = async (visitId: string) => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    try {
      const updated = await SiteVisitApiService.cancelSiteVisitByOwner(visitId, {
        ownerNote: "Slot unavailable / cancelled by host",
      });
      setVisits((prev) =>
        prev.map((v) =>
          v.id === visitId ? mapBackendVisitToScheduledVisit(updated) : v
        )
      );
      showToast("Visit cancelled by host.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to cancel visit.";
      showToast(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCompleteVisit = async (visitId: string) => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    try {
      const updated = await SiteVisitApiService.completeSiteVisit(visitId);
      setVisits((prev) =>
        prev.map((v) =>
          v.id === visitId ? mapBackendVisitToScheduledVisit(updated) : v
        )
      );
      showToast("Site walkthrough marked as completed!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to complete visit.";
      showToast(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkNoShow = async (visitId: string) => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    try {
      const updated = await SiteVisitApiService.markNoShowSiteVisit(visitId);
      setVisits((prev) =>
        prev.map((v) =>
          v.id === visitId ? mapBackendVisitToScheduledVisit(updated) : v
        )
      );
      showToast("Visitor recorded as No-Show.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to record no-show.";
      showToast(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleVisit || !rescheduleDate || isActionLoading) return;
    setIsActionLoading(true);
    try {
      let hour = 11;
      if (rescheduleSlot.startsWith("10:")) hour = 10;
      else if (rescheduleSlot.startsWith("02:")) hour = 14;
      else if (rescheduleSlot.startsWith("04:")) hour = 16;

      const newDate = new Date(`${rescheduleDate}T${String(hour).padStart(2, "0")}:00:00.000Z`);
      const targetIso = newDate.toISOString();

      const updated = await SiteVisitApiService.rescheduleSiteVisit(
        rescheduleVisit.id,
        {
          scheduledAt: targetIso,
          ownerNote: `Rescheduled to ${rescheduleDate} (${rescheduleSlot})`,
        }
      );

      setVisits((prev) =>
        prev.map((v) =>
          v.id === rescheduleVisit.id ? mapBackendVisitToScheduledVisit(updated) : v
        )
      );
      showToast(`Visit successfully rescheduled for ${rescheduleDate}.`);
      setRescheduleVisit(null);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Unable to reschedule visit slot.";
      showToast(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const filteredVisits = visits.filter((v) => v.status === currentTab);
  const showLoading = isAuthLoading || (isAuthenticated && isFetching);

  const getStatusBadge = (rawStatus: BackendSiteVisitStatus) => {
    switch (rawStatus) {
      case "REQUESTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            REQUESTED
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent-gold-light text-[#9E6E18] border border-accent-gold-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />
            CONFIRMED
          </span>
        );
      case "RESCHEDULED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <RotateCcw className="w-3 h-3 text-blue-600" />
            RESCHEDULED
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success-green-light text-success-green border border-success-green-border">
            <CheckCircle className="w-3 h-3 text-success-green" />
            COMPLETED
          </span>
        );
      case "CANCELLED_BY_BUYER":
      case "CANCELLED_BY_OWNER":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-error-red-light text-error-red border border-error-red/30">
            <XCircle className="w-3 h-3 text-error-red" />
            {rawStatus === "CANCELLED_BY_BUYER" ? "CANCELLED BY BUYER" : "CANCELLED BY HOST"}
          </span>
        );
      case "NO_SHOW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            NO SHOW
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {actionToast && (
        <div className="fixed top-20 right-6 z-50 rounded-xl bg-primary-navy text-white px-4 py-3 text-xs font-semibold shadow-soft-lg flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-accent-gold" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-primary-navy tracking-tight">
            Scheduled Property Visits
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            {isOwnerOrAgent
              ? "Manage buyer inspections, confirm appointment slots, and record completed walkthroughs."
              : "Track your requested and confirmed property tours, access visit locations, and manage schedules."}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent-gold-light text-[#9E6E18] border border-accent-gold-muted">
          <Sparkles className="w-3.5 h-3.5" />
          {visits.filter((v) => v.status === "UPCOMING").length} Upcoming Inspections
        </div>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="rounded-xl bg-error-red-light/80 border border-error-red/30 p-4 text-xs text-error-red flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border-default pb-1">
        {(["UPCOMING", "COMPLETED", "CANCELLED"] as VisitStatus[]).map((tab) => {
          const isSelected = currentTab === tab;
          const count = visits.filter((v) => v.status === tab).length;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setCurrentTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-primary-navy text-primary-navy"
                  : "border-transparent text-text-secondary hover:text-primary-navy"
              }`}
            >
              <span>{tab}</span>
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

      {/* Loading Skeleton */}
      {showLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-border-default bg-white p-5 shadow-soft space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded w-24" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="h-12 bg-slate-200 rounded-xl" />
                <div className="h-12 bg-slate-200 rounded-xl" />
                <div className="h-12 bg-slate-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredVisits.length > 0 ? (
        /* Visits List */
        <div className="space-y-4">
          {filteredVisits.map((visit) => (
            <div
              key={visit.id}
              className="rounded-2xl border border-border-default bg-white p-5 shadow-soft space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border-subtle pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-primary-navy">
                      {visit.propertyTitle}
                    </h3>
                    {getStatusBadge(visit.rawStatus)}
                  </div>
                  <p className="text-xs text-text-secondary flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-accent-gold shrink-0" />
                    {visit.propertyLocation}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-primary-navy bg-bg-light px-3 py-1.5 rounded-xl border border-border-subtle shrink-0">
                  <Calendar className="w-4 h-4 text-accent-gold" />
                  <span>{visit.date}</span>
                  <span>•</span>
                  <span className="text-text-secondary font-medium">{visit.timeSlot}</span>
                </div>
              </div>

              {/* Visitor / Host Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-bg-light border border-border-subtle flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-accent-gold border border-border-subtle shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-text-muted block">
                      {isOwnerOrAgent ? "Visitor Name" : "Participant"}
                    </span>
                    <strong className="text-text-primary block truncate font-semibold">
                      {visit.visitorName}
                    </strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-bg-light border border-border-subtle flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-accent-gold border border-border-subtle shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-text-muted block">Contact Phone</span>
                    <strong className="text-text-primary block truncate font-semibold">
                      {visit.visitorPhone}
                    </strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-bg-light border border-border-subtle flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-accent-gold border border-border-subtle shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-text-muted block">Email Address</span>
                    <strong className="text-text-primary block truncate font-semibold">
                      {visit.visitorEmail}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {visit.notes && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-text-secondary">
                  <strong className="text-primary-navy block font-semibold mb-0.5">
                    Visit Requirements / Notes:
                  </strong>
                  <p className="italic">&ldquo;{visit.notes}&rdquo;</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                {visit.status === "UPCOMING" && (
                  <>
                    {/* Buyer Action */}
                    {!isOwnerOrAgent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBuyerCancel(visit.id)}
                        disabled={isActionLoading}
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        className="text-xs text-error-red hover:bg-error-red-light border-border-default"
                      >
                        Cancel My Visit
                      </Button>
                    )}

                    {/* Owner / Agent Actions */}
                    {isOwnerOrAgent && (
                      <>
                        {visit.rawStatus === "REQUESTED" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleConfirmVisit(visit.id)}
                            disabled={isActionLoading}
                            leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                            className="text-xs font-bold shadow-soft-xs"
                          >
                            Confirm Appointment
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRescheduleVisit(visit);
                            setRescheduleDate(
                              new Date(Date.now() + 86400000).toISOString().split("T")[0]
                            );
                          }}
                          disabled={isActionLoading}
                          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                          className="text-xs font-semibold"
                        >
                          Reschedule
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOwnerCancel(visit.id)}
                          disabled={isActionLoading}
                          leftIcon={<XCircle className="w-3.5 h-3.5" />}
                          className="text-xs text-error-red hover:bg-error-red-light border-border-default"
                        >
                          Decline / Cancel
                        </Button>

                        {visit.rawStatus === "CONFIRMED" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkNoShow(visit.id)}
                              disabled={isActionLoading}
                              className="text-xs text-slate-600"
                            >
                              No-Show
                            </Button>

                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleCompleteVisit(visit.id)}
                              disabled={isActionLoading}
                              leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                              className="text-xs font-bold shadow-soft-xs"
                            >
                              Mark Completed
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}

                {visit.status === "COMPLETED" && (
                  <span className="text-xs font-semibold text-success-green flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Inspection Successfully Concluded
                  </span>
                )}

                {visit.status === "CANCELLED" && (
                  <span className="text-xs font-semibold text-text-muted flex items-center gap-1">
                    <XCircle className="w-4 h-4 text-error-red" />
                    Visit Slot Closed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarCheck}
          title={`No ${currentTab.toLowerCase()} visits`}
          description={
            isOwnerOrAgent
              ? "When buyers schedule on-site walkthroughs, their appointment slots will appear here."
              : "Explore properties and schedule free on-site walkthroughs with verified owners and agents."
          }
          actionText={!isOwnerOrAgent ? "Explore Properties" : undefined}
          actionHref={!isOwnerOrAgent ? "/buy" : undefined}
        />
      )}

      {/* Reschedule Modal */}
      {rescheduleVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-navy/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white border border-border-default p-6 shadow-soft-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-primary-navy flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-accent-gold" />
                Reschedule Visit Appointment
              </h3>
              <button
                type="button"
                onClick={() => setRescheduleVisit(null)}
                className="p-1 rounded-lg text-text-muted hover:bg-bg-light cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-text-secondary block mb-1">
                  Select New Inspection Date:
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border-default text-xs font-medium focus:border-accent-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-text-secondary block mb-1">
                  Select Preferred Time Window:
                </label>
                <select
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border-default text-xs font-medium focus:border-accent-gold focus:outline-none cursor-pointer"
                >
                  <option value="10:00 AM - 11:00 AM">Morning (10:00 AM - 11:00 AM)</option>
                  <option value="11:30 AM - 12:30 PM">Morning (11:30 AM - 12:30 PM)</option>
                  <option value="02:30 PM - 03:30 PM">Afternoon (02:30 PM - 03:30 PM)</option>
                  <option value="04:30 PM - 05:30 PM">Evening (04:30 PM - 05:30 PM)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRescheduleVisit(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isActionLoading}
                onClick={handleConfirmReschedule}
                className="text-xs font-bold shadow-soft-xs"
              >
                Confirm New Slot
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VisitsManager;

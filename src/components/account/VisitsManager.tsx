"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui";
import { ScheduledVisit, VisitStatus } from "@/types/account";
import { MOCK_SCHEDULED_VISITS } from "@/data/account/mockAccountData";
import { EmptyState } from "./EmptyState";

export function VisitsManager() {
  const [visits, setVisits] = useState<ScheduledVisit[]>(MOCK_SCHEDULED_VISITS);
  const [currentTab, setCurrentTab] = useState<VisitStatus>("UPCOMING");
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Modals state
  const [rescheduleVisit, setRescheduleVisit] = useState<ScheduledVisit | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState("11:00 AM - 12:00 PM");

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  const handleUpdateStatus = (visitId: string, status: VisitStatus) => {
    setVisits((prev) =>
      prev.map((v) => (v.id === visitId ? { ...v, status } : v))
    );
    showToast(`Visit marked as ${status}.`);
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleVisit || !rescheduleDate) return;
    setVisits((prev) =>
      prev.map((v) =>
        v.id === rescheduleVisit.id
          ? {
              ...v,
              date: rescheduleDate,
              timeSlot: rescheduleSlot,
              status: "UPCOMING",
            }
          : v
      )
    );
    showToast(`Visit successfully rescheduled for ${rescheduleDate}.`);
    setRescheduleVisit(null);
  };

  const filteredVisits = visits.filter((v) => v.status === currentTab);

  const getStatusBadge = (status: VisitStatus) => {
    switch (status) {
      case "UPCOMING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent-gold-light text-[#9E6E18] border border-accent-gold-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse" />
            UPCOMING
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success-green-light text-success-green border border-success-green-border">
            COMPLETED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-error-red-light text-error-red border border-error-red/30">
            CANCELLED
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
            Manage buyer inspections, confirm appointment slots, and record completed walkthroughs.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent-gold-light text-[#9E6E18] border border-accent-gold-muted">
          <Sparkles className="w-3.5 h-3.5" />
          {visits.filter((v) => v.status === "UPCOMING").length} Upcoming Inspections
        </div>
      </div>

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

      {/* Visits List */}
      {filteredVisits.length > 0 ? (
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
                    {getStatusBadge(visit.status)}
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

              {/* Visitor Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-bg-light border border-border-subtle flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-accent-gold border border-border-subtle shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-text-muted block">Visitor Name</span>
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

              {/* Visitor Notes */}
              {visit.notes && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-text-secondary">
                  <strong className="text-primary-navy block font-semibold mb-0.5">
                    Visitor Requirements / Notes:
                  </strong>
                  <p className="italic">&ldquo;{visit.notes}&rdquo;</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border-subtle">
                {visit.status === "UPCOMING" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(visit.id, "CANCELLED")}
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      className="text-xs text-error-red hover:bg-error-red-light border-border-default"
                    >
                      Cancel Visit
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRescheduleVisit(visit);
                        setRescheduleDate(visit.date);
                      }}
                      leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                      className="text-xs font-semibold"
                    >
                      Reschedule
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateStatus(visit.id, "COMPLETED")}
                      leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                      className="text-xs font-bold shadow-soft-xs"
                    >
                      Mark Completed
                    </Button>
                  </>
                )}

                {visit.status === "CANCELLED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus(visit.id, "UPCOMING")}
                    className="text-xs font-semibold"
                  >
                    Re-open Visit
                  </Button>
                )}

                {visit.status === "COMPLETED" && (
                  <span className="text-xs font-semibold text-success-green flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Inspection Successfully Concluded
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
          description="When buyers schedule on-site walkthroughs, their appointment slots will appear here."
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

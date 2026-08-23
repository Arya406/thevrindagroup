"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, CheckCircle2, ShieldCheck, Building2, AlertCircle } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { CommercialProperty, CommercialVisitRequest } from "@/types/commercial";
import { useAuth } from "@/lib/auth/auth-context";
import { SiteVisitApiService } from "@/lib/services/site-visit-api";

export interface ScheduleCommercialVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: CommercialProperty;
}

export function ScheduleCommercialVisitModal({
  isOpen,
  onClose,
  property,
}: ScheduleCommercialVisitModalProps) {
  const { currentUser, isAuthenticated, requireAuth } = useAuth();
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState<CommercialVisitRequest["preferredSlot"]>(
    "Morning (09:00 AM - 12:00 PM)"
  );
  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [companyName, setCompanyName] = useState("");
  const [notes, setNotes] = useState("");
  const [isBooked, setIsBooked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const executeSubmit = async () => {
    if (!date || !name || !phone || isLoading) return;
    setIsLoading(true);
    setError(null);

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(property.id);
    if (isUuid) {
      try {
        let hour = 10;
        if (timeSlot.startsWith("Afternoon")) hour = 14;
        else if (timeSlot.startsWith("Evening")) hour = 17;

        const scheduledDate = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00.000Z`);
        const targetIso = scheduledDate.toISOString();

        const buyerNote = [
          companyName ? `Company: ${companyName}` : null,
          `Delegate: ${name} (${phone})`,
          `Time window: ${timeSlot}`,
          notes ? `Requirements: ${notes}` : null,
        ]
          .filter(Boolean)
          .join("\n");

        await SiteVisitApiService.createSiteVisit(property.id, {
          scheduledAt: targetIso,
          buyerNote,
        });

        setIsBooked(true);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unable to schedule site inspection.";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      setIsBooked(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !name || !phone) {
      setError("Please select an inspection date and enter your contact details.");
      return;
    }

    if (!isAuthenticated) {
      const allowed = requireAuth({
        title: "Sign in to schedule a site tour",
        message: "Sign in to confirm VIP commercial asset inspections and receive verified floor plans.",
        onAuthenticated: () => executeSubmit(),
      });
      if (allowed) {
        executeSubmit();
      }
      return;
    }

    executeSubmit();
  };

  const handleReset = () => {
    setIsBooked(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-navy/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-soft-xl border border-border-default space-y-5 my-8 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-light transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isBooked ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-success-green-light text-success-green flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-primary-navy">
                Commercial Site Inspection Confirmed!
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Your on-site walkthrough for <strong>{property.title}</strong> has been registered for <strong>{date}</strong> ({timeSlot}).
              </p>
            </div>

            <div className="p-3 rounded-lg bg-bg-light border border-border-subtle text-xs text-left space-y-1">
              <p>
                <strong>Delegate:</strong> {name} ({companyName || "Corporate Account"})
              </p>
              <p>
                <strong>Location:</strong> {property.address}
              </p>
              <p>
                <strong>Key Contact:</strong> {property.sellerName} ({property.sellerPhone || "+91 80 4040 8080"})
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleReset}
              className="w-full text-xs font-bold"
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-accent-gold-light text-[#9E6E18] text-[11px] font-bold px-2 py-0.5 border border-accent-gold-muted flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  VIP Commercial Inspection
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-primary-navy mt-1">
                Schedule Site Tour: {property.title}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {property.location} • {property.carpetArea} • {property.priceFormatted}
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-xl bg-error-red-light border border-error-red/30 text-xs text-error-red flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Date Selection */}
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">
                  Preferred Inspection Date *
                </label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 h-3.5 w-3.5 text-text-muted pointer-events-none" />
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-8"
                    required
                  />
                </div>
              </div>

              {/* Time Slot Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary block">
                  Preferred Time Slot *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {([
                    "Morning (09:00 AM - 12:00 PM)",
                    "Afternoon (12:00 PM - 04:00 PM)",
                    "Evening (04:00 PM - 07:00 PM)",
                  ] as const).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
                        timeSlot === slot
                          ? "bg-primary-navy text-white border-primary-navy shadow-soft-xs"
                          : "bg-bg-light text-text-secondary border-border-default hover:bg-white"
                      }`}
                    >
                      {slot.split(" ")[0]}
                      <span className="block text-[10px] font-normal opacity-80">
                        {slot.match(/\((.*?)\)/)?.[1]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">
                    Your Full Name *
                  </label>
                  <Input
                    placeholder="e.g. Anand Mahindra"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">
                    Contact Phone *
                  </label>
                  <Input
                    placeholder="e.g. +91 98450 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">
                  Company / Organization Name
                </label>
                <Input
                  placeholder="e.g. Infosys / Tech Mahindra"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              {/* Special Instructions */}
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">
                  Inspection Focus / Security Requirements
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Need to review electrical load capacity and server room HVAC layout."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border-default text-xs text-text-primary focus:border-accent-gold focus:outline-none resize-none font-sans"
                />
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                leftIcon={<Clock className="w-4 h-4" />}
                className="w-full h-11 text-xs font-bold shadow-soft"
              >
                Confirm Site Inspection
              </Button>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-muted pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-success-green" />
                <span>
                  Accompanied by a senior corporate leasing manager. No broker fees.
                </span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ScheduleCommercialVisitModal;

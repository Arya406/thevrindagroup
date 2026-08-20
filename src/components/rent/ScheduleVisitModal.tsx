"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { RentalProperty, RentalVisitRequest } from "@/types/rental";

export interface ScheduleVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: RentalProperty;
}

export function ScheduleVisitModal({
  isOpen,
  onClose,
  property,
}: ScheduleVisitModalProps) {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState<RentalVisitRequest["preferredSlot"]>(
    "Morning (09:00 AM - 12:00 PM)"
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isBooked, setIsBooked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !name || !phone) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsBooked(true);
    }, 400);
  };

  const handleResetAndClose = () => {
    setIsBooked(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-navy/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-soft-lg border border-border-default space-y-5 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-light transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isBooked ? (
          <div className="py-6 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-green-light text-success-green mx-auto border border-success-green-border">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-primary-navy">
                Site Visit Scheduled!
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Your free site visit has been scheduled. The owner{" "}
                <strong className="text-primary-navy">{property.sellerName}</strong> has been notified.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-bg-light border border-border-subtle text-xs text-left space-y-1.5 max-w-sm mx-auto">
              <p className="text-text-secondary">
                <strong>Property:</strong> {property.title}
              </p>
              <p className="text-text-secondary">
                <strong>Date:</strong> {date}
              </p>
              <p className="text-text-secondary">
                <strong>Time Slot:</strong> {timeSlot}
              </p>
              <p className="text-text-secondary">
                <strong>Location:</strong> {property.address}
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleResetAndClose}
                className="font-bold text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-accent-gold-hover">
                <Calendar className="w-4 h-4" />
                <span>Complimentary Property Tour</span>
              </div>
              <h3 className="text-lg font-bold text-primary-navy">
                Schedule a Free Site Visit
              </h3>
              <p className="text-xs text-text-secondary">
                {property.title} · {property.formattedRent}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">
                  Select Preferred Date *
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">
                    Your Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Ramesh Nair"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    placeholder="e.g. 98110 54321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-bg-light border border-border-subtle flex items-start gap-2 text-[11px] text-text-secondary">
                <ShieldCheck className="w-4 h-4 text-success-green shrink-0 mt-0.5" />
                <p>
                  A dedicated TheVrindaGroup relationship manager will confirm with the owner and accompany your visit free of charge.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                leftIcon={<Clock className="w-4 h-4" />}
                className="w-full h-11 text-xs font-bold shadow-soft"
              >
                Confirm Site Visit Booking
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ScheduleVisitModal;

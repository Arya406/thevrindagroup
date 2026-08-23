"use client";

import React, { useState } from "react";
import { X, ShieldCheck, CheckCircle2, Send, AlertCircle } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { RentalProperty, RentalEnquiry } from "@/types/rental";
import { useAuth } from "@/lib/auth/auth-context";
import { EnquiryApiService, BackendPropertyEnquiry } from "@/lib/services/enquiry-api";
import { ApiClientError } from "@/lib/api-client";

export interface RentEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: RentalProperty;
}

export function RentEnquiryModal({
  isOpen,
  onClose,
  property,
}: RentEnquiryModalProps) {
  const { currentUser, isAuthenticated, requireAuth } = useAuth();

  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [interestType, setInterestType] = useState<RentalEnquiry["interestType"]>("Request Callback");
  const [message, setMessage] = useState(
    `Hi ${property.sellerName}, I am interested in your ${property.bhk} rental property in ${property.locality}, ${property.city}. Please share availability and terms.`
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdEnquiry, setCreatedEnquiry] = useState<BackendPropertyEnquiry | null>(null);

  if (!isOpen) return null;

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setErrorMessage(null);
    setCreatedEnquiry(null);
    onClose();
  };

  const executeSubmit = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const enquiry = await EnquiryApiService.createEnquiry(property.id, {
        message: message.trim() || undefined,
      });

      setCreatedEnquiry(enquiry);
      setIsSubmitted(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.statusCode === 400 && err.message.toLowerCase().includes("active enquiry")) {
          setErrorMessage("You already have an active enquiry for this property.");
        } else if (err.statusCode === 400 && err.message.toLowerCase().includes("own property")) {
          setErrorMessage("You cannot enquire about your own property.");
        } else if (err.statusCode === 403) {
          setErrorMessage("You do not have permission to submit an enquiry for this property.");
        } else if (err.statusCode === 401) {
          setErrorMessage("Your session has expired. Please sign in again.");
        } else {
          setErrorMessage(err.message || "Failed to submit rental enquiry.");
        }
      } else {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!isAuthenticated) {
      const canProceed = requireAuth({
        title: "Sign in to send rental enquiry",
        message: "Sign in to send direct enquiries to verified landlords and agents.",
        onAuthenticated: () => executeSubmit(),
      });
      if (canProceed) {
        executeSubmit();
      }
      return;
    }

    executeSubmit();
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

        {isSubmitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-green-light text-success-green mx-auto border border-success-green-border">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-primary-navy">
                Enquiry Sent Successfully!
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Your interest has been shared directly with{" "}
                <strong className="text-primary-navy">{property.sellerName}</strong>.
                You will receive a callback or notification shortly.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-bg-light border border-border-subtle text-xs text-left space-y-1.5 max-w-sm mx-auto">
              <div className="flex justify-between items-center border-b border-border-subtle pb-1">
                <span className="text-text-muted">Status</span>
                <span className="font-bold text-success-green">{createdEnquiry?.status || "NEW"}</span>
              </div>
              <p className="text-text-secondary truncate">
                <strong>Property:</strong> {property.title}
              </p>
              <p className="text-text-secondary">
                <strong>Monthly Rent:</strong> {property.formattedRent}
              </p>
              <p className="text-text-secondary">
                <strong>Preferred Method:</strong> {interestType}
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleResetAndClose}
                className="font-bold text-xs w-full"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-success-green">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Brokerage Direct Contact</span>
              </div>
              <h3 className="text-lg font-bold text-primary-navy">
                Connect with {property.sellerName}
              </h3>
              <p className="text-xs text-text-secondary">
                {property.bhk} in {property.locality}, {property.city} ·{" "}
                <strong className="text-primary-navy font-bold">{property.formattedRent}</strong>
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-error-red-light/70 border border-error-red/30 p-3 text-xs flex items-start gap-2 text-error-red animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary block">
                  I&apos;m Interested In:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {([
                    "Request Callback",
                    "Schedule Visit",
                    "WhatsApp",
                    "More Information",
                  ] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInterestType(type)}
                      className={`px-2 py-1.5 text-[11px] font-bold rounded-lg border transition-all cursor-pointer text-center ${
                        interestType === type
                          ? "bg-primary-navy text-white border-primary-navy shadow-soft-xs"
                          : "bg-bg-light text-text-secondary border-border-default hover:bg-white"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">
                    Your Full Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Aditi Rao"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">
                    Phone Number (WhatsApp) *
                  </label>
                  <Input
                    type="tel"
                    placeholder="e.g. 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">
                  Email Address (Optional)
                </label>
                <Input
                  type="email"
                  placeholder="e.g. aditi@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">
                  Message to Owner
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg border border-border-default bg-white p-2.5 text-xs text-text-primary focus:border-accent-gold focus:outline-none"
                  maxLength={2000}
                />
              </div>

              <div className="p-3 rounded-lg bg-bg-light border border-border-subtle flex items-start gap-2 text-[11px] text-text-secondary">
                <ShieldCheck className="w-4 h-4 text-success-green shrink-0 mt-0.5" />
                <p>
                  Your contact details are shared <strong>only with the verified property owner/agent</strong>. Zero spam guarantee.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={isLoading}
                leftIcon={<Send className="w-4 h-4" />}
                className="w-full h-11 text-xs font-bold shadow-soft"
              >
                Send Direct Enquiry
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default RentEnquiryModal;

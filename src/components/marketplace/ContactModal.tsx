"use client";

import React, { useState } from "react";
import { X, Phone, Mail, User, ShieldCheck, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { Property } from "@/types/property";
import { useAuth } from "@/lib/auth/auth-context";
import { EnquiryApiService, BackendPropertyEnquiry } from "@/lib/services/enquiry-api";
import { ApiClientError } from "@/lib/api-client";

export interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
}

export function ContactModal({ isOpen, onClose, property }: ContactModalProps) {
  const { currentUser, isAuthenticated, requireAuth } = useAuth();

  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [message, setMessage] = useState(
    property
      ? `Hi ${property.sellerName || "Seller"}, I am interested in your property "${property.title}" in ${property.location || property.city}. Please share more details and callback availability.`
      : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdEnquiry, setCreatedEnquiry] = useState<BackendPropertyEnquiry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !property) return null;

  const handleClose = () => {
    setSubmitted(false);
    setErrorMessage(null);
    setCreatedEnquiry(null);
    onClose();
  };

  const executeEnquirySubmission = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const enquiry = await EnquiryApiService.createEnquiry(property.id, {
        message: message.trim() || undefined,
      });

      setCreatedEnquiry(enquiry);
      setSubmitted(true);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.statusCode === 400 && err.message.toLowerCase().includes("active enquiry")) {
          setErrorMessage("You already have an active enquiry for this property.");
        } else if (err.statusCode === 400 && err.message.toLowerCase().includes("own property")) {
          setErrorMessage("You cannot submit an enquiry for your own property.");
        } else if (err.statusCode === 400 && err.message.toLowerCase().includes("unpublished")) {
          setErrorMessage("Cannot enquire about an unpublished listing.");
        } else if (err.statusCode === 403) {
          setErrorMessage("You do not have permission to submit an enquiry for this property.");
        } else if (err.statusCode === 401) {
          setErrorMessage("Your session has expired. Please sign in again.");
        } else if (err.statusCode === 409) {
          setErrorMessage("An active enquiry for this property already exists.");
        } else if (Array.isArray(err.details) && err.details.length > 0) {
          const firstDetail = err.details[0] as { message?: string };
          setErrorMessage(firstDetail?.message || err.message);
        } else {
          setErrorMessage(err.message || "Failed to submit enquiry.");
        }
      } else {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while connecting to the server. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!isAuthenticated) {
      const canProceed = requireAuth({
        title: "Sign in to contact seller",
        message: "Sign in with your account to send verified enquiries and receive instant callbacks.",
        onAuthenticated: () => executeEnquirySubmission(),
      });
      if (canProceed) {
        executeEnquirySubmission();
      }
      return;
    }

    executeEnquirySubmission();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-navy/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl border border-border-default shadow-soft-lg p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-light transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-success-green-light text-success-green flex items-center justify-center mx-auto shadow-soft-xs">
              <CheckCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-primary-navy">Enquiry Sent Successfully!</h3>
              <p className="text-xs sm:text-sm text-text-secondary max-w-xs mx-auto">
                The {property.sellerType === "owner" ? "owner" : "verified agent"}{" "}
                <strong className="text-text-primary">{property.sellerName}</strong> has
                received your enquiry and will contact you shortly.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-bg-light border border-border-subtle text-left text-xs space-y-1.5">
              <div className="flex justify-between items-center border-b border-border-subtle pb-1.5">
                <span className="text-text-muted">Enquiry Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-[11px] text-success-green bg-success-green-light px-2 py-0.5 rounded-full border border-success-green-border">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-green animate-pulse" />
                  {createdEnquiry?.status || "NEW"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Property</span>
                <span className="font-semibold text-text-primary truncate max-w-[200px]">
                  {property.title}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Reference Code</span>
                <span className="font-mono font-bold text-primary-navy">
                  {property.referenceCode || property.id.slice(0, 8)}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="primary" onClick={handleClose} className="w-full text-xs font-bold shadow-soft">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-success-green mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Brokerage Contact Guarantee</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary">
                Contact {property.sellerType === "owner" ? "Owner" : "Agent"}
              </h3>
              <p className="text-xs text-text-secondary mt-1 truncate">
                {property.title} • <span className="font-semibold text-text-primary">{property.price}</span>
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-error-red-light/70 border border-error-red/30 p-3.5 text-xs flex items-start gap-2.5 text-error-red animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <Input
                label="Your Full Name"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Mobile Number (+91)"
                placeholder="10-digit mobile number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
                required
              />

              <Input
                label="Email Address"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Message to Seller
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message or questions about the property..."
                  className="w-full rounded-xl border border-border-default bg-bg-light px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-primary-navy focus:bg-white focus:outline-none transition-colors resize-none"
                  maxLength={2000}
                />
              </div>

              <div className="pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full text-xs font-bold shadow-soft"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Transmitting Enquiry..." : "Get Instant Callback & Info"}
                </Button>
              </div>

              <p className="text-[11px] text-text-muted text-center leading-tight">
                By submitting, you agree to TheVrindaGroup’s Privacy Policy. Your contact is shared only with the verified seller.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ContactModal;

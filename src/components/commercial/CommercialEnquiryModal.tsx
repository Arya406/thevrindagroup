"use client";

import React, { useState } from "react";
import { X, ShieldCheck, CheckCircle2, Send, Building2, Briefcase } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { CommercialProperty, CommercialEnquiry } from "@/types/commercial";

export interface CommercialEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: CommercialProperty;
}

const BUSINESS_TYPES = [
  "IT / Software Services",
  "BFSI & Financial Services",
  "Retail & E-commerce",
  "Logistics & Warehousing",
  "Manufacturing & Industrial",
  "Healthcare & Pharma",
  "Consulting & Legal",
  "Startup / Scaleup",
  "Other Business",
];

const INTEREST_TYPES: CommercialEnquiry["interestType"][] = [
  "Schedule Site Visit",
  "Request Callback",
  "Request Pricing",
  "Request Floor Plan",
  "Request More Information",
];

export function CommercialEnquiryModal({
  isOpen,
  onClose,
  property,
}: CommercialEnquiryModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [interestType, setInterestType] =
    useState<CommercialEnquiry["interestType"]>("Request Callback");
  const [message, setMessage] = useState(
    `Hi ${property.sellerName}, I am interested in leasing/acquiring ${property.title} in ${property.locality}, ${property.city}. Please share commercial terms and master floor plans.`
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email || !companyName) {
      alert("Please fill in your name, contact phone, business email, and company name.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 400);
  };

  const handleReset = () => {
    setIsSubmitted(false);
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

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-success-green-light text-success-green flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-primary-navy">
                Commercial Enquiry Transmitted!
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Thank you, <strong>{name}</strong> from <strong>{companyName}</strong>. The commercial leasing director for {property.title} will contact you shortly at {phone}.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-bg-light border border-border-subtle text-xs text-left space-y-1">
              <p>
                <strong>Property:</strong> {property.title}
              </p>
              <p>
                <strong>Area:</strong> {property.carpetArea} ({property.floor})
              </p>
              <p>
                <strong>Interest:</strong> {interestType}
              </p>
            </div>

            <Button
              variant="primary"
              onClick={handleReset}
              className="w-full text-xs font-bold"
            >
              Back to Commercial Listings
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-accent-gold-light text-[#9E6E18] text-[11px] font-bold px-2 py-0.5 border border-accent-gold-muted flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  Commercial Enterprise Desk
                </span>
                <span className="text-xs text-text-muted">
                  ID: {property.id}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-primary-navy mt-1">
                Corporate Enquiry for {property.title}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {property.carpetArea} • {property.location} • {property.priceFormatted}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Interest Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary block">
                  Requirement Type:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInterestType(type)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all cursor-pointer ${
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

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">
                    Your Full Name *
                  </label>
                  <Input
                    placeholder="e.g. Rajesh Khurana"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">
                    Official Mobile Number *
                  </label>
                  <Input
                    placeholder="e.g. +91 98200 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Business Email & Company Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">
                    Corporate Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary block mb-1">
                    Company / Organization *
                  </label>
                  <Input
                    placeholder="e.g. Nexus Tech Labs"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Business Industry Type */}
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">
                  Industry / Business Vertical
                </label>
                <div className="relative flex items-center">
                  <Briefcase className="absolute left-3 h-3.5 w-3.5 text-text-muted pointer-events-none" />
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full h-10 pl-8 pr-4 appearance-none rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none cursor-pointer"
                  >
                    {BUSINESS_TYPES.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">
                  Custom Requirements / Fitout Specifications
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-border-default text-xs text-text-primary focus:border-accent-gold focus:outline-none resize-none font-sans"
                />
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                leftIcon={<Send className="w-4 h-4" />}
                className="w-full h-11 text-xs font-bold shadow-soft"
              >
                Send Commercial Enquiry
              </Button>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-muted pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-success-green" />
                <span>
                  Strict NDA Privacy: Information shared exclusively with the authorized leasing representative.
                </span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default CommercialEnquiryModal;

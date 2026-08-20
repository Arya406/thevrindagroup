"use client";

import React, { useState } from "react";
import { X, Phone, Mail, User, ShieldCheck, CheckCircle } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { Property } from "@/types/property";

export interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
}

export function ContactModal({ isOpen, onClose, property }: ContactModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !property) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setSubmitted(true);
    setTimeout(() => {
      // auto close after brief delay
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1800);
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-navy/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl border border-border-default shadow-soft-lg p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-light transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-success-green-light text-success-green flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="heading-card text-text-primary">Contact Request Sent!</h3>
            <p className="text-sm text-text-secondary">
              The {property.sellerType === "owner" ? "owner" : "verified agent"}{" "}
              <strong className="text-text-primary">{property.sellerName}</strong> has
              received your details and will call you shortly.
            </p>
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
              <p className="text-xs text-text-secondary mt-1">
                {property.title} • <span className="font-semibold text-text-primary">{property.price}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                label="Email Address (Optional)"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <div className="pt-2">
                <Button type="submit" variant="primary" className="w-full">
                  Get Instant Callback & Info
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

"use client";

import React from "react";
import { UserCheck, Building2, Briefcase, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { OwnerType } from "@/types/postProperty";

export interface PostPropertyLandingProps {
  selectedOwnerType: OwnerType;
  onSelectOwnerType: (type: OwnerType) => void;
  onStart: () => void;
}

export function PostPropertyLanding({
  selectedOwnerType,
  onSelectOwnerType,
  onStart,
}: PostPropertyLandingProps) {
  const personaOptions = [
    {
      id: "owner" as OwnerType,
      title: "I AM AN OWNER",
      subtitle: "Individual Homeowner / Property Holder",
      description: "List your residential flat, independent villa, or commercial unit with zero brokerage.",
      icon: UserCheck,
      badge: "Zero Brokerage",
    },
    {
      id: "agent" as OwnerType,
      title: "I AM AN AGENT",
      subtitle: "Certified Real Estate Broker / Channel Partner",
      description: "Promote verified client listings to thousands of active verified buyers & tenants.",
      icon: Briefcase,
      badge: "Partner Network",
    },
    {
      id: "developer" as OwnerType,
      title: "I AM A DEVELOPER",
      subtitle: "Builder / Project Marketing Wing",
      description: "Showcase residential societies, commercial IT parks, and new project launches.",
      icon: Building2,
      badge: "Builder Inventory",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent-gold-light text-[#9E6E18] border border-accent-gold-muted mx-auto">
          <Sparkles className="w-3.5 h-3.5" />
          Zero Listing Fees • Verified TheVrindaGroup Marketplace
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-primary-navy tracking-tight">
          List Your Property on TheVrindaGroup
        </h1>
        <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto">
          Reach genuine buyers and verified tenants looking for properties across India’s top metropolitan cities.
        </p>
      </div>

      {/* Role Selector Cards */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block text-center">
          Select Your Account Type to Continue
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {personaOptions.map((item) => {
            const isSelected = selectedOwnerType === item.id;
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onSelectOwnerType(item.id)}
                className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? "bg-white border-accent-gold ring-2 ring-accent-gold/30 shadow-soft-md -translate-y-1"
                    : "bg-white border-border-default hover:border-border-dark hover:shadow-soft"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-primary-navy text-accent-gold shadow-soft-xs"
                          : "bg-bg-light text-text-secondary"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-bg-light border border-border-subtle text-text-secondary">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-primary-navy tracking-wide">
                      {item.title}
                    </h3>
                    <p className="text-xs font-medium text-text-primary mt-0.5">
                      {item.subtitle}
                    </p>
                    <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-border-subtle text-xs">
                  <span
                    className={`font-semibold ${
                      isSelected ? "text-accent-gold-hover" : "text-text-muted"
                    }`}
                  >
                    {isSelected ? "Selected" : "Click to select"}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? "border-accent-gold bg-accent-gold text-dark-navy"
                        : "border-border-default"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4 fill-dark-navy text-accent-gold" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust Pillars Banner */}
      <div className="rounded-2xl bg-white border border-border-default p-5 shadow-soft">
        <h4 className="text-xs font-bold text-primary-navy uppercase tracking-wider mb-3 text-center sm:text-left">
          Why Sellers & Landlords Choose TheVrindaGroup
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-success-green shrink-0 mt-0.5" />
            <div>
              <strong className="text-text-primary block font-semibold">100% Free Listing</strong>
              <span className="text-text-secondary text-[11px]">No upfront charges or hidden commissions.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-success-green shrink-0 mt-0.5" />
            <div>
              <strong className="text-text-primary block font-semibold">Verified Enquiries</strong>
              <span className="text-text-secondary text-[11px]">Connect only with OTP-verified buyers & tenants.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-success-green shrink-0 mt-0.5" />
            <div>
              <strong className="text-text-primary block font-semibold">Instant Callbacks</strong>
              <span className="text-text-secondary text-[11px]">Manage customer responses from your personal desk.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-success-green shrink-0 mt-0.5" />
            <div>
              <strong className="text-text-primary block font-semibold">Secure Contact Sharing</strong>
              <span className="text-text-secondary text-[11px]">Your personal contact number is shielded from spam.</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={onStart}
          rightIcon={<ArrowRight className="w-5 h-5" />}
          className="w-full sm:w-auto text-sm sm:text-base font-bold shadow-soft-md h-12 px-10"
        >
          Start Listing Property
        </Button>
        <p className="text-xs text-text-muted mt-2">
          Step 1 of 7 takes only 30 seconds to complete
        </p>
      </div>
    </div>
  );
}

export default PostPropertyLanding;

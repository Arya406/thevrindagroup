"use client";

import React from "react";
import { IndianRupee, Sparkles } from "lucide-react";
import { Input } from "@/components/ui";
import {
  PostTransactionType,
  PropertyCategory,
  ListingPricing,
} from "@/types/postProperty";

export interface Step5PricingProps {
  transaction: PostTransactionType;
  category: PropertyCategory;
  pricing: ListingPricing;
  onChange: (pricing: ListingPricing) => void;
  errors?: Record<string, string>;
}

// Indian Currency Formatter in Lakhs / Crores
function formatIndianWords(amountStr?: string) {
  const num = parseInt(amountStr || "0", 10);
  if (!num || isNaN(num)) return "";

  if (num >= 10000000) {
    const cr = (num / 10000000).toFixed(2);
    return `₹ ${cr} Crore (₹ ${num.toLocaleString("en-IN")})`;
  }
  if (num >= 100000) {
    const lac = (num / 100000).toFixed(2);
    return `₹ ${lac} Lakh (₹ ${num.toLocaleString("en-IN")})`;
  }
  if (num >= 1000) {
    return `₹ ${num.toLocaleString("en-IN")}`;
  }
  return `₹ ${num}`;
}

export function Step5Pricing({
  transaction,
  category,
  pricing,
  onChange,
  errors = {},
}: Step5PricingProps) {
  const updateField = <K extends keyof ListingPricing>(
    field: K,
    val: ListingPricing[K]
  ) => {
    onChange({ ...pricing, [field]: val });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-primary-navy">
          Set Your Pricing & Terms
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
          {transaction === "sale"
            ? "Enter your expected sale price and negotiation preferences."
            : "Specify monthly rental amount, security deposit advance, and maintenance terms."}
        </p>
      </div>

      {transaction === "sale" ? (
        /* ================= SALE PRICING ================= */
        <div className="space-y-5">
          {/* Expected Price */}
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Expected Total Asking Price (₹) *
            </label>
            <div className="relative flex items-center">
              <IndianRupee className="absolute left-3 h-4 w-4 text-accent-gold pointer-events-none" />
              <input
                type="number"
                placeholder="e.g. 12500000"
                value={pricing.expectedPrice || ""}
                onChange={(e) => updateField("expectedPrice", e.target.value)}
                className={`w-full h-11 pl-9 pr-3 rounded-lg border text-sm font-bold focus:border-accent-gold focus:outline-none transition-all shadow-soft-xs ${
                  errors.expectedPrice ? "border-error-red bg-error-red-light/30" : "border-border-default bg-white"
                }`}
              />
            </div>
            {errors.expectedPrice ? (
              <p className="text-[11px] text-error-red font-medium mt-1">
                {errors.expectedPrice}
              </p>
            ) : pricing.expectedPrice ? (
              <p className="text-xs font-bold text-success-green mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {formatIndianWords(pricing.expectedPrice)}
              </p>
            ) : null}
          </div>

          {/* Price Negotiable Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary block">
              Is the Asking Price Negotiable?
            </label>
            <div className="flex gap-3">
              {[
                { val: true, label: "Yes, Open to Negotiation" },
                { val: false, label: "No, Fixed Price" },
              ].map((opt) => (
                <button
                  key={String(opt.val)}
                  type="button"
                  onClick={() => updateField("isPriceNegotiable", opt.val)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    pricing.isPriceNegotiable === opt.val
                      ? "bg-primary-navy text-white border-primary-navy shadow-soft-xs"
                      : "bg-white text-text-secondary border-border-default hover:bg-bg-light"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Maintenance Charges */}
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Monthly Society Maintenance (Optional)
            </label>
            <Input
              type="number"
              placeholder="e.g. 3500 (₹ / month)"
              value={pricing.maintenanceCharges || ""}
              onChange={(e) => updateField("maintenanceCharges", e.target.value)}
            />
          </div>
        </div>
      ) : (
        /* ================= RENT / LEASE PRICING ================= */
        <div className="space-y-5">
          {/* Monthly Rent */}
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Monthly Expected Rent (₹ / month) *
            </label>
            <div className="relative flex items-center">
              <IndianRupee className="absolute left-3 h-4 w-4 text-accent-gold pointer-events-none" />
              <input
                type="number"
                placeholder="e.g. 35000"
                value={pricing.monthlyRent || ""}
                onChange={(e) => updateField("monthlyRent", e.target.value)}
                className={`w-full h-11 pl-9 pr-3 rounded-lg border text-sm font-bold focus:border-accent-gold focus:outline-none transition-all shadow-soft-xs ${
                  errors.monthlyRent ? "border-error-red bg-error-red-light/30" : "border-border-default bg-white"
                }`}
              />
            </div>
            {errors.monthlyRent ? (
              <p className="text-[11px] text-error-red font-medium mt-1">
                {errors.monthlyRent}
              </p>
            ) : pricing.monthlyRent ? (
              <p className="text-xs font-bold text-success-green mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {formatIndianWords(pricing.monthlyRent)} / month
              </p>
            ) : null}
          </div>

          {/* Security Deposit & Maintenance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Security Deposit Advance (₹) *
              </label>
              <Input
                type="number"
                placeholder="e.g. 150000"
                value={pricing.securityDeposit || ""}
                onChange={(e) => updateField("securityDeposit", e.target.value)}
                error={errors.securityDeposit}
              />
              {pricing.securityDeposit && (
                <span className="text-[11px] text-text-muted mt-1 block">
                  {formatIndianWords(pricing.securityDeposit)}
                </span>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Monthly Maintenance (₹ / month)
              </label>
              <Input
                type="number"
                placeholder="e.g. 3200"
                value={pricing.maintenanceCharges || ""}
                onChange={(e) => updateField("maintenanceCharges", e.target.value)}
              />
            </div>
          </div>

          {/* Availability Date & Commercial Lease Lock-in */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Available From Date
              </label>
              <Input
                type="date"
                value={pricing.availableFrom || ""}
                onChange={(e) => updateField("availableFrom", e.target.value)}
              />
            </div>

            {category === "commercial" && (
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">
                  Commercial Lease Lock-in Period
                </label>
                <select
                  value={pricing.leaseDuration || "3 Years"}
                  onChange={(e) => updateField("leaseDuration", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none cursor-pointer"
                >
                  <option value="1 Year">1 Year Lock-in</option>
                  <option value="2 Years">2 Years Lock-in</option>
                  <option value="3 Years">3 Years Standard</option>
                  <option value="5 Years">5 Years Institutional</option>
                  <option value="9 Years">9 Years Long-term</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Step5Pricing;

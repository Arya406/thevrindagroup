"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { PropertyListingDraft } from "@/types/postProperty";

export interface PublishSuccessProps {
  draft: PropertyListingDraft;
  onPostAnother: () => void;
}

export function PublishSuccess({ draft, onPostAnother }: PublishSuccessProps) {
  const isResidential = draft.category === "residential";
  const propertyTitle = isResidential
    ? `${draft.residentialDetails.bhk} BHK ${draft.residentialType} in ${draft.location.locality || "Bangalore"}`
    : `Commercial ${draft.commercialType} in ${draft.location.locality || "Bangalore"}`;

  return (
    <div className="max-w-2xl mx-auto rounded-2xl bg-white border border-border-default p-6 sm:p-10 shadow-soft-lg text-center space-y-6 animate-in zoom-in-95 duration-300">
      {/* Animated Success Badge */}
      <div className="w-16 h-16 rounded-full bg-success-green-light text-success-green flex items-center justify-center mx-auto shadow-soft-sm">
        <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
      </div>

      {/* Headings */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-success-green bg-success-green-light px-2.5 py-0.5 rounded-full border border-success-green-border">
          <Sparkles className="w-3 h-3" />
          Submission Completed Successfully
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy tracking-tight">
          Your Property Has Been Submitted
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto">
          Your listing has been formatted and queued for marketplace review.
        </p>
      </div>

      {/* Submission Receipt Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-bg-light border border-border-subtle text-left text-xs space-y-2.5">
        <div className="flex items-center justify-between border-b border-border-default pb-2">
          <span className="text-text-muted">Generated Property ID</span>
          <strong className="text-primary-navy font-mono text-sm font-bold bg-white px-2 py-0.5 rounded border border-border-subtle">
            {draft.id || "PP-2026-8812"}
          </strong>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-text-muted block">Property Title</span>
            <strong className="text-text-primary capitalize truncate block">
              {propertyTitle}
            </strong>
          </div>
          <div>
            <span className="text-text-muted block">Transaction</span>
            <strong className="text-text-primary uppercase block">
              For {draft.transaction}
            </strong>
          </div>
          <div>
            <span className="text-text-muted block">Location</span>
            <strong className="text-text-primary truncate block">
              {draft.location.locality}, {draft.location.city}
            </strong>
          </div>
          <div>
            <span className="text-text-muted block">Expected Terms</span>
            <strong className="text-primary-navy font-bold block">
              {draft.transaction === "sale"
                ? `₹ ${parseInt(draft.pricing.expectedPrice || "0").toLocaleString("en-IN")}`
                : `₹ ${parseInt(draft.pricing.monthlyRent || "0").toLocaleString("en-IN")} / mo`}
            </strong>
          </div>
        </div>

        {/* Demo State Disclaimer */}
        <div className="pt-2 border-t border-border-subtle/80 flex items-start gap-2 text-[11px] text-text-secondary">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-gold shrink-0 mt-0.5" />
          <span>
            <strong>Frontend Simulation:</strong> This property listing is stored in your client session and ready for backend API connection.
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onPostAnother}
          leftIcon={<RotateCcw className="w-4 h-4" />}
          className="w-full sm:w-1/2 text-xs font-bold"
        >
          Post Another Property
        </Button>
        <Link href={draft.category === "commercial" ? "/commercial" : draft.transaction === "rent" ? "/rent" : "/buy"} className="w-full sm:w-1/2">
          <Button
            variant="primary"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full text-xs font-bold shadow-soft"
          >
            Explore Marketplace
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default PublishSuccess;

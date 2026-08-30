// ==============================================================================
// TheVrindaGroup - List Your Property Entry Flow Container
// Architecture:
// LIST YOUR PROPERTY -> Transaction Intent Selection -> [ Sell Property ] | [ Rent Property ]
// Edit Mode (/post-property?edit=<id>) automatically detects transaction type and bypasses selection.
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { TransactionIntentSelector } from "./TransactionIntentSelector";
import { SellPropertyForm } from "@/components/sell-property/SellPropertyForm";
import { RentPropertyForm } from "@/components/rent-property/RentPropertyForm";
import { PropertyApiService } from "@/lib/services/property-api";

export type PropertyListingIntent = "sell" | "rent" | null;

export function PostPropertyContainer() {
  const searchParams = useSearchParams();
  const editPropertyId = searchParams.get("edit");
  const isEditMode = Boolean(editPropertyId);

  // Initialize intent from query params if specified (e.g. /post-property?intent=sell)
  const initialIntentParam = searchParams.get("intent");
  const initialIntent: PropertyListingIntent =
    initialIntentParam === "sell" || initialIntentParam === "rent"
      ? initialIntentParam
      : null;

  const [selectedIntent, setSelectedIntent] = useState<PropertyListingIntent>(initialIntent);
  const [editListingType, setEditListingType] = useState<"sell" | "rent" | null>(null);
  const [isLoadingEdit, setIsLoadingEdit] = useState(isEditMode);

  // Detect Listing Type in Edit Mode
  useEffect(() => {
    if (isEditMode && editPropertyId) {
      PropertyApiService.getPropertyById(editPropertyId)
        .then((prop) => {
          if (prop?.listingType === "rent") {
            setEditListingType("rent");
          } else {
            setEditListingType("sell");
          }
        })
        .catch((err) => {
          console.error("Failed to detect edit property type:", err);
          setEditListingType("sell");
        })
        .finally(() => {
          setIsLoadingEdit(false);
        });
    }
  }, [isEditMode, editPropertyId]);

  // Loading state in Edit Mode
  if (isEditMode && isLoadingEdit) {
    return (
      <div className="py-20 text-center text-xs font-semibold text-text-muted">
        Loading property form...
      </div>
    );
  }

  // Edit Mode: Opens corresponding form based on detected listingType
  if (isEditMode) {
    if (editListingType === "rent") {
      return <RentPropertyForm />;
    }
    return <SellPropertyForm />;
  }

  // Transaction: SELL
  if (selectedIntent === "sell") {
    return (
      <SellPropertyForm
        onBackToIntentSelection={() => setSelectedIntent(null)}
      />
    );
  }

  // Transaction: RENT (Invariant: RENT MUST NEVER OPEN THE SELL FORM)
  if (selectedIntent === "rent") {
    return (
      <RentPropertyForm
        onBackToIntentSelection={() => setSelectedIntent(null)}
      />
    );
  }

  // Default: Transaction Intent Selection ("What do you want to do?")
  return (
    <TransactionIntentSelector
      onSelectIntent={(intent) => setSelectedIntent(intent)}
    />
  );
}

// ==============================================================================
// TheVrindaGroup - Single-Page Sell & Edit Property Form
// Supports CREATE mode (/post-property) and EDIT mode (/post-property?edit=<id>)
// ==============================================================================

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Home,
  Building2,
  Upload,
  X,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check,
  LandPlot,
  Phone,
  Lock,
  ExternalLink,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui";
import {
  SellCategory,
  SellSubtype,
  SellPropertyFormState,
  SubmittedPropertyResult,
  SellPropertyPhoto,
} from "@/types/sellProperty";
import { useAuth } from "@/lib/auth/auth-context";
import { PropertyApiService } from "@/lib/services/property-api";
import { ApiClientError } from "@/lib/api-client";
import {
  mapSellDraftToCreateDto,
  mapPropertyToSellFormState,
  formatIndianPricePreview,
} from "@/lib/services/sell-property-helper";
import { SellPropertySuccess } from "./SellPropertySuccess";

const DRAFT_STORAGE_KEY = "thevrindagroup_sell_draft_v1";

const POPULAR_CITIES = [
  "Bangalore",
  "Mumbai",
  "Delhi-NCR",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
];

const INITIAL_FORM_STATE: SellPropertyFormState = {
  category: "residential",
  subtype: "apartment",
  city: "Bangalore",
  locality: "",
  projectSociety: "",
  landmark: "",
  pincode: "",
  bhk: "2",
  area: "",
  areaUnit: "SQ_FT",
  expectedPrice: "",
  isPriceNegotiable: true,
  photos: [],
};

export function SellPropertyForm() {
  const { requireAuth, currentUser, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const editPropertyId = searchParams.get("edit");
  const isEditMode = Boolean(editPropertyId);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deterministic state initialization for 100% hydration safety
  const [form, setForm] = useState<SellPropertyFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<SubmittedPropertyResult | null>(null);

  // Edit Mode Specific State
  const [isLoadingProperty, setIsLoadingProperty] = useState(isEditMode);
  const [editLoadError, setEditLoadError] = useState<string | null>(null);
  const [deletedPhotoRemoteIds, setDeletedPhotoRemoteIds] = useState<string[]>([]);

  const photosRef = useRef<SellPropertyPhoto[]>([]);
  useEffect(() => {
    photosRef.current = form.photos;
  }, [form.photos]);

  // If in Edit Mode: Fetch the existing property from API
  useEffect(() => {
    if (!editPropertyId) return;

    let isMounted = true;

    PropertyApiService.getPropertyById(editPropertyId)
      .then((prop) => {
        if (!isMounted) return;
        if (!prop) {
          setEditLoadError("Property not found or you do not have permission to view it.");
          return;
        }
        const populated = mapPropertyToSellFormState(prop);
        setForm(populated);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setEditLoadError(
          err instanceof Error ? err.message : "Failed to load property details for editing."
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingProperty(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [editPropertyId]);

  // In Create Mode: Restore draft from localStorage asynchronously after client mount
  useEffect(() => {
    if (isEditMode) return; // Do not overwrite with local draft when in edit mode

    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          const timer = setTimeout(() => {
            setForm((prev) => ({
              ...prev,
              category:
                parsed.category === "residential" ||
                parsed.category === "commercial" ||
                parsed.category === "plot"
                  ? parsed.category
                  : prev.category,
              subtype: typeof parsed.subtype === "string" ? parsed.subtype : prev.subtype,
              city: typeof parsed.city === "string" && parsed.city.trim() ? parsed.city : prev.city,
              locality: typeof parsed.locality === "string" ? parsed.locality : prev.locality,
              projectSociety:
                typeof parsed.projectSociety === "string"
                  ? parsed.projectSociety
                  : prev.projectSociety,
              landmark: typeof parsed.landmark === "string" ? parsed.landmark : prev.landmark,
              pincode: typeof parsed.pincode === "string" ? parsed.pincode : prev.pincode,
              bhk: typeof parsed.bhk === "string" ? parsed.bhk : prev.bhk,
              area: typeof parsed.area === "string" ? parsed.area : prev.area,
              areaUnit:
                parsed.areaUnit === "SQ_FT" ||
                parsed.areaUnit === "SQ_YD" ||
                parsed.areaUnit === "ACRE"
                  ? parsed.areaUnit
                  : prev.areaUnit,
              expectedPrice:
                typeof parsed.expectedPrice === "string"
                  ? parsed.expectedPrice
                  : prev.expectedPrice,
              isPriceNegotiable:
                typeof parsed.isPriceNegotiable === "boolean"
                  ? parsed.isPriceNegotiable
                  : prev.isPriceNegotiable,
              photos: [], // Always empty initially for clean empty state
            }));
          }, 0);
          return () => clearTimeout(timer);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [isEditMode]);

  // Persist form changes into localStorage (Create mode only)
  useEffect(() => {
    if (isEditMode) return; // Do not save edit mode over create draft
    if (!submittedResult) {
      try {
        const toSave = { ...form, photos: [] };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(toSave));
      } catch {
        // Ignore storage quotas
      }
    }
  }, [form, submittedResult, isEditMode]);

  // Clean up Object URLs on unmount
  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => {
        if (photo.previewUrl && !photo.isExisting && photo.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(photo.previewUrl);
        }
      });
    };
  }, []);

  // Category and Subtype Handlers
  const handleCategoryChange = (category: SellCategory) => {
    let defaultSubtype: SellSubtype = "apartment";
    if (category === "commercial") defaultSubtype = "office";
    if (category === "plot") defaultSubtype = "plot";

    setForm((prev) => ({
      ...prev,
      category,
      subtype: defaultSubtype,
    }));
  };

  const handleSubtypeChange = (subtype: SellSubtype) => {
    setForm((prev) => ({ ...prev, subtype }));
  };

  const handleCitySelect = (city: string) => {
    setForm((prev) => ({ ...prev, city }));
    if (errors.city) {
      setErrors((prev) => ({ ...prev, city: "" }));
    }
  };

  const handleAreaChange = (val: string) => {
    // Reject negative sign
    const cleaned = val.replace(/-/g, "");
    setForm((prev) => ({ ...prev, area: cleaned }));
    if (errors.area) {
      setErrors((prev) => ({ ...prev, area: "" }));
    }
  };

  const handlePriceChange = (val: string) => {
    // Reject negative sign
    const cleaned = val.replace(/-/g, "");
    setForm((prev) => ({ ...prev, expectedPrice: cleaned }));
    if (errors.expectedPrice) {
      setErrors((prev) => ({ ...prev, expectedPrice: "" }));
    }
  };

  // Photo Upload Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: SellPropertyPhoto[] = [];
    const remainingSlots = 5 - form.photos.length;
    const countToAdd = Math.min(files.length, remainingSlots);

    for (let i = 0; i < countToAdd; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        newPhotos.push({
          id: `photo-${Date.now()}-${Math.random()}`,
          file,
          previewUrl: URL.createObjectURL(file),
          name: file.name,
          isExisting: false,
        });
      }
    }

    setForm((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (id: string) => {
    setForm((prev) => {
      const photoToRemove = prev.photos.find((p) => p.id === id);
      if (photoToRemove) {
        if (photoToRemove.previewUrl && !photoToRemove.isExisting && photoToRemove.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(photoToRemove.previewUrl);
        }
        if (photoToRemove.isExisting && photoToRemove.remoteId) {
          setDeletedPhotoRemoteIds((old) => [...old, photoToRemove.remoteId!]);
        }
      }
      return {
        ...prev,
        photos: prev.photos.filter((p) => p.id !== id),
      };
    });
  };

  // Strict Validation for Area, Price, and required fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.city.trim()) {
      newErrors.city = "Please select or enter a city.";
    }

    if (!form.locality.trim() || form.locality.trim().length < 2) {
      newErrors.locality = "Please provide the locality, area, or society name.";
    }

    if (form.category === "residential") {
      if (!form.bhk) {
        newErrors.bhk = "Please select BHK configuration.";
      }
    }

    // Bug 1 Fix: Strict positive Area check
    const areaStr = form.area.trim();
    const numericArea = Number(areaStr);
    if (!areaStr || isNaN(numericArea) || numericArea <= 0 || areaStr.includes("-")) {
      newErrors.area = "Area must be greater than 0.";
    }

    // Bug 2 Fix: Strict positive Expected Price check
    const priceStr = form.expectedPrice.trim();
    const numericPrice = Number(priceStr);
    if (!priceStr || isNaN(numericPrice) || numericPrice <= 0 || priceStr.includes("-")) {
      newErrors.expectedPrice = "Expected price must be greater than 0.";
    }

    if (form.pincode.trim() && !/^[1-9][0-9]{5}$/.test(form.pincode.trim())) {
      newErrors.pincode = "Please enter a valid 6-digit Indian pincode.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const el = document.getElementById(`field-${firstErrorField}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }

    return true;
  };

  // Submit Handler (Supports CREATE and EDIT modes)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    // Require authentication before submission
    const returnTarget = isEditMode && editPropertyId ? `/post-property?edit=${editPropertyId}` : "/post-property";
    const isAuth = requireAuth({
      title: isEditMode ? "Sign in to update property" : "Sign in to submit your property",
      message: isEditMode
        ? "Please sign in to save changes to your property listing."
        : "Please sign in or register to complete your free property listing submission.",
      returnTo: returnTarget,
    });

    if (!isAuth) {
      return;
    }

    // Require mobile number on authenticated user profile
    if (currentUser && !currentUser.phone) {
      setSubmitError(
        "Please add a mobile number to your profile before submitting a property for verification."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const propertyDto = mapSellDraftToCreateDto(form);

      if (isEditMode && editPropertyId) {
        // =========================================================================
        // EDIT MODE: Update existing property in-place (PATCH /api/properties/:id)
        // =========================================================================
        const updatedProperty = await PropertyApiService.updateProperty(editPropertyId, propertyDto);

        // Upload newly added photos
        const newPhotos = form.photos.filter((p) => Boolean(p.file));
        for (let i = 0; i < newPhotos.length; i++) {
          const photo = newPhotos[i];
          if (photo.file) {
            try {
              await PropertyApiService.uploadPropertyImage(editPropertyId, photo.file, {
                isPrimary: form.photos.indexOf(photo) === 0,
              });
            } catch (imgErr) {
              console.warn("[SellPropertyForm] Edit photo upload warning:", imgErr);
            }
          }
        }

        // Delete any removed photos
        for (const remId of deletedPhotoRemoteIds) {
          try {
            await PropertyApiService.deletePropertyImage(editPropertyId, remId);
          } catch (delErr) {
            console.warn("[SellPropertyForm] Edit photo delete warning:", delErr);
          }
        }

        setSubmittedResult({
          id: updatedProperty.id,
          referenceCode: updatedProperty.referenceCode || `TVG-${Math.floor(100000 + Math.random() * 900000)}`,
          title: updatedProperty.title,
          category: form.category,
          subtype: form.subtype,
          city: form.city,
          locality: form.locality,
          area: `${form.area} ${form.areaUnit}`,
          price: formatIndianPricePreview(form.expectedPrice),
          status: "DRAFT",
          submittedAt: new Date().toISOString(),
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // =========================================================================
      // CREATE MODE: Create new property (POST /api/properties)
      // =========================================================================
      const createdProperty = await PropertyApiService.createProperty(propertyDto);

      // Upload optional photos if attached
      if (form.photos && form.photos.length > 0) {
        for (let i = 0; i < form.photos.length; i++) {
          const photo = form.photos[i];
          if (photo.file) {
            try {
              await PropertyApiService.uploadPropertyImage(createdProperty.id, photo.file, {
                isPrimary: i === 0,
              });
            } catch (imgErr) {
              console.warn("[SellPropertyForm] Photo upload warning:", imgErr);
            }
          }
        }
      }

      // Clear local storage draft
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Ignore
      }

      setSubmittedResult({
        id: createdProperty.id,
        referenceCode: createdProperty.referenceCode || `TVG-${Math.floor(100000 + Math.random() * 900000)}`,
        title: createdProperty.title,
        category: form.category,
        subtype: form.subtype,
        city: form.city,
        locality: form.locality,
        area: `${form.area} ${form.areaUnit}`,
        price: formatIndianPricePreview(form.expectedPrice),
        status: "DRAFT",
        submittedAt: new Date().toISOString(),
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.statusCode === 401) {
          setSubmitError("Your session has expired. Please sign in again to submit your property.");
        } else if (err.statusCode === 403) {
          setSubmitError("You do not have permission to modify this property.");
        } else if (Array.isArray(err.details) && err.details.length > 0) {
          const first = err.details[0] as { message?: string };
          setSubmitError(first?.message || err.message);
        } else {
          setSubmitError(err.message || "Failed to submit property. Please try again.");
        }
      } else {
        setSubmitError(err instanceof Error ? err.message : "An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setForm(INITIAL_FORM_STATE);
    setSubmittedResult(null);
    setErrors({});
    setSubmitError(null);
    setDeletedPhotoRemoteIds([]);
  };

  // Loading state when fetching property in Edit Mode
  if (isLoadingProperty) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <div className="w-8 h-8 border-3 border-dark-navy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-text-primary">Loading property details for editing...</p>
      </div>
    );
  }

  // Error loading property in Edit Mode
  if (editLoadError) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
          <h2 className="text-base font-bold text-red-900 mb-1">Cannot Edit Property</h2>
          <p className="text-sm text-red-700 mb-5">{editLoadError}</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/account/properties">
              <Button variant="outline" size="sm">
                Back to My Properties
              </Button>
            </Link>
            <Link href="/post-property">
              <Button variant="primary" size="sm">
                Post New Property
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (submittedResult) {
    return <SellPropertySuccess property={submittedResult} onReset={handleResetForm} />;
  }

  const pricePreview = formatIndianPricePreview(form.expectedPrice);

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-gold/10 px-3 py-1 text-xs font-semibold text-accent-gold mb-3">
          {isEditMode ? <Edit3 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{isEditMode ? "Editing Existing Listing" : "Direct Seller Listing • Zero Brokerage"}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold font-heading text-dark-navy tracking-tight">
          {isEditMode ? "Edit Property" : "Sell Your Property"}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-text-secondary max-w-xl mx-auto">
          {isEditMode
            ? "Update your property listing details below and save your changes."
            : "Tell us a few details. It takes less than 2 minutes."}
        </p>
      </div>

      {submitError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">{isEditMode ? "Update failed:" : "Submission failed:"}</span> {submitError}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ========================================================================= */}
        {/* SECTION 1: PROPERTY TYPE */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-border-default bg-white p-5 sm:p-7 shadow-soft-xs">
          <h2 className="text-base sm:text-lg font-bold font-heading text-dark-navy mb-4 pb-3 border-b border-border-default">
            Property Type
          </h2>

          {/* Primary Category Selector */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            <button
              type="button"
              onClick={() => handleCategoryChange("residential")}
              className={`p-3.5 sm:p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                form.category === "residential"
                  ? "border-dark-navy bg-dark-navy text-accent-gold shadow-soft-sm scale-[1.02]"
                  : "border-border-default bg-white text-text-primary hover:border-dark-navy/40 hover:bg-bg-light"
              }`}
            >
              <Home className="w-6 h-6 shrink-0" />
              <span className="text-xs sm:text-sm font-bold">Residential</span>
            </button>

            <button
              type="button"
              onClick={() => handleCategoryChange("commercial")}
              className={`p-3.5 sm:p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                form.category === "commercial"
                  ? "border-dark-navy bg-dark-navy text-accent-gold shadow-soft-sm scale-[1.02]"
                  : "border-border-default bg-white text-text-primary hover:border-dark-navy/40 hover:bg-bg-light"
              }`}
            >
              <Building2 className="w-6 h-6 shrink-0" />
              <span className="text-xs sm:text-sm font-bold">Commercial</span>
            </button>

            <button
              type="button"
              onClick={() => handleCategoryChange("plot")}
              className={`p-3.5 sm:p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                form.category === "plot"
                  ? "border-dark-navy bg-dark-navy text-accent-gold shadow-soft-sm scale-[1.02]"
                  : "border-border-default bg-white text-text-primary hover:border-dark-navy/40 hover:bg-bg-light"
              }`}
            >
              <LandPlot className="w-6 h-6 shrink-0" />
              <span className="text-xs sm:text-sm font-bold">Plot / Land</span>
            </button>
          </div>

          {/* Dynamic Subtype Options */}
          <div className="mt-5 pt-4 border-t border-border-default/60">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2.5">
              Select {form.category === "plot" ? "Land" : form.category} Subtype
            </label>

            <div className="flex flex-wrap gap-2">
              {form.category === "residential" && (
                <>
                  <button
                    type="button"
                    onClick={() => handleSubtypeChange("apartment")}
                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      form.subtype === "apartment"
                        ? "bg-accent-gold text-dark-navy shadow-soft-xs"
                        : "bg-bg-light text-text-secondary hover:text-dark-navy hover:bg-border-default/60"
                    }`}
                  >
                    Apartment / Flat
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubtypeChange("villa")}
                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      form.subtype === "villa"
                        ? "bg-accent-gold text-dark-navy shadow-soft-xs"
                        : "bg-bg-light text-text-secondary hover:text-dark-navy hover:bg-border-default/60"
                    }`}
                  >
                    Villa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubtypeChange("independent-house")}
                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      form.subtype === "independent-house"
                        ? "bg-accent-gold text-dark-navy shadow-soft-xs"
                        : "bg-bg-light text-text-secondary hover:text-dark-navy hover:bg-border-default/60"
                    }`}
                  >
                    Independent House
                  </button>
                </>
              )}

              {form.category === "commercial" && (
                <>
                  <button
                    type="button"
                    onClick={() => handleSubtypeChange("office")}
                    className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      form.subtype === "office"
                        ? "bg-accent-gold text-dark-navy shadow-soft-xs"
                        : "bg-bg-light text-text-secondary hover:text-dark-navy hover:bg-border-default/60"
                    }`}
                  >
                    Office
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubtypeChange("shop")}
                    className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      form.subtype === "shop"
                        ? "bg-accent-gold text-dark-navy shadow-soft-xs"
                        : "bg-bg-light text-text-secondary hover:text-dark-navy hover:bg-border-default/60"
                    }`}
                  >
                    Shop
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubtypeChange("showroom")}
                    className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      form.subtype === "showroom"
                        ? "bg-accent-gold text-dark-navy shadow-soft-xs"
                        : "bg-bg-light text-text-secondary hover:text-dark-navy hover:bg-border-default/60"
                    }`}
                  >
                    Showroom
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubtypeChange("warehouse")}
                    className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                      form.subtype === "warehouse"
                        ? "bg-accent-gold text-dark-navy shadow-soft-xs"
                        : "bg-bg-light text-text-secondary hover:text-dark-navy hover:bg-border-default/60"
                    }`}
                  >
                    Warehouse
                  </button>
                </>
              )}

              {form.category === "plot" && (
                <button
                  type="button"
                  onClick={() => handleSubtypeChange("plot")}
                  className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-accent-gold text-dark-navy shadow-soft-xs"
                >
                  Plot / Land
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: LOCATION */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-border-default bg-white p-5 sm:p-7 shadow-soft-xs">
          <h2 className="text-base sm:text-lg font-bold font-heading text-dark-navy mb-4 pb-3 border-b border-border-default">
            Location
          </h2>

          <div className="space-y-4">
            {/* City Selection */}
            <div id="field-city">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                City <span className="text-red-500">*</span>
              </label>

              {/* Popular City Pills */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCitySelect(c)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      form.city.toLowerCase() === c.toLowerCase()
                        ? "bg-dark-navy text-accent-gold shadow-soft-xs"
                        : "bg-bg-light text-text-secondary hover:bg-border-default/60 hover:text-dark-navy"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={form.city}
                onChange={(e) => handleCitySelect(e.target.value)}
                placeholder="Enter city name (e.g. Bangalore)"
                className="w-full rounded-xl border border-border-default bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-dark-navy focus:outline-none focus:ring-1 focus:ring-dark-navy"
              />
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
            </div>

            {/* Locality / Area / Society */}
            <div id="field-locality">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Locality / Area / Society <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.locality}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, locality: e.target.value }));
                  if (errors.locality) setErrors((prev) => ({ ...prev, locality: "" }));
                }}
                placeholder="e.g. Whitefield, Indiranagar, Prestige Shantiniketan"
                className="w-full rounded-xl border border-border-default bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-dark-navy focus:outline-none focus:ring-1 focus:ring-dark-navy"
              />
              {errors.locality && (
                <p className="mt-1 text-xs text-red-500">{errors.locality}</p>
              )}
            </div>

            {/* Landmark & Pincode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div id="field-landmark">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Landmark <span className="text-text-muted font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={form.landmark}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, landmark: e.target.value }))
                  }
                  placeholder="e.g. Near Metro Station"
                  className="w-full rounded-xl border border-border-default bg-white px-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-dark-navy focus:outline-none focus:ring-1 focus:ring-dark-navy"
                />
              </div>

              <div id="field-pincode">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Pincode <span className="text-text-muted font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setForm((prev) => ({ ...prev, pincode: val }));
                    if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: "" }));
                  }}
                  placeholder="e.g. 560066"
                  className="w-full rounded-xl border border-border-default bg-white px-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-dark-navy focus:outline-none focus:ring-1 focus:ring-dark-navy"
                />
                {errors.pincode && (
                  <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: PROPERTY DETAILS */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-border-default bg-white p-5 sm:p-7 shadow-soft-xs">
          <h2 className="text-base sm:text-lg font-bold font-heading text-dark-navy mb-4 pb-3 border-b border-border-default">
            Property Details
          </h2>

          <div className="space-y-4">
            {/* DYNAMIC CASE 1: RESIDENTIAL (BHK + Area) */}
            {form.category === "residential" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div id="field-bhk">
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                    BHK Configuration <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {["1", "2", "3", "4", "5+"].map((bhk) => (
                      <button
                        key={bhk}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, bhk }));
                          if (errors.bhk) setErrors((prev) => ({ ...prev, bhk: "" }));
                        }}
                        className={`py-2 rounded-lg text-xs font-bold transition-all ${
                          form.bhk === bhk
                            ? "bg-dark-navy text-accent-gold shadow-soft-xs"
                            : "bg-bg-light text-text-secondary hover:bg-border-default/60 hover:text-dark-navy"
                        }`}
                      >
                        {bhk} BHK
                      </button>
                    ))}
                  </div>
                  {errors.bhk && <p className="mt-1 text-xs text-red-500">{errors.bhk}</p>}
                </div>

                <div id="field-area">
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                    Area <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={form.area}
                      onChange={(e) => handleAreaChange(e.target.value)}
                      placeholder="e.g. 1450"
                      className="w-full rounded-xl border border-border-default bg-white px-3.5 py-2.5 pr-16 text-sm text-text-primary placeholder:text-text-muted focus:border-dark-navy focus:outline-none focus:ring-1 focus:ring-dark-navy font-mono"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted pointer-events-none">
                      Sq.ft
                    </div>
                  </div>
                  {errors.area && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.area}</p>}
                </div>
              </div>
            )}

            {/* DYNAMIC CASE 2: COMMERCIAL (Area) */}
            {form.category === "commercial" && (
              <div id="field-area">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                  Area <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={form.area}
                    onChange={(e) => handleAreaChange(e.target.value)}
                    placeholder="e.g. 2500"
                    className="w-full rounded-xl border border-border-default bg-white px-3.5 py-2.5 pr-16 text-sm text-text-primary placeholder:text-text-muted focus:border-dark-navy focus:outline-none focus:ring-1 focus:ring-dark-navy font-mono"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted pointer-events-none">
                    Sq.ft
                  </div>
                </div>
                {errors.area && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.area}</p>}
              </div>
            )}

            {/* DYNAMIC CASE 3: PLOT / LAND (Plot Area + Unit) */}
            {form.category === "plot" && (
              <div id="field-area" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                    Plot Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={form.area}
                    onChange={(e) => handleAreaChange(e.target.value)}
                    placeholder="e.g. 2400"
                    className="w-full rounded-xl border border-border-default bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-dark-navy focus:outline-none focus:ring-1 focus:ring-dark-navy font-mono"
                  />
                  {errors.area && <p className="mt-1 text-xs text-red-500 font-semibold">{errors.area}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                    Unit
                  </label>
                  <div className="grid grid-cols-3 gap-1 h-[42px]">
                    {[
                      { id: "SQ_FT", label: "Sq.ft" },
                      { id: "SQ_YD", label: "Sq.yd" },
                      { id: "ACRE", label: "Acres" },
                    ].map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            areaUnit: u.id as "SQ_FT" | "SQ_YD" | "ACRE",
                          }))
                        }
                        className={`rounded-lg text-xs font-bold transition-all ${
                          form.areaUnit === u.id
                            ? "bg-dark-navy text-accent-gold shadow-soft-xs"
                            : "bg-bg-light text-text-secondary hover:bg-border-default/60"
                        }`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: EXPECTED PRICE */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-border-default bg-white p-5 sm:p-7 shadow-soft-xs">
          <h2 className="text-base sm:text-lg font-bold font-heading text-dark-navy mb-4 pb-3 border-b border-border-default">
            Expected Price
          </h2>

          <div id="field-expectedPrice" className="space-y-3">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Total Expected Amount <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-navy font-bold text-base pointer-events-none">
                ₹
              </div>
              <input
                type="number"
                min="1"
                step="any"
                value={form.expectedPrice}
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder="Enter expected amount (e.g. 8500000)"
                className="w-full rounded-xl border border-border-default bg-white pl-8 pr-4 py-3 text-base sm:text-lg font-bold font-mono text-dark-navy placeholder:text-text-muted focus:border-dark-navy focus:outline-none focus:ring-2 focus:ring-dark-navy/20"
              />
            </div>

            {/* Live Indian Currency Preview Badge */}
            {pricePreview && (
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs sm:text-sm font-bold text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Equivalent: {pricePreview}</span>
              </div>
            )}

            {errors.expectedPrice && (
              <p className="text-xs text-red-500 font-semibold">{errors.expectedPrice}</p>
            )}

            <div className="pt-2">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isPriceNegotiable}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, isPriceNegotiable: e.target.checked }))
                  }
                  className="rounded border-border-default text-dark-navy focus:ring-dark-navy w-4 h-4"
                />
                <span>Price is negotiable with verified buyers</span>
              </label>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 5: PHOTOS (Completely Clean & Zero Auto Images) */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-border-default bg-white p-5 sm:p-7 shadow-soft-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-default">
            <div>
              <h2 className="text-base sm:text-lg font-bold font-heading text-dark-navy">
                Photos
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Upload clear photos to get up to 5x more buyer enquiries.
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-bg-light text-text-secondary">
              Optional (Max 5)
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Upload Trigger Area */}
          {form.photos.length < 5 && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border-default hover:border-dark-navy/60 bg-bg-light/40 hover:bg-bg-light rounded-2xl p-6 text-center cursor-pointer transition-all mb-4"
            >
              <div className="w-12 h-12 rounded-full bg-white border border-border-default flex items-center justify-center mx-auto mb-2 text-dark-navy shadow-soft-xs">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-dark-navy mb-0.5">
                + Add Photos
              </p>
              <p className="text-xs text-text-secondary">
                JPG, PNG or WEBP (Max 10MB per image) • Up to {5 - form.photos.length} more photos
              </p>
            </div>
          )}

          {/* Photo Previews Grid (Visible ONLY when user selects photos) */}
          {form.photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {form.photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="relative group rounded-xl overflow-hidden aspect-square border border-border-default bg-bg-light"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.previewUrl}
                    alt={`Uploaded Property Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-dark-navy/80 text-white hover:bg-red-600 transition-colors shadow-soft cursor-pointer"
                    title="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 rounded bg-dark-navy/90 text-[10px] font-bold text-accent-gold px-1.5 py-0.5">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 6: SELLER CONTACT (Normalized Account Integration) */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-border-default bg-white p-5 sm:p-7 shadow-soft-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-default">
            <div>
              <h2 className="text-base sm:text-lg font-bold font-heading text-dark-navy">
                Seller Contact
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Our verification and support team will contact you using this phone number.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Verified Account</span>
            </span>
          </div>

          <div className="rounded-xl border border-border-default bg-bg-light/50 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-dark-navy text-accent-gold flex items-center justify-center shrink-0 shadow-soft-xs">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                    Registered Mobile Number
                  </div>
                  <div className="text-base font-bold font-mono text-dark-navy mt-0.5">
                    {currentUser?.phone ? (
                      currentUser.phone
                    ) : isAuthenticated ? (
                      <span className="text-amber-700 text-sm font-sans font-medium">
                        No phone number found in account
                      </span>
                    ) : (
                      <span className="text-text-muted text-sm font-sans font-normal">
                        Sign in to view registered number
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isAuthenticated && !currentUser?.phone && (
                <Link
                  href="/account/profile"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-navy bg-dark-navy text-accent-gold text-xs font-semibold hover:bg-dark-navy/90 transition-all shrink-0"
                >
                  <span>Add Mobile to Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <p className="text-[11px] text-text-muted mt-3 pt-3 border-t border-border-default/60">
              This number is linked to your authenticated profile. Buyers cannot see your phone number directly — all inquiries are routed through verified platform channels.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 7: SUBMIT */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-dark-navy/15 bg-gradient-to-br from-dark-navy to-dark-navy/95 p-6 sm:p-8 text-white shadow-soft">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-accent-gold font-bold text-xs uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>{isEditMode ? "Listing Management" : "100% Free Listing"}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-heading">
                {isEditMode ? "Ready to update your listing?" : "Ready to submit your property?"}
              </h3>
              <p className="text-xs text-white/70 mt-0.5">
                {isEditMode
                  ? "Updates will be saved directly to this listing and preserved."
                  : "Our verification team will review your submission and connect with you."}
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold justify-center shrink-0 shadow-soft-md cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-dark-navy border-t-transparent rounded-full animate-spin" />
                  <span>{isEditMode ? "Saving Changes..." : "Submitting..."}</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>{isEditMode ? "Update Property" : "Submit Property for Verification"}</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

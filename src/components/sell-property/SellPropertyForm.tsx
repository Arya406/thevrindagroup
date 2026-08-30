// ==============================================================================
// TheVrindaGroup - SELL Quick Listing Progressive Form (V1)
// Architecture: Fast creation with minimum data + Skip-for-now + Preview + Edit later
// ==============================================================================

"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Home,
  Building2,
  LandPlot,
  Upload,
  X,
  AlertCircle,
  Sparkles,
  Check,
  Edit3,
  Eye,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  IndianRupee,
  Search,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui";
import {
  QuickListingSubtype,
  QuickListingFormState,
  QuickListingPhoto,
  AreaUnitOption,
  FacingDirection,
  FurnishingType,
  QuickListingSubmissionResult,
} from "@/types/sellQuickListing";
import { useAuth } from "@/lib/auth/auth-context";
import { PropertyApiService } from "@/lib/services/property-api";
import {
  formatIndianPricePreview,
  generateDeterministicTitle,
  mapQuickListingToBackendDto,
  mapPropertyToQuickListingFormState,
} from "@/lib/services/sell-quick-listing-helper";
import {
  getAllStates,
  getDistrictsByState,
  isValidStateDistrict,
} from "@/data/location/canonicalLocations";
import { QuickListingPreviewModal } from "./QuickListingPreviewModal";
import { SellPropertySuccess } from "./SellPropertySuccess";

const DRAFT_STORAGE_KEY = "tvg_sell_quick_listing_draft_v1";

interface CanonicalLocationSelectProps {
  id: string;
  label: string;
  required?: boolean;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  disabledPlaceholder?: string;
  error?: string;
}

function CanonicalLocationSelect({
  id,
  label,
  required,
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = "Type to search...",
  disabled = false,
  disabledPlaceholder = "Disabled",
  error,
}: CanonicalLocationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, searchQuery]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchQuery("");
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        if (!disabled) {
          e.preventDefault();
          setIsOpen(true);
        }
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setSearchQuery("");
      setHighlightedIndex(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex]);
      }
    }
  };

  return (
    <div ref={containerRef} className="space-y-1.5 relative">
      <label htmlFor={id} className="block text-xs font-bold text-primary-navy">
        {label} {required && <span className="text-error-red">*</span>}
      </label>

      {/* Main trigger button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            setSearchQuery("");
            setHighlightedIndex(-1);
          }
        }}
        onKeyDown={handleKeyDown}
        className={`w-full h-11 px-3.5 rounded-xl border text-left flex items-center justify-between gap-2 text-xs font-medium transition-all ${
          disabled
            ? "bg-bg-light/60 border-border-subtle text-text-muted cursor-not-allowed"
            : isOpen
            ? "bg-white border-accent-gold ring-2 ring-accent-gold/20 shadow-soft-xs"
            : error
            ? "bg-white border-error-red text-text-primary"
            : "bg-white border-border-default hover:border-accent-gold/60 text-text-primary"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={value ? "text-text-primary font-semibold truncate" : "text-text-muted truncate"}>
          {disabled ? disabledPlaceholder : value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-text-muted shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-accent-gold" : ""}`} />
      </button>

      {/* Dropdown panel */}
      {isOpen && !disabled && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-40 rounded-xl bg-white border border-border-default shadow-soft-xl overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Filter search input */}
          <div className="px-2.5 pb-1.5 border-b border-border-subtle">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full h-8 pl-8 pr-7 text-xs bg-bg-light rounded-lg border border-border-default focus:border-accent-gold focus:outline-none text-text-primary placeholder:text-text-muted"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary-navy"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List of options */}
          <div className="max-h-52 overflow-y-auto pt-1">
            {filteredOptions.length === 0 ? (
              <div className="py-3 px-4 text-center text-xs text-text-muted">
                No matching location found
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = value === opt;
                const isHighlighted = highlightedIndex === idx;

                return (
                  <button
                    key={opt}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isHighlighted
                        ? "bg-bg-light text-primary-navy font-bold"
                        : isSelected
                        ? "bg-accent-gold/10 text-primary-navy font-bold"
                        : "text-text-primary hover:bg-bg-light"
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-accent-gold shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[11px] text-error-red mt-1">{error}</p>}
    </div>
  );
}

const RESIDENTIAL_SUBTYPES: { value: QuickListingSubtype; label: string; desc: string }[] = [
  { value: "apartment", label: "Flat / Apartment", desc: "Multi-storey flat or society apartment" },
  { value: "house", label: "House", desc: "Independent standalone house or kothi" },
  { value: "villa", label: "Villa", desc: "Gated community luxury villa" },
  { value: "builder-floor", label: "Builder Floor", desc: "Independent low-rise floor" },
  { value: "other", label: "Other Residential", desc: "Studio, penthouse or other living space" },
];

const PLOT_SUBTYPES: { value: QuickListingSubtype; label: string; desc: string }[] = [
  { value: "residential-plot", label: "Residential Plot", desc: "Land for home construction" },
  { value: "commercial-plot", label: "Commercial Plot", desc: "Commercial zone development land" },
  { value: "agricultural-land", label: "Agricultural Land", desc: "Farmland, farmhouse or agri plot" },
  { value: "other", label: "Other Plot / Land", desc: "Industrial or mixed-use land parcel" },
];

const COMMERCIAL_SUBTYPES: { value: QuickListingSubtype; label: string; desc: string }[] = [
  { value: "office", label: "Commercial Office", desc: "Corporate office or workspace" },
  { value: "shop", label: "Shop / Retail", desc: "Market shop, high street or mall unit" },
  { value: "showroom", label: "Showroom", desc: "Large retail or display showroom" },
  { value: "warehouse", label: "Warehouse / Godown", desc: "Logistics, storage or godown" },
  { value: "industrial", label: "Industrial Property", desc: "Factory, shed or industrial unit" },
  { value: "hotel", label: "Hotel / Guest House", desc: "Hospitality or lodging property" },
  { value: "restaurant", label: "Restaurant / Cafe", desc: "F&B dine-in space or kitchen" },
  { value: "building", label: "Commercial Building", desc: "Entire standalone commercial building" },
  { value: "other", label: "Other Commercial", desc: "Mixed-use commercial establishment" },
];

const FACING_OPTIONS: FacingDirection[] = [
  "East",
  "North",
  "North-East",
  "West",
  "South",
  "North-West",
  "South-East",
  "South-West",
];

const RESIDENTIAL_AMENITIES = [
  "Parking",
  "Power Backup",
  "Lift",
  "24x7 Security",
  "CCTV",
  "Gated Society",
  "Water Supply",
  "Park / Garden",
  "Gymnasium",
  "Swimming Pool",
  "Clubhouse",
];

const COMMERCIAL_AMENITIES = [
  "Parking",
  "Lift",
  "Power Backup",
  "24x7 Security",
  "CCTV",
  "Water Supply",
  "Fire Safety",
  "Reception Area",
  "Conference Room",
  "Pantry",
  "Air Conditioning",
  "Loading / Unloading Area",
  "Gated Premises",
];

const INITIAL_FORM_STATE: QuickListingFormState = {
  category: "residential",
  subtype: "apartment",
  houseRooms: "",
  bhk: "",
  askingPrice: "",
  location: {
    state: "",
    city: "",
    locality: "",
    address: "",
    pincode: "",
    landmark: "",
  },
  area: "",
  areaUnit: "SQ_FT",
  bathrooms: "",
  furnishingStatus: "",
  amenities: [],
  facing: "",
  title: "",
  isTitleManuallyEdited: false,
  description: "",
  photos: [],
  skippedSections: {},
};

export interface SellPropertyFormProps {
  onBackToIntentSelection?: () => void;
}

export function SellPropertyForm({ onBackToIntentSelection }: SellPropertyFormProps = {}) {
  const { requireAuth, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const editPropertyId = searchParams.get("edit");
  const isEditMode = Boolean(editPropertyId);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<QuickListingFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<QuickListingSubmissionResult | null>(null);

  // Edit Mode Specific State
  const [isLoadingProperty, setIsLoadingProperty] = useState(isEditMode);
  const [editLoadError, setEditLoadError] = useState<string | null>(null);

  // Derived Title for 100% reactive render without setState-in-effect
  const displayTitle = form.isTitleManuallyEdited && form.title
    ? form.title
    : generateDeterministicTitle(form);

  // Load existing property in Edit Mode
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
        const populated = mapPropertyToQuickListingFormState(prop);
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

  // Restore draft in Create Mode asynchronously
  useEffect(() => {
    if (isEditMode) return;
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setTimeout(() => {
            setForm((prev) => ({ ...prev, ...parsed, photos: [] }));
          }, 0);
        }
      }
    } catch {
      // Ignore localStorage parse errors
    }
  }, [isEditMode]);

  // Auto-save draft in Create Mode
  useEffect(() => {
    if (isEditMode || submittedResult) return;
    try {
      const draftData = { ...form, photos: [] };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
    } catch {
      // Ignore quota errors
    }
  }, [form, isEditMode, submittedResult]);

  // Helper to skip an optional section
  const handleSkipSection = (sectionKey: string) => {
    setForm((prev) => ({
      ...prev,
      skippedSections: { ...prev.skippedSections, [sectionKey]: true },
    }));
  };

  const allStates = useMemo(
    () => [...getAllStates()].sort((a, b) => a.localeCompare(b)),
    []
  );
  const availableDistricts = useMemo(() => {
    if (!form.location.state) return [];
    return [...getDistrictsByState(form.location.state)].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [form.location.state]);

  const handleStateChange = (newState: string) => {
    setForm((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        state: newState,
        city: "", // Invariant: immediately clear district on state change
      },
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.state;
      delete next.city;
      return next;
    });
  };

  const handleDistrictChange = (newDistrict: string) => {
    setForm((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        city: newDistrict,
      },
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.city;
      return next;
    });
  };

  // Validation before opening preview
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!form.askingPrice || Number(form.askingPrice.trim()) <= 0) {
      errs.askingPrice = "Please enter a valid asking price";
    }

    if (!form.location.state?.trim()) {
      errs.state = "Please select a State / Union Territory";
    }

    if (!form.location.city?.trim()) {
      errs.city = "Please select a District";
    } else if (
      form.location.state?.trim() &&
      !isValidStateDistrict(form.location.state, form.location.city)
    ) {
      errs.city = "Selected district does not belong to the selected state";
    }

    if (!form.location.locality.trim()) {
      errs.locality = "Please enter the locality, area, or sector";
    }

    if (!form.area || Number(form.area.trim()) <= 0) {
      errs.area = "Please enter the property area";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Open Preview Modal
  const handleOpenPreview = () => {
    if (!validateForm()) {
      window.scrollTo({ top: 200, behavior: "smooth" });
      return;
    }
    setIsPreviewOpen(true);
  };

  // Final Submit Handler
  const handleFinalSubmit = async () => {
    setSubmitError(null);

    // Require Auth
    if (!isAuthenticated) {
      requireAuth({
        title: "Sign in to list your property",
        message: "Sign in to submit and manage your property listing.",
        onAuthenticated: () => {
          setIsPreviewOpen(true);
        },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formToSubmit: QuickListingFormState = {
        ...form,
        title: displayTitle,
      };
      const dto = mapQuickListingToBackendDto(formToSubmit);

      if (isEditMode && editPropertyId) {
        // Update existing property
        const updated = await PropertyApiService.updateProperty(editPropertyId, dto);
        setSubmittedResult({
          id: updated.id,
          referenceCode: updated.referenceCode || `TVG-${updated.id.slice(0, 8).toUpperCase()}`,
          title: updated.title,
          category: form.category,
          subtype: form.subtype,
          city: updated.city || form.location.city,
          locality: form.location.locality,
          price: updated.price || formatIndianPricePreview(form.askingPrice),
          status: "DRAFT",
          submittedAt: new Date().toISOString(),
        });
      } else {
        // Create new property
        const created = await PropertyApiService.createProperty(dto);

        // Upload any attached photos
        if (form.photos.length > 0) {
          for (const photo of form.photos) {
            if (photo.file) {
              try {
                await PropertyApiService.uploadPropertyImage(created.id, photo.file);
              } catch {
                // Non-fatal image upload failure
              }
            }
          }
        }

        // Clear local draft
        try {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        } catch {
          // Ignore
        }

        setSubmittedResult({
          id: created.id,
          referenceCode: created.referenceCode || `TVG-${created.id.slice(0, 8).toUpperCase()}`,
          title: created.title,
          category: form.category,
          subtype: form.subtype,
          city: created.city || form.location.city,
          locality: form.location.locality,
          price: created.price || formatIndianPricePreview(form.askingPrice),
          status: "DRAFT",
          submittedAt: new Date().toISOString(),
        });
      }

      setIsPreviewOpen(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to submit property listing. Please verify your details and try again.";
      setSubmitError(msg);
      setIsPreviewOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Photo handlers
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newPhotos: QuickListingPhoto[] = Array.from(e.target.files).map((file) => ({
      id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
    }));
    setForm((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
    }));
    e.target.value = "";
  };

  const handleRemovePhoto = (id: string) => {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== id),
    }));
  };

  // Render Loading / Error States in Edit Mode
  if (isEditMode && isLoadingProperty) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-3 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-48 mx-auto" />
        <div className="h-4 bg-slate-100 rounded w-64 mx-auto" />
      </div>
    );
  }

  if (isEditMode && editLoadError) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="p-6 rounded-2xl bg-error-red-light/80 border border-error-red/30 text-error-red text-center space-y-4">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <h2 className="text-base font-bold">Failed to Load Property</h2>
          <p className="text-xs">{editLoadError}</p>
          <Link href="/account/properties">
            <Button variant="outline" size="sm" className="mt-2">
              Back to My Properties
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Render Success Result
  if (submittedResult) {
    return (
      <SellPropertySuccess
        property={{
          id: submittedResult.id,
          referenceCode: submittedResult.referenceCode,
          title: submittedResult.title,
          category: submittedResult.category,
          subtype: submittedResult.subtype,
          city: submittedResult.city,
          locality: submittedResult.locality,
          area: form.area || form.plotArea || "Area specified",
          price: submittedResult.price,
          status: "DRAFT",
          submittedAt: submittedResult.submittedAt,
        }}
        onReset={() => {
          setSubmittedResult(null);
          setForm(INITIAL_FORM_STATE);
        }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-200">
      {/* Top Navigation / Change Transaction */}
      {!isEditMode && onBackToIntentSelection && (
        <div className="flex items-center justify-start">
          <button
            type="button"
            onClick={onBackToIntentSelection}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary-navy transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Change Transaction (Sell / Rent)</span>
          </button>
        </div>
      )}

      {/* Top Banner / Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-gold/10 text-accent-gold-hover border border-accent-gold/20 text-xs font-extrabold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SELL PROPERTY • QUICK LISTING V1</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-navy tracking-tight">
          {isEditMode ? "Edit / Complete Your Listing" : "List Your Property for Sale"}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto">
          List quickly with essential details. Complete extra specifications anytime later from{" "}
          <strong className="text-primary-navy font-semibold">My Properties</strong>.
        </p>
      </div>

      {/* Global Submit Error */}
      {submitError && (
        <div className="p-4 rounded-2xl bg-error-red-light/80 border border-error-red/30 text-error-red text-xs flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* STEP 1: What are you selling? (Top-level SELL Category Selector) */}
      <div className="rounded-3xl border border-border-default bg-white p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-navy text-white text-xs font-bold">
              1
            </span>
            <h2 className="text-base font-bold text-primary-navy">
              What are you selling?
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-text-muted">
            Transaction: <strong className="text-primary-navy uppercase">SELL</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Residential */}
          <button
            type="button"
            onClick={() => {
              setForm((prev) => ({
                ...prev,
                category: "residential",
                subtype: "apartment",
              }));
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 relative ${
              form.category === "residential"
                ? "border-primary-navy bg-primary-navy/[0.03] shadow-soft-sm ring-2 ring-primary-navy/10"
                : "border-border-default bg-white hover:border-accent-gold/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`p-2.5 rounded-xl ${
                  form.category === "residential"
                    ? "bg-primary-navy text-white"
                    : "bg-bg-light text-primary-navy"
                }`}
              >
                <Home className="w-5 h-5" />
              </div>
              {form.category === "residential" && (
                <CheckCircle2 className="w-5 h-5 text-accent-gold" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary-navy">Residential</h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                Flat, House, Villa, Builder Floor
              </p>
            </div>
          </button>

          {/* Plot / Land */}
          <button
            type="button"
            onClick={() => {
              setForm((prev) => ({
                ...prev,
                category: "plot",
                subtype: "residential-plot",
              }));
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 relative ${
              form.category === "plot"
                ? "border-primary-navy bg-primary-navy/[0.03] shadow-soft-sm ring-2 ring-primary-navy/10"
                : "border-border-default bg-white hover:border-accent-gold/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`p-2.5 rounded-xl ${
                  form.category === "plot"
                    ? "bg-primary-navy text-white"
                    : "bg-bg-light text-primary-navy"
                }`}
              >
                <LandPlot className="w-5 h-5" />
              </div>
              {form.category === "plot" && (
                <CheckCircle2 className="w-5 h-5 text-accent-gold" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary-navy">Plot / Land</h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                Residential, Commercial & Agri Land
              </p>
            </div>
          </button>

          {/* Commercial */}
          <button
            type="button"
            onClick={() => {
              setForm((prev) => ({
                ...prev,
                category: "commercial",
                subtype: "office",
              }));
            }}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-2 relative ${
              form.category === "commercial"
                ? "border-primary-navy bg-primary-navy/[0.03] shadow-soft-sm ring-2 ring-primary-navy/10"
                : "border-border-default bg-white hover:border-accent-gold/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`p-2.5 rounded-xl ${
                  form.category === "commercial"
                    ? "bg-primary-navy text-white"
                    : "bg-bg-light text-primary-navy"
                }`}
              >
                <Building2 className="w-5 h-5" />
              </div>
              {form.category === "commercial" && (
                <CheckCircle2 className="w-5 h-5 text-accent-gold" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary-navy">Commercial</h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                Office, Shop, Showroom, Warehouse
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* STEP 2: Property Type & Specifics */}
      <div className="rounded-3xl border border-border-default bg-white p-6 shadow-soft space-y-6">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-navy text-white text-xs font-bold">
            2
          </span>
          <h2 className="text-base font-bold text-primary-navy">
            Select Specific Property Type
          </h2>
        </div>

        {/* Subtype Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {(form.category === "residential"
            ? RESIDENTIAL_SUBTYPES
            : form.category === "plot"
            ? PLOT_SUBTYPES
            : COMMERCIAL_SUBTYPES
          ).map((item) => {
            const isSelected = form.subtype === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, subtype: item.value }))}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-primary-navy bg-primary-navy text-white shadow-soft-xs font-bold"
                    : "border-border-default bg-white text-primary-navy hover:bg-bg-light font-medium"
                }`}
              >
                <span className="text-xs">{item.label}</span>
                <span
                  className={`text-[10px] mt-1 line-clamp-1 ${
                    isSelected ? "text-slate-200" : "text-text-muted"
                  }`}
                >
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* CONDITIONAL ROOM / BHK STRUCTURE */}
        {form.category === "residential" && (
          <div className="p-4 rounded-2xl bg-bg-light/70 border border-border-subtle space-y-3">
            {form.subtype === "house" ? (
              /* House Individual Room Count */
              <div>
                <label className="block text-xs font-bold text-primary-navy mb-1.5">
                  Room Count / Configuration
                </label>
                <div className="flex flex-wrap gap-2">
                  {["1 Room", "2 Rooms", "3 Rooms", "4 Rooms", "5+ Rooms"].map((r) => {
                    const isSelected = form.houseRooms === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            houseRooms: isSelected ? "" : r,
                          }))
                        }
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary-navy bg-primary-navy text-white"
                            : "border-border-default bg-white text-text-secondary hover:border-primary-navy"
                        }`}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : form.subtype === "apartment" ||
              form.subtype === "villa" ||
              form.subtype === "builder-floor" ? (
              /* Flat / Villa / Builder Floor BHK */
              <div>
                <label className="block text-xs font-bold text-primary-navy mb-1.5">
                  BHK Configuration
                </label>
                <div className="flex flex-wrap gap-2">
                  {["1", "2", "3", "4", "5+"].map((bhkVal) => {
                    const isSelected = form.bhk === bhkVal;
                    return (
                      <button
                        key={bhkVal}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            bhk: isSelected ? "" : bhkVal,
                          }))
                        }
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary-navy bg-primary-navy text-white"
                            : "border-border-default bg-white text-text-secondary hover:border-primary-navy"
                        }`}
                      >
                        {bhkVal} BHK
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* STEP 3: Location & Pricing */}
      <div className="rounded-3xl border border-border-default bg-white p-6 shadow-soft space-y-6">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-navy text-white text-xs font-bold">
            3
          </span>
          <h2 className="text-base font-bold text-primary-navy">
            Location & Asking Price
          </h2>
        </div>

        {/* Canonical Location: State and District Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. State / Union Territory Selector */}
          <CanonicalLocationSelect
            id="sell-property-state"
            label="State / Union Territory"
            required
            options={allStates}
            value={form.location.state}
            onChange={handleStateChange}
            placeholder="Select State / Union Territory"
            searchPlaceholder="Search state or UT..."
            error={errors.state}
          />

          {/* 2. District Selector (Dependent on State) */}
          <CanonicalLocationSelect
            id="sell-property-district"
            label="District"
            required
            options={availableDistricts}
            value={form.location.city}
            onChange={handleDistrictChange}
            placeholder={form.location.state ? "Select District" : "Select State First"}
            searchPlaceholder="Search district..."
            disabled={!form.location.state}
            disabledPlaceholder="Select State First"
            error={errors.city}
          />
        </div>

        {/* Locality, Landmark & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-primary-navy">
              Locality / Area / Sector <span className="text-error-red">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-gold" />
              <input
                type="text"
                placeholder="e.g. Talwandi, C-Scheme, Whitefield"
                value={form.location.locality}
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    location: { ...prev.location, locality: e.target.value },
                  }));
                  if (errors.locality) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.locality;
                      return next;
                    });
                  }
                }}
                className={`w-full h-11 pl-10 pr-4 rounded-xl border text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none ${
                  errors.locality ? "border-error-red" : "border-border-default"
                }`}
              />
            </div>
            {errors.locality && (
              <p className="text-[11px] text-error-red">{errors.locality}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-primary-navy">
              Landmark <span className="text-text-muted font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Near Metro, Opp. Mall"
              value={form.location.landmark || ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  location: { ...prev.location, landmark: e.target.value },
                }))
              }
              className="w-full h-11 px-4 rounded-xl border border-border-default text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-primary-navy">
              Address / Project Name <span className="text-text-muted font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Flat 302, Landmark Greens"
              value={form.location.address}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  location: { ...prev.location, address: e.target.value },
                }))
              }
              className="w-full h-11 px-4 rounded-xl border border-border-default text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none"
            />
          </div>
        </div>

        {/* ASKING PRICE (Pure numeric with live Indian text formatting) */}
        <div className="p-4 rounded-2xl bg-accent-gold/5 border border-accent-gold/30 space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-primary-navy">
              Asking Price (₹) <span className="text-error-red">*</span>
            </label>
            {form.askingPrice && (
              <span className="text-xs font-extrabold text-primary-navy bg-white px-2.5 py-0.5 rounded-lg border border-border-subtle shadow-soft-xs">
                {formatIndianPricePreview(form.askingPrice)}
              </span>
            )}
          </div>
          <div className="relative">
            <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-gold" />
            <input
              type="number"
              placeholder="e.g. 8500000 (85 Lakhs)"
              value={form.askingPrice}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  askingPrice: e.target.value.replace(/[^0-9]/g, ""),
                }))
              }
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border-default text-sm font-bold text-primary-navy bg-white focus:border-accent-gold focus:outline-none"
            />
          </div>
          {errors.askingPrice && (
            <p className="text-[11px] text-error-red">{errors.askingPrice}</p>
          )}
          <p className="text-[11px] text-text-muted">
            Enter total expected price. Zero brokerage fees on TheVrindaGroup.
          </p>
        </div>
      </div>

      {/* STEP 4: Optional Specifications with [Skip for now] */}
      <div className="rounded-3xl border border-border-default bg-white p-6 shadow-soft space-y-6">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-navy text-white text-xs font-bold">
              4
            </span>
            <h2 className="text-base font-bold text-primary-navy">
              Property Details
            </h2>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Optional
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleSkipSection("all_details")}
            className="text-xs font-bold text-text-muted hover:text-primary-navy underline cursor-pointer"
          >
            Skip all for now
          </button>
        </div>

        {/* 1. Area Input (with Indian Units) */}
        <div className="space-y-2 p-4 rounded-2xl bg-slate-50/70 border border-border-subtle">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-primary-navy">
              {form.category === "plot" ? "Plot / Land Area" : "Property Area"}
            </label>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, area: "" }))}
              className="text-[11px] font-semibold text-text-muted hover:text-primary-navy"
            >
              Skip
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2">
              <input
                type="number"
                placeholder={form.category === "plot" ? "e.g. 1500" : "e.g. 1200"}
                value={form.area}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    area: e.target.value.replace(/[^0-9]/g, ""),
                  }))
                }
                className="w-full h-10 px-3.5 rounded-xl border border-border-default text-xs font-medium text-text-primary bg-white focus:border-accent-gold focus:outline-none"
              />
            </div>
            <div>
              <select
                value={form.areaUnit}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    areaUnit: e.target.value as AreaUnitOption,
                  }))
                }
                className="w-full h-10 px-3 rounded-xl border border-border-default text-xs font-bold text-primary-navy bg-white focus:border-accent-gold focus:outline-none cursor-pointer"
              >
                <option value="SQ_FT">Sq. Ft.</option>
                <option value="SQ_YD">Sq. Yard / Gaj</option>
                <option value="SQ_M">Sq. Meter</option>
                <option value="ACRE">Acres</option>
                <option value="BIGHA">Bigha</option>
              </select>
            </div>
          </div>
          {errors.area && (
            <p className="text-[11px] text-error-red">{errors.area}</p>
          )}
        </div>

        {/* 2. Bathrooms (Residential & Commercial Office/Shop) */}
        {form.category !== "plot" && (
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50/70 border border-border-subtle">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-primary-navy">
                Bathrooms / Washrooms
              </label>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, bathrooms: "" }))}
                className="text-[11px] font-semibold text-text-muted hover:text-primary-navy"
              >
                Skip
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {["1", "2", "3", "4", "5+"].map((b) => {
                const isSelected = form.bathrooms === b;
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        bathrooms: isSelected ? "" : b,
                      }))
                    }
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary-navy bg-primary-navy text-white"
                        : "border-border-default bg-white text-text-secondary hover:border-primary-navy"
                    }`}
                  >
                    {b} {b === "1" ? "Bathroom" : "Bathrooms"}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Furnishing (Residential & Select Commercial) */}
        {form.category === "residential" ||
        (form.category === "commercial" &&
          form.subtype !== "warehouse" &&
          form.subtype !== "industrial") ? (
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50/70 border border-border-subtle">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-primary-navy">
                Furnishing Status
              </label>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, furnishingStatus: "" }))}
                className="text-[11px] font-semibold text-text-muted hover:text-primary-navy"
              >
                Skip
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "UNFURNISHED", label: "Unfurnished" },
                { value: "SEMI_FURNISHED", label: "Semi-Furnished" },
                { value: "FULLY_FURNISHED", label: "Fully Furnished" },
              ].map((f) => {
                const isSelected = form.furnishingStatus === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        furnishingStatus: isSelected ? "" : (f.value as FurnishingType),
                      }))
                    }
                    className={`py-2 px-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary-navy bg-primary-navy text-white"
                        : "border-border-default bg-white text-text-secondary hover:border-primary-navy"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* 4. Facing Direction */}
        <div className="space-y-2 p-4 rounded-2xl bg-slate-50/70 border border-border-subtle">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-primary-navy">
              Facing Direction
            </label>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, facing: "" }))}
              className="text-[11px] font-semibold text-text-muted hover:text-primary-navy"
            >
              Skip
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {FACING_OPTIONS.map((fc) => {
              const isSelected = form.facing === fc;
              return (
                <button
                  key={fc}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      facing: isSelected ? "" : fc,
                    }))
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary-navy bg-primary-navy text-white"
                      : "border-border-default bg-white text-text-secondary hover:border-primary-navy"
                  }`}
                >
                  {fc}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Amenities & Features */}
        <div className="space-y-2 p-4 rounded-2xl bg-slate-50/70 border border-border-subtle">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-primary-navy">
              Amenities & Highlights
            </label>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, amenities: [] }))}
              className="text-[11px] font-semibold text-text-muted hover:text-primary-navy"
            >
              Skip
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(form.category === "commercial" ? COMMERCIAL_AMENITIES : RESIDENTIAL_AMENITIES).map(
              (am) => {
                const isSelected = form.amenities.includes(am);
                return (
                  <button
                    key={am}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        amenities: isSelected
                          ? prev.amenities.filter((item) => item !== am)
                          : [...prev.amenities, am],
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold"
                        : "border-border-default bg-white text-text-secondary hover:border-primary-navy"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>{am}</span>
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* STEP 5: Title & Description */}
      <div className="rounded-3xl border border-border-default bg-white p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-navy text-white text-xs font-bold">
              5
            </span>
            <h2 className="text-base font-bold text-primary-navy">
              Listing Title & Description
            </h2>
          </div>
        </div>

        {/* Auto Title with Edit Button */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-primary-navy">
              Listing Title
            </label>
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  isTitleManuallyEdited: !prev.isTitleManuallyEdited,
                  title: prev.isTitleManuallyEdited ? "" : displayTitle,
                }))
              }
              className="text-xs font-bold text-accent-gold-hover hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>{form.isTitleManuallyEdited ? "Auto-Generate" : "Custom Edit"}</span>
            </button>
          </div>
          <input
            type="text"
            value={displayTitle}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                title: e.target.value,
                isTitleManuallyEdited: true,
              }))
            }
            className="w-full h-11 px-4 rounded-xl border border-border-default text-xs font-bold text-primary-navy bg-slate-50/50 focus:border-accent-gold focus:outline-none"
          />
          <p className="text-[11px] text-text-muted">
            Automatically built from your verified specifications. You can customize the title anytime.
          </p>
        </div>

        {/* Optional Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-primary-navy">
              Description <span className="text-text-muted font-normal">(Optional)</span>
            </label>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, description: "" }))}
              className="text-[11px] font-semibold text-text-muted hover:text-primary-navy"
            >
              Skip
            </button>
          </div>
          <textarea
            rows={3}
            placeholder="Add key highlights, neighborhood advantages, connectivity or special features..."
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            className="w-full p-3.5 rounded-xl border border-border-default text-xs font-medium text-text-primary bg-white focus:border-accent-gold focus:outline-none"
          />
        </div>
      </div>

      {/* STEP 6: Photos (Optional) */}
      <div className="rounded-3xl border border-border-default bg-white p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-navy text-white text-xs font-bold">
              6
            </span>
            <h2 className="text-base font-bold text-primary-navy">
              Property Photos
            </h2>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Optional
            </span>
          </div>
          <button
            type="button"
            onClick={() => setForm((prev) => ({ ...prev, photos: [] }))}
            className="text-xs font-bold text-text-muted hover:text-primary-navy underline cursor-pointer"
          >
            Skip for now
          </button>
        </div>

        {/* Photo Upload Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border-default hover:border-accent-gold/80 rounded-2xl p-6 text-center bg-bg-light/40 hover:bg-bg-light/80 transition-all cursor-pointer space-y-2"
        >
          <Upload className="w-8 h-8 text-accent-gold mx-auto" />
          <div>
            <span className="text-xs font-bold text-primary-navy">
              Click to upload property photos
            </span>
            <span className="text-[11px] text-text-muted block mt-0.5">
              JPG, PNG or WEBP (Max 5MB each)
            </span>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoSelect}
          className="hidden"
        />

        {/* Photo Thumbnails */}
        {form.photos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 pt-2">
            {form.photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-border-subtle group shadow-soft-xs"
              >
                <Image
                  src={photo.previewUrl}
                  alt={photo.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto(photo.id);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-dark-navy/80 text-white hover:bg-error-red transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STEP 7: Submit & Preview Bar */}
      <div className="rounded-3xl border border-primary-navy/20 bg-primary-navy text-white p-6 shadow-soft-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Ready to Preview & List?</h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Preview your exact listing before final submission. Free with zero brokerage.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="md"
            onClick={handleOpenPreview}
            leftIcon={<Eye className="w-4 h-4" />}
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-bold"
          >
            Preview Listing
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleOpenPreview}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto text-xs font-extrabold shadow-soft-sm"
          >
            Continue
          </Button>
        </div>
      </div>

      {/* Mandatory Preview Modal */}
      <QuickListingPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        form={form}
        onConfirmSubmit={handleFinalSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

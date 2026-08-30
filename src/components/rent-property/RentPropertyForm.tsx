// ==============================================================================
// TheVrindaGroup - RENT Quick Listing V1 Form Component
// Architecture: Fast Listing + Minimum Info + Optional Enrichment + Skip + Preview + Submit
// Zero-Default Rule: All optional fields default to empty string / empty array
// ==============================================================================

"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Building2,
  Home,
  Briefcase,
  Store,
  Layers,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Sparkles,
  ArrowLeft,
  Search,
  ChevronDown,
  Check,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button, Card } from "@/components/ui";
import { useAuth } from "@/lib/auth/auth-context";
import { PropertyApiService } from "@/lib/services/property-api";
import {
  RentQuickListingFormState,
  RentResidentialSubtype,
  RentCommercialSubtype,
  RentHouseType,
  RentRoomBathroom,
  RentVillaParking,
  RentFurnishingStatus,
  RentAreaUnitOption,
  RentPhotoItem,
} from "@/types/rentQuickListing";
import {
  generateDeterministicRentTitle,
  formatRentPricePreview,
  mapRentListingToBackendDto,
  mapPropertyToRentQuickListingFormState,
} from "@/lib/services/rent-quick-listing-helper";
import {
  getAllStates,
  getDistrictsByState,
  isValidStateDistrict,
} from "@/data/location/canonicalLocations";
import { RentQuickListingPreviewModal } from "./RentQuickListingPreviewModal";

interface RentPropertyFormProps {
  onBackToIntentSelection?: () => void;
}

interface SubtypeOption<T> {
  id: T;
  label: string;
  desc: string;
  icon: LucideIcon;
}

const RESIDENTIAL_SUBTYPES: SubtypeOption<RentResidentialSubtype>[] = [
  { id: "house", label: "House", desc: "Full house, floor/portion, or single room", icon: Home },
  { id: "apartment", label: "Flat / Apartment", desc: "Society flat, independent apartment", icon: Building2 },
  { id: "villa", label: "Villa / Bungalow", desc: "Independent luxury villa or gated home", icon: Sparkles },
  { id: "other", label: "Other Residential", desc: "Studio, duplex, farm house, PG", icon: Layers },
];

const COMMERCIAL_SUBTYPES: SubtypeOption<RentCommercialSubtype>[] = [
  { id: "office", label: "Commercial Office", desc: "IT park, corporate office, commercial space", icon: Briefcase },
  { id: "shop", label: "Shop / Retail", desc: "Retail store, market stall, commercial booth", icon: Store },
  { id: "showroom", label: "Showroom", desc: "Main road showroom, high-visibility outlet", icon: Building2 },
  { id: "other", label: "Other Commercial", desc: "General commercial unit, open space", icon: Layers },
];

const HOUSE_TYPE_OPTIONS: { id: RentHouseType; label: string; desc: string }[] = [
  { id: "full-house", label: "Full House", desc: "Renting the entire independent building" },
  { id: "part-of-house", label: "Part of House", desc: "Renting a specific floor or portion" },
  { id: "room", label: "Single Room", desc: "Renting an individual private room" },
];

const HOUSE_FLOOR_OPTIONS = [
  "Ground Floor",
  "1st Floor",
  "2nd Floor",
  "3rd Floor",
  "4th Floor+",
];

const RESIDENTIAL_OTHER_OPTIONS = [
  "Studio",
  "Duplex",
  "Farm House",
  "Independent Floor",
  "Paying Guest",
  "Other",
];

const CENTRALIZED_AMENITIES = [
  "Parking",
  "Lift",
  "Power Backup",
  "24/7 Security",
  "CCTV",
  "Water Supply",
  "Air Conditioning",
  "Garden",
  "Gym",
  "Swimming Pool",
  "Gated Community",
  "Intercom",
  "Fire Safety",
];

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
    <div ref={containerRef} className="space-y-1 relative">
      <label htmlFor={id} className="text-xs font-bold text-primary-navy block">
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

const INITIAL_FORM_STATE: RentQuickListingFormState = {
  category: "residential",
  residentialSubtype: "apartment",
  commercialSubtype: "office",
  houseType: "full-house",
  houseFloor: "",
  houseRooms: "",
  roomBathroom: "",
  bhk: "",
  villaParking: "",
  residentialOtherType: "Studio",
  customPropertyType: "",
  builtUpArea: "",
  areaUnit: "SQ_FT",
  bathrooms: "",
  furnishingStatus: "",
  amenities: [],
  monthlyRent: "",
  location: {
    state: "",
    city: "",
    locality: "",
    address: "",
    pincode: "",
    landmark: "",
  },
  photos: [],
  title: "",
  isTitleManuallyEdited: false,
  description: "",
  skippedSections: {},
};

export function RentPropertyForm({ onBackToIntentSelection }: RentPropertyFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editPropertyId = searchParams.get("edit");
  const isEditMode = Boolean(editPropertyId);

  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<RentQuickListingFormState>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(isEditMode);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Hydrate Existing Property in Edit Mode
  useEffect(() => {
    if (!editPropertyId) return;

    let isMounted = true;
    PropertyApiService.getPropertyById(editPropertyId)
      .then((prop) => {
        if (!isMounted) return;
        if (prop) {
          setForm(mapPropertyToRentQuickListingFormState(prop));
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to load rental property for editing:", err);
        setSubmitError("Could not load property details for editing.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingExisting(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [editPropertyId]);

  // Keep title synchronized deterministically if not manually edited
  const autoGeneratedTitle = useMemo(() => {
    return generateDeterministicRentTitle(form);
  }, [form]);

  const effectiveTitle = form.isTitleManuallyEdited ? form.title : autoGeneratedTitle;

  // Photo Handling
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newPhotos: RentPhotoItem[] = files.map((file) => ({
      id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
    }));

    setForm((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos],
    }));

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePhoto = (photoId: string) => {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== photoId),
    }));
  };

  // Toggle Amenity Selection
  const toggleAmenity = (name: string) => {
    setForm((prev) => {
      const exists = prev.amenities.includes(name);
      const updated = exists
        ? prev.amenities.filter((a) => a !== name)
        : [...prev.amenities, name];
      return { ...prev, amenities: updated };
    });
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

    // 1. Monthly Rent is REQUIRED
    const rentNum = Number(form.monthlyRent.replace(/[^0-9]/g, "").trim());
    if (!rentNum || rentNum <= 0) {
      errs.monthlyRent = "Please enter a valid monthly rent amount";
    }

    // 2. State & District (Canonical Validation)
    if (!form.location.state.trim()) {
      errs.state = "Please select the property state";
    }
    if (!form.location.city.trim()) {
      errs.city = "Please select the property district";
    } else if (
      form.location.state.trim() &&
      !isValidStateDistrict(form.location.state, form.location.city)
    ) {
      errs.city = "Selected district does not belong to the selected state";
    }

    // 3. Part of House requires Floor
    if (
      form.category === "residential" &&
      form.residentialSubtype === "house" &&
      form.houseType === "part-of-house" &&
      !form.houseFloor.trim()
    ) {
      errs.houseFloor = "Please select which floor is being rented";
    }

    // 4. Residential Other requires Custom Type if Other selected
    if (
      form.category === "residential" &&
      form.residentialSubtype === "other" &&
      form.residentialOtherType === "Other" &&
      !form.customPropertyType.trim()
    ) {
      errs.customPropertyType = "Please enter the property type name";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOpenPreview = () => {
    if (!validateForm()) {
      window.scrollTo({ top: 200, behavior: "smooth" });
      return;
    }
    setIsPreviewOpen(true);
  };

  // Final Submission
  const handleFinalSubmit = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const submissionForm = {
        ...form,
        title: effectiveTitle,
      };
      const dto = mapRentListingToBackendDto(submissionForm);

      let savedPropertyId = editPropertyId;

      if (isEditMode && editPropertyId) {
        // Update existing property
        await PropertyApiService.updateProperty(editPropertyId, dto);
      } else {
        // Create new rental listing
        const created = await PropertyApiService.createProperty(dto);
        savedPropertyId = created.id;
      }

      // Upload new photos if any
      const newPhotos = form.photos.filter((p) => p.file !== null);
      if (savedPropertyId && newPhotos.length > 0) {
        for (let i = 0; i < newPhotos.length; i++) {
          if (newPhotos[i].file) {
            try {
              await PropertyApiService.uploadPropertyImage(
                savedPropertyId,
                newPhotos[i].file as File,
                { isPrimary: i === 0 }
              );
            } catch (imgErr) {
              console.warn("Failed to upload photo:", imgErr);
            }
          }
        }
      }

      // Redirect to My Properties
      setIsPreviewOpen(false);
      router.push("/account/properties");
    } catch (err: unknown) {
      console.error("RENT listing submission failed:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while saving your rental listing.";
      setSubmitError(msg);
      setIsPreviewOpen(false);
      window.scrollTo({ top: 100, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingExisting) {
    return (
      <div className="py-20 text-center text-xs font-semibold text-text-muted">
        Loading rental property details...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Breadcrumb & Step Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBackToIntentSelection && !isEditMode && (
            <button
              type="button"
              onClick={onBackToIntentSelection}
              className="inline-flex items-center gap-1 text-xs font-semibold text-text-muted hover:text-primary-navy transition-colors mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Options</span>
            </button>
          )}
          <span className="text-xs font-bold text-accent-gold uppercase tracking-wider bg-accent-gold/10 px-2.5 py-1 rounded-md">
            {isEditMode ? "Edit Rental Property" : "Rent Listing Flow"}
          </span>
        </div>
      </div>

      {submitError && (
        <div className="mb-6 p-4 rounded-2xl bg-error-red/10 border border-error-red/20 text-error-red text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* ==================================================================== */}
        {/* STEP 1: CATEGORY SELECTION (Residential vs Commercial)               */}
        {/* ==================================================================== */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent-gold">
                Step 1
              </span>
              <h2 className="text-base font-bold text-primary-navy mt-0.5">
                What type of property are you renting?
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  category: "residential",
                }))
              }
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                form.category === "residential"
                  ? "border-accent-gold bg-accent-gold/5 shadow-soft-sm ring-1 ring-accent-gold"
                  : "border-border-default hover:border-border-hover bg-white"
              }`}
            >
              <Home className={`w-5 h-5 mb-2 ${form.category === "residential" ? "text-accent-gold" : "text-text-muted"}`} />
              <div>
                <p className="text-xs font-bold text-primary-navy">Residential</p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  House, Flat / Apartment, Villa, or Rooms
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  category: "commercial",
                }))
              }
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                form.category === "commercial"
                  ? "border-accent-gold bg-accent-gold/5 shadow-soft-sm ring-1 ring-accent-gold"
                  : "border-border-default hover:border-border-hover bg-white"
              }`}
            >
              <Briefcase className={`w-5 h-5 mb-2 ${form.category === "commercial" ? "text-accent-gold" : "text-text-muted"}`} />
              <div>
                <p className="text-xs font-bold text-primary-navy">Commercial</p>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Office, Shop / Retail, Showroom
                </p>
              </div>
            </button>
          </div>
        </Card>

        {/* ==================================================================== */}
        {/* STEP 2: SUBTYPE SELECTION                                            */}
        {/* ==================================================================== */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent-gold">
              Step 2
            </span>
            <h2 className="text-base font-bold text-primary-navy mt-0.5">
              {form.category === "residential"
                ? "Select Residential Category"
                : "Select Commercial Category"}
            </h2>
          </div>

          {form.category === "residential" ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {RESIDENTIAL_SUBTYPES.map((sub) => {
                const Icon = sub.icon;
                const isSelected = form.residentialSubtype === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        residentialSubtype: sub.id,
                      }))
                    }
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-accent-gold bg-accent-gold/5 shadow-soft-sm ring-1 ring-accent-gold"
                        : "border-border-default hover:border-border-hover bg-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-2 ${isSelected ? "text-accent-gold" : "text-text-muted"}`} />
                    <div>
                      <p className="text-xs font-bold text-primary-navy">{sub.label}</p>
                      <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2">{sub.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {COMMERCIAL_SUBTYPES.map((sub) => {
                const Icon = sub.icon;
                const isSelected = form.commercialSubtype === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        commercialSubtype: sub.id,
                      }))
                    }
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-accent-gold bg-accent-gold/5 shadow-soft-sm ring-1 ring-accent-gold"
                        : "border-border-default hover:border-border-hover bg-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-2 ${isSelected ? "text-accent-gold" : "text-text-muted"}`} />
                    <div>
                      <p className="text-xs font-bold text-primary-navy">{sub.label}</p>
                      <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2">{sub.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* ==================================================================== */}
        {/* STEP 3: CONDITIONAL SUB-STRUCTURE SPECIFICATIONS                     */}
        {/* ==================================================================== */}

        {/* 3.A: Residential House Sub-options */}
        {form.category === "residential" && form.residentialSubtype === "house" && (
          <Card className="p-5 sm:p-6 space-y-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent-gold">
                Step 3
              </span>
              <h2 className="text-base font-bold text-primary-navy mt-0.5">
                What portion of the house is for rent?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {HOUSE_TYPE_OPTIONS.map((ht) => {
                const isSelected = form.houseType === ht.id;
                return (
                  <button
                    key={ht.id}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        houseType: ht.id,
                        houseFloor: ht.id === "part-of-house" ? prev.houseFloor : "",
                      }))
                    }
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "border-accent-gold bg-accent-gold/5 shadow-soft-sm ring-1 ring-accent-gold"
                        : "border-border-default hover:border-border-hover bg-white"
                    }`}
                  >
                    <p className="text-xs font-bold text-primary-navy">{ht.label}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{ht.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* If Part of House: Floor is REQUIRED */}
            {form.houseType === "part-of-house" && (
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-primary-navy">
                    Which Floor are you renting? *
                  </label>
                  <span className="text-[10px] font-bold text-amber-700 uppercase">Required</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {HOUSE_FLOOR_OPTIONS.map((floor) => {
                    const isSelected = form.houseFloor === floor;
                    return (
                      <button
                        key={floor}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            houseFloor: floor,
                          }))
                        }
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-primary-navy text-white shadow-xs"
                            : "bg-white border border-border-default text-text-primary hover:border-accent-gold"
                        }`}
                      >
                        {floor}
                      </button>
                    );
                  })}
                </div>
                {errors.houseFloor && (
                  <p className="text-[11px] text-error-red mt-1">{errors.houseFloor}</p>
                )}
              </div>
            )}

            {/* If Room: Private vs Shared Bathroom */}
            {form.houseType === "room" && (
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50/70 border border-border-subtle">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-primary-navy">
                    Bathroom Facility (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, roomBathroom: "" }))}
                    className="text-[11px] font-semibold text-text-muted hover:text-primary-navy"
                  >
                    Skip
                  </button>
                </div>
                <div className="flex gap-2.5">
                  {[
                    { id: "private", label: "Private / Attached Bathroom" },
                    { id: "shared", label: "Shared Bathroom" },
                  ].map((rb) => {
                    const isSelected = form.roomBathroom === rb.id;
                    return (
                      <button
                        key={rb.id}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            roomBathroom: isSelected ? "" : (rb.id as RentRoomBathroom),
                          }))
                        }
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-primary-navy text-white shadow-xs"
                            : "bg-white border border-border-default text-text-primary hover:border-accent-gold"
                        }`}
                      >
                        {rb.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* 3.B: Residential Other Subtype Options */}
        {form.category === "residential" && form.residentialSubtype === "other" && (
          <Card className="p-5 sm:p-6 space-y-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent-gold">
                Step 3
              </span>
              <h2 className="text-base font-bold text-primary-navy mt-0.5">
                Specify Residential Property Type
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {RESIDENTIAL_OTHER_OPTIONS.map((opt) => {
                const isSelected = form.residentialOtherType === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        residentialOtherType: opt,
                        customPropertyType: opt !== "Other" ? "" : prev.customPropertyType,
                      }))
                    }
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-left ${
                      isSelected
                        ? "bg-primary-navy text-white shadow-xs"
                        : "bg-white border border-border-default text-text-primary hover:border-accent-gold"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {form.residentialOtherType === "Other" && (
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="Enter Property Type (e.g. Treehouse, Tent)"
                  value={form.customPropertyType}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      customPropertyType: e.target.value,
                    }))
                  }
                  className="w-full h-10 px-3.5 rounded-xl border border-border-default text-xs font-medium text-text-primary bg-white focus:border-accent-gold focus:outline-none"
                />
                {errors.customPropertyType && (
                  <p className="text-[11px] text-error-red mt-1">{errors.customPropertyType}</p>
                )}
              </div>
            )}
          </Card>
        )}

        {/* 3.C: Commercial Built-up Area (Office, Shop, Showroom) */}
        {form.category === "commercial" &&
          (form.commercialSubtype === "office" ||
            form.commercialSubtype === "shop" ||
            form.commercialSubtype === "showroom") && (
            <Card className="p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent-gold">
                    Step 3
                  </span>
                  <h2 className="text-base font-bold text-primary-navy mt-0.5">
                    Built-up Area (Optional)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, builtUpArea: "" }))}
                  className="text-[11px] font-semibold text-text-muted hover:text-primary-navy"
                >
                  Skip
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    placeholder="e.g. 1500"
                    value={form.builtUpArea}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        builtUpArea: e.target.value.replace(/[^0-9]/g, ""),
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
                        areaUnit: e.target.value as RentAreaUnitOption,
                      }))
                    }
                    className="w-full h-10 px-3 rounded-xl border border-border-default text-xs font-bold text-primary-navy bg-white focus:border-accent-gold focus:outline-none cursor-pointer"
                  >
                    <option value="SQ_FT">Sq. Ft.</option>
                    <option value="SQ_YD">Sq. Yard / Gaj</option>
                    <option value="SQ_M">Sq. Meter</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

        {/* ==================================================================== */}
        {/* STEP 4: OPTIONAL RESIDENTIAL ENRICHMENT                              */}
        {/* (Flat/Apartment, Full/Part House, Villa)                             */}
        {/* ==================================================================== */}
        {form.category === "residential" &&
          (form.residentialSubtype === "apartment" ||
            form.residentialSubtype === "villa" ||
            (form.residentialSubtype === "house" && form.houseType !== "room")) && (
            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent-gold">
                    Optional Details
                  </span>
                  <h2 className="text-base font-bold text-primary-navy mt-0.5">
                    Property Configuration & Amenities
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      bhk: "",
                      houseRooms: "",
                      bathrooms: "",
                      furnishingStatus: "",
                      villaParking: "",
                      amenities: [],
                    }))
                  }
                  className="text-xs font-semibold text-text-muted hover:text-primary-navy transition-colors"
                >
                  Skip all for now
                </button>
              </div>

              {/* 1. BHK / Room Count */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50/70 border border-border-subtle">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-primary-navy">
                    {form.residentialSubtype === "house"
                      ? "Number of Rooms"
                      : "BHK Configuration"}
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        bhk: "",
                        houseRooms: "",
                      }))
                    }
                    className="text-[11px] font-semibold text-text-muted hover:text-primary-navy"
                  >
                    Skip
                  </button>
                </div>

                {form.residentialSubtype === "house" ? (
                  <div className="flex flex-wrap gap-2">
                    {["1", "2", "3", "4", "5+"].map((r) => {
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
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? "bg-primary-navy text-white shadow-xs"
                              : "bg-white border border-border-default text-text-primary hover:border-accent-gold"
                          }`}
                        >
                          {r} {r === "1" ? "Room" : "Rooms"}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {["1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"].map((b) => {
                      const isSelected = form.bhk === b;
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              bhk: isSelected ? "" : b,
                            }))
                          }
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? "bg-primary-navy text-white shadow-xs"
                              : "bg-white border border-border-default text-text-primary hover:border-accent-gold"
                          }`}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. Number of Bathrooms */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50/70 border border-border-subtle">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-primary-navy">
                    Bathrooms
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
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-primary-navy text-white shadow-xs"
                            : "bg-white border border-border-default text-text-primary hover:border-accent-gold"
                        }`}
                      >
                        {b} {b === "1" ? "Bath" : "Baths"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Villa Parking Option */}
              {form.residentialSubtype === "villa" && (
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50/70 border border-border-subtle">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-primary-navy">
                      Parking Facility
                    </label>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, villaParking: "" }))}
                      className="text-[11px] font-semibold text-text-muted hover:text-primary-navy"
                    >
                      Skip
                    </button>
                  </div>
                  <div className="flex gap-2.5">
                    {[
                      { id: "available", label: "Parking Available" },
                      { id: "not-available", label: "Not Available" },
                    ].map((pOpt) => {
                      const isSelected = form.villaParking === pOpt.id;
                      return (
                        <button
                          key={pOpt.id}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              villaParking: isSelected ? "" : (pOpt.id as RentVillaParking),
                            }))
                          }
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? "bg-primary-navy text-white shadow-xs"
                              : "bg-white border border-border-default text-text-primary hover:border-accent-gold"
                          }`}
                        >
                          {pOpt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Furnishing */}
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
                    { id: "UNFURNISHED", label: "Unfurnished" },
                    { id: "SEMI_FURNISHED", label: "Semi-Furnished" },
                    { id: "FULLY_FURNISHED", label: "Fully Furnished" },
                  ].map((f) => {
                    const isSelected = form.furnishingStatus === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            furnishingStatus: isSelected ? "" : (f.id as RentFurnishingStatus),
                          }))
                        }
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                          isSelected
                            ? "bg-primary-navy text-white shadow-xs"
                            : "bg-white border border-border-default text-text-primary hover:border-accent-gold"
                        }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Centralized Amenities */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50/70 border border-border-subtle">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-primary-navy">
                    Amenities & Features
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
                  {CENTRALIZED_AMENITIES.map((name) => {
                    const isSelected = form.amenities.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleAmenity(name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-accent-gold/15 border border-accent-gold text-primary-navy font-bold"
                            : "bg-white border border-border-default text-text-secondary hover:border-accent-gold"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-accent-gold" />}
                        <span>{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

        {/* ==================================================================== */}
        {/* STEP 5: LOCATION (Canonical State, District required; Locality, Pincode optional) */}
        {/* ==================================================================== */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent-gold">
              Location Details
            </span>
            <h2 className="text-base font-bold text-primary-navy mt-0.5">
              Where is the property located?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. State / Union Territory Selector */}
            <CanonicalLocationSelect
              id="rent-property-state"
              label="State"
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
              id="rent-property-district"
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

            <div>
              <label className="text-xs font-bold text-primary-navy block mb-1">
                Locality / Area Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Talwandi / Kunhari"
                value={form.location.locality}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    location: { ...prev.location, locality: e.target.value },
                  }))
                }
                className="w-full h-11 px-3.5 rounded-xl border border-border-default text-xs font-medium text-text-primary bg-white focus:border-accent-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-primary-navy block mb-1">
                Pincode (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 324005"
                value={form.location.pincode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    location: { ...prev.location, pincode: e.target.value },
                  }))
                }
                className="w-full h-11 px-3.5 rounded-xl border border-border-default text-xs font-medium text-text-primary bg-white focus:border-accent-gold focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* ==================================================================== */}
        {/* STEP 6: PRICING (Monthly Rent - Only 1 Pricing Field)                */}
        {/* ==================================================================== */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent-gold">
              Pricing
            </span>
            <h2 className="text-base font-bold text-primary-navy mt-0.5">
              Set Expected Monthly Rent
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-bg-light border border-border-subtle space-y-2">
            <label className="text-xs font-bold text-primary-navy block">
              Monthly Rent *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-text-muted">
                ₹
              </span>
              <input
                type="text"
                placeholder="e.g. 15000"
                value={form.monthlyRent}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    monthlyRent: e.target.value.replace(/[^0-9]/g, ""),
                  }))
                }
                className="w-full h-11 pl-8 pr-20 rounded-xl border border-border-default text-sm font-bold text-primary-navy bg-white focus:border-accent-gold focus:outline-none"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted">
                / month
              </span>
            </div>
            {errors.monthlyRent && (
              <p className="text-[11px] text-error-red mt-1">{errors.monthlyRent}</p>
            )}
            {form.monthlyRent && Number(form.monthlyRent) > 0 && (
              <p className="text-xs font-bold text-accent-gold-hover">
                {formatRentPricePreview(form.monthlyRent)}
              </p>
            )}
          </div>
        </Card>

        {/* ==================================================================== */}
        {/* STEP 7: PHOTOS (Optional)                                            */}
        {/* ==================================================================== */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent-gold">
                Photos
              </span>
              <h2 className="text-base font-bold text-primary-navy mt-0.5">
                Property Photos (Optional)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, photos: [] }))}
              className="text-xs font-semibold text-text-muted hover:text-primary-navy"
            >
              Skip for now
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 rounded-2xl border-2 border-dashed border-border-default hover:border-accent-gold bg-bg-light/40 hover:bg-accent-gold/5 transition-all text-center cursor-pointer space-y-2"
          >
            <UploadCloud className="w-8 h-8 text-accent-gold mx-auto" />
            <p className="text-xs font-bold text-primary-navy">
              Click to browse and add property photos
            </p>
            <p className="text-[11px] text-text-muted">
              JPG, PNG, or WEBP. You can also skip and add photos later.
            </p>
          </div>

          {form.photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {form.photos.map((p, idx) => (
                <div
                  key={p.id}
                  className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-border-subtle group"
                >
                  <Image
                    src={p.previewUrl}
                    alt={`Photo ${idx + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 bg-dark-navy/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto(p.id);
                    }}
                    className="absolute top-2 right-2 p-1 rounded-md bg-dark-navy/80 text-white hover:bg-error-red transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ==================================================================== */}
        {/* STEP 8: TITLE & DESCRIPTION (Automatic, Editable Title)              */}
        {/* ==================================================================== */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent-gold">
              Listing Summary
            </span>
            <h2 className="text-base font-bold text-primary-navy mt-0.5">
              Title & Description
            </h2>
          </div>

          <div className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-primary-navy">
                  Property Title (Editable)
                </label>
                {form.isTitleManuallyEdited && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        isTitleManuallyEdited: false,
                        title: "",
                      }))
                    }
                    className="text-[11px] font-semibold text-accent-gold hover:underline"
                  >
                    Reset to auto-title
                  </button>
                )}
              </div>
              <input
                type="text"
                value={effectiveTitle}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                    isTitleManuallyEdited: true,
                  }))
                }
                className="w-full h-10 px-3.5 rounded-xl border border-border-default text-xs font-bold text-primary-navy bg-white focus:border-accent-gold focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-primary-navy">
                  Description (Optional)
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
                placeholder="Mention special terms, tenant preferences, or landmark proximity..."
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full p-3 rounded-xl border border-border-default text-xs font-medium text-text-primary bg-white focus:border-accent-gold focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* ==================================================================== */}
        {/* SUBMIT BUTTON                                                        */}
        {/* ==================================================================== */}
        <div className="pt-2 flex justify-end">
          <Button
            type="button"
            variant="primary"
            onClick={handleOpenPreview}
            className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold shadow-md shadow-accent-gold/20"
          >
            Review & Preview Listing
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      <RentQuickListingPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        form={{ ...form, title: effectiveTitle }}
        onConfirmSubmit={handleFinalSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

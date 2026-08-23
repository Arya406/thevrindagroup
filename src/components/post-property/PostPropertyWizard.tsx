"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Save, Sparkles, Edit3, AlertCircle } from "lucide-react";
import { Button, Container } from "@/components/ui";
import { PropertyListingDraft } from "@/types/postProperty";
import { useAuth } from "@/lib/auth/auth-context";
import { PropertyApiService, mapDraftToCreatePropertyDto } from "@/lib/services/property-api";
import { ApiClientError } from "@/lib/api-client";
import { Property } from "@/types/property";
import { PostPropertyLanding } from "./PostPropertyLanding";
import { StepProgress } from "./StepProgress";
import { Step1PropertyType } from "./Step1PropertyType";
import { Step2Location } from "./Step2Location";
import { Step3PropertyDetails } from "./Step3PropertyDetails";
import { Step4Photos } from "./Step4Photos";
import { Step5Pricing } from "./Step5Pricing";
import { Step6AmenitiesDescription } from "./Step6AmenitiesDescription";
import { Step7Review } from "./Step7Review";
import { PublishSuccess } from "./PublishSuccess";

const STORAGE_KEY = "thevrindagroup_property_draft_v1";

const INITIAL_DRAFT: PropertyListingDraft = {
  id: `PP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
  currentStep: 0, // 0 = Landing
  ownerType: "owner",
  transaction: "sale",
  category: "residential",
  residentialType: "apartment",
  commercialType: "office",
  location: {
    city: "Bangalore",
    locality: "",
    projectSociety: "",
    landmark: "",
    address: "",
  },
  residentialDetails: {
    bhk: "2",
    bathrooms: "2",
    balconies: "1",
    carpetArea: "",
    builtUpArea: "",
    floor: "",
    totalFloors: "",
    propertyAge: "1-3 Years",
    facing: "East",
    furnishing: "Semi Furnished",
    parking: "1 Covered",
    possessionStatus: "Ready to Move",
  },
  commercialDetails: {
    carpetArea: "",
    builtUpArea: "",
    floor: "",
    totalFloors: "",
    propertyAge: "Brand New",
    parking: "4 Dedicated Bays",
    furnishing: "Fully Furnished",
    possessionStatus: "Ready to Move",
    hasConferenceRoom: true,
    hasReception: true,
    hasPantry: true,
    hasPowerBackup: true,
    hasCentralAc: true,
    hasFireSafety: true,
  },
  photos: [],
  pricing: {
    expectedPrice: "",
    isPriceNegotiable: true,
    monthlyRent: "",
    securityDeposit: "",
    maintenanceCharges: "",
    availableFrom: "",
    leaseDuration: "3 Years",
  },
  amenities: [
    "Reserved Parking",
    "High-speed Lift",
    "24x7 Multi-tier Security",
    "100% Power Backup",
  ],
  description: "",
  isConfirmed: false,
};

export function PostPropertyWizard() {
  const { requireAuth } = useAuth();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [draft, setDraft] = useState<PropertyListingDraft>(INITIAL_DRAFT);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [createdProperty, setCreatedProperty] = useState<Property | null>(null);
  const [isLivePublished, setIsLivePublished] = useState(false);

  const [isEditMode, setIsEditMode] = useState<boolean>(() => Boolean(editId));
  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(() => {
    if (typeof window === "undefined" || editId) return false;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PropertyListingDraft;
        return Boolean(parsed && parsed.currentStep > 0 && parsed.currentStep <= 7);
      }
    } catch {
      return false;
    }
    return false;
  });
  const [isPublishing, setIsPublishing] = useState(false);

  // Fetch real property if editId is provided
  useEffect(() => {
    if (editId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(editId);
      if (isUuid) {
        PropertyApiService.getPropertyById(editId)
          .then((p) => {
            if (p) {
              setIsEditMode(true);
              setDraft((prev) => ({
                ...prev,
                id: p.id,
                transaction: p.listingType === "rent" ? "rent" : "sale",
                category: p.propertyType === "apartment" || p.propertyType === "villa" ? "residential" : "commercial",
                location: {
                  ...prev.location,
                  city: p.city || "Bangalore",
                  locality: p.location || "",
                  projectSociety: p.title || "",
                  address: p.location || "",
                },
                pricing: {
                  ...prev.pricing,
                  expectedPrice: String(p.price || ""),
                },
                description: p.description || "",
              }));
            }
          })
          .catch(() => {
            // Handled gracefully
          });
      }
    }
  }, [editId]);

  // Save to localStorage whenever draft changes
  useEffect(() => {
    if (draft.currentStep > 0 && draft.currentStep < 8 && !isEditMode) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } catch {
        // ignore localStorage write errors
      }
    }
  }, [draft, isEditMode]);

  const handleResumeDraft = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setDraft(parsed);
        setHasSavedDraft(false);
      }
    } catch {
      setHasSavedDraft(false);
    }
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setHasSavedDraft(false);
    setDraft(INITIAL_DRAFT);
  };

  const handleSaveDraftManual = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setSavedToast("Listing draft saved successfully! You can resume anytime.");
      setTimeout(() => setSavedToast(null), 3000);
    } catch {
      setSavedToast("Draft stored in current browser session.");
      setTimeout(() => setSavedToast(null), 3000);
    }
  };

  // Step Validation Logic
  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};

    if (draft.currentStep === 1) {
      if (!draft.transaction) errors.transaction = "Please choose a transaction model.";
      if (!draft.category) errors.category = "Please choose residential or commercial.";
    }

    if (draft.currentStep === 2) {
      if (!draft.location.city.trim()) errors.city = "Please enter the property city.";
      if (!draft.location.locality.trim()) errors.locality = "Please enter locality / neighborhood.";
      if (!draft.location.projectSociety.trim()) errors.projectSociety = "Please enter society/project name.";
      if (!draft.location.address.trim()) errors.address = "Please enter the complete street address.";
    }

    if (draft.currentStep === 3) {
      if (draft.category === "residential") {
        if (!draft.residentialDetails.carpetArea || parseInt(draft.residentialDetails.carpetArea) <= 0) {
          errors.carpetArea = "Please enter a valid carpet area in sq.ft.";
        }
        if (!draft.residentialDetails.floor.trim()) {
          errors.floor = "Please specify the floor level.";
        }
      } else {
        if (!draft.commercialDetails.carpetArea || parseInt(draft.commercialDetails.carpetArea) <= 0) {
          errors.carpetArea = "Please enter a valid commercial carpet area in sq.ft.";
        }
        if (!draft.commercialDetails.floor.trim()) {
          errors.floor = "Please specify the floor level.";
        }
      }
    }

    if (draft.currentStep === 4) {
      if (draft.photos.length === 0) {
        errors.photos = "Please add at least 1 photo before continuing.";
      }
    }

    if (draft.currentStep === 5) {
      if (draft.transaction === "sale") {
        if (!draft.pricing.expectedPrice || parseInt(draft.pricing.expectedPrice) <= 0) {
          errors.expectedPrice = "Please enter your expected sale price.";
        }
      } else {
        if (!draft.pricing.monthlyRent || parseInt(draft.pricing.monthlyRent) <= 0) {
          errors.monthlyRent = "Please enter expected monthly rent.";
        }
        if (!draft.pricing.securityDeposit || parseInt(draft.pricing.securityDeposit) <= 0) {
          errors.securityDeposit = "Please enter security deposit advance amount.";
        }
      }
    }

    if (draft.currentStep === 6) {
      if (!draft.description.trim() || draft.description.trim().length < 15) {
        errors.description = "Please provide at least 15 characters describing your property.";
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStepErrors({});
      setDraft((prev) => ({
        ...prev,
        currentStep: Math.min(prev.currentStep + 1, 8),
      }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setStepErrors({});
    setDraft((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Real Backend Property Creation Flow
  const executePublish = async () => {
    setIsPublishing(true);
    setPublishError(null);

    try {
      // 1. Convert form state to typed backend DTO
      const createDto = mapDraftToCreatePropertyDto(draft);

      // 2. Create Property in PostgreSQL (status: DRAFT)
      const property = await PropertyApiService.createProperty(createDto);
      setCreatedProperty(property);

      // 3. Attach uploaded photos: handle both new binary File uploads and existing remote URLs
      let attachedImagesCount = 0;

      if (draft.photos && draft.photos.length > 0) {
        for (let i = 0; i < draft.photos.length; i++) {
          const photo = draft.photos[i];
          const isPrimary =
            photo.isCover || (i === 0 && !draft.photos.some((p) => p.isCover));

          if (photo.file) {
            // Real local binary file upload via multipart endpoint
            try {
              await PropertyApiService.uploadPropertyImage(property.id, photo.file, {
                isPrimary,
              });
              attachedImagesCount++;
            } catch (uploadErr) {
              console.warn("[PostPropertyWizard] Image upload error:", uploadErr);
            }
          } else if (photo.url && /^https?:\/\//i.test(photo.url)) {
            // Preset / remote URL attach
            try {
              await PropertyApiService.addPropertyImage(property.id, {
                url: photo.url,
                altText: photo.name || `${property.title} Image ${i + 1}`,
                displayOrder: i,
                isPrimary,
              });
              attachedImagesCount++;
            } catch (attachErr) {
              console.warn("[PostPropertyWizard] Image URL attach error:", attachErr);
            }
          }
        }
      }

      // 4. Transition status to PUBLISHED if images exist and meet publishing criteria
      if (attachedImagesCount > 0) {
        try {
          const published = await PropertyApiService.publishProperty(property.id);
          setCreatedProperty(published);
          setIsLivePublished(true);
        } catch {
          // If publishing failed, property remains in DRAFT
          setIsLivePublished(false);
        }
      } else {
        setIsLivePublished(false);
      }

      // 5. Clean up localStorage draft
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }

      // 6. Transition to Step 8 (Success Screen)
      setDraft((prev) => ({
        ...prev,
        id: property.referenceCode || property.id,
        currentStep: 8,
        submittedAt: new Date().toISOString(),
      }));

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.statusCode === 401) {
          setPublishError("Your session has expired. Please sign in again to publish your listing.");
        } else if (err.statusCode === 403) {
          setPublishError("Only registered Owners and Certified Agents have permission to list properties.");
        } else if (err.statusCode === 409) {
          setPublishError("A property with this identical title or reference code already exists.");
        } else if (Array.isArray(err.details) && err.details.length > 0) {
          const firstDetail = err.details[0] as { message?: string };
          setPublishError(firstDetail?.message || err.message);
        } else {
          setPublishError(err.message || "Failed to create property on backend.");
        }
      } else {
        setPublishError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while connecting to the property server. Please try again."
        );
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublish = () => {
    if (!draft.isConfirmed) {
      alert("Please check the accuracy confirmation box before publishing.");
      return;
    }

    const canProceed = requireAuth({
      title: "Sign in to publish your property",
      message: "Create an account or sign in to publish your listing across India's top property seekers.",
      onAuthenticated: () => executePublish(),
    });

    if (canProceed) {
      executePublish();
    }
  };

  const handlePostAnother = () => {
    setCreatedProperty(null);
    setIsLivePublished(false);
    setPublishError(null);
    setDraft({
      ...INITIAL_DRAFT,
      id: `PP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      currentStep: 0,
    });
  };

  return (
    <div className="py-8 sm:py-10 bg-bg-light min-h-screen font-sans text-text-primary">
      <Container className="space-y-6 max-w-4xl">
        {/* Toast Notification */}
        {savedToast && (
          <div className="fixed top-20 right-6 z-50 rounded-xl bg-primary-navy text-white px-4 py-3 text-xs font-semibold shadow-soft-lg flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300">
            <Save className="w-4 h-4 text-accent-gold" />
            <span>{savedToast}</span>
          </div>
        )}

        {/* Edit Mode Alert Banner */}
        {isEditMode && draft.currentStep > 0 && draft.currentStep <= 7 && (
          <div className="rounded-2xl border border-accent-gold/40 bg-accent-gold-light/60 p-4 shadow-soft flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Edit3 className="w-4 h-4 text-[#9E6E18]" />
              <span className="text-xs sm:text-sm font-bold text-primary-navy">
                Editing Property Listing:{" "}
                <span className="text-text-primary font-semibold">
                  {draft.location.projectSociety || draft.id}
                </span>
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-navy text-white">
              Edit Mode
            </span>
          </div>
        )}

        {/* Existing Draft Recovery Banner */}
        {hasSavedDraft && draft.currentStep === 0 && !isEditMode && (
          <div className="rounded-2xl border border-accent-gold/40 bg-accent-gold-light/50 p-4 sm:p-5 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
            <div className="space-y-0.5 text-center sm:text-left">
              <span className="text-xs font-bold text-[#9E6E18] flex items-center gap-1.5 justify-center sm:justify-start">
                <Sparkles className="w-4 h-4" />
                Unfinished Listing Found
              </span>
              <p className="text-xs sm:text-sm text-primary-navy font-semibold">
                You have a saved property draft in progress. Would you like to resume where you left off?
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscardDraft}
                className="text-xs"
              >
                Discard & Start New
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleResumeDraft}
                className="text-xs font-bold shadow-soft-xs"
              >
                Resume Draft
              </Button>
            </div>
          </div>
        )}

        {/* Step 0: Landing Introduction Screen */}
        {draft.currentStep === 0 && (
          <PostPropertyLanding
            selectedOwnerType={draft.ownerType}
            onSelectOwnerType={(ot) => setDraft((p) => ({ ...p, ownerType: ot }))}
            onStart={() => setDraft((p) => ({ ...p, currentStep: 1 }))}
          />
        )}

        {/* Steps 1 to 7: Active Listing Wizard */}
        {draft.currentStep >= 1 && draft.currentStep <= 7 && (
          <div className="space-y-6">
            {/* Top Stepper Progress */}
            <StepProgress
              currentStep={draft.currentStep}
              onStepClick={(s) => setDraft((p) => ({ ...p, currentStep: s }))}
            />

            {/* Error Banner on Step 7 if submission failed */}
            {publishError && draft.currentStep === 7 && (
              <div className="rounded-xl bg-error-red-light/60 border border-error-red/30 p-4 text-xs flex items-center gap-3 text-error-red">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div className="space-y-0.5">
                  <strong className="font-bold">Submission Error:</strong>
                  <p>{publishError}</p>
                </div>
              </div>
            )}

            {/* Main Form White Card */}
            <div className="rounded-2xl border border-border-default bg-white p-5 sm:p-8 shadow-soft space-y-6">
              {draft.currentStep === 1 && (
                <Step1PropertyType
                  transaction={draft.transaction}
                  onTransactionChange={(t) => setDraft((p) => ({ ...p, transaction: t }))}
                  category={draft.category}
                  onCategoryChange={(c) => setDraft((p) => ({ ...p, category: c }))}
                  residentialType={draft.residentialType}
                  onResidentialTypeChange={(rt) => setDraft((p) => ({ ...p, residentialType: rt }))}
                  commercialType={draft.commercialType}
                  onCommercialTypeChange={(ct) => setDraft((p) => ({ ...p, commercialType: ct }))}
                />
              )}

              {draft.currentStep === 2 && (
                <Step2Location
                  location={draft.location}
                  onChange={(loc) => setDraft((p) => ({ ...p, location: loc }))}
                  errors={stepErrors}
                />
              )}

              {draft.currentStep === 3 && (
                <Step3PropertyDetails
                  category={draft.category}
                  residentialDetails={draft.residentialDetails}
                  onResidentialChange={(rd) => setDraft((p) => ({ ...p, residentialDetails: rd }))}
                  commercialDetails={draft.commercialDetails}
                  onCommercialChange={(cd) => setDraft((p) => ({ ...p, commercialDetails: cd }))}
                  errors={stepErrors}
                />
              )}

              {draft.currentStep === 4 && (
                <Step4Photos
                  photos={draft.photos}
                  onPhotosChange={(photos) => setDraft((p) => ({ ...p, photos }))}
                  error={stepErrors.photos}
                />
              )}

              {draft.currentStep === 5 && (
                <Step5Pricing
                  transaction={draft.transaction}
                  category={draft.category}
                  pricing={draft.pricing}
                  onChange={(pricing) => setDraft((p) => ({ ...p, pricing }))}
                  errors={stepErrors}
                />
              )}

              {draft.currentStep === 6 && (
                <Step6AmenitiesDescription
                  category={draft.category}
                  amenities={draft.amenities}
                  onAmenitiesChange={(amenities) => setDraft((p) => ({ ...p, amenities }))}
                  description={draft.description}
                  onDescriptionChange={(description) => setDraft((p) => ({ ...p, description }))}
                  error={stepErrors.description}
                />
              )}

              {draft.currentStep === 7 && (
                <Step7Review
                  draft={draft}
                  onEditStep={(s) => setDraft((p) => ({ ...p, currentStep: s }))}
                  onConfirmChange={(conf) => setDraft((p) => ({ ...p, isConfirmed: conf }))}
                  onPublish={handlePublish}
                  onSaveDraft={handleSaveDraftManual}
                  isPublishing={isPublishing}
                />
              )}

              {/* Navigation Controls (Steps 1 to 6) */}
              {draft.currentStep < 7 && (
                <div className="flex items-center justify-between pt-6 border-t border-border-default">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                    className="text-xs font-semibold"
                  >
                    {draft.currentStep === 1 ? "Back to Account Type" : "Back"}
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={handleSaveDraftManual}
                      leftIcon={<Save className="w-3.5 h-3.5" />}
                      className="hidden sm:inline-flex text-xs"
                    >
                      Save Draft
                    </Button>

                    <Button
                      variant="primary"
                      onClick={handleNext}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="text-xs font-bold shadow-soft-xs px-6"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 8: Success Screen */}
        {draft.currentStep === 8 && (
          <PublishSuccess
            draft={draft}
            createdPropertyId={createdProperty?.id}
            createdPropertySlug={createdProperty?.slug}
            createdReferenceCode={createdProperty?.referenceCode}
            isLivePublished={isLivePublished}
            onPostAnother={handlePostAnother}
          />
        )}
      </Container>
    </div>
  );
}

export default PostPropertyWizard;

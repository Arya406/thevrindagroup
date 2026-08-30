"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Maximize,
  BedDouble,
  Bath,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  Heart,
  Share2,
  Calculator,
  Sparkles,
  Clock,
  Sofa,
  AlertCircle,
  RotateCcw,
  Building2,
} from "lucide-react";
import {
  Container,
  Button,
  OwnerBadge,
  AgentBadge,
  Card,
  Input,
} from "@/components/ui";
import { PropertyCard } from "@/components/marketplace/PropertyCard";
import { ContactModal } from "@/components/marketplace/ContactModal";
import { PropertyApiService } from "@/lib/services/property-api";
import { FavoriteApiService } from "@/lib/services/favorite-api";
import { SiteVisitApiService } from "@/lib/services/site-visit-api";
import { useAuth } from "@/lib/auth/auth-context";
import { Property } from "@/types/property";

interface DisplayProperty {
  id: string;
  title: string;
  price: string;
  priceNumeric: number;
  bhk: string | number | null;
  bhkString?: string;
  bathrooms: number | null;
  carpetArea: string;
  location: string;
  city: string;
  address: string;
  propertyType: string;
  listingType: string;
  isReraVerified: boolean;
  reraNumber?: string;
  sellerType: "owner" | "agent" | "developer";
  sellerName: string;
  sellerPhone?: string;
  isFeatured?: boolean;
  image: string;
  images: string[];
  description: string;
  furnishingStatus: string;
  possessionStatus: string;
  floor?: string;
  facing?: string;
  parking?: string;
  amenities: string[];
  postedDate: string;
  securityDeposit?: string;
  maintenanceCharges?: string;
  noticePeriod?: string;
  tenantPreference?: string[];
  nearbyFacilities?: {
    metro?: string;
    itParks?: string;
    schools?: string;
    hospitals?: string;
    shopping?: string;
  };
}

export interface PropertyDetailContentProps {
  propertyId: string;
  initialProperty?: Property | null;
}

export function PropertyDetailContent({
  propertyId,
  initialProperty = null,
}: PropertyDetailContentProps) {
  const [backendProperty, setBackendProperty] = useState<Property | null>(initialProperty);
  const [isLoading, setIsLoading] = useState(!initialProperty);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch real property from backend on mount or propertyId change if not preloaded
  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!propertyId) return;
      if (initialProperty && initialProperty.id === propertyId) {
        setBackendProperty(initialProperty);
        setIsLoading(false);
        return;
      }

      try {
        let prop = await PropertyApiService.getPropertyById(propertyId);
        if (!prop) {
          prop = await PropertyApiService.getPropertyBySlug(propertyId);
        }
        if (isMounted) {
          if (prop) {
            setBackendProperty(prop);
            setFetchError(null);
          } else {
            setFetchError("Property listing not found or has been archived.");
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Failed to load property details.";
          setFetchError(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [propertyId, initialProperty]);

  const handleManualRetry = () => {
    setIsLoading(true);
    setFetchError(null);
    PropertyApiService.getPropertyById(propertyId)
      .then((prop) => {
        if (prop) {
          setBackendProperty(prop);
        } else {
          setFetchError("Property listing not found or has been archived.");
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load property details.";
        setFetchError(msg);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const property: DisplayProperty | null = backendProperty
    ? {
        id: backendProperty.id,
        title: backendProperty.title,
        price: backendProperty.price,
        priceNumeric: backendProperty.priceNumeric,
        bhk: backendProperty.bhk,
        bhkString: backendProperty.bhk ? `${backendProperty.bhk} BHK` : "",
        bathrooms: backendProperty.bathrooms,
        carpetArea: backendProperty.carpetArea,
        location: backendProperty.location,
        city: backendProperty.city,
        address: backendProperty.address,
        propertyType: backendProperty.propertyType,
        listingType: backendProperty.listingType,
        isReraVerified: backendProperty.isReraVerified,
        reraNumber: backendProperty.reraNumber,
        sellerType: backendProperty.sellerType,
        sellerName: backendProperty.sellerName,
        sellerPhone: backendProperty.sellerPhone || undefined,
        isFeatured: backendProperty.isFeatured,
        image: backendProperty.image,
        images: backendProperty.images,
        description: backendProperty.description,
        furnishingStatus: backendProperty.furnishingStatus || "",
        possessionStatus: backendProperty.possessionStatus || "",
        amenities: backendProperty.amenities,
        postedDate: backendProperty.postedDate,
      }
    : null;

  const isRental = property?.listingType?.toLowerCase() === "rent";

  const { isAuthenticated, requireAuth } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFav, setIsTogglingFav] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Sync initial favorite status from backend for authenticated users
  useEffect(() => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(propertyId);
    if (isAuthenticated && isUuid) {
      FavoriteApiService.getFavoriteStatus(propertyId)
        .then((res) => {
          setIsFavorite(res.isFavorited);
        })
        .catch(() => {
          // Handled silently
        });
    }
  }, [isAuthenticated, propertyId]);

  // Similar Properties State (Live from backend)
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);

  useEffect(() => {
    if (property?.city) {
      PropertyApiService.getProperties({
        city: property.city !== "All" ? property.city : undefined,
        limit: 4,
      })
        .then((res) => {
          setSimilarProperties((res.properties || []).filter((p) => p.id !== property.id).slice(0, 3));
        })
        .catch(() => {
          setSimilarProperties([]);
        });
    }
  }, [property?.id, property?.city]);

  // Site Visit State
  const [visitDate, setVisitDate] = useState("");
  const [visitSlot, setVisitSlot] = useState("11:00 AM - 01:00 PM");
  const [isVisitBooked, setIsVisitBooked] = useState(false);

  // EMI Calculator State
  const [customLoanAmount, setCustomLoanAmount] = useState<number | null>(null);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const loanAmount =
    customLoanAmount !== null
      ? customLoanAmount
      : Math.round((property?.priceNumeric || 5000000) * 0.8);

  const calculateEMI = () => {
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = tenureYears * 12;
    const emi =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
    return Math.round(emi);
  };

  const executeFavoriteToggle = async () => {
    if (isTogglingFav) return;
    setIsTogglingFav(true);
    const nextState = !isFavorite;
    setIsFavorite(nextState);

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(propertyId);
    if (isUuid) {
      try {
        const res = await FavoriteApiService.toggleFavorite(propertyId, !nextState);
        setSaveToast(
          res.isFavorited
            ? "Property added to your shortlisted favorites!"
            : "Property removed from your favorites."
        );
      } catch (err: unknown) {
        setIsFavorite(!nextState); // Rollback
        const msg = err instanceof Error ? err.message : "Unable to update saved property.";
        setSaveToast(msg);
      } finally {
        setIsTogglingFav(false);
        setTimeout(() => setSaveToast(null), 3000);
      }
    } else {
      setSaveToast(
        nextState
          ? "Property added to your shortlisted favorites!"
          : "Property removed from your favorites."
      );
      setIsTogglingFav(false);
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      const allowed = requireAuth({
        title: "Sign in to save properties",
        message: "Sign in to keep your shortlisted properties and access them across all devices.",
        onAuthenticated: () => executeFavoriteToggle(),
      });
      if (allowed) {
        executeFavoriteToggle();
      }
      return;
    }
    executeFavoriteToggle();
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setSaveToast("Property link copied to clipboard!");
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  const [isBookingLoading, setIsBookingLoading] = useState(false);

  const executeBookVisit = async () => {
    if (!visitDate || isBookingLoading || !property) return;
    setIsBookingLoading(true);

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(property.id);
    if (isUuid) {
      try {
        let hour = 11;
        if (visitSlot.startsWith("10:")) hour = 10;
        else if (visitSlot.startsWith("12:")) hour = 12;
        else if (visitSlot.startsWith("02:")) hour = 14;
        else if (visitSlot.startsWith("04:")) hour = 16;

        const scheduledDate = new Date(`${visitDate}T${String(hour).padStart(2, "0")}:00:00.000Z`);
        const targetIso = scheduledDate.toISOString();

        await SiteVisitApiService.createSiteVisit(property.id, {
          scheduledAt: targetIso,
          buyerNote: `Requested slot: ${visitSlot}`,
        });

        setIsVisitBooked(true);
        setSaveToast(`Site visit requested successfully for ${visitDate} (${visitSlot})!`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unable to book site visit. Please try again.";
        setSaveToast(msg);
      } finally {
        setIsBookingLoading(false);
        setTimeout(() => setSaveToast(null), 4000);
      }
    } else {
      setIsVisitBooked(true);
      setIsBookingLoading(false);
      setSaveToast(`Site visit requested for ${visitDate} (${visitSlot}).`);
      setTimeout(() => setSaveToast(null), 4000);
    }
  };

  const handleBookVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitDate) return;
    if (!isAuthenticated) {
      const allowed = requireAuth({
        title: "Sign in to book a site visit",
        message: "Sign in to schedule and track verified on-site property walkthroughs.",
        onAuthenticated: () => executeBookVisit(),
      });
      if (allowed) {
        executeBookVisit();
      }
      return;
    }
    executeBookVisit();
  };

  if (isLoading) {
    return (
      <div className="py-12 bg-bg-light min-h-screen">
        <Container>
          <div className="animate-pulse space-y-6 max-w-5xl mx-auto">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-96 bg-slate-200 rounded-2xl w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 h-64 bg-slate-200 rounded-xl"></div>
              <div className="h-64 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="py-24 bg-bg-light min-h-[60vh] flex items-center justify-center text-center">
        <Container>
          <div className="max-w-md mx-auto p-8 bg-white rounded-2xl border border-border-default shadow-soft-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-primary-navy">Property Listing Unavailable</h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              {fetchError || "This listing is currently under review, unpublished, or has been archived by the administrator."}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/buy">
                <Button variant="primary" size="sm" className="text-xs font-bold">
                  Browse Active Properties
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRetry}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                className="text-xs font-bold"
              >
                Retry
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8 bg-bg-light min-h-screen font-sans text-text-primary">
      <Container className="space-y-6">
        {/* Save/Share Toast */}
        {saveToast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-dark-navy text-white px-4 py-2.5 text-xs font-semibold shadow-soft-xl animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-gold" />
            {saveToast}
          </div>
        )}

        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={isRental ? "/rent" : "/buy"}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary-navy transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to {isRental ? "Rental Properties" : "All Properties"}
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFavoriteToggle}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                isFavorite
                  ? "bg-error-red-light border-error-red/30 text-error-red"
                  : "bg-white border-border-default text-text-secondary hover:text-primary-navy"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isFavorite ? "fill-error-red text-error-red" : ""
                }`}
              />
              {isFavorite ? "Saved" : "Save"}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-default bg-white text-xs font-semibold text-text-secondary hover:text-primary-navy transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          </div>
        </div>

        {/* Main Title & Price Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-5 rounded-2xl border border-border-default shadow-soft-xs">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {property.sellerType === "owner" ? (
                <OwnerBadge size="sm" />
              ) : (
                <AgentBadge size="sm" />
              )}
              <span className="rounded bg-bg-light border border-border-subtle px-2 py-0.5 text-[11px] font-semibold text-text-secondary uppercase">
                {property.propertyType}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-primary-navy tracking-tight">
              {property.title}
            </h1>

            <p className="text-xs sm:text-sm text-text-secondary flex items-center gap-1">
              <MapPin className="w-4 h-4 text-accent-gold shrink-0" />
              {property.address}
            </p>
          </div>

          <div className="md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-border-subtle shrink-0">
            <div className="text-2xl sm:text-3xl font-black text-primary-navy tracking-tight">
              {property.price}
            </div>
            <p className="text-xs text-text-muted">
              {isRental
                ? "Monthly Rent (Excludes Maintenance)"
                : "All Inclusive Estimated Cost"}
            </p>
          </div>
        </div>

        {/* Photo Gallery Grid */}
        {property.images.length > 0 || property.image ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-[360px] sm:h-[440px] md:h-[480px]">
            {/* Main Hero Photo (8 cols or 12 cols if only 1 photo) */}
            <div className={`relative ${property.images.length > 1 ? "lg:col-span-8" : "lg:col-span-12"} h-full rounded-2xl overflow-hidden bg-slate-100 border border-border-default group`}>
              <Image
                src={property.images[activeImageIndex] || property.image}
                alt={`${property.title} - View ${activeImageIndex + 1}`}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-102"
              />
              {property.images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1 rounded-lg">
                  {activeImageIndex + 1} / {property.images.length} Photos
                </div>
              )}
            </div>

            {/* Thumbnail Strip (4 cols) */}
            {property.images.length > 1 && (
              <div className="hidden lg:grid lg:col-span-4 grid-rows-3 gap-3 h-full">
                {property.images.slice(0, 3).map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-full rounded-xl overflow-hidden bg-slate-100 border cursor-pointer transition-all ${
                      activeImageIndex === idx
                        ? "border-accent-gold ring-2 ring-accent-gold/40"
                        : "border-border-default hover:border-text-secondary"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-64 sm:h-80 rounded-2xl border border-border-default bg-slate-100/70 flex flex-col items-center justify-center text-slate-400 p-6 text-center select-none">
            <Building2 className="w-12 h-12 opacity-40 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No photos uploaded for this property</p>
            <p className="text-xs text-slate-400 mt-0.5">Contact the seller for more details or to schedule a site visit.</p>
          </div>
        )}

        {/* Content Layout: 8 cols Details + 4 cols Sticky Contact Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: 8 Cols Detailed Info */}
          <div className="lg:col-span-8 space-y-6">
            {/* Highlights Grid */}
            <Card className="p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-accent-gold-hover mb-4">
                Property Overview & Specs
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-light border border-border-subtle">
                  <div className="w-10 h-10 rounded-lg bg-white border border-border-default flex items-center justify-center text-accent-gold shrink-0">
                    <Maximize className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-text-muted">Carpet Area</p>
                    <p className="text-xs font-bold text-primary-navy">
                      {property.carpetArea}
                    </p>
                  </div>
                </div>

                {property.bhk ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-light border border-border-subtle">
                    <div className="w-10 h-10 rounded-lg bg-white border border-border-default flex items-center justify-center text-accent-gold shrink-0">
                      <BedDouble className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-text-muted">Bedrooms</p>
                      <p className="text-xs font-bold text-primary-navy">
                        {property.bhkString || `${property.bhk} BHK`}
                      </p>
                    </div>
                  </div>
                ) : null}

                {property.bathrooms ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-light border border-border-subtle">
                    <div className="w-10 h-10 rounded-lg bg-white border border-border-default flex items-center justify-center text-accent-gold shrink-0">
                      <Bath className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-text-muted">Bathrooms</p>
                      <p className="text-xs font-bold text-primary-navy">
                        {property.bathrooms} Baths
                      </p>
                    </div>
                  </div>
                ) : null}

                {property.furnishingStatus ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-light border border-border-subtle">
                    <div className="w-10 h-10 rounded-lg bg-white border border-border-default flex items-center justify-center text-accent-gold shrink-0">
                      <Sofa className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-text-muted">Furnishing</p>
                      <p className="text-xs font-bold text-primary-navy truncate">
                        {property.furnishingStatus}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </Card>

            {/* Description */}
            {property.description && property.description.trim().length > 0 && (
              <Card className="p-5 sm:p-6 space-y-3">
                <h2 className="text-base font-bold text-primary-navy">
                  About This Property
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </Card>
            )}

            {/* Amenities Section */}
            {property.amenities.length > 0 && (
              <Card className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-primary-navy">
                    Amenities & Features
                  </h2>
                  <span className="text-xs font-semibold text-accent-gold">
                    {property.amenities.length} Verified Highlights
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-bg-light border border-border-subtle text-xs font-medium text-text-primary"
                    >
                      <CheckCircle2 className="w-4 h-4 text-success-green shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* EMI Home Loan Calculator */}
            {!isRental && (
              <Card className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-accent-gold" />
                  <h2 className="text-base font-bold text-primary-navy">
                    Home Loan EMI Calculator
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">
                      Loan Amount (₹)
                    </label>
                    <Input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setCustomLoanAmount(Number(e.target.value))}
                      step={100000}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">
                      Interest Rate (% p.a.)
                    </label>
                    <Input
                      type="number"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      step={0.1}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">
                      Tenure (Years)
                    </label>
                    <Input
                      type="number"
                      value={tenureYears}
                      onChange={(e) => setTenureYears(Number(e.target.value))}
                      min={1}
                      max={30}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary-navy text-white flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/70">Estimated Monthly EMI</p>
                    <p className="text-xl font-bold text-accent-gold">
                      ₹{calculateEMI().toLocaleString("en-IN")} / month
                    </p>
                  </div>
                  <span className="text-[11px] text-white/60">
                    Calculated for {tenureYears} yrs @ {interestRate}%
                  </span>
                </div>
              </Card>
            )}
          </div>

          {/* RIGHT: 4 Cols Sticky Seller & Site Visit Box */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            {/* Seller Contact Card */}
            <Card className="p-5 sm:p-6 space-y-4 border-2 border-border-default">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary-navy text-accent-gold font-black text-lg flex items-center justify-center">
                  {property.sellerName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary-navy flex items-center gap-1">
                    {property.sellerName}
                    <ShieldCheck className="w-4 h-4 text-accent-gold" />
                  </h3>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-bg-light border border-border-subtle text-text-secondary uppercase">
                    Verified {property.sellerType}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <Button
                  variant="primary"
                  className="w-full h-11 text-xs font-bold"
                  onClick={() => setIsContactOpen(true)}
                  leftIcon={<PhoneCall className="w-4 h-4 text-accent-gold" />}
                >
                  Contact Seller Directly
                </Button>

                <p className="text-[11px] text-center text-text-muted">
                  Zero Brokerage on Direct Owner Properties
                </p>
              </div>
            </Card>

            {/* Schedule Visit Card */}
            <Card className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-gold" />
                <h3 className="text-sm font-bold text-primary-navy">
                  Schedule an In-Person Site Visit
                </h3>
              </div>

              {isVisitBooked ? (
                <div className="p-4 rounded-xl bg-success-green-light border border-success-green/30 text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-success-green mx-auto" />
                  <p className="text-xs font-bold text-success-green">Visit Requested!</p>
                  <p className="text-[11px] text-text-secondary">
                    The owner will confirm your appointment for {visitDate}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookVisitSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-text-secondary block mb-1">
                      Preferred Date
                    </label>
                    <Input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-text-secondary block mb-1">
                      Time Slot
                    </label>
                    <select
                      value={visitSlot}
                      onChange={(e) => setVisitSlot(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none"
                    >
                      <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                      <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    variant="outline"
                    isLoading={isBookingLoading}
                    className="w-full h-10 text-xs font-bold hover:border-primary-navy"
                  >
                    Book Free Site Visit
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>

        {/* Similar Properties Section */}
        {similarProperties.length > 0 && (
          <div className="pt-10 border-t border-border-default space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent-gold-hover">
                  Explore More Options
                </span>
                <h3 className="heading-section text-primary-navy">
                  Similar Verified Properties Nearby
                </h3>
              </div>

              <Link href={isRental ? "/rent" : "/buy"}>
                <Button variant="outline" size="sm" className="text-xs font-bold">
                  View All &rarr;
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        )}
      </Container>

      {/* Direct Contact Modal */}
      {backendProperty && (
        <ContactModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
          property={backendProperty}
        />
      )}
    </div>
  );
}

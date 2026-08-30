"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Maximize2,
  Building2,
  PhoneCall,
  ShieldCheck,
  Heart,
  Share2,
  Calendar,
  Layers,
  Sparkles,
  Clock,
  Car,
  Briefcase,
  CheckCircle2,
  Train,
  Plane,
  Building,
  Hotel,
  Landmark,
} from "lucide-react";
import {
  Container,
  Button,
  OwnerBadge,
  AgentBadge,
  Card,
  Input,
} from "@/components/ui";
import { CommercialPropertyCard } from "@/components/commercial/CommercialPropertyCard";
import { CommercialEnquiryModal } from "@/components/commercial/CommercialEnquiryModal";
import { ScheduleCommercialVisitModal } from "@/components/commercial/ScheduleCommercialVisitModal";
import { useAuth } from "@/lib/auth/auth-context";
import { FavoriteApiService } from "@/lib/services/favorite-api";
import { SiteVisitApiService } from "@/lib/services/site-visit-api";
import { PropertyApiService, mapPropertyToCommercialProperty } from "@/lib/services/property-api";
import { CommercialProperty } from "@/types/commercial";

export interface CommercialPropertyDetailContentProps {
  propertyId: string;
  initialProperty?: CommercialProperty | null;
}

export function CommercialPropertyDetailContent({
  propertyId,
  initialProperty = null,
}: CommercialPropertyDetailContentProps) {
  const [liveProperty, setLiveProperty] = useState<CommercialProperty | null>(initialProperty);
  const [isLoading, setIsLoading] = useState<boolean>(!initialProperty);
  const [similarCommercial, setSimilarCommercial] = useState<CommercialProperty[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!propertyId) {
        setIsLoading(false);
        return;
      }
      if (initialProperty && initialProperty.id === propertyId) {
        setLiveProperty(initialProperty);
        setIsLoading(false);
        return;
      }

      try {
        let p = await PropertyApiService.getPropertyById(propertyId);
        if (!p) {
          p = await PropertyApiService.getPropertyBySlug(propertyId);
        }
        if (isMounted) {
          if (p) {
            setLiveProperty(mapPropertyToCommercialProperty(p));
          } else {
            setLiveProperty(null);
          }
        }
      } catch {
        if (isMounted) {
          setLiveProperty(null);
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

  const property = liveProperty;

  // Live Similar Commercial Properties
  useEffect(() => {
    if (property?.city) {
      PropertyApiService.getProperties({
        city: property.city !== "All" ? property.city : undefined,
        limit: 4,
      })
        .then((res) => {
          const mapped = (res.properties || []).map(mapPropertyToCommercialProperty);
          setSimilarCommercial(mapped.filter((p) => p.id !== property.id).slice(0, 3));
        })
        .catch(() => {
          setSimilarCommercial([]);
        });
    }
  }, [property?.id, property?.city]);

  const { isAuthenticated, requireAuth } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFav, setIsTogglingFav] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Quick Site Visit Form State
  const [visitDate, setVisitDate] = useState("");
  const [visitSlot, setVisitSlot] = useState("10:00 AM - 12:00 PM");
  const [isVisitBooked, setIsVisitBooked] = useState(false);

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
            ? "Commercial asset added to your shortlist!"
            : "Removed from your shortlisted properties."
        );
      } catch (err: unknown) {
        setIsFavorite(!nextState);
        const msg = err instanceof Error ? err.message : "Unable to update saved property.";
        setSaveToast(msg);
      } finally {
        setIsTogglingFav(false);
        setTimeout(() => setSaveToast(null), 3000);
      }
    } else {
      setSaveToast(
        nextState
          ? "Commercial asset added to your shortlist!"
          : "Removed from your shortlisted properties."
      );
      setIsTogglingFav(false);
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      const allowed = requireAuth({
        title: "Sign in to save commercial properties",
        message: "Create an account to save and track shortlisted commercial assets.",
        onAuthenticated: () => executeFavoriteToggle(),
      });
      if (allowed) {
        executeFavoriteToggle();
      }
      return;
    }
    executeFavoriteToggle();
  };

  const [isBookingLoading, setIsBookingLoading] = useState(false);

  const executeBookCommercialVisit = async () => {
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
          buyerNote: `Commercial inspection requested for ${visitSlot}`,
        });

        setIsVisitBooked(true);
        setSaveToast(`Site visit requested successfully for ${visitDate} (${visitSlot})!`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unable to book inspection.";
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

  const handleBookVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitDate) {
      setSaveToast("Please select a preferred date for the site inspection.");
      setTimeout(() => setSaveToast(null), 3000);
      return;
    }

    if (!isAuthenticated) {
      const allowed = requireAuth({
        title: "Sign in to schedule inspection",
        message: "Sign in to confirm VIP commercial asset inspections.",
        onAuthenticated: () => executeBookCommercialVisit(),
      });
      if (allowed) {
        executeBookCommercialVisit();
      }
      return;
    }

    executeBookCommercialVisit();
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
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-primary-navy">Commercial Listing Unavailable</h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              This commercial asset is currently under review, unpublished, or has been archived.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/commercial">
                <Button variant="primary" size="sm" className="text-xs font-bold">
                  Browse Commercial Marketplace
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8 bg-bg-light min-h-screen font-sans text-text-primary">
      <Container className="space-y-6">
        {/* Toast */}
        {saveToast && (
          <div className="fixed top-20 right-6 z-50 rounded-xl bg-primary-navy text-white px-4 py-3 text-xs font-semibold shadow-soft-lg flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300">
            <Heart className="w-4 h-4 fill-error-red text-error-red" />
            <span>{saveToast}</span>
          </div>
        )}

        {/* Back Link & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/commercial"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-text-secondary hover:text-primary-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Commercial Marketplace
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFavoriteToggle}
              leftIcon={
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite ? "fill-error-red text-error-red" : ""
                  }`}
                />
              }
              className="text-xs font-semibold"
            >
              {isFavorite ? "Shortlisted" : "Shortlist Asset"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Share2 className="w-4 h-4" />}
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard?.writeText(window.location.href);
                  alert("Commercial property link copied to clipboard!");
                }
              }}
              className="text-xs font-semibold"
            >
              Share
            </Button>
          </div>
        </div>

        {/* Title & Badges Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-default pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {property.sellerType === "owner" ? (
                <OwnerBadge />
              ) : property.sellerType === "developer" ? (
                <span className="inline-flex items-center gap-1 rounded bg-[#0F1B3D] text-[#F5C469] text-xs font-bold px-2.5 py-0.5 border border-[#D9A441]/50">
                  <Building2 className="w-3.5 h-3.5" />
                  BUILDER ASSET
                </span>
              ) : (
                <AgentBadge />
              )}
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-white border border-border-default text-primary-navy uppercase tracking-wider">
                {property.propertyType}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-accent-gold-light text-[#9E6E18] border border-accent-gold-muted uppercase">
                {property.transactionType === "lease"
                  ? "For Lease"
                  : property.transactionType === "rent"
                  ? "For Rent"
                  : property.transactionType === "sale"
                  ? "For Sale"
                  : "Co-working"}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-bg-light border border-border-subtle text-text-secondary">
                {property.possessionStatus}
              </span>
            </div>
            <h1 className="heading-section text-primary-navy">{property.title}</h1>
            <p className="text-sm text-text-secondary flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-accent-gold shrink-0" />
              {property.address}
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-xs text-text-muted">
              {property.transactionType === "sale"
                ? "Total Asking Price"
                : "Commercial Rent / Month"}
            </p>
            <p className="text-3xl font-bold text-primary-navy tracking-tight">
              {property.priceFormatted}
            </p>
            {property.estimatedRentalYield && (
              <p className="text-xs font-bold text-success-green mt-0.5 flex items-center md:justify-end gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Estimated Yield: {property.estimatedRentalYield}
              </p>
            )}
            {property.maintenanceCharges && (
              <p className="text-xs text-text-muted mt-0.5">
                Maintenance: {property.maintenanceCharges}
              </p>
            )}
          </div>
        </div>

        {/* Media Gallery */}
        {property.images.length > 0 || property.image ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`${property.images.length > 1 ? "md:col-span-3" : "md:col-span-4"} relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-200 border border-border-default shadow-soft`}>
              <Image
                src={property.images[activeImageIndex] || property.image}
                alt={property.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 75vw"
                className="object-cover"
              />
            </div>

            {property.images.length > 1 && (
              <div className="grid grid-cols-3 md:grid-cols-1 gap-3">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-16/10 md:aspect-auto md:h-28 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? "border-accent-gold ring-2 ring-accent-gold/30"
                        : "border-border-default hover:border-border-dark opacity-80 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      sizes="20vw"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-64 sm:h-80 rounded-2xl border border-border-default bg-slate-100/70 flex flex-col items-center justify-center text-slate-400 p-6 text-center select-none">
            <Building2 className="w-12 h-12 opacity-40 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No photos uploaded for this commercial property</p>
            <p className="text-xs text-slate-400 mt-0.5">Contact the seller for more details or to schedule a site inspection.</p>
          </div>
        )}

        {/* Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 items-start">
          {/* Main Details (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Commercial Specs Card */}
            <Card className="p-6">
              <h2 className="text-base font-bold text-primary-navy mb-4 pb-2 border-b border-border-subtle flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-accent-gold" />
                Technical & Architectural Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-light border border-border-subtle">
                  <Maximize2 className="w-5 h-5 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-text-muted block">Carpet Area</span>
                    <strong className="text-text-primary font-semibold text-sm">
                      {property.carpetArea}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-light border border-border-subtle">
                  <Building2 className="w-5 h-5 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-text-muted block">Super Built-up</span>
                    <strong className="text-text-primary font-semibold text-sm">
                      {property.builtUpArea || property.carpetArea}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-light border border-border-subtle">
                  <Layers className="w-5 h-5 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-text-muted block">Floor Level</span>
                    <strong className="text-text-primary font-semibold text-sm">
                      {property.floor}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-light border border-border-subtle">
                  <Car className="w-5 h-5 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-text-muted block">Parking Bays</span>
                    <strong className="text-text-primary font-semibold text-sm">
                      {property.parking}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-light border border-border-subtle">
                  <Briefcase className="w-5 h-5 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-text-muted block">Fit-out Status</span>
                    <strong className="text-text-primary font-semibold text-sm">
                      {property.furnishingStatus}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-light border border-border-subtle">
                  <Building className="w-5 h-5 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-text-muted block">Total Floors</span>
                    <strong className="text-text-primary font-semibold text-sm">
                      {property.totalFloors} Storeys
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-light border border-border-subtle">
                  <Clock className="w-5 h-5 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-text-muted block">Possession</span>
                    <strong className="text-text-primary font-semibold text-sm">
                      {property.possessionStatus}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-light border border-border-subtle">
                  <ShieldCheck className="w-5 h-5 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-text-muted block">Compliance</span>
                    <strong className="text-text-primary font-semibold text-sm">
                      RERA Approved
                    </strong>
                  </div>
                </div>
              </div>
            </Card>

            {/* Financial & Commercial Terms Card */}
            <Card className="p-6 space-y-4 border-accent-gold/40">
              <h2 className="text-base font-bold text-primary-navy pb-2 border-b border-border-subtle flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-gold" />
                Commercial Terms & Financial Model
              </h2>

              {property.transactionType === "sale" ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-bg-light border border-border-subtle">
                    <span className="text-text-muted block">Total Capital Price</span>
                    <strong className="text-primary-navy text-sm font-bold block">
                      {property.priceFormatted}
                    </strong>
                  </div>
                  <div className="p-3 rounded-lg bg-bg-light border border-border-subtle">
                    <span className="text-text-muted block">Estimated Yield</span>
                    <strong className="text-success-green text-sm font-bold block">
                      {property.estimatedRentalYield || "8.5% p.a."}
                    </strong>
                  </div>
                  <div className="p-3 rounded-lg bg-bg-light border border-border-subtle">
                    <span className="text-text-muted block">Estimated Monthly Rent</span>
                    <strong className="text-primary-navy text-sm font-bold block">
                      {property.estimatedMonthlyRent || "On Request"}
                    </strong>
                  </div>
                  <div className="p-3 rounded-lg bg-bg-light border border-border-subtle">
                    <span className="text-text-muted block">RERA Status</span>
                    <strong className="text-primary-navy text-sm font-bold block">
                      Verified Title
                    </strong>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-bg-light border border-border-subtle">
                    <span className="text-text-muted block">Monthly Lease Rent</span>
                    <strong className="text-primary-navy text-sm font-bold block">
                      {property.priceFormatted}
                    </strong>
                  </div>
                  <div className="p-3 rounded-lg bg-bg-light border border-border-subtle">
                    <span className="text-text-muted block">Security Deposit</span>
                    <strong className="text-primary-navy text-sm font-bold block">
                      {property.securityDeposit || "6 Months"}
                    </strong>
                  </div>
                  <div className="p-3 rounded-lg bg-bg-light border border-border-subtle">
                    <span className="text-text-muted block">CAM Charges</span>
                    <strong className="text-primary-navy text-sm font-bold block">
                      {property.maintenanceCharges || "₹ 15 / sq.ft"}
                    </strong>
                  </div>
                  <div className="p-3 rounded-lg bg-bg-light border border-border-subtle">
                    <span className="text-text-muted block">Lock-in Period</span>
                    <strong className="text-primary-navy text-sm font-bold block">
                      {property.lockInPeriod || "3 Years"}
                    </strong>
                  </div>
                </div>
              )}
            </Card>

            {/* Description & Corporate Highlights */}
            <Card className="p-6 space-y-4">
              <h2 className="text-base font-bold text-primary-navy pb-2 border-b border-border-subtle">
                About This Asset & Corporate Facilities
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                {property.description}
              </p>

              {/* RERA Guarantee Banner */}
              {property.isReraVerified && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-success-green-light border border-success-green-border mt-4">
                  <ShieldCheck className="w-6 h-6 text-success-green shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-success-green uppercase tracking-wide">
                      100% Verified Commercial Title & Occupancy Certificate
                    </h3>
                    <p className="text-xs text-text-primary mt-0.5">
                      RERA Registration No: <strong>{property.reraNumber || "RERA-VERIFIED-COMMERCIAL"}</strong>. Title deed and statutory approvals verified by TheVrindaGroup Corporate Legal Wing.
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Enterprise Amenities */}
            <Card className="p-6 space-y-4">
              <h2 className="text-base font-bold text-primary-navy pb-2 border-b border-border-subtle">
                Building & Campus Amenities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-bg-light text-xs font-medium text-text-primary"
                  >
                    <CheckCircle2 className="w-4 h-4 text-success-green shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Location Advantages & Connectivity */}
            <Card className="p-6 space-y-4">
              <h2 className="text-base font-bold text-primary-navy pb-2 border-b border-border-subtle">
                Business Connectivity & Transit Infrastructure
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-bg-light border border-border-subtle space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-primary-navy">
                    <Train className="w-4 h-4 text-accent-gold" />
                    Metro Station
                  </div>
                  <p className="text-text-secondary">
                    {property.nearbyFacilities?.metro || "Within 500m walking radius"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-bg-light border border-border-subtle space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-primary-navy">
                    <Plane className="w-4 h-4 text-accent-gold" />
                    International Airport
                  </div>
                  <p className="text-text-secondary">
                    {property.nearbyFacilities?.airport || "30 mins via dedicated arterial expressway"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-bg-light border border-border-subtle space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-primary-navy">
                    <Hotel className="w-4 h-4 text-accent-gold" />
                    5-Star Hotels & Dining
                  </div>
                  <p className="text-text-secondary">
                    {property.nearbyFacilities?.hotels || "JW Marriott, Grand Hyatt & business clubs"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-bg-light border border-border-subtle space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-primary-navy">
                    <Building2 className="w-4 h-4 text-accent-gold" />
                    Business Hub
                  </div>
                  <p className="text-text-secondary">
                    {property.nearbyFacilities?.businessHub || "Surrounded by Fortune 500 tech campuses"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-bg-light border border-border-subtle space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-primary-navy">
                    <Landmark className="w-4 h-4 text-accent-gold" />
                    Corporate Banking
                  </div>
                  <p className="text-text-secondary">
                    {property.nearbyFacilities?.banking || "All major national & foreign bank branches"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-bg-light border border-border-subtle space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-primary-navy">
                    <MapPin className="w-4 h-4 text-accent-gold" />
                    Highway Frontage
                  </div>
                  <p className="text-text-secondary">
                    {property.nearbyFacilities?.highway || "Direct signal-free connectivity"}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar (1 col) */}
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Contact Seller Card */}
            <Card className="p-6 border-accent-gold/40 shadow-soft-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-accent-gold-light text-[#9E6E18] border border-accent-gold-muted">
                  Corporate Leasing Desk
                </span>
                <ShieldCheck className="w-4 h-4 text-success-green" />
              </div>

              <div>
                <span className="text-xs text-text-muted">Direct Representation:</span>
                <h3 className="text-base font-bold text-primary-navy">
                  {property.sellerName}
                </h3>
                <p className="text-xs text-success-green font-semibold mt-0.5">
                  Verified Institutional Representative
                </p>
              </div>

              <div className="p-3 rounded-lg bg-bg-light text-xs text-text-secondary space-y-1">
                <p>
                  <strong>Property ID:</strong> {property.id}
                </p>
                <p>
                  <strong>Carpet Area:</strong> {property.carpetArea}
                </p>
                <p>
                  <strong>{property.transactionType === "sale" ? "Price" : "Rent"}:</strong>{" "}
                  {property.priceFormatted}
                </p>
              </div>

              <Button
                variant="primary"
                className="w-full h-11 text-xs font-bold shadow-soft"
                onClick={() => setIsEnquiryOpen(true)}
                leftIcon={<PhoneCall className="w-4 h-4" />}
              >
                Request Proposal & Floor Plan
              </Button>

              <Button
                variant="outline"
                className="w-full h-10 text-xs font-semibold"
                onClick={() => setIsScheduleOpen(true)}
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
              >
                Book Commercial Walkthrough
              </Button>

              <p className="text-[11px] text-text-muted text-center leading-tight">
                Enterprise NDA protected. Direct consultation with corporate managers.
              </p>
            </Card>

            {/* Quick Inspection Card */}
            <Card className="p-6 space-y-3.5 border-border-default">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-gold" />
                <h3 className="text-sm font-bold text-primary-navy">
                  Quick Site Inspection
                </h3>
              </div>

              {isVisitBooked ? (
                <div className="p-3 rounded-lg bg-success-green-light border border-success-green-border text-center space-y-1">
                  <CheckCircle2 className="w-5 h-5 text-success-green mx-auto" />
                  <p className="text-xs font-bold text-success-green">
                    Inspection Registered!
                  </p>
                  <p className="text-[11px] text-text-secondary">
                    Our leasing director will coordinate your visit on {visitDate} at {visitSlot}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookVisit} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-text-secondary block mb-1">
                      Inspection Date
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
                    className="w-full h-10 text-xs font-bold hover:border-primary-navy"
                  >
                    Confirm Walkthrough
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>

        {/* Similar Commercial Properties Section */}
        {similarCommercial.length > 0 && (
          <div className="pt-10 border-t border-border-default space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent-gold-hover">
                  Explore More Commercial Assets
                </span>
                <h3 className="heading-section text-primary-navy">
                  Similar Verified Spaces in {property.city}
                </h3>
              </div>

              <Link href="/commercial">
                <Button variant="outline" size="sm" className="text-xs font-bold">
                  View All &rarr;
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarCommercial.map((p) => (
                <CommercialPropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        )}
      </Container>

      {/* Direct Contact Modal */}
      <CommercialEnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        property={property}
      />

      {/* Full Schedule Visit Modal */}
      <ScheduleCommercialVisitModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        property={property}
      />
    </div>
  );
}

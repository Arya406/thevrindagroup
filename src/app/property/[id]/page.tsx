"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Maximize,
  BedDouble,
  Bath,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  Building,
  Heart,
  Share2,
  Compass,
  Car,
  Layers,
  Calculator,
  Train,
  Sparkles,
  Clock,
  Sofa,
  Users,
  Briefcase,
  Hospital,
} from "lucide-react";
import {
  Container,
  Button,
  ReraBadge,
  OwnerBadge,
  AgentBadge,
  Card,
  Input,
} from "@/components/ui";
import { MOCK_PROPERTIES } from "@/data/mockProperties";
import { MOCK_RENTALS } from "@/data/mockRentals";
import { PropertyCard } from "@/components/marketplace/PropertyCard";
import { ContactModal } from "@/components/marketplace/ContactModal";
import { RentEnquiryModal } from "@/components/rent/RentEnquiryModal";

interface DisplayProperty {
  id: string;
  title: string;
  price: string;
  priceNumeric: number;
  bhk: string | number;
  bhkString?: string;
  bathrooms: number;
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

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params?.id as string;

  // Check in mock rentals first, then mock properties
  const rentalItem = MOCK_RENTALS.find((r) => r.id === propertyId);
  const isRental = Boolean(rentalItem);

  const rawProperty = MOCK_PROPERTIES.find((p) => p.id === propertyId) || MOCK_PROPERTIES[0];

  const property: DisplayProperty = rentalItem
    ? {
        id: rentalItem.id,
        title: rentalItem.title,
        price: rentalItem.formattedRent,
        priceNumeric: rentalItem.monthlyRent,
        bhk: rentalItem.bhkNumeric,
        bhkString: rentalItem.bhk,
        bathrooms: rentalItem.bathrooms,
        carpetArea: rentalItem.carpetArea,
        location: rentalItem.location,
        city: rentalItem.city,
        address: rentalItem.address,
        propertyType: rentalItem.propertyType,
        listingType: "rent",
        isReraVerified: rentalItem.isReraVerified,
        reraNumber: "RERA-VERIFIED-RENTAL",
        sellerType: rentalItem.sellerType,
        sellerName: rentalItem.sellerName,
        sellerPhone: rentalItem.sellerPhone,
        isFeatured: rentalItem.isFeatured,
        image: rentalItem.image,
        images: rentalItem.images,
        description: rentalItem.description,
        furnishingStatus: rentalItem.furnishingStatus,
        possessionStatus: rentalItem.availability,
        floor: rentalItem.floor,
        facing: rentalItem.facing,
        parking: rentalItem.parking,
        amenities: rentalItem.amenities,
        postedDate: rentalItem.postedDate,
        securityDeposit: rentalItem.securityDeposit,
        maintenanceCharges: rentalItem.maintenanceCharges,
        noticePeriod: rentalItem.noticePeriod,
        tenantPreference: rentalItem.tenantPreference,
        nearbyFacilities: rentalItem.nearbyFacilities,
      }
    : {
        id: rawProperty.id,
        title: rawProperty.title,
        price: rawProperty.price,
        priceNumeric: rawProperty.priceNumeric,
        bhk: rawProperty.bhk,
        bhkString: `${rawProperty.bhk} BHK`,
        bathrooms: rawProperty.bathrooms,
        carpetArea: rawProperty.carpetArea,
        location: rawProperty.location,
        city: rawProperty.city,
        address: rawProperty.address,
        propertyType: rawProperty.propertyType,
        listingType: rawProperty.listingType,
        isReraVerified: rawProperty.isReraVerified,
        reraNumber: rawProperty.reraNumber,
        sellerType: rawProperty.sellerType,
        sellerName: rawProperty.sellerName,
        sellerPhone: rawProperty.sellerPhone,
        isFeatured: rawProperty.isFeatured,
        image: rawProperty.image,
        images: rawProperty.images,
        description: rawProperty.description,
        furnishingStatus: rawProperty.furnishingStatus,
        possessionStatus: rawProperty.possessionStatus,
        floor: rawProperty.floor,
        facing: rawProperty.facing,
        parking: rawProperty.parking,
        amenities: rawProperty.amenities,
        postedDate: rawProperty.postedDate,
      };

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Site Visit State
  const [visitDate, setVisitDate] = useState("");
  const [visitSlot, setVisitSlot] = useState("11:00 AM - 01:00 PM");
  const [isVisitBooked, setIsVisitBooked] = useState(false);

  // EMI Calculator State (for sale listings)
  const [loanAmount, setLoanAmount] = useState(
    Math.round((property.priceNumeric || 5000000) * 0.8)
  );
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  const calculateEMI = () => {
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = tenureYears * 12;
    const emi =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
    return Math.round(emi);
  };

  const handleFavoriteToggle = () => {
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    setSaveToast(
      nextState
        ? "Property added to your shortlisted favorites!"
        : "Property removed from your favorites."
    );
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleBookVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitDate) {
      alert("Please choose a preferred date for the site visit.");
      return;
    }
    setIsVisitBooked(true);
  };

  // Similar Properties
  const similarProperties = MOCK_PROPERTIES.filter(
    (p) => p.id !== property.id && p.city === property.city
  ).slice(0, 3);

  return (
    <div className="py-8 bg-bg-light min-h-screen font-sans text-text-primary">
      <Container className="space-y-6">
        {/* Toast Notification */}
        {saveToast && (
          <div className="fixed top-20 right-6 z-50 rounded-xl bg-primary-navy text-white px-4 py-3 text-xs font-semibold shadow-soft-lg flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300">
            <Heart className="w-4 h-4 fill-error-red text-error-red" />
            <span>{saveToast}</span>
          </div>
        )}

        {/* Back Link & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={isRental ? "/rent" : "/buy"}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-text-secondary hover:text-primary-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {isRental ? "Rental Marketplace" : "Properties Search"}
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
              {isFavorite ? "Saved" : "Save Property"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Share2 className="w-4 h-4" />}
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard?.writeText(window.location.href);
                  alert("Property link copied to clipboard!");
                }
              }}
              className="text-xs font-semibold"
            >
              Share
            </Button>
          </div>
        </div>

        {/* Title & Badges Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-default pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {property.isReraVerified && <ReraBadge />}
              {property.sellerType === "owner" ? <OwnerBadge /> : <AgentBadge />}
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-white border border-border-default text-primary-navy uppercase tracking-wider">
                {property.propertyType}
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
              {isRental ? "Monthly Rent" : "Total Asking Price"}
            </p>
            <p className="text-3xl font-bold text-primary-navy tracking-tight">
              {property.price}
            </p>
            {isRental && property.securityDeposit && (
              <p className="text-xs font-medium text-text-secondary mt-0.5">
                Security Deposit:{" "}
                <strong className="text-primary-navy">
                  {property.securityDeposit}
                </strong>
              </p>
            )}
            {!isRental && (
              <p className="text-xs text-text-secondary mt-0.5">
                Approx. ₹{" "}
                {Math.round(
                  property.priceNumeric /
                    parseInt(property.carpetArea.replace(/[^0-9]/g, ""))
                ).toLocaleString("en-IN")}{" "}
                / sq.ft
              </p>
            )}
          </div>
        </div>

        {/* Media Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-200 border border-border-default shadow-soft">
            <Image
              src={property.images[activeImageIndex] || property.image}
              alt={property.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 75vw"
              className="object-cover"
            />
          </div>

          <div className="grid grid-cols-3 md:grid-cols-1 gap-3">
            {property.images.slice(0, 3).map((img, idx) => (
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
        </div>

        {/* Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 items-start">
          {/* Main Details (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Specs Card */}
            <Card className="p-6">
              <h2 className="text-base font-bold text-primary-navy mb-4 pb-2 border-b border-border-subtle">
                Overview & Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-light border border-border-subtle">
                  <Maximize className="w-5 h-5 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-text-muted block">Carpet Area</span>
                    <strong className="text-text-primary font-semibold text-sm">
                      {property.carpetArea}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-light border border-border-subtle">
                  <BedDouble className="w-5 h-5 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-text-muted block">Configuration</span>
                    <strong className="text-text-primary font-semibold text-sm">
                      {property.bhk} BHK
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-light border border-border-subtle">
                  <Bath className="w-5 h-5 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-text-muted block">Bathrooms</span>
                    <strong className="text-text-primary font-semibold text-sm">
                      {property.bathrooms} Baths
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-light border border-border-subtle">
                  <Building className="w-5 h-5 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-text-muted block">
                      {isRental ? "Availability" : "Possession"}
                    </span>
                    <strong className="text-text-primary font-semibold text-sm">
                      {property.possessionStatus}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-light border border-border-subtle">
                  <Layers className="w-5 h-5 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-text-muted block">Floor Level</span>
                    <strong className="text-text-primary font-semibold text-sm">
                      {property.floor || "High Floor"}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-light border border-border-subtle">
                  <Compass className="w-5 h-5 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-text-muted block">Facing</span>
                    <strong className="text-text-primary font-semibold text-sm">
                      {property.facing || "East Facing"}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-light border border-border-subtle">
                  <Car className="w-5 h-5 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-text-muted block">Parking</span>
                    <strong className="text-text-primary font-semibold text-sm">
                      {property.parking || "1 Covered"}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-light border border-border-subtle">
                  <Sofa className="w-5 h-5 text-accent-gold shrink-0" />
                  <div>
                    <span className="text-text-muted block">Furnishing</span>
                    <strong className="text-text-primary font-semibold text-sm">
                      {property.furnishingStatus}
                    </strong>
                  </div>
                </div>
              </div>
            </Card>

            {/* Rental Terms Card (If Rental) */}
            {isRental && (
              <Card className="p-6 space-y-4 border-accent-gold/40">
                <h2 className="text-base font-bold text-primary-navy pb-2 border-b border-border-subtle flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-gold" />
                  Rental Terms & Agreement Summary
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-bg-light border border-border-subtle">
                    <span className="text-text-muted block">Monthly Rent</span>
                    <strong className="text-primary-navy text-sm font-bold block">
                      {property.price}
                    </strong>
                  </div>
                  <div className="p-3 rounded-lg bg-bg-light border border-border-subtle">
                    <span className="text-text-muted block">Security Deposit</span>
                    <strong className="text-primary-navy text-sm font-bold block">
                      {property.securityDeposit || "2 Months"}
                    </strong>
                  </div>
                  <div className="p-3 rounded-lg bg-bg-light border border-border-subtle">
                    <span className="text-text-muted block">Maintenance</span>
                    <strong className="text-primary-navy text-sm font-bold block">
                      {property.maintenanceCharges || "Included"}
                    </strong>
                  </div>
                  <div className="p-3 rounded-lg bg-bg-light border border-border-subtle">
                    <span className="text-text-muted block">Notice Period</span>
                    <strong className="text-primary-navy text-sm font-bold block">
                      {property.noticePeriod || "1 Month"}
                    </strong>
                  </div>
                </div>

                {property.tenantPreference && (
                  <div className="pt-2 text-xs flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent-gold" />
                    <span className="text-text-secondary">
                      Tenant Preference:{" "}
                      <strong className="text-primary-navy">
                        {property.tenantPreference.join(", ")}
                      </strong>
                    </span>
                  </div>
                )}
              </Card>
            )}

            {/* Description & Highlights */}
            <Card className="p-6 space-y-4">
              <h2 className="text-base font-bold text-primary-navy pb-2 border-b border-border-subtle">
                About This Property
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                {property.description}
              </p>

              {/* RERA Guarantee Box */}
              {property.isReraVerified && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-success-green-light border border-success-green-border mt-4">
                  <ShieldCheck className="w-6 h-6 text-success-green shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-success-green uppercase tracking-wide">
                      100% Verified Legal Listing
                    </h3>
                    <p className="text-xs text-text-primary mt-0.5">
                      Direct owner profile confirmed with title deed check and zero broker fee guarantee.
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Amenities Card */}
            <Card className="p-6 space-y-4">
              <h2 className="text-base font-bold text-primary-navy pb-2 border-b border-border-subtle">
                Society & Project Amenities
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

            {/* Location & Neighborhood Advantage */}
            <Card className="p-6 space-y-4">
              <h2 className="text-base font-bold text-primary-navy pb-2 border-b border-border-subtle">
                Nearby Transit & Facilities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-bg-light border border-border-subtle space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-primary-navy">
                    <Train className="w-4 h-4 text-accent-gold" />
                    Metro Station
                  </div>
                  <p className="text-text-secondary">
                    {property.nearbyFacilities?.metro || "Within 1 km radius"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-bg-light border border-border-subtle space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-primary-navy">
                    <Briefcase className="w-4 h-4 text-accent-gold" />
                    IT & Business Hub
                  </div>
                  <p className="text-text-secondary">
                    {property.nearbyFacilities?.itParks || "10 mins to tech corridors"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-bg-light border border-border-subtle space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-primary-navy">
                    <Hospital className="w-4 h-4 text-accent-gold" />
                    Healthcare & Schools
                  </div>
                  <p className="text-text-secondary">
                    {property.nearbyFacilities?.hospitals || "5 mins to top multispecialty hospitals"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Home Loan EMI Calculator (Only for Buy) */}
            {!isRental && (
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                  <h2 className="text-base font-bold text-primary-navy flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-accent-gold" />
                    Home Loan EMI Calculator
                  </h2>
                  <span className="text-xs font-bold text-accent-gold-hover">
                    Estimated EMI: ₹ {calculateEMI().toLocaleString("en-IN")} / mo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">
                      Loan Amount (80% Default)
                    </label>
                    <Input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">
                      Interest Rate (% p.a.)
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-secondary block mb-1">
                      Loan Tenure (Years)
                    </label>
                    <Input
                      type="number"
                      value={tenureYears}
                      onChange={(e) => setTenureYears(Number(e.target.value))}
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar (1 col) */}
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Contact Seller Card */}
            <Card className="p-6 border-accent-gold/40 shadow-soft-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-accent-gold-light text-[#9E6E18] border border-accent-gold-muted">
                  Direct Seller Connect
                </span>
                <ShieldCheck className="w-4 h-4 text-success-green" />
              </div>

              <div>
                <span className="text-xs text-text-muted">Offered by:</span>
                <h3 className="text-base font-bold text-primary-navy">
                  {property.sellerName}
                </h3>
                <p className="text-xs text-success-green font-semibold mt-0.5">
                  Zero Brokerage Verified Profile
                </p>
              </div>

              <div className="p-3 rounded-lg bg-bg-light text-xs text-text-secondary space-y-1">
                <p>
                  <strong>Property ID:</strong> {property.id}
                </p>
                <p>
                  <strong>Location:</strong> {property.location}
                </p>
                <p>
                  <strong>{isRental ? "Monthly Rent" : "Price"}:</strong>{" "}
                  {property.price}
                </p>
              </div>

              <Button
                variant="primary"
                className="w-full h-11 text-xs font-bold shadow-soft"
                onClick={() => setIsContactOpen(true)}
                leftIcon={<PhoneCall className="w-4 h-4" />}
              >
                Contact {property.sellerType === "owner" ? "Owner" : "Agent"}
              </Button>

              <p className="text-[11px] text-text-muted text-center leading-tight">
                Free instant callback without spam. 100% privacy protected.
              </p>
            </Card>

            {/* Schedule a Free Site Visit */}
            <Card className="p-6 space-y-3.5 border-border-default">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-gold" />
                <h3 className="text-sm font-bold text-primary-navy">
                  Schedule a Site Visit
                </h3>
              </div>

              {isVisitBooked ? (
                <div className="p-3 rounded-lg bg-success-green-light border border-success-green-border text-center space-y-1">
                  <CheckCircle2 className="w-5 h-5 text-success-green mx-auto" />
                  <p className="text-xs font-bold text-success-green">
                    Site Visit Confirmed!
                  </p>
                  <p className="text-[11px] text-text-secondary">
                    Our relationship manager will coordinate your visit on {visitDate} at {visitSlot}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookVisit} className="space-y-3">
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
      {isRental && rentalItem ? (
        <RentEnquiryModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
          property={rentalItem}
        />
      ) : (
        <ContactModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
          property={rawProperty}
        />
      )}
    </div>
  );
}

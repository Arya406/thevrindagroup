"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Users,
  CalendarCheck,
  Eye,
  PlusCircle,
  ArrowRight,
  MapPin,
  Sparkles,
  Heart,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useAuth } from "@/lib/auth/auth-context";
import { EnquiryApiService, BackendPropertyEnquiry } from "@/lib/services/enquiry-api";
import { SiteVisitApiService } from "@/lib/services/site-visit-api";
import { PropertyApiService } from "@/lib/services/property-api";
import { FavoriteApiService } from "@/lib/services/favorite-api";
import { Property } from "@/types/property";
import { Lead, ManagedProperty } from "@/types/account";

function mapBackendEnquiryToLead(enq: BackendPropertyEnquiry): Lead {
  return {
    id: enq.id,
    name: enq.buyer?.name || "Verified Seeker",
    email: enq.buyer?.email || "seeker@thevrindagroup.com",
    phone: enq.buyer?.phone || "+91 98765 43210",
    propertyId: enq.propertyId,
    propertyTitle: enq.property.title,
    propertyLocation: enq.property.location
      ? `${enq.property.location.locality}, ${enq.property.location.city}`
      : "Bangalore",
    enquiryType: "Request Callback",
    message: enq.message || "I am interested in this property. Please share more details.",
    status: enq.status === "CONTACTED" ? "CONTACTED" : enq.status === "CLOSED" ? "CLOSED" : "NEW",
    createdAt: new Date(enq.createdAt).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}

function mapPropertyToManaged(p: Property): ManagedProperty {
  const category =
    p.propertyType === "commercial-office" || p.propertyType === "retail-shop"
      ? "commercial"
      : "residential";

  return {
    id: p.id,
    title: p.title,
    location: p.location || "Bangalore",
    city: p.city || "Bangalore",
    price: p.priceNumeric || 0,
    formattedPrice: p.price || "₹0",
    image:
      p.image ||
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    status: p.isApproved ? "ACTIVE" : "DRAFT",
    views: 0,
    enquiries: 0,
    saves: 0,
    visits: 0,
    postedAt: p.postedDate || "Recently",
    propertyType: p.propertyType,
    transactionType: p.listingType === "rent" ? "rent" : "sale",
    category,
    bhk: p.bhk ? `${p.bhk} BHK` : undefined,
    carpetArea: p.carpetArea || "1,200 sq.ft",
  };
}

export function OverviewStats() {
  const { currentUser, isAuthenticated } = useAuth();
  const displayName = currentUser?.name ? currentUser.name.split(" ")[0] : "Member";
  const canManageProperties =
    currentUser?.role === "OWNER" ||
    currentUser?.role === "AGENT" ||
    currentUser?.role === "ADMIN";

  const [realLeads, setRealLeads] = useState<Lead[]>([]);
  const [realProperties, setRealProperties] = useState<ManagedProperty[]>([]);
  const [totalEnquiriesCount, setTotalEnquiriesCount] = useState<number>(0);
  const [upcomingVisitsCount, setUpcomingVisitsCount] = useState<number>(0);
  const [activeListingsCount, setActiveListingsCount] = useState<number>(0);
  const [savedPropertiesCount, setSavedPropertiesCount] = useState<number>(0);

  useEffect(() => {
    if (isAuthenticated) {
      // 1. Fetch Enquiries (Available to all users)
      EnquiryApiService.getMyEnquiries({ limit: 5 })
        .then((res) => {
          if (res.enquiries) {
            setRealLeads(res.enquiries.map(mapBackendEnquiryToLead));
            setTotalEnquiriesCount(res.pagination.total);
          }
        })
        .catch(() => {
          // Fallback gracefully
        });

      // 2. Fetch Site Visits (Available to all users)
      SiteVisitApiService.getMySiteVisits({ limit: 10 })
        .then((res) => {
          if (res.siteVisits) {
            const upcoming = res.siteVisits.filter(
              (v) =>
                v.status === "REQUESTED" ||
                v.status === "CONFIRMED" ||
                v.status === "RESCHEDULED"
            ).length;
            setUpcomingVisitsCount(upcoming);
          }
        })
        .catch(() => {
          // Fallback gracefully
        });

      // 3. Fetch Favorites (Available to all users)
      FavoriteApiService.getMyFavorites({ limit: 1 })
        .then((res) => {
          if (res.pagination) {
            setSavedPropertiesCount(res.pagination.total);
          } else if (res.favorites) {
            setSavedPropertiesCount(res.favorites.length);
          }
        })
        .catch(() => {
          // Fallback gracefully
        });

      // 4. Fetch Owner Listings (if user can manage properties)
      if (canManageProperties) {
        PropertyApiService.getMyProperties({ limit: 10 })
          .then((res) => {
            if (res.properties) {
              const mapped = res.properties.map(mapPropertyToManaged);
              setRealProperties(mapped);
              const active = mapped.filter((p) => p.status === "ACTIVE").length;
              setActiveListingsCount(active);
            }
          })
          .catch(() => {
            // Fallback gracefully
          });
      }
    }
  }, [isAuthenticated, canManageProperties]);

  const activeProperties = realProperties.filter((p) => p.status === "ACTIVE").slice(0, 3);
  const displayLeads = realLeads.slice(0, 3);

  const statsList = canManageProperties
    ? [
        {
          title: "Saved Properties",
          value: savedPropertiesCount,
          subtitle: "Shortlisted listings",
          icon: Heart,
          color: "text-error-red",
          bg: "bg-error-red-light",
          href: "/account/saved",
        },
        {
          title: "My Enquiries",
          value: totalEnquiriesCount,
          subtitle: "Active conversations",
          icon: Users,
          color: "text-primary-navy",
          bg: "bg-primary-navy/10",
          href: "/account/leads",
        },
        {
          title: "Scheduled Visits",
          value: upcomingVisitsCount,
          subtitle: "Upcoming walkthroughs",
          icon: CalendarCheck,
          color: "text-[#9E6E18]",
          bg: "bg-accent-gold-light",
          href: "/account/visits",
        },
        {
          title: "My Active Listings",
          value: activeListingsCount,
          subtitle: "Live in marketplace",
          icon: Building2,
          color: "text-success-green",
          bg: "bg-success-green-light",
          href: "/account/properties",
        },
      ]
    : [
        {
          title: "Saved Properties",
          value: savedPropertiesCount,
          subtitle: "Shortlisted listings",
          icon: Heart,
          color: "text-error-red",
          bg: "bg-error-red-light",
          href: "/account/saved",
        },
        {
          title: "My Enquiries",
          value: totalEnquiriesCount,
          subtitle: "Active conversations",
          icon: Users,
          color: "text-primary-navy",
          bg: "bg-primary-navy/10",
          href: "/account/leads",
        },
        {
          title: "Scheduled Visits",
          value: upcomingVisitsCount,
          subtitle: "Upcoming walkthroughs",
          icon: CalendarCheck,
          color: "text-[#9E6E18]",
          bg: "bg-accent-gold-light",
          href: "/account/visits",
        },
        {
          title: "Account Status",
          value: "Verified",
          subtitle: `${currentUser?.role || "Member"} Account`,
          icon: Sparkles,
          color: "text-success-green",
          bg: "bg-success-green-light",
          href: "/account/profile",
        },
      ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary-navy to-dark-navy p-6 sm:p-8 text-white relative overflow-hidden shadow-soft-md">
        <div className="absolute right-0 top-0 w-80 h-80 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-accent-gold/20 text-accent-gold border border-accent-gold/30">
              <Sparkles className="w-3.5 h-3.5" />
              {canManageProperties ? "Owner & Seeker Command Center" : "Buyer Discovery & Account Center"}
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {displayName}!
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-lg">
              {canManageProperties
                ? "Manage your saved properties, track your property inquiries, inspect site visits, and oversee your marketplace listings."
                : "Manage your shortlisted properties, track your inquiries, and inspect upcoming site visit appointments."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <Link href="/buy">
              <Button
                variant="outline"
                size="md"
                leftIcon={<Search className="w-4 h-4" />}
                className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-soft-xs"
              >
                Browse Properties
              </Button>
            </Link>

            <Link href="/post-property">
              <Button
                variant="primary"
                size="md"
                leftIcon={<PlusCircle className="w-4 h-4" />}
                className="text-xs font-bold shadow-soft-xs"
              >
                List Property FREE
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsList.map((st) => {
          const Icon = st.icon;
          return (
            <Link
              key={st.title}
              href={st.href}
              className="rounded-2xl border border-border-default bg-white p-4 sm:p-5 shadow-soft hover:shadow-soft-md hover:border-border-dark transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-secondary">
                  {st.title}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${st.bg} ${st.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="pt-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-primary-navy group-hover:text-accent-gold-hover transition-colors">
                  {st.value}
                </div>
                <div className="text-[11px] text-text-muted mt-0.5">
                  {st.subtitle}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2-Column: Recent Leads & Active Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads Box */}
        <div className="rounded-2xl border border-border-default bg-white p-5 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div>
              <h3 className="text-sm font-bold text-primary-navy">
                Recent Leads & Enquiries
              </h3>
              <p className="text-[11px] text-text-muted">
                Latest customer responses received
              </p>
            </div>
            <Link
              href="/account/leads"
              className="text-xs font-bold text-accent-gold-hover hover:underline flex items-center gap-1"
            >
              View All ({displayLeads.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {displayLeads.map((lead) => (
              <Link
                key={lead.id}
                href="/account/leads"
                className="p-3 rounded-xl border border-border-subtle bg-bg-light hover:bg-white hover:border-border-default transition-all block space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary-navy group-hover:text-accent-gold-hover transition-colors">
                    {lead.name}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      lead.status === "NEW"
                        ? "bg-success-green-light text-success-green border border-success-green-border"
                        : "bg-primary-navy/10 text-primary-navy"
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>

                <div className="text-[11px] text-text-secondary truncate">
                  Interested in: <strong className="text-text-primary">{lead.propertyTitle}</strong>
                </div>

                <div className="flex items-center justify-between text-[10px] text-text-muted pt-1 border-t border-border-subtle/60">
                  <span>{lead.enquiryType}</span>
                  <span>{lead.createdAt}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Active Listings Box */}
        <div className="rounded-2xl border border-border-default bg-white p-5 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div>
              <h3 className="text-sm font-bold text-primary-navy">
                Top Performing Listings
              </h3>
              <p className="text-[11px] text-text-muted">
                Live properties receiving inquiries
              </p>
            </div>
            <Link
              href="/account/properties"
              className="text-xs font-bold text-accent-gold-hover hover:underline flex items-center gap-1"
            >
              Manage All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {activeProperties.map((prop) => (
              <div
                key={prop.id}
                className="p-3 rounded-xl border border-border-subtle bg-bg-light flex items-center gap-3"
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-border-subtle bg-slate-100">
                  <Image
                    src={prop.image}
                    alt={prop.title}
                    fill
                    sizes="60px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <h4 className="text-xs font-bold text-primary-navy truncate">
                    {prop.title}
                  </h4>
                  <p className="text-[11px] text-text-secondary truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-accent-gold shrink-0" />
                    {prop.location}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-text-muted pt-0.5">
                    <span className="font-bold text-primary-navy">{prop.formattedPrice}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-text-muted" />
                      {prop.views} Views
                    </span>
                    <span>•</span>
                    <span>{prop.enquiries} Leads</span>
                  </div>
                </div>

                <Link href={prop.category === "commercial" ? `/commercial/property/${prop.id}` : `/property/${prop.id}`}>
                  <Button variant="outline" size="sm" className="text-[10px] h-7 px-2.5">
                    View
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewStats;

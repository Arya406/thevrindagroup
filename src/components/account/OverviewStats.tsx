"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Users,
  CalendarCheck,
  Eye,
  PlusCircle,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useAuth } from "@/lib/auth/auth-context";
import {
  MOCK_ACCOUNT_STATS,
  MOCK_MANAGED_PROPERTIES,
  MOCK_LEADS,
} from "@/data/account/mockAccountData";

export function OverviewStats() {
  const { currentUser } = useAuth();
  const displayName = currentUser?.name ? currentUser.name.split(" ")[0] : "Arya";

  const activeProperties = MOCK_MANAGED_PROPERTIES.filter((p) => p.status === "ACTIVE").slice(0, 3);
  const recentLeads = MOCK_LEADS.slice(0, 3);

  const statsList = [
    {
      title: "Active Listings",
      value: MOCK_ACCOUNT_STATS.activeListings,
      subtitle: "Live in Marketplace",
      icon: Building2,
      color: "text-primary-navy",
      bg: "bg-primary-navy/10",
      href: "/account/properties",
    },
    {
      title: "Pending Review",
      value: MOCK_ACCOUNT_STATS.pendingReview,
      subtitle: "In Verification Queue",
      icon: Clock,
      color: "text-accent-gold-hover",
      bg: "bg-accent-gold-light",
      href: "/account/properties",
    },
    {
      title: "Total Enquiries",
      value: MOCK_ACCOUNT_STATS.totalEnquiries,
      subtitle: "Verified Buyer Leads",
      icon: Users,
      color: "text-success-green",
      bg: "bg-success-green-light",
      href: "/account/leads",
    },
    {
      title: "Upcoming Visits",
      value: MOCK_ACCOUNT_STATS.upcomingVisits,
      subtitle: "Scheduled on-site tours",
      icon: CalendarCheck,
      color: "text-[#9E6E18]",
      bg: "bg-accent-gold-light",
      href: "/account/visits",
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
              Owner & Agent Control Center
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {displayName}!
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-lg">
              Here is what is happening across your listings, buyer inquiries, and upcoming inspections today.
            </p>
          </div>

          <Link href="/post-property" className="shrink-0">
            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="text-xs font-bold shadow-soft-xs"
            >
              Post New Property
            </Button>
          </Link>
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
              View All ({MOCK_LEADS.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentLeads.map((lead) => (
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

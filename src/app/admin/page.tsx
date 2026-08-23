"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  PhoneCall,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { AdminApiService } from "@/lib/services/admin-api";
import {
  DashboardSummaryResponse,
  DashboardLeadsResponse,
  DashboardPropertiesResponse,
  DashboardOwnerMetricItem,
} from "@/types/admin";

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [leadsData, setLeadsData] = useState<DashboardLeadsResponse | null>(null);
  const [propertiesData, setPropertiesData] = useState<DashboardPropertiesResponse | null>(null);
  const [owners, setOwners] = useState<DashboardOwnerMetricItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      AdminApiService.getDashboardSummary(),
      AdminApiService.getDashboardLeads(),
      AdminApiService.getDashboardProperties(),
      AdminApiService.getDashboardOwners(),
    ])
      .then(([sumRes, leadRes, propRes, ownRes]) => {
        if (isMounted) {
          setSummary(sumRes);
          setLeadsData(leadRes);
          setPropertiesData(propRes);
          setOwners(ownRes);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load admin dashboard metrics.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    Promise.all([
      AdminApiService.getDashboardSummary(),
      AdminApiService.getDashboardLeads(),
      AdminApiService.getDashboardProperties(),
      AdminApiService.getDashboardOwners(),
    ])
      .then(([sumRes, leadRes, propRes, ownRes]) => {
        setSummary(sumRes);
        setLeadsData(leadRes);
        setPropertiesData(propRes);
        setOwners(ownRes);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load admin dashboard metrics.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-border-default animate-pulse p-4" />
          ))}
        </div>
        <div className="h-64 bg-white rounded-2xl border border-border-default animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-error-red-light border border-error-red/20 rounded-2xl text-error-red space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load Admin Dashboard</span>
        </div>
        <p className="text-xs">{error}</p>
        <button
          type="button"
          onClick={handleRefresh}
          className="px-4 py-2 bg-error-red text-white text-xs font-bold rounded-xl hover:bg-error-red-hover transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-border-default shadow-soft-xs">
        <div>
          <h1 className="text-xl font-black text-primary-navy tracking-tight">Admin Overview &amp; CRM</h1>
          <p className="text-xs text-text-secondary">
            Live operations, lead routing pipelines, catalog health, and agent performance.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl border border-border-default text-xs font-semibold text-text-secondary hover:text-primary-navy hover:bg-bg-light transition-all flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-border-default shadow-soft-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">Total Users</span>
            <div className="w-9 h-9 rounded-xl bg-primary-navy/10 text-primary-navy flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-primary-navy">{summary?.users.total || 0}</p>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted font-medium">
              <span>{summary?.users.buyers || 0} Buyers</span>
              <span>•</span>
              <span>{summary?.users.owners || 0} Owners</span>
              <span>•</span>
              <span>{summary?.users.agents || 0} Agents</span>
            </div>
          </div>
        </div>

        {/* Properties */}
        <div className="bg-white p-5 rounded-2xl border border-border-default shadow-soft-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">Catalog Properties</span>
            <div className="w-9 h-9 rounded-xl bg-accent-gold/15 text-accent-gold-hover flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-primary-navy">{summary?.properties.total || 0}</p>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted font-medium">
              <span className="text-success-green font-bold">{summary?.properties.published || 0} Live</span>
              <span>•</span>
              <span>{summary?.properties.draft || 0} Draft/Review</span>
            </div>
          </div>
        </div>

        {/* Total Leads / Enquiries */}
        <div className="bg-white p-5 rounded-2xl border border-border-default shadow-soft-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">Buyer Enquiries</span>
            <div className="w-9 h-9 rounded-xl bg-success-green/10 text-success-green flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-primary-navy">{summary?.enquiries.total || 0}</p>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted font-medium">
              <span>{leadsData?.new || 0} New</span>
              <span>•</span>
              <span className="text-success-green font-bold">{leadsData?.conversionRate || 0}% Conversion</span>
            </div>
          </div>
        </div>

        {/* Site Visits */}
        <div className="bg-white p-5 rounded-2xl border border-border-default shadow-soft-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">Site Visits</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-primary-navy">{summary?.siteVisits.total || 0}</p>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted font-medium">
              <span>{summary?.siteVisits.confirmed || 0} Confirmed</span>
              <span>•</span>
              <span>{summary?.siteVisits.completed || 0} Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Pipeline Funnel */}
      <div className="bg-white p-6 rounded-2xl border border-border-default shadow-soft-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-primary-navy flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent-gold" />
            <span>Marketplace Lead Routing Pipeline</span>
          </h2>
          <Link
            href="/admin/leads"
            className="text-xs font-semibold text-accent-gold hover:text-accent-gold-hover flex items-center gap-1"
          >
            <span>Manage Leads</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-center">
            <p className="text-[10px] font-bold uppercase text-blue-700">New</p>
            <p className="text-lg font-black text-blue-900 mt-1">{leadsData?.new || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 text-center">
            <p className="text-[10px] font-bold uppercase text-amber-700">Contacted</p>
            <p className="text-lg font-black text-amber-900 mt-1">{leadsData?.contacted || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
            <p className="text-[10px] font-bold uppercase text-indigo-700">Interested</p>
            <p className="text-lg font-black text-indigo-900 mt-1">{leadsData?.interested || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-100 text-center">
            <p className="text-[10px] font-bold uppercase text-purple-700">Visits Set</p>
            <p className="text-lg font-black text-purple-900 mt-1">{leadsData?.siteVisitScheduled || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <p className="text-[10px] font-bold uppercase text-emerald-700">Closed</p>
            <p className="text-lg font-black text-emerald-900 mt-1">{leadsData?.closed || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-center">
            <p className="text-[10px] font-bold uppercase text-gray-600">Dropped</p>
            <p className="text-lg font-black text-gray-800 mt-1">{leadsData?.notInterested || 0}</p>
          </div>
        </div>
      </div>

      {/* Two-Column Matrix: Top Owners & High Activity Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Property Owners */}
        <div className="bg-white p-6 rounded-2xl border border-border-default shadow-soft-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-primary-navy flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary-navy" />
              <span>Top Property Owners</span>
            </h2>
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-accent-gold hover:text-accent-gold-hover"
            >
              View Roster
            </Link>
          </div>

          <div className="space-y-3">
            {owners.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">No owners registered yet.</p>
            ) : (
              owners.slice(0, 5).map((item, idx) => (
                <div
                  key={item.owner.id || idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-bg-light border border-border-subtle"
                >
                  <div>
                    <p className="text-xs font-bold text-primary-navy">{item.owner.name}</p>
                    <p className="text-[10px] text-text-muted">{item.owner.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-primary-navy">{item.propertiesCount}</span>
                    <span className="text-[10px] text-text-muted ml-1">Listings</span>
                    <p className="text-[10px] text-success-green font-semibold">
                      {item.enquiriesCount} Enquiries
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Most Active Listings */}
        <div className="bg-white p-6 rounded-2xl border border-border-default shadow-soft-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-primary-navy flex items-center gap-2">
              <Building2 className="w-4 h-4 text-accent-gold" />
              <span>High Velocity Properties</span>
            </h2>
            <Link
              href="/admin/properties"
              className="text-xs font-semibold text-accent-gold hover:text-accent-gold-hover"
            >
              Moderation Queue
            </Link>
          </div>

          <div className="space-y-3">
            {!propertiesData?.mostActiveProperties || propertiesData.mostActiveProperties.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">No active properties in database.</p>
            ) : (
              propertiesData.mostActiveProperties.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-bg-light border border-border-subtle"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-bold text-primary-navy truncate">{p.title}</p>
                    <p className="text-[10px] text-text-muted">Ref: {p.referenceCode}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-accent-gold/15 text-accent-gold-hover text-[10px] font-bold">
                      {p.enquiryCount} Leads
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

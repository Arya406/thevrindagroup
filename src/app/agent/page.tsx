"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { AgentApiService } from "@/lib/services/agent-api";
import { AgentDashboardMetrics } from "@/types/agent";

export default function AgentDashboardPage() {
  const [metrics, setMetrics] = useState<AgentDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    AgentApiService.getDashboard()
      .then((data) => {
        if (isMounted) {
          setMetrics(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load agent dashboard.");
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
    AgentApiService.getDashboard()
      .then((data) => {
        setMetrics(data);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load agent dashboard.");
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-error-red-light border border-error-red/20 rounded-2xl text-error-red space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load Agent Workspace</span>
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
          <h1 className="text-xl font-black text-primary-navy tracking-tight">Agent CRM &amp; Assigned Leads</h1>
          <p className="text-xs text-text-secondary">
            Personal lead pipeline, today&apos;s customer assignments, scheduled walkthroughs, and conversion metrics.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl border border-border-default text-xs font-semibold text-text-secondary hover:text-primary-navy hover:bg-bg-light transition-all flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assigned */}
        <div className="bg-white p-5 rounded-2xl border border-border-default shadow-soft-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">Assigned Leads</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-primary-navy">{metrics?.totalAssignedLeads || 0}</p>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted font-medium">
              <span>{metrics?.leadsReceivedToday || 0} Received Today</span>
            </div>
          </div>
        </div>

        {/* Deals Closed */}
        <div className="bg-white p-5 rounded-2xl border border-border-default shadow-soft-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">Deals Closed</span>
            <div className="w-9 h-9 rounded-xl bg-success-green/10 text-success-green flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-success-green">{metrics?.closedLeads || 0}</p>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted font-medium">
              <span>{metrics?.leadsClosedToday || 0} Closed Today</span>
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-border-default shadow-soft-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">Conversion Rate</span>
            <div className="w-9 h-9 rounded-xl bg-accent-gold/15 text-accent-gold-hover flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-primary-navy">{metrics?.conversionRate || 0}%</p>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted font-medium">
              <span>Closed vs Total Assigned</span>
            </div>
          </div>
        </div>

        {/* Active Site Visits */}
        <div className="bg-white p-5 rounded-2xl border border-border-default shadow-soft-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary">Site Tours</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-primary-navy">{metrics?.activeSiteVisits || 0}</p>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted font-medium">
              <span>{metrics?.completedSiteVisits || 0} Tours Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Distribution */}
      <div className="bg-white p-6 rounded-2xl border border-border-default shadow-soft-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-primary-navy">Personal Lead Pipeline</h2>
          <Link
            href="/agent/leads"
            className="text-xs font-semibold text-accent-gold hover:text-accent-gold-hover flex items-center gap-1"
          >
            <span>View All Assigned Leads</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-center">
            <p className="text-[10px] font-bold uppercase text-blue-700">New</p>
            <p className="text-lg font-black text-blue-900 mt-1">{metrics?.newLeads || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 text-center">
            <p className="text-[10px] font-bold uppercase text-amber-700">Contacted</p>
            <p className="text-lg font-black text-amber-900 mt-1">{metrics?.contactedLeads || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
            <p className="text-[10px] font-bold uppercase text-indigo-700">Interested</p>
            <p className="text-lg font-black text-indigo-900 mt-1">{metrics?.interestedLeads || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-100 text-center">
            <p className="text-[10px] font-bold uppercase text-purple-700">Visits Set</p>
            <p className="text-lg font-black text-purple-900 mt-1">{metrics?.siteVisitScheduled || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <p className="text-[10px] font-bold uppercase text-emerald-700">Closed</p>
            <p className="text-lg font-black text-emerald-900 mt-1">{metrics?.closedLeads || 0}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-center">
            <p className="text-[10px] font-bold uppercase text-gray-600">Dropped</p>
            <p className="text-lg font-black text-gray-800 mt-1">{metrics?.notInterestedLeads || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

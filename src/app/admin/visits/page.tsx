"use client";

import React, { useEffect, useState } from "react";
import {
  CalendarCheck,
} from "lucide-react";
import { AdminApiService } from "@/lib/services/admin-api";
import { AdminSafeSiteVisit, SiteVisitStatus } from "@/types/admin";

export default function AdminSiteVisitsPage() {
  const [visits, setVisits] = useState<AdminSafeSiteVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    AdminApiService.getSiteVisits({
      status: statusFilter !== "ALL" ? (statusFilter as SiteVisitStatus) : undefined,
      limit: 20,
    })
      .then((res) => {
        if (isMounted) {
          setVisits(res.siteVisits);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load site visits.");
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
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-border-default shadow-soft-xs">
        <div>
          <h1 className="text-xl font-black text-primary-navy tracking-tight">Site Walkthrough Oversight</h1>
          <p className="text-xs text-text-secondary">
            Monitor on-site property visits, buyer inspections, host scheduling, and completion rates.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {["ALL", "REQUESTED", "CONFIRMED", "COMPLETED", "RESCHEDULED", "CANCELLED_BY_BUYER", "NO_SHOW"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? "bg-primary-navy text-white shadow-soft-xs"
                  : "bg-bg-light text-text-secondary hover:text-primary-navy"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error-red-light border border-error-red/20 rounded-2xl text-error-red text-xs">
          {error}
        </div>
      )}

      {/* Visits Table */}
      <div className="bg-white rounded-2xl border border-border-default shadow-soft-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-text-muted">Loading scheduled visits...</div>
        ) : visits.length === 0 ? (
          <div className="p-12 text-center text-text-muted space-y-2">
            <CalendarCheck className="w-8 h-8 mx-auto text-accent-gold" />
            <p className="text-xs font-bold">No site visits found matching this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-light border-b border-border-default text-text-muted uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-4">Property</th>
                  <th className="p-4">Buyer Details</th>
                  <th className="p-4">Owner / Host</th>
                  <th className="p-4">Scheduled Date</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {visits.map((v) => (
                  <tr key={v.id} className="hover:bg-bg-light/60 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-primary-navy line-clamp-1">{v.property?.title}</p>
                      <p className="text-[10px] text-text-muted">
                        Ref: {v.property?.referenceCode} • {v.property?.city}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-primary-navy">{v.buyer?.name || "Buyer"}</p>
                      <p className="text-[10px] text-text-muted">{v.buyer?.email} • {v.buyer?.phone || ""}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-primary-navy">{v.owner?.name || "Host"}</p>
                      <p className="text-[10px] text-text-muted">{v.owner?.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-primary-navy">
                        {new Date(v.visitDate).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-text-muted">{v.preferredSlot}</p>
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          v.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : v.status === "CONFIRMED"
                            ? "bg-blue-100 text-blue-800"
                            : v.status === "REQUESTED"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

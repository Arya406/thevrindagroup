"use client";

import React, { useEffect, useState } from "react";
import {
  Award,
  RefreshCw,
} from "lucide-react";
import { AdminApiService } from "@/lib/services/admin-api";
import { AdminAgentPerformanceItem } from "@/types/admin";

export default function AdminPerformancePage() {
  const [agents, setAgents] = useState<AdminAgentPerformanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    AdminApiService.getAgentPerformance()
      .then((data) => {
        if (isMounted) {
          setAgents(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load agent performance matrix.");
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
    AdminApiService.getAgentPerformance()
      .then((data) => {
        setAgents(data);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load agent performance matrix.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-border-default shadow-soft-xs">
        <div>
          <h1 className="text-xl font-black text-primary-navy tracking-tight">Agent Performance &amp; Leaderboard</h1>
          <p className="text-xs text-text-secondary">
            Operational pipeline conversion rates, on-site walkthrough completions, and active lead volume.
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

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-border-default shadow-soft-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-text-muted">Loading performance statistics...</div>
        ) : error ? (
          <div className="p-6 bg-error-red-light text-error-red text-xs">{error}</div>
        ) : agents.length === 0 ? (
          <div className="p-12 text-center text-text-muted space-y-2">
            <Award className="w-8 h-8 mx-auto text-accent-gold" />
            <p className="text-xs font-bold">No active agents or lead assignments in database yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-light border-b border-border-default text-text-muted uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-4">Rank &amp; Agent</th>
                  <th className="p-4 text-center">Active Leads</th>
                  <th className="p-4 text-center">Contacted</th>
                  <th className="p-4 text-center">Site Tours</th>
                  <th className="p-4 text-center">Deals Closed</th>
                  <th className="p-4 text-right">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {agents.map((item, idx) => (
                  <tr key={item.agent.id} className="hover:bg-bg-light/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary-navy text-accent-gold font-bold text-xs flex items-center justify-center">
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-primary-navy">{item.agent.name}</p>
                          <p className="text-[10px] text-text-muted">{item.agent.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center font-bold text-primary-navy">
                      {item.activeLeads}
                    </td>
                    <td className="p-4 text-center text-text-secondary">
                      {item.contacted}
                    </td>
                    <td className="p-4 text-center text-text-secondary">
                      {item.siteVisits}
                    </td>
                    <td className="p-4 text-center font-bold text-success-green">
                      {item.closed}
                    </td>
                    <td className="p-4 text-right">
                      <span className="px-2.5 py-1 rounded-full bg-success-green/10 text-success-green font-bold text-xs">
                        {item.conversionRate}%
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

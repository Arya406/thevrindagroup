"use client";

import React, { useEffect, useState } from "react";
import {
  History,
  RefreshCw,
} from "lucide-react";
import { AdminApiService } from "@/lib/services/admin-api";
import { SafeAuditLog, AuditAction } from "@/types/admin";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<SafeAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    AdminApiService.getAuditLogs({
      action: actionFilter !== "ALL" ? (actionFilter as AuditAction) : undefined,
      limit: 20,
    })
      .then((res) => {
        if (isMounted) {
          setLogs(res.auditLogs);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load audit logs.");
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
  }, [actionFilter]);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    AdminApiService.getAuditLogs({
      action: actionFilter !== "ALL" ? (actionFilter as AuditAction) : undefined,
      limit: 20,
    })
      .then((res) => {
        setLogs(res.auditLogs);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load audit logs.");
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
          <h1 className="text-xl font-black text-primary-navy tracking-tight">Compliance &amp; System Audit Trail</h1>
          <p className="text-xs text-text-secondary">
            Immutable administrative action log recording user elevations, listing unpublishing, lead reassignments, and security events.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {["ALL", "USER_ROLE_CHANGE", "PROPERTY_UNPUBLISHED", "PROPERTY_ARCHIVED", "LEAD_ASSIGNED"].map((act) => (
            <button
              key={act}
              type="button"
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                actionFilter === act
                  ? "bg-primary-navy text-white shadow-soft-xs"
                  : "bg-bg-light text-text-secondary hover:text-primary-navy"
              }`}
            >
              {act === "ALL" ? "ALL ACTIONS" : act}
            </button>
          ))}
          <button
            type="button"
            onClick={handleRefresh}
            className="px-3.5 py-1.5 rounded-xl border border-border-default text-xs font-semibold text-text-secondary hover:text-primary-navy hover:bg-bg-light transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-error-red-light border border-error-red/20 rounded-2xl text-error-red text-xs">
          {error}
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-border-default shadow-soft-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-text-muted">Loading audit entries...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-text-muted space-y-2">
            <History className="w-8 h-8 mx-auto text-accent-gold" />
            <p className="text-xs font-bold">No audit entries found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-light border-b border-border-default text-text-muted uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-4">Action &amp; Entity</th>
                  <th className="p-4">Admin Actor</th>
                  <th className="p-4">Target Entity ID</th>
                  <th className="p-4">Details / Metadata</th>
                  <th className="p-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-bg-light/60 transition-colors">
                    <td className="p-4">
                      <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded bg-primary-navy/10 text-primary-navy uppercase">
                        {log.action}
                      </span>
                      <p className="text-[10px] font-bold text-text-secondary mt-1 uppercase">
                        {log.entityType}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-primary-navy">{log.actor?.name || "System Admin"}</p>
                      <p className="text-[10px] text-text-muted">{log.actor?.email}</p>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-text-muted select-all">
                      {log.entityId}
                    </td>
                    <td className="p-4">
                      <code className="text-[10px] bg-bg-light p-1.5 rounded border border-border-subtle text-text-secondary font-mono block max-w-xs truncate">
                        {JSON.stringify(log.metadata)}
                      </code>
                    </td>
                    <td className="p-4 text-right text-text-muted text-[10px]">
                      {new Date(log.createdAt).toLocaleString()}
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

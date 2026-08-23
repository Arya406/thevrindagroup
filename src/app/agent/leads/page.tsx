"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  X,
  Edit2,
} from "lucide-react";
import { AgentApiService } from "@/lib/services/agent-api";
import { AgentSafeLead } from "@/types/agent";
import { EnquiryStatus } from "@/types/admin";

export default function AgentLeadsPage() {
  const [leads, setLeads] = useState<AgentSafeLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Status Change Modal
  const [selectedLead, setSelectedLead] = useState<AgentSafeLead | null>(null);
  const [targetStatus, setTargetStatus] = useState<EnquiryStatus>("CONTACTED");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    AgentApiService.getLeads({
      status: statusFilter !== "ALL" ? (statusFilter as EnquiryStatus) : undefined,
      search: searchQuery.trim() || undefined,
      limit: 20,
    })
      .then((res) => {
        if (isMounted) {
          setLeads(res.leads);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load assigned leads.");
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
  }, [statusFilter, searchQuery]);

  const refreshLeads = async () => {
    try {
      const res = await AgentApiService.getLeads({
        status: statusFilter !== "ALL" ? (statusFilter as EnquiryStatus) : undefined,
        search: searchQuery.trim() || undefined,
        limit: 20,
      });
      setLeads(res.leads);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to refresh assigned leads.");
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setIsSubmitting(true);
    setModalError(null);
    try {
      await AgentApiService.updateLeadStatus(selectedLead.id, targetStatus);
      setActionSuccess(`Lead status updated to ${targetStatus}.`);
      setIsStatusModalOpen(false);
      await refreshLeads();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Failed to update lead status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {actionSuccess && (
        <div className="p-4 bg-success-green-light border border-success-green/20 rounded-2xl text-success-green flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button type="button" onClick={() => setActionSuccess(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-error-red-light border border-error-red/20 rounded-2xl text-error-red text-xs">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-border-default shadow-soft-xs">
        <div>
          <h1 className="text-xl font-black text-primary-navy tracking-tight">Assigned Leads Workspace</h1>
          <p className="text-xs text-text-secondary">
            Prospective buyer enquiries assigned to you. Track communication progress, book site walkthroughs, and record deals.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {["ALL", "NEW", "CONTACTED", "INTERESTED", "SITE_VISIT_SCHEDULED", "CLOSED", "NOT_INTERESTED"].map((st) => (
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

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-border-default shadow-soft-xs overflow-hidden space-y-4 p-4">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search leads by name, email, or property..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bg-light border border-border-default rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
          />
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-text-muted">Loading assigned leads...</div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-text-muted space-y-2">
            <Users className="w-8 h-8 mx-auto text-accent-gold" />
            <p className="text-xs font-bold">No leads assigned matching this criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-light border-b border-border-default text-text-muted uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Buyer Lead</th>
                  <th className="p-3">Inquired Property</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Assignment Notes</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-bg-light/60 transition-colors">
                    <td className="p-3">
                      <p className="font-bold text-primary-navy">{lead.buyer?.name || lead.name || "Buyer"}</p>
                      <p className="text-[10px] text-text-muted">{lead.buyer?.email || lead.email || ""} • {lead.buyer?.phone || lead.phone || ""}</p>
                      <p className="text-[10px] text-text-secondary mt-1 italic line-clamp-1">
                        &quot;{lead.message}&quot;
                      </p>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-primary-navy line-clamp-1">
                        {lead.property?.title || "Property Listing"}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        Ref: {lead.property?.referenceCode} • {lead.property?.city}
                      </p>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          lead.status === "NEW"
                            ? "bg-blue-100 text-blue-800"
                            : lead.status === "CONTACTED"
                            ? "bg-amber-100 text-amber-800"
                            : lead.status === "INTERESTED"
                            ? "bg-indigo-100 text-indigo-800"
                            : lead.status === "SITE_VISIT_SCHEDULED"
                            ? "bg-purple-100 text-purple-800"
                            : lead.status === "CLOSED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-3 text-text-muted text-[10px]">
                      {lead.currentAssignment?.reason || "Routed by Agency"}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLead(lead);
                          setTargetStatus(lead.status);
                          setIsStatusModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-primary-navy text-white hover:bg-primary-navy-light text-[10px] font-bold transition-all flex items-center gap-1 ml-auto"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Update Status</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* STATUS UPDATE MODAL */}
      {isStatusModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-soft-xl border border-border-default space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-primary-navy">Update Lead Status</h3>
              <button type="button" onClick={() => setIsStatusModalOpen(false)} className="text-text-muted hover:text-primary-navy">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-error-red-light border border-error-red/20 rounded-xl text-error-red text-xs">
                {modalError}
              </div>
            )}

            <div className="p-3 rounded-xl bg-bg-light border border-border-subtle text-xs">
              <p className="font-bold text-primary-navy">Buyer: {selectedLead.buyer?.name || selectedLead.name || "Buyer"}</p>
              <p className="text-[10px] text-text-muted">{selectedLead.buyer?.email || selectedLead.email} • {selectedLead.buyer?.phone || selectedLead.phone || ""}</p>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Select Pipeline Stage</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as EnquiryStatus)}
                  className="w-full px-3 py-2 bg-bg-light border border-border-default rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
                >
                  <option value="CONTACTED">CONTACTED (Follow-up initiated)</option>
                  <option value="INTERESTED">INTERESTED (Buyer interested, discussing property)</option>
                  <option value="SITE_VISIT_SCHEDULED">SITE_VISIT_SCHEDULED (Tour scheduled)</option>
                  <option value="CLOSED">CLOSED (Transaction completed successfully)</option>
                  <option value="NOT_INTERESTED">NOT_INTERESTED (Buyer dropped)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-bg-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-primary-navy text-white text-xs font-bold hover:bg-primary-navy-light disabled:opacity-50"
                >
                  {isSubmitting ? "Updating..." : "Save Pipeline Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

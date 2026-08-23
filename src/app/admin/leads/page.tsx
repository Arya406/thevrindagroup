"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  RotateCcw,
  UserMinus,
  Sparkles,
  CheckCircle2,
  X,
} from "lucide-react";
import { AdminApiService } from "@/lib/services/admin-api";
import {
  AdminSafeEnquiry,
  EnquiryStatus,
} from "@/types/admin";

export default function AdminLeadsPage() {
  const [enquiries, setEnquiries] = useState<AdminSafeEnquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modals state
  const [selectedEnquiry, setSelectedEnquiry] = useState<AdminSafeEnquiry | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isReassignOpen, setIsReassignOpen] = useState(false);

  // Assignment Form State
  const [agentId, setAgentId] = useState("");
  const [assignReason, setAssignReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    AdminApiService.getEnquiries({
      status: statusFilter !== "ALL" ? (statusFilter as EnquiryStatus) : undefined,
      limit: 20,
    })
      .then((res) => {
        if (isMounted) {
          setEnquiries(res.enquiries);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load enquiries.");
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

  const refreshLeads = async () => {
    try {
      const res = await AdminApiService.getEnquiries({
        status: statusFilter !== "ALL" ? (statusFilter as EnquiryStatus) : undefined,
        limit: 20,
      });
      setEnquiries(res.enquiries);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to refresh enquiries.");
    }
  };

  const handleManualAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry || !agentId) return;
    setIsSubmitting(true);
    setModalError(null);
    try {
      await AdminApiService.assignLead(selectedEnquiry.id, agentId.trim(), assignReason.trim() || undefined);
      setActionSuccess("Lead assigned to agent successfully.");
      setIsAssignOpen(false);
      setAgentId("");
      setAssignReason("");
      await refreshLeads();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Failed to assign lead.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry || !agentId || !assignReason) {
      setModalError("Reassignment reason is required.");
      return;
    }
    setIsSubmitting(true);
    setModalError(null);
    try {
      await AdminApiService.reassignLead(selectedEnquiry.id, agentId.trim(), assignReason.trim());
      setActionSuccess("Lead reassigned successfully.");
      setIsReassignOpen(false);
      setAgentId("");
      setAssignReason("");
      await refreshLeads();
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : "Failed to reassign lead.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassign = async (enquiry: AdminSafeEnquiry) => {
    const reason = prompt("Please enter the reason for unassigning this lead:");
    if (!reason) return;
    try {
      await AdminApiService.unassignLead(enquiry.id, reason);
      setActionSuccess("Lead unassigned.");
      await refreshLeads();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to unassign lead.");
    }
  };

  const handleAutoAssign = async (enquiry: AdminSafeEnquiry) => {
    try {
      const res = await AdminApiService.autoAssignLead(enquiry.id);
      setActionSuccess(`Lead auto-assigned to ${res.assignedAgent?.name || "Agent"}.`);
      await refreshLeads();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Auto-assignment failed (no available agents).");
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
          <h1 className="text-xl font-black text-primary-navy tracking-tight">Marketplace Lead CRM &amp; Routing</h1>
          <p className="text-xs text-text-secondary">
            Manage buyer interest, route enquiries to qualified broker agents, and trigger algorithmic assignment.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["ALL", "NEW", "CONTACTED", "INTERESTED", "SITE_VISIT_SCHEDULED", "CLOSED"].map((st) => (
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
      <div className="bg-white rounded-2xl border border-border-default shadow-soft-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-text-muted">Loading leads...</div>
        ) : enquiries.length === 0 ? (
          <div className="p-12 text-center text-text-muted space-y-2">
            <Users className="w-8 h-8 mx-auto text-accent-gold" />
            <p className="text-xs font-bold">No buyer enquiries found matching the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-light border-b border-border-default text-text-muted uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-4">Buyer / Lead</th>
                  <th className="p-4">Property</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assigned Agent</th>
                  <th className="p-4 text-right">Routing Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-bg-light/60 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-primary-navy">{enq.name}</p>
                      <p className="text-[10px] text-text-muted">{enq.email} • {enq.phone}</p>
                      <p className="text-[10px] text-text-secondary mt-1 line-clamp-1 italic">
                        &quot;{enq.message}&quot;
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-primary-navy line-clamp-1">
                        {enq.property?.title || "Property Enquiry"}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        Ref: {enq.property?.referenceCode || "N/A"} • {enq.property?.city || ""}
                      </p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          enq.status === "NEW"
                            ? "bg-blue-100 text-blue-800"
                            : enq.status === "CONTACTED"
                            ? "bg-amber-100 text-amber-800"
                            : enq.status === "INTERESTED"
                            ? "bg-indigo-100 text-indigo-800"
                            : enq.status === "SITE_VISIT_SCHEDULED"
                            ? "bg-purple-100 text-purple-800"
                            : enq.status === "CLOSED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {enq.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {enq.assignedAgent ? (
                        <div>
                          <p className="font-bold text-primary-navy">{enq.assignedAgent.name}</p>
                          <p className="text-[10px] text-text-muted">{enq.assignedAgent.email}</p>
                          <span className="text-[9px] font-semibold text-success-green">Assigned</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!enq.assignedAgent ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleAutoAssign(enq)}
                              className="px-2.5 py-1 rounded-lg bg-accent-gold/15 text-accent-gold-hover hover:bg-accent-gold/25 text-[10px] font-bold transition-all flex items-center gap-1"
                              title="Auto-Assign using capacity algorithm"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Auto</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEnquiry(enq);
                                setIsAssignOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-primary-navy text-white hover:bg-primary-navy-light text-[10px] font-bold transition-all flex items-center gap-1"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>Assign</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEnquiry(enq);
                                setIsReassignOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-border-default text-text-secondary hover:text-primary-navy text-[10px] font-bold flex items-center gap-1"
                              title="Reassign to another agent"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reassign</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUnassign(enq)}
                              className="p-1 rounded-lg text-error-red hover:bg-error-red-light"
                              title="Unassign lead"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ASSIGN LEAD MODAL */}
      {isAssignOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-soft-xl border border-border-default space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-primary-navy">Assign Lead to Agent</h3>
              <button type="button" onClick={() => setIsAssignOpen(false)} className="text-text-muted hover:text-primary-navy">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-error-red-light border border-error-red/20 rounded-xl text-error-red text-xs">
                {modalError}
              </div>
            )}

            <div className="p-3 rounded-xl bg-bg-light border border-border-subtle text-xs space-y-1">
              <p className="font-bold text-primary-navy">Lead: {selectedEnquiry.name}</p>
              <p className="text-[10px] text-text-muted">Property: {selectedEnquiry.property?.title}</p>
            </div>

            <form onSubmit={handleManualAssign} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Agent User UUID *</label>
                <input
                  type="text"
                  required
                  placeholder="Paste Agent User UUID"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-light border border-border-default rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Routing Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Reason or customer preference notes..."
                  value={assignReason}
                  onChange={(e) => setAssignReason(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-light border border-border-default rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-bg-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-primary-navy text-white text-xs font-bold hover:bg-primary-navy-light disabled:opacity-50"
                >
                  {isSubmitting ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REASSIGN LEAD MODAL */}
      {isReassignOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-soft-xl border border-border-default space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-primary-navy">Reassign Lead</h3>
              <button type="button" onClick={() => setIsReassignOpen(false)} className="text-text-muted hover:text-primary-navy">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-error-red-light border border-error-red/20 rounded-xl text-error-red text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleReassign} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">New Agent User UUID *</label>
                <input
                  type="text"
                  required
                  placeholder="Paste new Agent User UUID"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-light border border-border-default rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Reassignment Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Territory reassignment, workload balancing"
                  value={assignReason}
                  onChange={(e) => setAssignReason(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-light border border-border-default rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReassignOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-bg-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-primary-navy text-white text-xs font-bold hover:bg-primary-navy-light disabled:opacity-50"
                >
                  {isSubmitting ? "Reassigning..." : "Confirm Reassignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

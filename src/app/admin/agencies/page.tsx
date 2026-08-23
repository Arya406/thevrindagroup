"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Sliders,
  X,
  Building,
} from "lucide-react";
import { AdminApiService } from "@/lib/services/admin-api";
import {
  SafeAgency,
  SafeAgentProfile,
  AgencyMemberRole,
  AgentAvailability,
} from "@/types/admin";
import { ApiClientError } from "@/lib/api-client";

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState<SafeAgency[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<SafeAgency | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAgentProfileOpen, setIsAgentProfileOpen] = useState(false);
  const [targetAgentProfile, setTargetAgentProfile] = useState<SafeAgentProfile | null>(null);

  // Forms state
  const [agencyForm, setAgencyForm] = useState({
    name: "",
    code: "",
    email: "",
    phone: "",
    address: "",
    city: "Bangalore",
  });
  const [memberUserId, setMemberUserId] = useState("");
  const [memberRole, setMemberRole] = useState<AgencyMemberRole>("AGENT");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    AdminApiService.getAgencies({
      search: searchQuery.trim() || undefined,
    })
      .then((res) => {
        if (isMounted) {
          setAgencies(res.agencies);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load agencies.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery]);

  const refreshAgencies = async () => {
    try {
      const res = await AdminApiService.getAgencies({
        search: searchQuery.trim() || undefined,
      });
      setAgencies(res.agencies);
      if (selectedAgency) {
        const updated = res.agencies.find((a) => a.id === selectedAgency.id);
        if (updated) {
          const detail = await AdminApiService.getAgencyById(updated.id);
          setSelectedAgency(detail);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to refresh agencies.");
    }
  };

  const handleSelectAgency = async (agency: SafeAgency) => {
    try {
      const detail = await AdminApiService.getAgencyById(agency.id);
      setSelectedAgency(detail);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load agency details.");
    }
  };

  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);
    try {
      const created = await AdminApiService.createAgency({
        name: agencyForm.name.trim(),
        code: agencyForm.code.trim().toUpperCase(),
        email: agencyForm.email.trim() || undefined,
        phone: agencyForm.phone.trim() || undefined,
        address: agencyForm.address.trim() || undefined,
        city: agencyForm.city.trim() || undefined,
      });
      setActionSuccess(`Agency "${created.name}" created successfully.`);
      setIsCreateOpen(false);
      setAgencyForm({ name: "", code: "", email: "", phone: "", address: "", city: "Bangalore" });
      await refreshAgencies();
      await handleSelectAgency(created);
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.statusCode === 409) {
        setFormError("Agency code already exists. Please choose a unique alphanumeric code.");
      } else {
        setFormError(err instanceof Error ? err.message : "Failed to create agency.");
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleAgencyStatus = async (agency: SafeAgency) => {
    try {
      if (agency.isActive) {
        await AdminApiService.deactivateAgency(agency.id);
        setActionSuccess(`Agency "${agency.name}" deactivated.`);
      } else {
        await AdminApiService.activateAgency(agency.id);
        setActionSuccess(`Agency "${agency.name}" activated.`);
      }
      await refreshAgencies();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to toggle agency status.");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgency) return;
    setFormSubmitting(true);
    setFormError(null);
    try {
      await AdminApiService.addAgencyMember(selectedAgency.id, memberUserId.trim(), memberRole);
      setActionSuccess("Member added to agency successfully.");
      setIsAddMemberOpen(false);
      setMemberUserId("");
      await handleSelectAgency(selectedAgency);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to add member.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedAgency) return;
    if (!confirm("Are you sure you want to remove this member from the agency?")) return;
    try {
      await AdminApiService.removeAgencyMember(selectedAgency.id, memberId);
      setActionSuccess("Member removed from agency.");
      await handleSelectAgency(selectedAgency);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to remove member.");
    }
  };

  const handleOpenAgentProfile = async (userId: string) => {
    try {
      const profile = await AdminApiService.getAgentProfile(userId);
      setTargetAgentProfile(profile);
      setIsAgentProfileOpen(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load agent capacity profile.");
    }
  };

  const handleUpdateAgentProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAgentProfile) return;
    setFormSubmitting(true);
    setFormError(null);
    try {
      const updated = await AdminApiService.updateAgentProfile(targetAgentProfile.userId, {
        maxActiveLeads: targetAgentProfile.maxActiveLeads,
        availabilityStatus: targetAgentProfile.availabilityStatus,
        designation: targetAgentProfile.designation || undefined,
        specialization: targetAgentProfile.specialization || undefined,
      });
      setActionSuccess("Agent capacity & routing settings updated.");
      setTargetAgentProfile(updated);
      setIsAgentProfileOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to update agent profile.");
    } finally {
      setFormSubmitting(false);
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
          <h1 className="text-xl font-black text-primary-navy tracking-tight">Brokerage Agencies &amp; Teams</h1>
          <p className="text-xs text-text-secondary">
            Manage partner agencies, broker teams, agent rosters, and lead distribution capacity.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-primary-navy text-white text-xs font-bold hover:bg-primary-navy-light transition-all flex items-center gap-1.5 shadow-soft-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Agency</span>
        </button>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List: Agencies */}
        <div className="bg-white p-4 rounded-2xl border border-border-default shadow-soft-xs space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search agencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-bg-light border border-border-default rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
            />
          </div>

          <div className="space-y-2">
            {agencies.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-8">No agencies found.</p>
            ) : (
              agencies.map((agency) => {
                const isSelected = selectedAgency?.id === agency.id;
                return (
                  <button
                    key={agency.id}
                    type="button"
                    onClick={() => handleSelectAgency(agency)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-primary-navy/5 border-primary-navy"
                        : "bg-white border-border-subtle hover:bg-bg-light"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-primary-navy">{agency.name}</p>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          agency.isActive
                            ? "bg-success-green/10 text-success-green"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {agency.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted">
                      <span>Code: {agency.code}</span>
                      <span>•</span>
                      <span>{agency.city || "Bangalore"}</span>
                      {agency.memberCount !== undefined && (
                        <>
                          <span>•</span>
                          <span>{agency.memberCount} Members</span>
                        </>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail Panel: Agency Roster & Controls */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAgency ? (
            <div className="bg-white p-6 rounded-2xl border border-border-default shadow-soft-xs space-y-6">
              {/* Agency Summary Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-primary-navy">{selectedAgency.name}</h2>
                    <span className="px-2 py-0.5 bg-bg-light border border-border-default rounded text-[10px] font-bold text-text-secondary uppercase">
                      {selectedAgency.code}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    {selectedAgency.address ? `${selectedAgency.address}, ` : ""}
                    {selectedAgency.city || "Bangalore"} • {selectedAgency.email || "No email"} • {selectedAgency.phone || "No phone"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleAgencyStatus(selectedAgency)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedAgency.isActive
                        ? "border-error-red/30 text-error-red hover:bg-error-red-light"
                        : "border-success-green/30 text-success-green hover:bg-success-green-light"
                    }`}
                  >
                    {selectedAgency.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddMemberOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-primary-navy text-white text-xs font-bold hover:bg-primary-navy-light transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Member</span>
                  </button>
                </div>
              </div>

              {/* Members Roster Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Agency Roster &amp; Agents ({selectedAgency.members?.length || 0})
                </h3>

                {!selectedAgency.members || selectedAgency.members.length === 0 ? (
                  <p className="text-xs text-text-muted py-6 text-center">
                    No members assigned to this agency yet. Click &quot;Add Member&quot; with a user UUID.
                  </p>
                ) : (
                  <div className="divide-y divide-border-subtle border border-border-default rounded-xl overflow-hidden">
                    {selectedAgency.members.map((m) => (
                      <div key={m.id} className="p-3.5 flex items-center justify-between hover:bg-bg-light transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-navy text-accent-gold font-bold text-xs flex items-center justify-center">
                            {m.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-primary-navy">{m.user.name}</p>
                            <p className="text-[10px] text-text-muted">{m.user.email} • {m.user.phone || "No phone"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-navy/10 text-primary-navy uppercase">
                            {m.role}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleOpenAgentProfile(m.userId)}
                            className="p-1.5 rounded-lg border border-border-default text-text-secondary hover:text-primary-navy hover:bg-white text-xs font-semibold flex items-center gap-1"
                            title="Manage Agent Capacity"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Capacity</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveMember(m.id)}
                            className="p-1.5 rounded-lg text-error-red hover:bg-error-red-light transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-border-default text-center text-text-muted space-y-2">
              <Building className="w-8 h-8 mx-auto text-accent-gold" />
              <p className="text-xs font-bold">Select an agency from the left panel to inspect team roster.</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE AGENCY MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-soft-xl border border-border-default space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-primary-navy">Create Brokerage Agency</h3>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="text-text-muted hover:text-primary-navy">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-error-red-light border border-error-red/20 rounded-xl text-error-red text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateAgency} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Agency Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prestige Realty Partners"
                  value={agencyForm.name}
                  onChange={(e) => setAgencyForm({ ...agencyForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-light border border-border-default rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Agency Code * (Unique Alphanumeric)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PRESTIGE_BLR"
                  value={agencyForm.code}
                  onChange={(e) => setAgencyForm({ ...agencyForm, code: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-light border border-border-default rounded-xl text-xs uppercase focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="contact@agency.com"
                    value={agencyForm.email}
                    onChange={(e) => setAgencyForm({ ...agencyForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-bg-light border border-border-default rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={agencyForm.phone}
                    onChange={(e) => setAgencyForm({ ...agencyForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-bg-light border border-border-default rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">City</label>
                <input
                  type="text"
                  placeholder="Bangalore"
                  value={agencyForm.city}
                  onChange={(e) => setAgencyForm({ ...agencyForm, city: e.target.value })}
                  className="w-full px-3 py-2 bg-bg-light border border-border-default rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-bg-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-xl bg-primary-navy text-white text-xs font-bold hover:bg-primary-navy-light disabled:opacity-50"
                >
                  {formSubmitting ? "Creating..." : "Save Agency"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-soft-xl border border-border-default space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-primary-navy">Add Member to {selectedAgency?.name}</h3>
              <button type="button" onClick={() => setIsAddMemberOpen(false)} className="text-text-muted hover:text-primary-navy">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-error-red-light border border-error-red/20 rounded-xl text-error-red text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">User UUID *</label>
                <input
                  type="text"
                  required
                  placeholder="Paste registered User ID UUID"
                  value={memberUserId}
                  onChange={(e) => setMemberUserId(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-light border border-border-default rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Agency Member Role</label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value as AgencyMemberRole)}
                  className="w-full px-3 py-2 bg-bg-light border border-border-default rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
                >
                  <option value="AGENT">AGENT (Field Broker)</option>
                  <option value="MANAGER">MANAGER (Team Lead)</option>
                  <option value="ADMIN">ADMIN (Agency Head)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-bg-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-xl bg-primary-navy text-white text-xs font-bold hover:bg-primary-navy-light disabled:opacity-50"
                >
                  {formSubmitting ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AGENT CAPACITY & PROFILE MODAL */}
      {isAgentProfileOpen && targetAgentProfile && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-soft-xl border border-border-default space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="text-sm font-bold text-primary-navy">Agent Lead Routing Capacity</h3>
              <button type="button" onClick={() => setIsAgentProfileOpen(false)} className="text-text-muted hover:text-primary-navy">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-error-red-light border border-error-red/20 rounded-xl text-error-red text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleUpdateAgentProfile} className="space-y-3">
              <div className="p-3 rounded-xl bg-bg-light border border-border-subtle flex items-center justify-between text-xs">
                <span className="font-semibold text-text-secondary">Current Active Leads:</span>
                <span className="font-bold text-primary-navy">{targetAgentProfile.currentActiveLeads}</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Max Active Leads (1 - 200)</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  required
                  value={targetAgentProfile.maxActiveLeads}
                  onChange={(e) => setTargetAgentProfile({ ...targetAgentProfile, maxActiveLeads: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 bg-bg-light border border-border-default rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Availability Status</label>
                <select
                  value={targetAgentProfile.availabilityStatus}
                  onChange={(e) => setTargetAgentProfile({ ...targetAgentProfile, availabilityStatus: e.target.value as AgentAvailability })}
                  className="w-full px-3 py-2 bg-bg-light border border-border-default rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/40"
                >
                  <option value="AVAILABLE">AVAILABLE (Eligible for Auto-Routing)</option>
                  <option value="BUSY">BUSY (Temporary Halt)</option>
                  <option value="ON_LEAVE">ON_LEAVE (Paused)</option>
                  <option value="INACTIVE">INACTIVE (Offboarded)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAgentProfileOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-bg-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-xl bg-primary-navy text-white text-xs font-bold hover:bg-primary-navy-light disabled:opacity-50"
                >
                  {formSubmitting ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

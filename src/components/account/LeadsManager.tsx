"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Search,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui";
import { Lead, LeadStatus, LeadEnquiryType } from "@/types/account";
import { EmptyState } from "./EmptyState";
import { useAuth } from "@/lib/auth/auth-context";
import { EnquiryApiService, BackendPropertyEnquiry, BackendEnquiryStatus } from "@/lib/services/enquiry-api";

const LEAD_STATUS_OPTIONS: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "SITE VISIT",
  "NEGOTIATION",
  "CLOSED",
  "NOT INTERESTED",
];

const ENQUIRY_TYPES: LeadEnquiryType[] = [
  "Request Callback",
  "Schedule Visit",
  "Request More Information",
  "Request Pricing",
  "Request Floor Plan",
];

function mapBackendEnquiryToLead(enq: BackendPropertyEnquiry): Lead {
  let status: LeadStatus = "NEW";
  if (enq.status === "CONTACTED") status = "CONTACTED";
  else if (enq.status === "INTERESTED") status = "INTERESTED";
  else if (enq.status === "SITE_VISIT_SCHEDULED") status = "SITE VISIT";
  else if (enq.status === "CLOSED") status = "CLOSED";
  else if (enq.status === "NOT_INTERESTED") status = "NOT INTERESTED";

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
    status,
    createdAt: new Date(enq.createdAt).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}

export function LeadsManager() {
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const targetId = searchParams?.get("id");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [propertyFilter, setPropertyFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Fetch real user enquiries if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      EnquiryApiService.getMyEnquiries()
        .then((res) => {
          if (res.enquiries) {
            const mapped = res.enquiries.map(mapBackendEnquiryToLead);
            setLeads(mapped);
            if (targetId) {
              const match = mapped.find((l) => l.id === targetId);
              if (match) {
                setSelectedLead(match);
              }
            }
          }
        })
        .catch(() => {
          // Handled gracefully
        });
    }
  }, [isAuthenticated, targetId]);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  // Status Change Handler
  const handleUpdateStatus = async (leadId: string, nextStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: nextStatus } : l))
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }

    // If real UUID, trigger backend status update
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(leadId);
    if (isUuid) {
      let backendStatus: BackendEnquiryStatus = "NEW";
      if (nextStatus === "CONTACTED") backendStatus = "CONTACTED";
      else if (nextStatus === "INTERESTED") backendStatus = "INTERESTED";
      else if (nextStatus === "SITE VISIT") backendStatus = "SITE_VISIT_SCHEDULED";
      else if (nextStatus === "CLOSED") backendStatus = "CLOSED";
      else if (nextStatus === "NOT INTERESTED") backendStatus = "NOT_INTERESTED";

      try {
        await EnquiryApiService.updateEnquiryStatus(leadId, backendStatus);
      } catch {
        // Handled silently
      }
    }

    showToast(`Lead status updated to ${nextStatus}.`);
  };

  // Unique properties from user leads
  const uniqueProperties = Array.from(
    new Map(leads.map((l) => [l.propertyId, { id: l.propertyId, title: l.propertyTitle }])).values()
  );

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    // Status filter
    if (statusFilter !== "ALL" && lead.status !== statusFilter) return false;

    // Property filter
    if (propertyFilter !== "ALL" && lead.propertyId !== propertyFilter) return false;

    // Type filter
    if (typeFilter !== "ALL" && lead.enquiryType !== typeFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        lead.name.toLowerCase().includes(q) ||
        lead.propertyTitle.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        lead.phone.includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case "NEW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success-green-light text-success-green border border-success-green-border">
            <span className="w-1.5 h-1.5 rounded-full bg-success-green animate-pulse" />
            NEW
          </span>
        );
      case "CONTACTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            CONTACTED
          </span>
        );
      case "INTERESTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-[#9E6E18] border border-amber-200">
            INTERESTED
          </span>
        );
      case "SITE VISIT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            SITE VISIT
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            CLOSED
          </span>
        );
      case "NOT INTERESTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            NOT INTERESTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-bg-light text-text-secondary border border-border-default">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {actionToast && (
        <div className="fixed top-20 right-6 z-50 rounded-xl bg-primary-navy text-white px-4 py-3 text-xs font-semibold shadow-soft-lg flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-accent-gold" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-primary-navy tracking-tight">
            Leads & Enquiries
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Connect directly with verified buyers and tenants who submitted interest on your listings.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-success-green-light text-success-green border border-success-green-border">
          <Sparkles className="w-3.5 h-3.5" />
          {leads.filter((l) => l.status === "NEW").length} Uncontacted New Leads
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="rounded-2xl border border-border-default bg-white p-4 shadow-soft space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search leads by name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none shadow-soft-xs"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              {LEAD_STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>
          </div>

          {/* Property Filter */}
          <div>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none cursor-pointer truncate"
            >
              <option value="ALL">All Properties ({uniqueProperties.length})</option>
              {uniqueProperties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Enquiry Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Enquiry Types</option>
              {ENQUIRY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters link if active */}
        {(statusFilter !== "ALL" || propertyFilter !== "ALL" || typeFilter !== "ALL" || searchQuery) && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-border-subtle">
            <span className="text-text-muted">
              Showing {filteredLeads.length} of {leads.length} leads
            </span>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("ALL");
                setPropertyFilter("ALL");
                setTypeFilter("ALL");
                setSearchQuery("");
              }}
              className="text-accent-gold-hover font-bold hover:underline cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Leads List */}
      {filteredLeads.length > 0 ? (
        <div className="space-y-3">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              className="rounded-2xl border border-border-default bg-white p-4 sm:p-5 shadow-soft hover:shadow-soft-md hover:border-border-dark transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-bold text-primary-navy group-hover:text-accent-gold-hover transition-colors">
                    {lead.name}
                  </h3>
                  {getStatusBadge(lead.status)}
                </div>

                <div className="text-xs text-text-secondary">
                  Interested in: <strong className="text-text-primary">{lead.propertyTitle}</strong>
                </div>

                <p className="text-xs text-text-muted line-clamp-1 italic">
                  &ldquo;{lead.message}&rdquo;
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-text-muted">
                  <span className="font-semibold text-primary-navy">{lead.enquiryType}</span>
                  <span>•</span>
                  <span>{lead.phone}</span>
                  <span>•</span>
                  <span>{lead.createdAt}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border-subtle justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  className="text-xs font-semibold"
                >
                  View Lead
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No enquiries found"
          description="No leads match your current filter settings. When someone inquires, their request will appear here."
        />
      )}

      {/* Lead Detail Slide-over Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-dark-navy/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl h-full bg-white shadow-soft-2xl p-6 sm:p-8 overflow-y-auto space-y-6 flex flex-col justify-between animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border-default pb-4">
                <div>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                    Lead Inquiry Details
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-primary-navy flex items-center gap-2 mt-0.5">
                    {selectedLead.name}
                    {getStatusBadge(selectedLead.status)}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="p-2 rounded-xl text-text-muted hover:bg-bg-light hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Contact Action Buttons */}
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => showToast(`Initiating telephone call to ${selectedLead.phone}`)}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-bg-light hover:bg-white border border-border-default text-primary-navy transition-colors cursor-pointer shadow-soft-xs"
                >
                  <Phone className="w-4 h-4 text-accent-gold" />
                  Call
                </button>

                <button
                  type="button"
                  onClick={() => showToast(`Opening WhatsApp chat with ${selectedLead.phone}`)}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-bg-light hover:bg-white border border-border-default text-primary-navy transition-colors cursor-pointer shadow-soft-xs"
                >
                  <MessageSquare className="w-4 h-4 text-success-green" />
                  WhatsApp
                </button>

                <button
                  type="button"
                  onClick={() => showToast(`Preparing draft email to ${selectedLead.email}`)}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-bg-light hover:bg-white border border-border-default text-primary-navy transition-colors cursor-pointer shadow-soft-xs"
                >
                  <Mail className="w-4 h-4 text-accent-gold" />
                  Email
                </button>
              </div>

              {/* Status Selector Dropdown */}
              <div className="p-4 rounded-xl bg-bg-light border border-border-subtle space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                  Update Lead Progression Status:
                </label>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleUpdateStatus(selectedLead.id, e.target.value as LeadStatus)}
                  className="w-full h-10 px-3 rounded-lg border border-border-default bg-white text-xs font-bold text-primary-navy focus:border-accent-gold focus:outline-none cursor-pointer"
                >
                  {LEAD_STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property Snapshot */}
              <div className="p-4 rounded-xl border border-border-default bg-white shadow-soft-xs space-y-2">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                  Inquired Property
                </span>
                <h4 className="text-xs font-bold text-primary-navy">
                  {selectedLead.propertyTitle}
                </h4>
                <p className="text-[11px] text-text-secondary flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-accent-gold" />
                  {selectedLead.propertyLocation}
                </p>
              </div>

              {/* Customer Message */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                  Customer Message
                </span>
                <p className="text-xs text-text-primary leading-relaxed bg-bg-light p-4 rounded-xl border border-border-subtle">
                  {selectedLead.message}
                </p>
              </div>

              {/* Additional Meta */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-bg-light border border-border-subtle space-y-1">
                  <span className="text-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3 text-accent-gold" />
                    Preferred Time
                  </span>
                  <strong className="text-text-primary block font-semibold">
                    {selectedLead.preferredTime || "Anytime"}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-bg-light border border-border-subtle space-y-1">
                  <span className="text-text-muted flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-accent-gold" />
                    Enquiry Received
                  </span>
                  <strong className="text-text-primary block font-semibold">
                    {selectedLead.createdAt}
                  </strong>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-border-default flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateStatus(selectedLead.id, "CLOSED")}
                className="text-xs font-semibold"
              >
                Mark as Closed
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleUpdateStatus(selectedLead.id, "SITE VISIT");
                  showToast(`Site visit request created for ${selectedLead.name}`);
                }}
                className="text-xs font-bold shadow-soft-xs"
              >
                Schedule Site Visit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeadsManager;

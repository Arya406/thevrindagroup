"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  PhoneCall,
  CalendarCheck,
  Building2,
  Briefcase,
  Sparkles,
  AlertCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  X,
} from "lucide-react";
import { NotificationApiService } from "@/lib/services/notification-api";
import { AppNotification, NotificationType } from "@/types/notification";
import { useAuth } from "@/lib/auth/auth-context";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
  onUnreadCountChange: (count: number) => void;
}

export function NotificationCenter({
  isOpen,
  onClose,
  unreadCount,
  onUnreadCountChange,
}: NotificationCenterProps) {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch when opened or when filter changes
  useEffect(() => {
    let ignore = false;
    if (isOpen) {
      NotificationApiService.getNotifications({
        limit: 30,
        unread: filter === "UNREAD" ? true : undefined,
      })
        .then((res) => {
          if (!ignore) {
            setNotifications(res.notifications);
            setError(null);
            setIsLoading(false);
          }
        })
        .catch((err: unknown) => {
          if (!ignore) {
            setError(
              err instanceof Error ? err.message : "Failed to load notifications."
            );
            setIsLoading(false);
          }
        });
    }
    return () => {
      ignore = true;
    };
  }, [isOpen, filter]);

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await NotificationApiService.getNotifications({
        limit: 30,
        unread: filter === "UNREAD" ? true : undefined,
      });
      setNotifications(res.notifications);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load notifications."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Helper to mark single notification as read
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await NotificationApiService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, status: "READ", readAt: new Date().toISOString() } : n
        )
      );
      onUnreadCountChange(Math.max(0, unreadCount - 1));
    } catch {
      // Ignored
    }
  };

  // Helper to mark all as read
  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await NotificationApiService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          status: "READ",
          readAt: new Date().toISOString(),
        }))
      );
      onUnreadCountChange(0);
    } catch {
      // Ignored
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Helper to delete a notification
  const handleDeleteNotification = async (
    id: string,
    wasUnread: boolean,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await NotificationApiService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) {
        onUnreadCountChange(Math.max(0, unreadCount - 1));
      }
    } catch {
      // Ignored
    }
  };

  // Resolve target link based on notification type and user role
  const resolveTargetLink = (n: AppNotification): string | null => {
    const role = currentUser?.role;

    if (n.propertyId) {
      if (
        n.type === "PROPERTY_PUBLISHED" ||
        n.type === "PROPERTY_SOLD" ||
        n.type === "PROPERTY_RENTED"
      ) {
        return `/property/${n.propertyId}`;
      }
    }

    if (
      n.type === "ENQUIRY_CREATED" ||
      n.type === "ENQUIRY_STATUS_CHANGED"
    ) {
      if (role === "ADMIN") return "/admin/leads";
      if (role === "AGENT") return "/agent/leads";
      return n.enquiryId ? `/account/leads?id=${n.enquiryId}` : "/account/leads";
    }

    if (
      n.type.startsWith("SITE_VISIT_")
    ) {
      if (role === "ADMIN") return "/admin/visits";
      return "/account/visits";
    }

    if (
      n.type === "LEAD_ASSIGNED" ||
      n.type === "LEAD_REASSIGNED" ||
      n.type === "LEAD_UNASSIGNED"
    ) {
      if (role === "AGENT") return "/agent/leads";
      if (role === "ADMIN") return "/admin/leads";
      return n.enquiryId ? `/account/leads?id=${n.enquiryId}` : "/account/leads";
    }

    return null;
  };

  // Handle clicking on notification card
  const handleNotificationClick = async (n: AppNotification) => {
    if (n.status !== "READ") {
      await handleMarkAsRead(n.id);
    }
    const targetLink = resolveTargetLink(n);
    if (targetLink) {
      onClose();
      router.push(targetLink);
    }
  };

  // Visual icon & colors for notification type
  const getNotificationVisuals = (type: NotificationType) => {
    switch (type) {
      case "ENQUIRY_CREATED":
      case "ENQUIRY_STATUS_CHANGED":
        return {
          icon: PhoneCall,
          bg: "bg-blue-50 text-blue-600 border-blue-200",
          badge: "Lead Enquiry",
        };
      case "SITE_VISIT_REQUESTED":
      case "SITE_VISIT_CONFIRMED":
      case "SITE_VISIT_RESCHEDULED":
      case "SITE_VISIT_COMPLETED":
        return {
          icon: CalendarCheck,
          bg: "bg-emerald-50 text-emerald-600 border-emerald-200",
          badge: "Site Visit",
        };
      case "SITE_VISIT_CANCELLED":
      case "SITE_VISIT_NO_SHOW":
        return {
          icon: CalendarCheck,
          bg: "bg-rose-50 text-rose-600 border-rose-200",
          badge: "Visit Cancelled",
        };
      case "PROPERTY_PUBLISHED":
      case "PROPERTY_SOLD":
      case "PROPERTY_RENTED":
        return {
          icon: Building2,
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          badge: "Listing Update",
        };
      case "LEAD_ASSIGNED":
      case "LEAD_REASSIGNED":
        return {
          icon: Briefcase,
          bg: "bg-indigo-50 text-indigo-600 border-indigo-200",
          badge: "CRM Assignment",
        };
      case "LEAD_UNASSIGNED":
        return {
          icon: AlertCircle,
          bg: "bg-slate-100 text-slate-600 border-slate-200",
          badge: "Lead Released",
        };
      default:
        return {
          icon: Sparkles,
          bg: "bg-primary-navy/10 text-primary-navy border-primary-navy/20",
          badge: "Update",
        };
    }
  };

  // Format relative time
  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return past.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } catch {
      return "Recent";
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-[340px] sm:w-[420px] max-w-[calc(100vw-24px)] bg-white rounded-3xl border border-border-default shadow-soft-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-sans"
    >
      {/* Header */}
      <div className="p-4 bg-white border-b border-border-default flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-accent-gold/15 text-accent-gold-hover flex items-center justify-center font-bold">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-primary-navy tracking-tight flex items-center gap-1.5">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-accent-gold text-dark-navy text-[10px] font-black shadow-soft-xs">
                  {unreadCount > 99 ? "99+" : unreadCount} new
                </span>
              )}
            </h3>
            <p className="text-[10px] text-text-muted">
              Live property, lead &amp; visit alerts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
              className="text-[11px] font-bold text-accent-gold-hover hover:text-dark-navy hover:bg-accent-gold/10 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-primary-navy hover:bg-bg-light transition-colors"
            aria-label="Close notifications"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 pt-3 pb-2 bg-bg-light/60 border-b border-border-subtle flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-border-default shadow-soft-xs">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              filter === "ALL"
                ? "bg-primary-navy text-white shadow-soft-xs"
                : "text-text-secondary hover:text-primary-navy"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("UNREAD")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              filter === "UNREAD"
                ? "bg-primary-navy text-white shadow-soft-xs"
                : "text-text-secondary hover:text-primary-navy"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-1.5 text-text-muted hover:text-primary-navy hover:bg-white rounded-lg transition-colors border border-transparent hover:border-border-default"
          title="Refresh notifications"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-accent-gold" : ""}`} />
        </button>
      </div>

      {/* Content List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-border-subtle divide-opacity-60 overscroll-contain">
        {isLoading && notifications.length === 0 ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-border-default animate-pulse"
              >
                <div className="w-8 h-8 rounded-xl bg-bg-light shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 bg-bg-light rounded" />
                  <div className="h-2.5 w-full bg-bg-light rounded" />
                  <div className="h-2 w-1/4 bg-bg-light rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-error-red/10 border border-error-red/20 text-error-red flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-xs text-error-red font-semibold">{error}</p>
            <button
              type="button"
              onClick={handleRefresh}
              className="px-3 py-1.5 bg-primary-navy text-white text-xs font-bold rounded-xl hover:bg-primary-navy-light transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-success-green/10 text-success-green flex items-center justify-center mx-auto border border-success-green/20">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-primary-navy">You&apos;re all caught up!</p>
            <p className="text-[11px] text-text-muted max-w-[200px] mx-auto">
              {filter === "UNREAD"
                ? "No unread alerts. Check the 'All' tab to see past history."
                : "No notifications recorded yet. Activity will appear here."}
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            const visual = getNotificationVisuals(n.type);
            const VisualIcon = visual.icon;
            const isUnread = n.status !== "READ";
            const targetLink = resolveTargetLink(n);

            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-3.5 transition-all group flex items-start gap-3 cursor-pointer ${
                  isUnread
                    ? "bg-accent-gold/5 hover:bg-accent-gold/10"
                    : "bg-white hover:bg-bg-light/80"
                }`}
              >
                {/* Visual Icon Badge */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border shadow-soft-xs ${visual.bg}`}
                >
                  <VisualIcon className="w-4 h-4" />
                </div>

                {/* Body Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-1.5 py-0.2 rounded bg-bg-light border border-border-subtle shrink-0">
                        {visual.badge}
                      </span>
                      {isUnread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-gold-hover shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-text-muted font-medium flex items-center gap-0.5 shrink-0">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTimeAgo(n.createdAt)}
                    </span>
                  </div>

                  <h4
                    className={`text-xs tracking-tight line-clamp-1 ${
                      isUnread
                        ? "font-black text-primary-navy"
                        : "font-semibold text-text-primary"
                    }`}
                  >
                    {n.title}
                  </h4>

                  <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>

                  {/* Actions & Deep Link Indicator */}
                  <div className="pt-1 flex items-center justify-between gap-2">
                    {targetLink ? (
                      <span className="text-[10px] font-bold text-accent-gold-hover flex items-center gap-1 group-hover:underline">
                        <span>View Details</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    ) : (
                      <span />
                    )}

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {isUnread && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(n.id, e)}
                          className="p-1 rounded-lg text-text-muted hover:text-success-green hover:bg-success-green/10 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteNotification(n.id, isUnread, e)}
                        className="p-1 rounded-lg text-text-muted hover:text-error-red hover:bg-error-red/10 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-bg-light/60 border-t border-border-default text-center flex items-center justify-between px-4">
        <span className="text-[10px] text-text-muted">
          Auto-synchronized with live activity
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-[11px] font-bold text-text-secondary hover:text-primary-navy transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

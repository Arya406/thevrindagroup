"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Bell,
  CheckCircle,
  Camera,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  User as UserIcon,
  Lock,
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth/auth-context";
import { UserApiService } from "@/lib/services/user-api";
import { ApiClientError } from "@/lib/api-client";

interface LocalPreferences {
  emailNotifications: boolean;
  enquiryAlerts: boolean;
  visitReminders: boolean;
  companyName: string;
  companyWebsite: string;
}

const DEFAULT_PREFERENCES: LocalPreferences = {
  emailNotifications: true,
  enquiryAlerts: true,
  visitReminders: true,
  companyName: "",
  companyWebsite: "",
};

export function ProfileSettingsManager() {
  const { currentUser, updateUser, isAuthenticated, requireAuth } = useAuth();

  // Local Form Fields
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || "");
  const [role, setRole] = useState(currentUser?.role || "BUYER");
  const [preferences, setPreferences] = useState<LocalPreferences>(DEFAULT_PREFERENCES);

  const [isLoading, setIsLoading] = useState(!currentUser);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    UserApiService.getProfile()
      .then((user) => {
        if (isMounted) {
          setName(user.name);
          setEmail(user.email);
          setPhone(user.phone || "");
          setAvatarUrl(user.avatarUrl || user.avatar || "");
          setRole(user.role);
          setFetchError(null);
          updateUser(user);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg =
            err instanceof ApiClientError
              ? err.message
              : err instanceof Error
              ? err.message
              : "Failed to load user profile.";
          setFetchError(msg);
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
  }, [isAuthenticated, updateUser]);

  const handleRetry = () => {
    setIsLoading(true);
    setFetchError(null);

    UserApiService.getProfile()
      .then((user) => {
        setName(user.name);
        setEmail(user.email);
        setPhone(user.phone || "");
        setAvatarUrl(user.avatarUrl || user.avatar || "");
        setRole(user.role);
        updateUser(user);
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof ApiClientError
            ? err.message
            : err instanceof Error
            ? err.message
            : "Failed to load user profile.";
        setFetchError(msg);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleToggleNotification = (
    key: "emailNotifications" | "enquiryAlerts" | "visitReminders"
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      requireAuth({ message: "Sign in to save profile settings" });
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveToast(null);

    try {
      const res = await UserApiService.updateProfile({
        name: name.trim(),
        phone: phone.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
      });

      // Update auth context so headers/navbars reflect the new name/avatar
      updateUser(res.user);
      setName(res.user.name);
      setPhone(res.user.phone || "");
      setAvatarUrl(res.user.avatarUrl || res.user.avatar || "");

      setSaveToast(res.message || "Profile settings updated successfully.");
      setTimeout(() => setSaveToast(null), 3500);
    } catch (err: unknown) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Failed to save profile changes.";
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarPrompt = () => {
    const newUrl = prompt("Enter a valid image URL for your profile avatar:", avatarUrl);
    if (newUrl !== null) {
      setAvatarUrl(newUrl.trim());
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 right-6 z-50 rounded-xl bg-primary-navy text-white px-4 py-3 text-xs font-semibold shadow-soft-lg flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-accent-gold" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-primary-navy tracking-tight">
          Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
          Manage your account profile details, personal contact information, and notification preferences.
        </p>
      </div>

      {/* Fetch Error Banner */}
      {fetchError && (
        <div className="rounded-xl bg-error-red-light/80 border border-error-red/30 p-4 text-xs text-error-red flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs h-8"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="rounded-2xl border border-border-default bg-white p-6 sm:p-8 shadow-soft space-y-6 animate-pulse">
          <div className="flex items-center gap-4 pb-6 border-b border-border-subtle">
            <div className="w-16 h-16 rounded-full bg-slate-200" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-border-default bg-white p-6 sm:p-8 shadow-soft space-y-6"
        >
          {/* Save Error Alert */}
          {saveError && (
            <div className="rounded-xl bg-error-red-light/80 border border-error-red/30 p-3.5 text-xs text-error-red flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Profile Picture Bar */}
          <div className="flex items-center gap-4 pb-6 border-b border-border-subtle">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-accent-gold shadow-soft-xs bg-bg-light flex items-center justify-center">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={name || "User Avatar"}
                  fill
                  className="object-cover"
                />
              ) : (
                <UserIcon className="w-8 h-8 text-text-muted" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-primary-navy flex items-center gap-1.5">
                {name || "User Account"}
                <ShieldCheck className="w-4 h-4 text-accent-gold" />
              </h3>
              <p className="text-xs text-text-muted">
                {role === "ADMIN"
                  ? "Administrator · Verified TheVrindaGroup Member"
                  : role === "AGENT"
                  ? "Agent Partner · Verified TheVrindaGroup Member"
                  : "Verified TheVrindaGroup Member"}
              </p>
              <button
                type="button"
                onClick={handleAvatarPrompt}
                className="text-xs font-bold text-accent-gold-hover hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                Change Photo URL
              </button>
            </div>
          </div>

          {/* Account Status Banner */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
              Account Status
            </label>
            <div className="p-3.5 rounded-xl border border-border-default bg-bg-light/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-primary-navy block">
                  {role === "ADMIN"
                    ? "System Administrator"
                    : role === "AGENT"
                    ? "Certified Real Estate Agent / Broker"
                    : "Verified TheVrindaGroup Member"}
                </span>
                <span className="text-[11px] text-text-muted block mt-0.5">
                  {role === "ADMIN"
                    ? "Full administrative access and platform governance permissions."
                    : role === "AGENT"
                    ? "Licensed broker account with CRM lead assignment access."
                    : "Active verified account with full access to browse, enquire, and list properties."}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-success-green/10 text-success-green text-[11px] font-bold uppercase tracking-wider">
                {role === "ADMIN" ? "ADMIN" : role === "AGENT" ? "AGENT" : "VERIFIED"}
              </span>
            </div>
          </div>

          {/* Basic Information Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">
                  Full Name *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arya Sharma"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1 flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[10px] text-text-muted flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Verified Identifier
                  </span>
                </label>
                <Input
                  type="email"
                  value={email}
                  disabled
                  className="bg-bg-light text-text-muted cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">
                  Phone Number
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary block mb-1">
                  Company / Agency Name (Optional)
                </label>
                <Input
                  value={preferences.companyName}
                  onChange={(e) =>
                    setPreferences({ ...preferences, companyName: e.target.value })
                  }
                  placeholder="e.g. Sharma Estates"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Website or Portfolio Link (Optional)
              </label>
              <Input
                value={preferences.companyWebsite}
                onChange={(e) =>
                  setPreferences({ ...preferences, companyWebsite: e.target.value })
                }
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-3 pt-4 border-t border-border-subtle">
            <div className="flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-accent-gold" />
              <h4 className="text-xs font-bold text-primary-navy uppercase tracking-wider">
                Communication & Alert Preferences
              </h4>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  key: "enquiryAlerts" as const,
                  title: "Instant Lead & Enquiry Alerts",
                  desc: "Receive instant email notifications when a prospective buyer submits interest.",
                },
                {
                  key: "visitReminders" as const,
                  title: "Inspection & Visit Reminders",
                  desc: "Receive reminders prior to scheduled property walkthroughs.",
                },
                {
                  key: "emailNotifications" as const,
                  title: "Market Trends & Price Index Digest",
                  desc: "Weekly marketplace valuation insights and local rental yield reports.",
                },
              ].map((pref) => {
                const isChecked = preferences[pref.key];
                return (
                  <label
                    key={pref.key}
                    className="flex items-start gap-3 p-3 rounded-xl border border-border-subtle bg-bg-light hover:bg-white cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleNotification(pref.key)}
                      className="w-4 h-4 mt-0.5 rounded border-border-default accent-primary-navy cursor-pointer"
                    />
                    <div className="text-xs space-y-0.5">
                      <strong className="text-text-primary block font-semibold">
                        {pref.title}
                      </strong>
                      <span className="text-text-muted text-[11px] block">
                        {pref.desc}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-border-default flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              className="text-xs font-bold shadow-soft px-8"
            >
              Save Changes
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ProfileSettingsManager;

"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Bell,
  CheckCircle,
  Camera,
  ShieldCheck,
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { UserProfile } from "@/types/account";
import { MOCK_USER_PROFILE } from "@/data/account/mockAccountData";

export function ProfileSettingsManager() {
  const [profile, setProfile] = useState<UserProfile>(MOCK_USER_PROFILE);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const handleToggleNotification = (key: keyof UserProfile["notifications"]) => {
    setProfile((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveToast("Profile settings updated successfully.");
      setTimeout(() => setSaveToast(null), 3000);
    }, 400);
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
          Manage your account persona, personal contact details, and notification preferences.
        </p>
      </div>

      <div className="rounded-2xl border border-border-default bg-white p-6 sm:p-8 shadow-soft space-y-6">
        {/* Profile Picture Bar */}
        <div className="flex items-center gap-4 pb-6 border-b border-border-subtle">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-accent-gold shadow-soft-xs">
            <Image
              src={profile.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
              alt={profile.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-primary-navy flex items-center gap-1.5">
              {profile.name}
              <ShieldCheck className="w-4 h-4 text-accent-gold" />
            </h3>
            <p className="text-xs text-text-muted">
              JPG or PNG up to 5MB. Verified TheVrindaGroup Member.
            </p>
            <button
              type="button"
              onClick={() => alert("Upload new avatar triggered (frontend simulation).")}
              className="text-xs font-bold text-accent-gold-hover hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              Change Photo
            </button>
          </div>
        </div>

        {/* User Role Persona Switcher */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
            Account Type *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "owner" as const, label: "Individual Homeowner", desc: "List and manage your personal properties" },
              { id: "agent" as const, label: "Real Estate Agent", desc: "Certified broker / property marketing agency" },
            ].map((roleOpt) => {
              const isSelected = profile.role === roleOpt.id;
              return (
                <div
                  key={roleOpt.id}
                  onClick={() => setProfile({ ...profile, role: roleOpt.id })}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary-navy text-white border-primary-navy shadow-soft-xs"
                      : "bg-white text-text-primary border-border-default hover:bg-bg-light"
                  }`}
                >
                  <span className="text-xs font-bold block">{roleOpt.label}</span>
                  <span className={`text-[11px] block mt-0.5 ${isSelected ? "text-white/80" : "text-text-muted"}`}>
                    {roleOpt.desc}
                  </span>
                </div>
              );
            })}
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
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Email Address *
              </label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Phone Number *
              </label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Company / Agency Name (Optional)
              </label>
              <Input
                value={profile.companyName || ""}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Website or Portfolio Link (Optional)
            </label>
            <Input
              value={profile.companyWebsite || ""}
              onChange={(e) => setProfile({ ...profile, companyWebsite: e.target.value })}
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
                desc: "Receive instant email and SMS notifications when a prospective buyer submits interest.",
              },
              {
                key: "visitReminders" as const,
                title: "Inspection & Visit Reminders",
                desc: "Receive calendar reminders 2 hours prior to scheduled property walkthroughs.",
              },
              {
                key: "emailNotifications" as const,
                title: "Market Trends & Price Index Digest",
                desc: "Weekly marketplace valuation insights and local rental yield reports.",
              },
            ].map((pref) => {
              const isChecked = profile.notifications[pref.key];
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
            variant="primary"
            size="md"
            onClick={handleSave}
            isLoading={isSaving}
            className="text-xs font-bold shadow-soft px-8"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettingsManager;

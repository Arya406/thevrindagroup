"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth/auth-context";
import { UserRole } from "@/lib/auth/auth-types";

export interface RegisterFormProps {
  onSuccess?: () => void;
  showLoginLink?: boolean;
}

export function RegisterForm({ onSuccess, showLoginLink = true }: RegisterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get("returnTo") || "/account";

  const { register, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [role, setRole] = useState<UserRole>("BUYER");
  const [lookingFor, setLookingFor] = useState<"buy" | "rent" | "both">("both");
  const [agencyName, setAgencyName] = useState("");
  const [agencyWebsite, setAgencyWebsite] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      errs.name = "Please enter your full name.";
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      errs.phone = "Enter a valid 10-digit mobile number.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      errs.email = "Enter a valid email address.";
    }

    if (!password) {
      errs.password = "Password is required.";
    } else if (password.length < 8) {
      errs.password = "Password must contain at least 8 characters.";
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }

    if (role === "AGENT" && !agencyName.trim()) {
      errs.agencyName = "Please enter your agency or brokerage firm name.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    const res = await register({
      name,
      email,
      phone: `+91 ${phone.replace(/[^0-9]/g, "").slice(-10)}`,
      password,
      role,
      agencyName: role === "AGENT" ? agencyName : undefined,
      agencyWebsite: role === "AGENT" ? agencyWebsite : undefined,
      lookingFor,
      intent: "list",
    });

    if (res.success) {
      // Clear sensitive state
      setPassword("");
      setConfirmPassword("");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(returnTo);
      }
    } else {
      setGeneralError(res.error || "Unable to register. Please check your information.");
      setPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-accent-gold/40 shadow-soft-xs bg-white flex items-center justify-center mx-auto shrink-0">
          <Image
            src="/logo.jpeg"
            alt="TheVrindaGroup Logo"
            fill
            priority
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-gold-hover bg-accent-gold-light px-2.5 py-0.5 rounded-full border border-accent-gold-muted mx-auto">
          <Sparkles className="w-3 h-3" />
          Join 100% Free • Verified Real Estate
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-primary-navy tracking-tight">
          Create your TheVrindaGroup account
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Connect with genuine buyers, tenants, and verified properties across India.
        </p>
      </div>

      {/* General Error Banner */}
      {generalError && (
        <div className="p-3 rounded-xl bg-error-red-light border border-error-red/30 text-xs text-error-red font-medium">
          {generalError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="text-xs font-semibold text-text-secondary block mb-1">
            Full Name *
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              autoComplete="name"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full h-11 pl-10 pr-3 rounded-xl border text-xs font-medium focus:border-accent-gold focus:outline-none shadow-soft-xs transition-all ${
                errors.name ? "border-error-red bg-error-red-light/30" : "border-border-default bg-white"
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-[11px] text-error-red font-medium mt-1">{errors.name}</p>
          )}
        </div>

        {/* Mobile Number & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Mobile Number (10 Digits) *
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-bold text-text-muted border-r border-border-default pr-2">
                +91
              </span>
              <input
                type="tel"
                autoComplete="tel"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full h-11 pl-14 pr-3 rounded-xl border text-xs font-medium focus:border-accent-gold focus:outline-none shadow-soft-xs transition-all ${
                  errors.phone ? "border-error-red bg-error-red-light/30" : "border-border-default bg-white"
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-[11px] text-error-red font-medium mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Email Address *
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
              <input
                type="email"
                autoComplete="email"
                placeholder="rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full h-11 pl-10 pr-3 rounded-xl border text-xs font-medium focus:border-accent-gold focus:outline-none shadow-soft-xs transition-all ${
                  errors.email ? "border-error-red bg-error-red-light/30" : "border-border-default bg-white"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-error-red font-medium mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Role Persona: Buyer vs Owner vs Agent */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-semibold text-text-secondary block">
            I am registering as:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: "BUYER" as UserRole,
                label: "Buyer / Property Seeker",
                desc: "Looking to buy, rent, or explore properties",
              },
              {
                id: "OWNER" as UserRole,
                label: "Property Owner / Seller",
                desc: "List, sell, or rent out your properties",
              },
              {
                id: "AGENT" as UserRole,
                label: "Real Estate Agent / Broker",
                desc: "Channel partner, agency, or certified broker",
              },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  role === r.id
                    ? "bg-primary-navy text-white border-primary-navy shadow-soft-xs"
                    : "bg-white text-text-primary border-border-default hover:bg-bg-light"
                }`}
              >
                <strong className="text-xs block">{r.label}</strong>
                <span className={`text-[10px] block mt-0.5 ${role === r.id ? "text-white/80" : "text-text-muted"}`}>
                  {r.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* If Agent: Agency Details */}
        {role === "AGENT" && (
          <div className="p-4 rounded-xl bg-bg-light border border-border-subtle space-y-3 animate-in fade-in duration-150">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Agency / Brokerage Firm Name *
              </label>
              <Input
                placeholder="e.g. Apex Realty Partners"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                error={errors.agencyName}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">
                Agency Website (Optional)
              </label>
              <Input
                placeholder="e.g. https://apexrealty.in"
                value={agencyWebsite}
                onChange={(e) => setAgencyWebsite(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Password (Min 8 Chars) *
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full h-11 pl-10 pr-10 rounded-xl border text-xs font-medium focus:border-accent-gold focus:outline-none shadow-soft-xs transition-all ${
                  errors.password ? "border-error-red bg-error-red-light/30" : "border-border-default bg-white"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-text-muted hover:text-primary-navy p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-error-red font-medium mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Confirm Password *
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full h-11 pl-10 pr-10 rounded-xl border text-xs font-medium focus:border-accent-gold focus:outline-none shadow-soft-xs transition-all ${
                  errors.confirmPassword ? "border-error-red bg-error-red-light/30" : "border-border-default bg-white"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 text-text-muted hover:text-primary-navy p-1 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[11px] text-error-red font-medium mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Intent: Looking to Buy / Rent / Both */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-semibold text-text-secondary block">
            I am looking to:
          </label>
          <div className="flex gap-2">
            {[
              { id: "both" as const, label: "Buy & Rent" },
              { id: "buy" as const, label: "Buy Property" },
              { id: "rent" as const, label: "Rent Property" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLookingFor(opt.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  lookingFor === opt.id
                    ? "bg-accent-gold text-dark-navy border-accent-gold shadow-soft-xs"
                    : "bg-white text-text-secondary border-border-default hover:bg-bg-light"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="w-full text-xs sm:text-sm font-bold shadow-soft h-11 mt-2"
        >
          Create Free Account
        </Button>
      </form>

      {/* Login link */}
      {showLoginLink && (
        <div className="text-center pt-2 border-t border-border-subtle text-xs text-text-secondary">
          Already have an account?{" "}
          <Link
            href={`/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
            className="font-bold text-primary-navy hover:text-accent-gold-hover hover:underline"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Security note */}
      <div className="p-3 rounded-xl bg-bg-light border border-border-subtle flex items-center gap-2 text-[11px] text-text-muted">
        <ShieldCheck className="w-4 h-4 text-success-green shrink-0" />
        <span>By creating an account, you agree to TheVrindaGroup Terms of Service and Privacy Policy.</span>
      </div>
    </div>
  );
}

export default RegisterForm;

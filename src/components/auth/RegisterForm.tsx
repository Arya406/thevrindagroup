"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui";
import { useAuth } from "@/lib/auth/auth-context";
import { GoogleAuthButton } from "./GoogleAuthButton";

export interface RegisterFormProps {
  onSuccess?: () => void;
  showLoginLink?: boolean;
}

export function RegisterForm({ onSuccess, showLoginLink = true }: RegisterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get("returnTo") || "/account";

  const { requestRegistration, verifyOtp, resendOtp, linkGoogleAccount, isLoading } = useAuth();

  // Registration Form State
  const [step, setStep] = useState<"FORM" | "VERIFY">("FORM");
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [lookingFor, setLookingFor] = useState<"buy" | "rent" | "both">("both");

  // OTP Verification State
  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Account Linking State
  const [linkData, setLinkData] = useState<{ email: string; idToken: string } | null>(null);
  const [linkPassword, setLinkPassword] = useState("");
  const [showLinkPassword, setShowLinkPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Cooldown countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "VERIFY" && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, resendCooldown]);

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

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    const res = await requestRegistration({
      name,
      email,
      phone,
      password,
      role: "BUYER",
      lookingFor,
      intent: "find",
    });

    if (res.success && res.registrationId) {
      setRegistrationId(res.registrationId);
      setStep("VERIFY");
      setResendCooldown(60);
    } else {
      setGeneralError(res.error || "Unable to process registration. Please try again.");
    }
  };

  const handleVerifyEmail = async () => {
    if (!emailOtp.trim() || emailOtp.length < 6) {
      setGeneralError("Please enter the 6-digit email verification code.");
      return;
    }

    setGeneralError(null);
    const res = await verifyOtp({
      target: email,
      type: "EMAIL_VERIFICATION",
      otp: emailOtp.trim(),
      registrationId: registrationId || undefined,
    });

    if (res.success) {
      setEmailVerified(true);
      if (res.isComplete) {
        if (onSuccess) onSuccess();
        else router.push(returnTo);
      }
    } else {
      setGeneralError(res.error || "Invalid email verification code.");
    }
  };

  const handleResend = async (type: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION") => {
    if (resendCooldown > 0) return;
    setGeneralError(null);
    setResendMessage(null);

    const target = type === "EMAIL_VERIFICATION" ? email : phone;
    const res = await resendOtp({ target, type });

    if (res.success) {
      setResendMessage(res.message || "A fresh code has been sent.");
      setResendCooldown(60);
    } else {
      setGeneralError(res.error || "Unable to resend code right now.");
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkData || !linkPassword) return;

    setGeneralError(null);
    const res = await linkGoogleAccount(linkData.idToken, linkPassword);

    if (res.success) {
      setLinkPassword("");
      setLinkData(null);
      if (onSuccess) onSuccess();
      else router.push(returnTo);
    } else {
      setGeneralError(res.error || "Failed to link Google account. Please verify your password.");
      setLinkPassword("");
    }
  };

  const handleGoogleSuccess = () => {
    if (onSuccess) onSuccess();
    else router.push(returnTo);
  };

  // ---------------------------------------------------------------------------
  // Account Linking View
  // ---------------------------------------------------------------------------
  if (linkData) {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-200">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-accent-gold-hover border border-accent-gold-muted">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-primary-navy tracking-tight">
            Security Verification Required
          </h2>
          <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
            An existing account was found for <strong className="text-primary-navy">{linkData.email}</strong>.
            Please enter your platform password to securely connect Google Sign-In.
          </p>
        </div>

        {generalError && (
          <div className="p-3.5 rounded-xl bg-error-red-light border border-error-red/30 text-xs text-error-red font-medium text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleLinkSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Platform Password *
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
              <input
                type={showLinkPassword ? "text" : "password"}
                placeholder="Enter your existing account password"
                value={linkPassword}
                onChange={(e) => setLinkPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none shadow-soft-xs transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowLinkPassword(!showLinkPassword)}
                className="absolute right-3.5 text-text-muted hover:text-text-primary p-0.5"
              >
                {showLinkPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full text-xs sm:text-sm font-bold shadow-soft h-11"
          >
            Verify Password & Link Google Account
          </Button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setLinkData(null);
                setLinkPassword("");
                setGeneralError(null);
              }}
              className="text-xs font-bold text-text-secondary hover:text-primary-navy"
            >
              Cancel and Return to Sign Up
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Step 2: Verification Screen View (Email Verification)
  // ---------------------------------------------------------------------------
  if (step === "VERIFY") {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-200">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-gold-hover bg-accent-gold-light px-2.5 py-0.5 rounded-full border border-accent-gold-muted mx-auto">
            <Sparkles className="w-3 h-3" />
            Step 2 of 2: Email Verification
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-primary-navy tracking-tight">
            Verify Your Email Address
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary">
            Enter the 6-digit verification code sent to <strong className="text-primary-navy">{email}</strong>
          </p>
        </div>

        {generalError && (
          <div className="p-3.5 rounded-xl bg-error-red-light border border-error-red/30 text-xs text-error-red font-medium text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {resendMessage && (
          <div className="p-3 rounded-xl bg-success-green-light border border-success-green-border text-xs text-success-green font-medium text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{resendMessage}</span>
          </div>
        )}

        {/* Email Verification Card */}
        <div className="p-4 rounded-2xl border border-border-default bg-slate-50/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent-gold" />
              <span className="text-xs font-bold text-primary-navy">Verification Code</span>
            </div>
            {emailVerified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success-green bg-success-green-light px-2 py-0.5 rounded-full border border-success-green-border">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            ) : null}
          </div>

          {!emailVerified && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="6-digit email OTP"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full h-11 px-3 text-center tracking-widest text-base font-bold rounded-xl border border-border-default bg-white focus:border-accent-gold focus:outline-none"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleVerifyEmail}
                isLoading={isLoading}
                className="h-11 px-5 text-xs font-bold shrink-0 shadow-soft"
              >
                Verify & Create Account
              </Button>
            </div>
          )}
        </div>

        {/* Resend & Actions */}
        <div className="flex items-center justify-between text-xs pt-2">
          <button
            type="button"
            onClick={() => setStep("FORM")}
            className="inline-flex items-center gap-1 text-text-muted hover:text-primary-navy font-semibold"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Info
          </button>

          <button
            type="button"
            onClick={() => handleResend("EMAIL_VERIFICATION")}
            disabled={resendCooldown > 0 || isLoading}
            className={`inline-flex items-center gap-1 font-bold ${
              resendCooldown > 0
                ? "text-text-muted cursor-not-allowed"
                : "text-primary-navy hover:underline cursor-pointer"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? "opacity-50" : ""}`} />
            {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : "Resend Verification Code"}
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Step 1: Initial Form View
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-gold-hover bg-accent-gold-light px-2.5 py-0.5 rounded-full border border-accent-gold-muted mx-auto">
          <Sparkles className="w-3 h-3" />
          Zero Brokerage &bull; Verified Community
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-primary-navy tracking-tight">
          Create Your Account
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Join India&apos;s most trusted verified real estate marketplace
        </p>
      </div>

      {generalError && (
        <div className="p-3.5 rounded-xl bg-error-red-light border border-error-red/30 text-xs text-error-red font-medium text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Google OAuth Section */}
      <div className="space-y-4">
        <GoogleAuthButton
          onSuccess={handleGoogleSuccess}
          onLinkRequired={(data) => {
            setLinkData(data);
            setGeneralError(null);
          }}
          onError={(err) => setGeneralError(err)}
        />

        <div className="relative flex items-center justify-center">
          <div className="border-t border-border-subtle w-full" />
          <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-text-muted shrink-0">
            Or Register With Email
          </span>
          <div className="border-t border-border-subtle w-full" />
        </div>
      </div>

      <form onSubmit={handleRequestSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="text-xs font-semibold text-text-secondary block mb-1">
            Full Name *
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full h-11 pl-10 pr-3 rounded-xl border bg-white text-xs font-medium text-text-primary focus:outline-none shadow-soft-xs transition-all ${
                errors.name ? "border-error-red focus:border-error-red" : "border-border-default focus:border-accent-gold"
              }`}
            />
          </div>
          {errors.name && <p className="text-[11px] text-error-red mt-1 font-medium">{errors.name}</p>}
        </div>

        {/* Email Address */}
        <div>
          <label className="text-xs font-semibold text-text-secondary block mb-1">
            Email Address *
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
            <input
              type="email"
              placeholder="e.g. rahul.sharma@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full h-11 pl-10 pr-3 rounded-xl border bg-white text-xs font-medium text-text-primary focus:outline-none shadow-soft-xs transition-all ${
                errors.email ? "border-error-red focus:border-error-red" : "border-border-default focus:border-accent-gold"
              }`}
            />
          </div>
          {errors.email && <p className="text-[11px] text-error-red mt-1 font-medium">{errors.email}</p>}
        </div>

        {/* Mobile Number */}
        <div>
          <label className="text-xs font-semibold text-text-secondary block mb-1">
            Mobile Number (10 Digits) *
          </label>
          <div className="relative flex items-center">
            <Phone className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full h-11 pl-10 pr-3 rounded-xl border bg-white text-xs font-medium text-text-primary focus:outline-none shadow-soft-xs transition-all ${
                errors.phone ? "border-error-red focus:border-error-red" : "border-border-default focus:border-accent-gold"
              }`}
            />
          </div>
          {errors.phone && <p className="text-[11px] text-error-red mt-1 font-medium">{errors.phone}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="text-xs font-semibold text-text-secondary block mb-1">
            Password (Min 8 Characters) *
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full h-11 pl-10 pr-10 rounded-xl border bg-white text-xs font-medium text-text-primary focus:outline-none shadow-soft-xs transition-all ${
                errors.password ? "border-error-red focus:border-error-red" : "border-border-default focus:border-accent-gold"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-text-muted hover:text-text-primary p-0.5"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-[11px] text-error-red mt-1 font-medium">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="text-xs font-semibold text-text-secondary block mb-1">
            Confirm Password *
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full h-11 pl-10 pr-10 rounded-xl border bg-white text-xs font-medium text-text-primary focus:outline-none shadow-soft-xs transition-all ${
                errors.confirmPassword ? "border-error-red focus:border-error-red" : "border-border-default focus:border-accent-gold"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 text-text-muted hover:text-text-primary p-0.5"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-[11px] text-error-red mt-1 font-medium">{errors.confirmPassword}</p>}
        </div>

        {/* Looking For */}
        <div>
          <label className="text-xs font-semibold text-text-secondary block mb-1.5">
            I am interested in
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["buy", "rent", "both"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setLookingFor(type)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                  lookingFor === type
                    ? "border-accent-gold bg-accent-gold-light/40 text-primary-navy shadow-soft-xs"
                    : "border-border-default bg-white text-text-muted hover:border-border-subtle"
                }`}
              >
                {type === "both" ? "Buy & Rent" : type}
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="w-full text-xs sm:text-sm font-bold shadow-soft h-11 mt-2"
        >
          Continue to Verification
        </Button>
      </form>

      {/* Login link */}
      {showLoginLink && (
        <div className="text-center pt-2 border-t border-border-subtle">
          <p className="text-xs text-text-secondary">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-primary-navy hover:text-accent-gold-hover hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

export default RegisterForm;

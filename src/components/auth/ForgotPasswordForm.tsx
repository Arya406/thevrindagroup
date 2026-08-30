"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, KeyRound } from "lucide-react";
import { Button } from "@/components/ui";
import { authClient } from "@/lib/auth/auth-client";

export function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams?.get("token") || "";
  const emailParam = searchParams?.get("email") || "";

  // Request Reset Mode vs Confirm Reset Mode
  const isResetMode = Boolean(tokenParam && emailParam);

  const [email, setEmail] = useState(emailParam);
  const token = tokenParam;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authClient.forgotPassword(email.trim());
      if (res.success) {
        setIsSubmitted(true);
      } else {
        setError(res.error || "Unable to process password reset request. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authClient.resetPassword({
        email: email.trim(),
        token: token.trim(),
        newPassword,
      });

      if (res.success) {
        setIsResetComplete(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(res.error || "Invalid or expired password reset link.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Mode A: Password Reset Completed View
  // ---------------------------------------------------------------------------
  if (isResetComplete) {
    return (
      <div className="rounded-2xl border border-success-green-border bg-success-green-light/40 p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-success-green text-white flex items-center justify-center mx-auto shadow-soft-xs">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-bold text-primary-navy">
            Password Reset Successfully
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Your account password has been updated. Redirecting you to sign in...
          </p>
        </div>
        <Link href="/login" className="block pt-2">
          <Button variant="primary" size="md" className="w-full text-xs font-bold shadow-soft">
            Continue to Login
          </Button>
        </Link>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Mode B: Set New Password View (from email link with token)
  // ---------------------------------------------------------------------------
  if (isResetMode) {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-200">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-gold-hover bg-accent-gold-light px-2.5 py-0.5 rounded-full border border-accent-gold-muted mx-auto">
            <KeyRound className="w-3 h-3" />
            Account Security
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-primary-navy tracking-tight">
            Choose New Password
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Set a new secure password for <strong className="text-primary-navy">{email}</strong>
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-error-red-light border border-error-red/30 text-xs text-error-red font-medium text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleResetSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              New Password (Min 8 Characters) *
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none shadow-soft-xs transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-text-muted hover:text-text-primary p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Confirm New Password *
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none shadow-soft-xs transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 text-text-muted hover:text-text-primary p-0.5"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full text-xs sm:text-sm font-bold shadow-soft h-11 mt-2"
          >
            Update Password
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-xs font-bold text-text-secondary hover:text-primary-navy inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Mode C: Request Reset Link Sent View
  // ---------------------------------------------------------------------------
  if (isSubmitted) {
    return (
      <div className="rounded-2xl border border-success-green-border bg-success-green-light/40 p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-success-green text-white flex items-center justify-center mx-auto shadow-soft-xs">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-bold text-primary-navy">
            Instructions Dispatched
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            If an active account exists for <strong className="text-text-primary">{email}</strong>, a password reset link has been dispatched.
          </p>
        </div>

        <p className="text-[11px] text-text-muted">
          ⏳ The link remains valid for 30 minutes. Please check your inbox and spam folder.
        </p>

        <Link href="/login" className="block pt-2">
          <Button variant="primary" size="md" className="w-full text-xs font-bold shadow-soft">
            Back to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Mode D: Initial Request Form View
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-gold-hover bg-accent-gold-light px-2.5 py-0.5 rounded-full border border-accent-gold-muted mx-auto">
          <Sparkles className="w-3 h-3" />
          Account Recovery
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-primary-navy tracking-tight">
          Forgot Password?
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Enter your registered email address to receive password recovery instructions.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-error-red-light border border-error-red/30 text-xs text-error-red font-medium text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRequestSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-text-secondary block mb-1">
            Registered Email Address *
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
            <input
              type="email"
              placeholder="e.g. rahul.sharma@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none shadow-soft-xs transition-all"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full text-xs sm:text-sm font-bold shadow-soft h-11 mt-2"
        >
          Send Reset Instructions
        </Button>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="text-xs font-bold text-text-secondary hover:text-primary-navy inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}

export default ForgotPasswordForm;

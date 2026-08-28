"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { useAuth } from "@/lib/auth/auth-context";

export interface LoginFormProps {
  onSuccess?: () => void;
  showRegisterLink?: boolean;
}

export function LoginForm({ onSuccess, showRegisterLink = true }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get("returnTo") || "/account";

  const { login, isLoading } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!identifier.trim()) {
      errs.identifier = "Please enter your registered email or 10-digit mobile number.";
    }
    if (!password) {
      errs.password = "Please enter your password.";
    } else if (password.length < 6) {
      errs.password = "Password must contain at least 6 characters.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    const res = await login({
      identifier,
      password,
      rememberMe,
    });

    if (res.success) {
      // Clear password field from state
      setPassword("");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(returnTo);
      }
    } else {
      setGeneralError(res.error || "Unable to sign in. Please check your credentials.");
      setPassword("");
    }
  };

  const handleGoogleAuthClick = () => {
    alert(
      "Google OAuth 2.0 Integration: Authentication client abstraction is ready. Connect Google Client ID in production backend."
    );
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
          TheVrindaGroup Verified Portal
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-primary-navy tracking-tight">
          Welcome back to TheVrindaGroup
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Sign in to manage your properties, enquiries and saved listings.
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
        {/* Email or Phone */}
        <div>
          <label className="text-xs font-semibold text-text-secondary block mb-1">
            Email Address or Mobile Number *
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              autoComplete="username"
              placeholder="e.g. arya.sharma@example.com or 9876543210"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className={`w-full h-11 pl-10 pr-3 rounded-xl border text-xs font-medium focus:border-accent-gold focus:outline-none shadow-soft-xs transition-all ${
                errors.identifier ? "border-error-red bg-error-red-light/30" : "border-border-default bg-white"
              }`}
            />
          </div>
          {errors.identifier && (
            <p className="text-[11px] text-error-red font-medium mt-1">{errors.identifier}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-text-secondary block">
              Password *
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-bold text-accent-gold-hover hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
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
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-error-red font-medium mt-1">{errors.password}</p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <label className="flex items-center gap-2 text-text-secondary cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-border-default accent-primary-navy cursor-pointer"
            />
            <span>Keep me signed in for 7 days</span>
          </label>
        </div>

        {/* Submit CTA */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="w-full text-xs sm:text-sm font-bold shadow-soft h-11"
        >
          Sign In to TheVrindaGroup
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-border-default w-full" />
        <span className="bg-white px-3 text-[11px] text-text-muted font-medium uppercase tracking-wider relative">
          Or Continue With
        </span>
      </div>

      {/* Google OAuth Button */}
      <div>
        <button
          type="button"
          onClick={handleGoogleAuthClick}
          className="w-full h-11 rounded-xl border border-border-default bg-white hover:bg-bg-light text-text-primary text-xs font-bold flex items-center justify-center gap-2.5 shadow-soft-xs transition-all cursor-pointer active:scale-[0.99]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Register link */}
      {showRegisterLink && (
        <div className="text-center pt-2 border-t border-border-subtle text-xs text-text-secondary">
          Don&apos;t have a TheVrindaGroup account?{" "}
          <Link
            href={`/register${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
            className="font-bold text-primary-navy hover:text-accent-gold-hover hover:underline"
          >
            Create Account Free
          </Link>
        </div>
      )}

      {/* Privacy note */}
      <div className="p-3 rounded-xl bg-bg-light border border-border-subtle flex items-center gap-2 text-[11px] text-text-muted">
        <ShieldCheck className="w-4 h-4 text-success-green shrink-0" />
        <span>Your personal information is protected under TheVrindaGroup Security Standards.</span>
      </div>
    </div>
  );
}

export default LoginForm;

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, KeyRound, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { useAuth } from "@/lib/auth/auth-context";
import { GoogleAuthButton } from "./GoogleAuthButton";

export interface LoginFormProps {
  onSuccess?: () => void;
  showRegisterLink?: boolean;
}

export function LoginForm({ onSuccess, showRegisterLink = true }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get("returnTo") || "/account";

  const { login, linkGoogleAccount, isLoading } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Account Linking State
  const [linkData, setLinkData] = useState<{ email: string; idToken: string } | null>(null);
  const [linkPassword, setLinkPassword] = useState("");
  const [showLinkPassword, setShowLinkPassword] = useState(false);

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

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkData || !linkPassword) return;

    setGeneralError(null);
    const res = await linkGoogleAccount(linkData.idToken, linkPassword);

    if (res.success) {
      setLinkPassword("");
      setLinkData(null);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(returnTo);
      }
    } else {
      setGeneralError(res.error || "Failed to link Google account. Please verify your password.");
      setLinkPassword("");
    }
  };

  const handleGoogleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      router.push(returnTo);
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
          TheVrindaGroup Verified Portal
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-primary-navy tracking-tight">
          {linkData ? "Link Your Google Account" : "Welcome back to TheVrindaGroup"}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          {linkData
            ? `An existing account was found for ${linkData.email}. Enter your password to securely link Google.`
            : "Sign in to manage your properties, enquiries and saved listings."}
        </p>
      </div>

      {/* General Error Banner */}
      {generalError && (
        <div className="p-3 rounded-xl bg-error-red-light border border-error-red/30 text-xs text-error-red font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Account Linking Prompt Form */}
      {linkData ? (
        <form onSubmit={handleLinkSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-accent-gold-light/40 border border-accent-gold-muted text-xs text-primary-navy font-medium space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-accent-gold-hover">
              <KeyRound className="w-4 h-4" />
              Security Verification Required
            </div>
            <p className="text-text-secondary text-[11px]">
              To protect your existing account, please confirm ownership by entering your account password.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Account Password for {linkData.email} *
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
              <input
                type={showLinkPassword ? "text" : "password"}
                placeholder="Enter existing account password"
                value={linkPassword}
                onChange={(e) => setLinkPassword(e.target.value)}
                autoFocus
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-border-default bg-white text-xs font-medium focus:border-accent-gold focus:outline-none shadow-soft-xs transition-all"
              />
              <button
                type="button"
                onClick={() => setShowLinkPassword(!showLinkPassword)}
                className="absolute right-3 text-text-muted hover:text-primary-navy p-1 cursor-pointer"
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
            disabled={!linkPassword.trim()}
            className="w-full text-xs sm:text-sm font-bold shadow-soft h-11"
          >
            Verify Password & Link Google
          </Button>

          <button
            type="button"
            onClick={() => {
              setLinkData(null);
              setLinkPassword("");
              setGeneralError(null);
            }}
            className="w-full text-center text-xs font-semibold text-text-secondary hover:text-primary-navy hover:underline pt-1 cursor-pointer"
          >
            Cancel & Return to Standard Login
          </button>
        </form>
      ) : (
        /* Standard Login Form */
        <>
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

          {/* Real Google Identity Services Button */}
          <GoogleAuthButton
            mode="signin"
            onSuccess={handleGoogleSuccess}
            onError={(err) => setGeneralError(err)}
            onLinkRequired={(data) => setLinkData(data)}
          />

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
        </>
      )}
    </div>
  );
}

export default LoginForm;

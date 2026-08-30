"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Sparkles, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";
import { authClient } from "@/lib/auth/auth-client";

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneParam = searchParams?.get("phone") || "+91 98765 43210";
  const returnTo = searchParams?.get("returnTo") || "/account";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCountdown]);

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    const code = otp.join("");

    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authClient.verifyOtp({
        target: phoneParam,
        type: "PHONE_VERIFICATION",
        otp: code,
      });

      if (res.success) {
        setSuccessMessage("Mobile verification successful.");
        setTimeout(() => {
          router.push(returnTo);
        }, 800);
      } else {
        setError(res.error || "Invalid verification code. Please check and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || isLoading) return;
    setError(null);
    setSuccessMessage(null);

    const res = await authClient.resendOtp({
      target: phoneParam,
      type: "PHONE_VERIFICATION",
    });

    if (res.success) {
      setSuccessMessage(res.message || "A new verification code has been dispatched.");
      setResendCountdown(60);
    } else {
      setError(res.error || "Unable to resend verification code. Please wait before trying again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-gold-hover bg-accent-gold-light px-2.5 py-0.5 rounded-full border border-accent-gold-muted mx-auto">
          <Sparkles className="w-3 h-3" />
          Two-Factor Authentication
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-primary-navy tracking-tight">
          Verify Mobile OTP
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Enter the 6-digit verification code sent to <strong className="text-text-primary">{phoneParam}</strong>.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-error-red-light border border-error-red/30 text-xs text-error-red font-medium text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-xl bg-success-green-light border border-success-green-border text-xs text-success-green font-medium text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 6 Digit Inputs */}
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-digit-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-extrabold text-primary-navy rounded-xl border border-border-default bg-white focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 focus:outline-none shadow-soft-xs transition-all"
            />
          ))}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="w-full text-xs sm:text-sm font-bold shadow-soft h-11"
        >
          Verify & Sign In
        </Button>

        {/* Resend Link */}
        <div className="text-center text-xs text-text-muted">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCountdown > 0 || isLoading}
            className={`font-bold inline-flex items-center gap-1 ${
              resendCountdown > 0
                ? "text-text-muted cursor-not-allowed"
                : "text-primary-navy hover:underline cursor-pointer"
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${resendCountdown > 0 ? "opacity-50" : ""}`} />
            {resendCountdown > 0 ? `Resend OTP (${resendCountdown}s)` : "Resend OTP"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default VerifyOtpForm;

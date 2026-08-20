"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
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
  const [resendCountdown, setResendCountdown] = useState(30);

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
    const code = otp.join("");

    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authClient.verifyOtp({
        identifier: phoneParam,
        otp: code,
      });

      if (res.success) {
        router.push(returnTo);
      } else {
        setError(res.error || "Invalid OTP entered. (Use demo code: 123456)");
      }
    } finally {
      setIsLoading(false);
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
        <div className="p-3 rounded-xl bg-error-red-light border border-error-red/30 text-xs text-error-red font-medium text-center">
          {error}
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

        {/* Demo Hint */}
        <div className="text-center">
          <span className="text-[11px] font-bold text-success-green bg-success-green-light px-3 py-1 rounded-full border border-success-green-border inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Frontend Simulation Demo Code: 123456
          </span>
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
            onClick={() => setResendCountdown(30)}
            className="text-primary-navy font-bold hover:underline cursor-pointer"
          >
            Resend OTP ({resendCountdown}s)
          </button>
        </div>
      </form>
    </div>
  );
}

export default VerifyOtpForm;

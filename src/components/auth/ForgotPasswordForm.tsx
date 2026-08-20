"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { authClient } from "@/lib/auth/auth-client";

export function ForgotPasswordForm() {
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError("Please enter your registered email address or mobile number.");
      return;
    }

    setIsLoading(true);
    try {
      await authClient.requestPasswordReset({ identifier });
      setIsSubmitted(true);
    } catch {
      setError("Unable to process password reset request. Please try again.");
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
          Account Recovery
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-primary-navy tracking-tight">
          Forgot Password?
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Enter your registered email address or mobile number to receive instructions.
        </p>
      </div>

      {isSubmitted ? (
        <div className="rounded-2xl border border-success-green-border bg-success-green-light/40 p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-success-green text-white flex items-center justify-center mx-auto shadow-soft-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-primary-navy">
              Password Reset Request Created
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              We have generated a password reset token for <strong className="text-text-primary">{identifier}</strong>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-border-subtle text-[11px] text-text-muted flex items-start gap-2 text-left">
            <ShieldCheck className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
            <span>
              <strong>Backend Simulation Notice:</strong> Connect your authentication email/SMS gateway in production to deliver the actual reset message.
            </span>
          </div>

          <Link href="/login" className="block pt-2">
            <Button variant="primary" size="md" className="w-full text-xs font-bold shadow-soft">
              Back to Login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-error-red-light border border-error-red/30 text-xs text-error-red font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-text-secondary block mb-1">
              Registered Email or Mobile Number *
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. arya.sharma@example.com or 9876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-border-default bg-white text-xs font-medium text-text-primary focus:border-accent-gold focus:outline-none shadow-soft-xs transition-all"
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
      )}
    </div>
  );
}

export default ForgotPasswordForm;

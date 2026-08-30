import { Metadata } from "next";
import { Suspense } from "react";
import { VerifyOtpForm } from "@/components/auth/VerifyOtpForm";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Verify OTP | TheVrindaGroup",
  description: "Verify your one-time password on TheVrindaGroup.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyOtpPage() {
  return (
    <div className="py-12 sm:py-16 bg-bg-light min-h-[80vh] flex items-center justify-center font-sans">
      <Container className="max-w-md w-full">
        <div className="rounded-3xl border border-border-default bg-white p-6 sm:p-10 shadow-soft-xl">
          <Suspense
            fallback={
              <div className="py-12 text-center text-xs font-semibold text-text-muted">
                Loading verification form...
              </div>
            }
          >
            <VerifyOtpForm />
          </Suspense>
        </div>
      </Container>
    </div>
  );
}

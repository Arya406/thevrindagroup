import { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Forgot Password | TheVrindaGroup",
  description: "Reset your TheVrindaGroup account password.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return (
    <div className="py-12 sm:py-16 bg-bg-light min-h-[80vh] flex items-center justify-center font-sans">
      <Container className="max-w-md w-full">
        <div className="rounded-3xl border border-border-default bg-white p-6 sm:p-10 shadow-soft-xl">
          <Suspense
            fallback={
              <div className="py-12 text-center text-xs font-semibold text-text-muted">
                Loading password recovery form...
              </div>
            }
          >
            <ForgotPasswordForm />
          </Suspense>
        </div>
      </Container>
    </div>
  );
}

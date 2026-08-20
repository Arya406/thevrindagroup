import { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Create Account | TheVrindaGroup Real Estate Portal",
  description: "Create a free account on TheVrindaGroup to list properties, schedule site visits, and connect with owners.",
};

export default function RegisterPage() {
  return (
    <div className="py-12 sm:py-16 bg-bg-light min-h-[80vh] flex items-center justify-center font-sans">
      <Container className="max-w-lg w-full">
        <div className="rounded-3xl border border-border-default bg-white p-6 sm:p-10 shadow-soft-xl">
          <Suspense
            fallback={
              <div className="py-12 text-center text-xs font-semibold text-text-muted">
                Loading registration form...
              </div>
            }
          >
            <RegisterForm />
          </Suspense>
        </div>
      </Container>
    </div>
  );
}

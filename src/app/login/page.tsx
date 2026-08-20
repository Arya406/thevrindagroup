import { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Login | TheVrindaGroup Real Estate Portal",
  description: "Sign in to manage your listed properties, leads, and shortlisted homes with TheVrindaGroup.",
};

export default function LoginPage() {
  return (
    <div className="py-12 sm:py-16 bg-bg-light min-h-[80vh] flex items-center justify-center font-sans">
      <Container className="max-w-md w-full">
        <div className="rounded-3xl border border-border-default bg-white p-6 sm:p-10 shadow-soft-xl">
          <Suspense
            fallback={
              <div className="py-12 text-center text-xs font-semibold text-text-muted">
                Loading sign in form...
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </Container>
    </div>
  );
}

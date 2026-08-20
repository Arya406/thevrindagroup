import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Forgot Password | TheVrindaGroup",
  description: "Reset your TheVrindaGroup account password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="py-12 sm:py-16 bg-bg-light min-h-[80vh] flex items-center justify-center font-sans">
      <Container className="max-w-md w-full">
        <div className="rounded-3xl border border-border-default bg-white p-6 sm:p-10 shadow-soft-xl">
          <ForgotPasswordForm />
        </div>
      </Container>
    </div>
  );
}

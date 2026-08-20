"use client";

import React, { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export function AuthRequiredModal() {
  const { authModalOpen, authModalContext, closeAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  if (!authModalOpen) return null;

  const handleSuccess = () => {
    if (authModalContext?.onAuthenticated) {
      authModalContext.onAuthenticated();
    }
    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-navy/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-border-default p-6 sm:p-8 shadow-soft-2xl relative space-y-5 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-text-muted hover:bg-bg-light hover:text-text-primary transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Context Heading */}
        {authModalContext?.message && (
          <div className="p-3.5 rounded-2xl bg-accent-gold-light/60 border border-accent-gold-muted flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#9E6E18] shrink-0 mt-0.5" />
            <p className="text-xs text-primary-navy font-semibold leading-relaxed">
              {authModalContext.message}
            </p>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-bg-light p-1 border border-border-subtle">
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "login"
                ? "bg-white text-primary-navy shadow-soft-xs"
                : "text-text-secondary hover:text-primary-navy"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "register"
                ? "bg-white text-primary-navy shadow-soft-xs"
                : "text-text-secondary hover:text-primary-navy"
            }`}
          >
            Create Account Free
          </button>
        </div>

        {/* Form Tab Content */}
        {activeTab === "login" ? (
          <LoginForm
            onSuccess={handleSuccess}
            showRegisterLink={false}
          />
        ) : (
          <RegisterForm
            onSuccess={handleSuccess}
            showLoginLink={false}
          />
        )}
      </div>
    </div>
  );
}

export default AuthRequiredModal;

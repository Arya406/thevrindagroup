"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ArrowLeft,
  Lock,
  Loader2,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useAuth } from "@/lib/auth/auth-context";

const AGENT_NAV_ITEMS = [
  { label: "Agent Overview", href: "/agent", icon: LayoutDashboard },
  { label: "Assigned Leads", href: "/agent/leads", icon: Users },
];

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, isAuthenticated, isLoading, isInitialized } = useAuth();

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 p-8 bg-white rounded-2xl shadow-soft-sm border border-border-default">
          <Loader2 className="w-8 h-8 animate-spin text-accent-gold" />
          <p className="text-xs font-semibold text-text-secondary">Verifying Broker Agent Workspace...</p>
        </div>
      </div>
    );
  }

  // Role Guard: AGENT or ADMIN allowed
  if (!isAuthenticated || (currentUser?.role !== "AGENT" && currentUser?.role !== "ADMIN")) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-soft-lg border border-border-default text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-error-red/10 border border-error-red/20 text-error-red flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-primary-navy">Agent Workspace Restricted</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            This workspace is dedicated to certified real-estate agents with <span className="font-bold text-primary-navy">AGENT</span> credentials. Your current persona is <span className="font-bold uppercase text-accent-gold">{currentUser?.role || "GUEST"}</span>.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full py-2.5 px-4 rounded-xl bg-primary-navy text-white text-xs font-bold hover:bg-primary-navy-light transition-all shadow-soft-xs"
            >
              Sign In as Agent
            </Link>
            <Link
              href="/account"
              className="w-full py-2.5 px-4 rounded-xl bg-bg-light text-text-secondary text-xs font-bold hover:bg-border-subtle transition-all"
            >
              Return to My Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light font-sans text-text-primary">
      {/* Top Header */}
      <div className="bg-white border-b border-border-default sticky top-0 z-40 shadow-soft-xs">
        <Container>
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/account"
                className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-primary-navy transition-colors px-2.5 py-1.5 rounded-lg hover:bg-bg-light"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>My Account</span>
              </Link>
              <div className="h-4 w-px bg-border-default" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight text-primary-navy">
                  TheVrindaGroup
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-black uppercase tracking-wider">
                  Agent Workspace
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-primary-navy">{currentUser.name}</p>
                <p className="text-[10px] text-text-muted">{currentUser.email}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-800 text-white font-bold text-xs flex items-center justify-center shadow-soft-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Agent Workspace */}
      <Container className="py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Nav */}
          <aside className="w-full lg:w-60 shrink-0">
            <div className="bg-white rounded-2xl border border-border-default p-3 shadow-soft-xs space-y-1 sticky top-22">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-3 py-1.5">
                Broker Actions
              </p>
              {AGENT_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-primary-navy text-white shadow-soft-xs"
                        : "text-text-secondary hover:text-primary-navy hover:bg-bg-light"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-accent-gold" : "text-text-muted"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </aside>

          {/* Page Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </Container>
    </div>
  );
}

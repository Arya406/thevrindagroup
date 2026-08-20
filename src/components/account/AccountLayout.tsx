"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Building,
  Users,
  CalendarCheck,
  Heart,
  Settings,
  PlusCircle,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { Button, Container } from "@/components/ui";
import { useAuth } from "@/lib/auth/auth-context";
import { MOCK_ACCOUNT_STATS } from "@/data/account/mockAccountData";

export interface AccountLayoutProps {
  children: React.ReactNode;
}

export function AccountLayout({ children }: AccountLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  const navItems = [
    {
      label: "Overview",
      href: "/account",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: "My Properties",
      href: "/account/properties",
      icon: Building,
      badge: MOCK_ACCOUNT_STATS.activeListings + MOCK_ACCOUNT_STATS.pendingReview,
      badgeColor: "bg-primary-navy/10 text-primary-navy",
    },
    {
      label: "Leads & Enquiries",
      href: "/account/leads",
      icon: Users,
      badge: "2 New",
      badgeColor: "bg-success-green-light text-success-green border border-success-green-border",
    },
    {
      label: "Scheduled Visits",
      href: "/account/visits",
      icon: CalendarCheck,
      badge: MOCK_ACCOUNT_STATS.upcomingVisits,
      badgeColor: "bg-accent-gold-light text-[#9E6E18] border border-accent-gold-muted",
    },
    {
      label: "Saved Properties",
      href: "/account/saved",
      icon: Heart,
      badge: null,
    },
    {
      label: "Profile Settings",
      href: "/account/profile",
      icon: Settings,
      badge: null,
    },
  ];

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs font-semibold text-text-muted">
        Loading your account details...
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-accent-gold-light text-[#9E6E18] flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-primary-navy">
          Authentication Required
        </h2>
        <p className="text-xs text-text-secondary">
          Please sign in to access your properties, buyer leads, and saved listings.
        </p>
        <Link href={`/login?returnTo=${encodeURIComponent(pathname)}`}>
          <Button variant="primary" size="md" className="text-xs font-bold">
            Sign In to TheVrindaGroup
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-bg-light min-h-screen font-sans text-text-primary py-6 sm:py-8">
      <Container>
        {/* MOBILE USER HEADER & HORIZONTAL SCROLL NAV */}
        <div className="lg:hidden space-y-4 mb-6">
          {/* User Profile Bar */}
          <div className="bg-white rounded-2xl border border-border-default p-4 shadow-soft flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-accent-gold/40 shrink-0 bg-primary-navy text-accent-gold flex items-center justify-center font-bold text-sm">
                {currentUser.avatar ? (
                  <Image
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  currentUser.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h2 className="text-sm font-bold text-primary-navy flex items-center gap-1">
                  {currentUser.name}
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-gold" />
                </h2>
                <span className="text-[10px] font-semibold text-text-muted capitalize">
                  {currentUser.role} Account • Verified
                </span>
              </div>
            </div>

            <Link
              href="/post-property"
              className="inline-flex items-center gap-1 bg-accent-gold text-dark-navy px-3 py-1.5 rounded-lg text-xs font-bold shadow-soft-xs hover:bg-accent-gold-hover"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Post Property
            </Link>
          </div>

          {/* Horizontal Nav Bar */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                    isActive
                      ? "bg-primary-navy text-white border-primary-navy shadow-soft-xs"
                      : "bg-white text-text-secondary border-border-default hover:bg-bg-light"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : item.badgeColor || "bg-bg-light text-text-primary"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* DESKTOP 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* DESKTOP SIDEBAR (4 cols on lg, 3 on xl) */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-4 sticky top-24">
            {/* User Profile Card */}
            <div className="bg-white rounded-2xl border border-border-default p-5 shadow-soft space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-accent-gold/40 shrink-0 bg-primary-navy text-accent-gold flex items-center justify-center font-bold text-base">
                  {currentUser.avatar ? (
                    <Image
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    currentUser.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-primary-navy truncate flex items-center gap-1">
                    {currentUser.name}
                    <ShieldCheck className="w-4 h-4 text-accent-gold shrink-0" />
                  </h3>
                  <p className="text-[11px] text-text-muted truncate">
                    {currentUser.email}
                  </p>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.2 rounded bg-bg-light border border-border-subtle text-text-secondary mt-1 uppercase tracking-wide">
                    {currentUser.role} Account
                  </span>
                </div>
              </div>

              {/* Nav Items List */}
              <nav className="space-y-1 pt-2 border-t border-border-subtle">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-primary-navy text-white shadow-soft-xs font-bold"
                          : "text-text-secondary hover:text-primary-navy hover:bg-bg-light"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? "text-accent-gold" : "text-text-muted"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? "bg-white/20 text-white"
                              : item.badgeColor || "bg-bg-light text-text-primary"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom Post Property CTA */}
              <div className="pt-3 border-t border-border-subtle">
                <Link
                  href="/post-property"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent-gold px-4 py-2.5 text-xs font-bold text-dark-navy hover:bg-accent-gold-hover shadow-soft-xs transition-all active:scale-[0.99]"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Property FREE</span>
                </Link>
                <p className="text-[10px] text-text-muted text-center mt-1.5">
                  100% Zero Brokerage Listing
                </p>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6">
            {children}
          </main>
        </div>
      </Container>
    </div>
  );
}

export default AccountLayout;

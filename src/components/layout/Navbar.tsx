"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  PlusCircle,
  User,
  ChevronDown,
  LayoutDashboard,
  Building,
  Users,
  Heart,
  Settings,
  LogOut,
  ShieldCheck,
  Briefcase,
  Bell,
  CalendarCheck,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useAuth } from "@/lib/auth/auth-context";
import { NotificationApiService } from "@/lib/services/notification-api";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

export interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Buy Properties", href: "/buy" },
  { label: "Rent / Lease", href: "/rent" },
  { label: "Commercial", href: "/commercial" },
];

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, isAuthenticated, isInitialized, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Synchronize unread count on auth change & start 45s interval
  useEffect(() => {
    let ignore = false;
    if (!isAuthenticated || !currentUser) return;

    NotificationApiService.getUnreadCount()
      .then((res) => {
        if (!ignore) setUnreadCount(res.count);
      })
      .catch(() => {});

    const interval = setInterval(() => {
      NotificationApiService.getUnreadCount()
        .then((res) => {
          if (!ignore) setUnreadCount(res.count);
        })
        .catch(() => {});
    }, 45000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [isAuthenticated, currentUser]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    setIsNotificationsOpen(false);
    closeMobileMenu();
    setUnreadCount(0);
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-border-default font-sans select-none shadow-soft-xs transition-colors">
      <Container className="relative">
        <div className="flex h-16 items-center justify-between">
          {/* LEFT: TheVrindaGroup Official Logo / Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold rounded-lg p-1 -ml-1"
            aria-label="TheVrindaGroup Home"
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-accent-gold/40 shadow-soft-xs bg-white flex items-center justify-center shrink-0">
              <Image
                src="/logo.jpeg"
                alt="TheVrindaGroup Official Logo"
                fill
                priority
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-black tracking-tight text-primary-navy font-sans">
                TheVrindaGroup
              </span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-gold ml-0.5 self-end mb-1" />
            </div>
          </Link>

          {/* CENTER: Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-1 lg:gap-2"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => {
              const isActive =
                (item.href === "/buy" && (pathname === "/buy" || pathname.startsWith("/buy/") || pathname === "/properties")) ||
                (item.href === "/rent" && (pathname === "/rent" || pathname.startsWith("/rent/"))) ||
                (item.href === "/commercial" && (pathname === "/commercial" || pathname.startsWith("/commercial/")));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-3.5 py-2 text-sm rounded-lg transition-colors duration-150 ${
                    isActive
                      ? "bg-primary-navy/10 text-primary-navy font-bold shadow-soft-xs"
                      : "font-medium text-text-primary/90 hover:text-primary-navy hover:bg-bg-light"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Actions (Auth State, Notifications & Post Property) */}
          <div className="hidden md:flex items-center gap-3">
            {!isInitialized ? (
              /* Neutral skeleton placeholder to prevent flash and layout shift */
              <div className="h-9 w-20 rounded-xl bg-bg-light/60 border border-border-default/30 animate-pulse" aria-hidden="true" />
            ) : isAuthenticated && currentUser ? (
              <>
                {/* Notification Bell Dropdown Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                      setIsUserMenuOpen(false);
                    }}
                    className={`relative p-2 rounded-xl border transition-all cursor-pointer shadow-soft-xs ${
                      isNotificationsOpen
                        ? "border-accent-gold bg-accent-gold/10 text-primary-navy ring-2 ring-accent-gold/20"
                        : "border-border-default bg-white text-text-secondary hover:text-primary-navy hover:bg-bg-light"
                    }`}
                    aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
                    aria-expanded={isNotificationsOpen}
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-gold text-dark-navy text-[10px] font-black flex items-center justify-center border-2 border-white shadow-soft-xs">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  <NotificationCenter
                    isOpen={isNotificationsOpen}
                    onClose={() => setIsNotificationsOpen(false)}
                    unreadCount={unreadCount}
                    onUnreadCountChange={setUnreadCount}
                  />
                </div>

                {/* Authenticated User Menu Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(!isUserMenuOpen);
                      setIsNotificationsOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border-default bg-white hover:bg-bg-light transition-all cursor-pointer shadow-soft-xs"
                  >
                    <div className="relative w-7 h-7 rounded-full overflow-hidden border border-accent-gold/40 shrink-0 bg-primary-navy text-accent-gold flex items-center justify-center text-xs font-bold">
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
                    <span className="text-xs font-bold text-primary-navy max-w-[100px] truncate">
                      {currentUser.name.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-11 w-56 rounded-2xl bg-white border border-border-default shadow-soft-xl z-50 p-2 space-y-1 animate-in fade-in duration-150">
                      <div className="p-2.5 border-b border-border-subtle mb-1">
                        <p className="text-xs font-bold text-primary-navy truncate flex items-center gap-1">
                          {currentUser.name}
                          <ShieldCheck className="w-3.5 h-3.5 text-accent-gold" />
                        </p>
                        <p className="text-[10px] text-text-muted truncate">
                          {currentUser.email}
                        </p>
                        <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-bg-light border border-border-subtle text-text-secondary mt-1 uppercase">
                          {currentUser.role} Account
                        </span>
                      </div>

                    <Link
                      href="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-primary hover:bg-bg-light rounded-xl transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-accent-gold" />
                      <span>Overview</span>
                    </Link>

                    <Link
                      href="/account/saved"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-primary hover:bg-bg-light rounded-xl transition-colors"
                    >
                      <Heart className="w-4 h-4 text-error-red" />
                      <span>Saved Properties</span>
                    </Link>

                    <Link
                      href="/account/visits"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-primary hover:bg-bg-light rounded-xl transition-colors"
                    >
                      <CalendarCheck className="w-4 h-4 text-[#9E6E18]" />
                      <span>Scheduled Visits</span>
                    </Link>

                    <Link
                      href="/account/leads"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-primary hover:bg-bg-light rounded-xl transition-colors"
                    >
                      <Users className="w-4 h-4 text-success-green" />
                      <span>My Enquiries</span>
                    </Link>

                    {(currentUser.role === "OWNER" || currentUser.role === "AGENT" || currentUser.role === "ADMIN") && (
                      <Link
                        href="/account/properties"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-primary hover:bg-bg-light rounded-xl transition-colors"
                      >
                        <Building className="w-4 h-4 text-primary-navy" />
                        <span>My Properties</span>
                      </Link>
                    )}

                    <Link
                      href="/account/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-primary hover:bg-bg-light rounded-xl transition-colors"
                    >
                      <Settings className="w-4 h-4 text-text-muted" />
                      <span>Profile Settings</span>
                    </Link>

                    {currentUser.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-accent-gold-hover bg-accent-gold/10 hover:bg-accent-gold/20 rounded-xl transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-accent-gold" />
                        <span>Admin Portal</span>
                      </Link>
                    )}

                    {(currentUser.role === "AGENT" || currentUser.role === "ADMIN") && (
                      <Link
                        href="/agent"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                      >
                        <Briefcase className="w-4 h-4 text-blue-700" />
                        <span>Agent Workspace</span>
                      </Link>
                    )}

                    <div className="border-t border-border-subtle my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-error-red hover:bg-error-red-light rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
              /* Logged out: Sign in CTA */
              <Link
                href="/login"
                className="px-3.5 py-2 text-sm font-medium text-text-primary hover:text-accent-gold-hover transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold rounded-lg flex items-center gap-1.5"
              >
                <User className="w-4 h-4 text-accent-gold" />
                <span>Login</span>
              </Link>
            )}

           

            <Link
              href="/post-property"
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent-gold px-4 py-2 text-sm font-semibold text-dark-navy hover:bg-accent-gold-hover shadow-soft-xs transition-all duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 shrink-0"
            >
              <PlusCircle className="h-4 w-4 shrink-0" />
              <span>List Your Property</span>
              <span className="rounded bg-dark-navy/15 px-1 py-0.2 text-[10px] font-bold tracking-wider uppercase text-dark-navy">
                FREE
              </span>
            </Link>
          </div>

          {/* MOBILE: Actions (Notifications & Hamburger) */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && currentUser && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`relative p-2 rounded-lg border transition-all cursor-pointer ${
                    isNotificationsOpen
                      ? "border-accent-gold bg-accent-gold/10 text-primary-navy"
                      : "border-border-default bg-white text-text-secondary hover:text-primary-navy"
                  }`}
                  aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-accent-gold text-dark-navy text-[9px] font-black flex items-center justify-center border-2 border-white shadow-soft-xs">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                <NotificationCenter
                  isOpen={isNotificationsOpen}
                  onClose={() => setIsNotificationsOpen(false)}
                  unreadCount={unreadCount}
                  onUnreadCountChange={setUnreadCount}
                />
              </div>
            )}

            <button
              type="button"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-text-primary hover:bg-bg-light hover:text-primary-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold transition-colors"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden border-t border-border-default py-4 animate-in fade-in slide-in-from-top-2 duration-150 bg-white"
            aria-label="Mobile Navigation"
          >
            <nav className="flex flex-col space-y-1 pb-3">
              {navItems.map((item) => {
                const isActive =
                  (item.href === "/buy" && (pathname === "/buy" || pathname.startsWith("/buy/") || pathname === "/properties")) ||
                  (item.href === "/rent" && (pathname === "/rent" || pathname.startsWith("/rent/"))) ||
                  (item.href === "/commercial" && (pathname === "/commercial" || pathname.startsWith("/commercial/")));

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`px-3.5 py-2.5 text-base rounded-lg transition-colors ${
                      isActive
                        ? "bg-primary-navy/10 text-primary-navy font-bold shadow-soft-xs"
                        : "font-medium text-text-primary hover:bg-bg-light hover:text-primary-navy"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex flex-col space-y-2.5 pt-3 border-t border-border-subtle">
              {!isInitialized ? (
                <div className="h-10 w-full rounded-lg bg-bg-light/60 border border-border-default/30 animate-pulse" aria-hidden="true" />
              ) : isAuthenticated && currentUser ? (
                <>
                  <Link
                    href="/account"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-text-primary border border-border-default rounded-lg hover:bg-bg-light transition-colors"
                  >
                    <span>My Account ({currentUser.name.split(" ")[0]})</span>
                    <LayoutDashboard className="w-4 h-4 text-accent-gold" />
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-1.5 w-full px-4 py-2 text-xs font-semibold text-error-red border border-error-red/20 bg-error-red-light/30 rounded-lg cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium text-text-primary border border-border-default rounded-lg hover:bg-bg-light transition-colors"
                >
                  Login / Register
                </Link>
              )}

              <Link
                href="/post-property"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-accent-gold px-4 py-2.5 text-sm font-semibold text-dark-navy hover:bg-accent-gold-hover shadow-soft-xs transition-all"
              >
                <PlusCircle className="h-4 w-4" />
                <span>List Your Property</span>
                <span className="rounded bg-dark-navy/15 px-1 py-0.2 text-[10px] font-bold uppercase text-dark-navy">
                  FREE
                </span>
              </Link>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}

export default Navbar;
